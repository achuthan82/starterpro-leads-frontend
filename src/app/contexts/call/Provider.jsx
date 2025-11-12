// Import Dependencies
import { useState, useEffect, useRef, useCallback } from "react";
import { Device } from '@twilio/voice-sdk';
import PropTypes from "prop-types";
import { v4 as uuidv4 } from 'uuid';

// Local Imports
import { CallContext } from "./context";
import { dialerService } from "utils/apiService";
import profileService from "utils/profileService";

// ----------------------------------------------------------------------

export function CallProvider({ children }) {
  const [callStatus, setCallStatus] = useState('Ready to Make Calls');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isDialing, setIsDialing] = useState(false);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedOutboundNumber, setSelectedOutboundNumber] = useState(null);
  const [transcript, setTranscript] = useState('Call transcription will appear here when connected');
  const [callHistory, setCallHistory] = useState([]);
  const [callLogs, setCallLogs] = useState([]); // API call logs
  const [callLogsLoading, setCallLogsLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [licenseDetails, setLicenseDetails] = useState(null);
  const [licenseError, setLicenseError] = useState(null);
  const [licenseLoading, setLicenseLoading] = useState(false);

  // Refs
  const deviceRef = useRef(null);
  const callRef = useRef(null);
  const callTimerRef = useRef(null);
  const audioElementRef = useRef(null);
  const isInitializedRef = useRef(false);
  const callDurationRef = useRef(0);

  // Initialize audio element
  useEffect(() => {
    audioElementRef.current = new Audio();
    audioElementRef.current.preload = 'auto';
    
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

  // Request microphone permissions
  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      stream.getTracks().forEach(track => track.stop());
      console.log('Microphone permission granted');
      return true;
    } catch (error) {
      console.warn('Microphone permission not granted:', error);
      setCallStatus('Microphone access is required for calling');
      return false;
    }
  }, []);

  // Initialize Twilio Device (called only when making a call)
  const initializeTwilio = useCallback(async (toNumber, mortgageId, uuid) => {
    try {
      setCallStatus('Initializing calling system...');
      
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        throw new Error('Microphone permission required');
      }

      // Call API with required parameters
      const data = await dialerService.initializeTwilio({
        to_number: toNumber,
        mortgage_id: mortgageId,
        uuid: uuid
      });
      
      if (!data?.data?.token) {
        throw new Error('No token in response');
      }
      
      // Destroy existing device if any
      if (deviceRef.current) {
        deviceRef.current.destroy();
      }
      
      // Create new device with token
      deviceRef.current = new Device(data.data.token, {
        codecPreferences: ['opus', 'pcmu'],
        debug: true,
        enableRingingState: true,
        closeProtection: true
      });

      // Wait for device to be ready before resolving
      return new Promise((resolve, reject) => {
        let timeout;
        
        const onRegistered = () => {
          if (timeout) clearTimeout(timeout);
          deviceRef.current.off('registered', onRegistered);
          deviceRef.current.off('error', onError);
          setCallStatus('Ready to Make Calls');
          isInitializedRef.current = true;
          resolve();
        };

        const onError = (error) => {
          if (timeout) clearTimeout(timeout);
          deviceRef.current.off('registered', onRegistered);
          deviceRef.current.off('error', onError);
          console.error('Device error:', error);
          setCallStatus(`Device error: ${error.message}`);
          isInitializedRef.current = false;
          reject(error);
        };

        timeout = setTimeout(() => {
          deviceRef.current.off('registered', onRegistered);
          deviceRef.current.off('error', onError);
          reject(new Error('Device registration timeout'));
        }, 10000); // 10 second timeout

        deviceRef.current.on('registered', onRegistered);
        deviceRef.current.on('error', onError);
        deviceRef.current.on('incoming', (call) => {
          console.log('Incoming call:', call);
        });
        
        deviceRef.current.register();
      });

    } catch (error) {
      console.error('Initialization failed:', error);
      setCallStatus(`Initialization failed: ${error.message || 'Unknown error'}`);
      isInitializedRef.current = false;
      throw error;
    }
  }, [requestMicrophonePermission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy();
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      window.currentTwilioCall = null;
      isInitializedRef.current = false;
    };
  }, []);

  // Reset call ended status after delay
  useEffect(() => {
    if (isCallEnded) {
      const timer = setTimeout(() => {
        setIsCallEnded(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCallEnded]);

  const startCallTimer = useCallback(() => {
    setCallDuration(0);
    callDurationRef.current = 0;
    callTimerRef.current = setInterval(() => {
      callDurationRef.current += 1;
      setCallDuration(callDurationRef.current);
    }, 1000);
  }, []);

  const stopCallTimer = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  }, []);

  const formatCallDuration = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Extract state from lead
  const getLeadState = useCallback((lead) => {
    if (!lead) return null;
    
    // Try to get state from originalData if available
    const leadState = lead.originalData?.state || lead.state;
    
    // If state is in format like "FL-33101", extract "FL"
    if (leadState && typeof leadState === 'string') {
      // Handle format like "FL-33101" or "FL 33101"
      const match = leadState.match(/^([A-Z]{2})[-\s]/);
      if (match) return match[1];
      // If it's just a 2-letter code, return it
      if (leadState.length === 2 && /^[A-Z]{2}$/.test(leadState)) {
        return leadState.toUpperCase();
      }
    }
    
    return leadState;
  }, []);

  // Check license for selected lead's state
  const checkLicense = useCallback(async (lead) => {
    if (!lead) {
      setLicenseDetails(null);
      setLicenseError(null);
      return;
    }

    const leadState = getLeadState(lead);
    if (!leadState) {
      setLicenseDetails(null);
      setLicenseError('Lead state not found');
      return;
    }

    setLicenseLoading(true);
    setLicenseError(null);
    
    try {
      const response = await profileService.getLicenseDetails(leadState);
      
      if (response.data.status === 200 && response.data.data) {
        // Check if license exists for this state
        // API might return filtered results or all licenses
        const licenses = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];
        
        // Filter by state (in case API doesn't filter)
        const licenseForState = licenses.find(license => {
          const licenseState = license.state?.toUpperCase();
          const normalizedLeadState = leadState.toUpperCase();
          return licenseState === normalizedLeadState;
        });

        if (licenseForState) {
          setLicenseDetails(licenseForState);
          setLicenseError(null);
        } else {
          setLicenseDetails(null);
          setLicenseError(`License not found for state: ${leadState}. Please upload license in Profile.`);
        }
      } else if (response.data.status === 204) {
        setLicenseDetails(null);
        setLicenseError(`License not found for state: ${leadState}. Please upload license in Profile.`);
      } else {
        setLicenseDetails(null);
        setLicenseError(response.data.message || 'Failed to check license');
      }
    } catch (error) {
      console.error('Error checking license:', error);
      setLicenseDetails(null);
      setLicenseError(error?.response?.data?.message || error?.message || 'Failed to check license');
    } finally {
      setLicenseLoading(false);
    }
  }, [getLeadState]);

  // Fetch call logs when lead is selected
  const fetchCallLogs = useCallback(async (lead) => {
    if (!lead) {
      setCallLogs([]);
      return;
    }

    const mortgageId = lead.originalData?.mortgage_id || lead.mortgage_id || lead.identifier || lead.id;
    if (!mortgageId) {
      setCallLogs([]);
      return;
    }

    setCallLogsLoading(true);
    try {
      const response = await dialerService.getCallLogs({
        page: 1,
        per_page: 100,
        mortgage_id: mortgageId
      });

      if (response.status === 200 && response.data) {
        // Transform API data to match component structure
        const transformedLogs = response.data.map(log => ({
          id: log.id,
          date: log.started_at ? new Date(log.started_at).toISOString().split('T')[0] : '',
          time: log.started_at ? new Date(log.started_at).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          }) : '',
          duration: log.duration_seconds 
            ? `${Math.floor(log.duration_seconds / 60)}:${String(log.duration_seconds % 60).padStart(2, '0')}`
            : '0:00',
          status: log.status || 'completed',
          to_number: log.to_number || '',
          outbound_number: log.outbound_number || {},
          transcription: log.transcription || {},
          recording: log.recording || {},
          twilio_call_sid: log.twilio_call_sid || '',
          started_at: log.started_at || '',
          ended_at: log.ended_at || ''
        }));
        setCallLogs(transformedLogs);
      } else {
        setCallLogs([]);
      }
    } catch (error) {
      console.error('Error fetching call logs:', error);
      setCallLogs([]);
    } finally {
      setCallLogsLoading(false);
    }
  }, []);

  // Check license when lead is selected
  useEffect(() => {
    if (selectedLead) {
      checkLicense(selectedLead);
      fetchCallLogs(selectedLead);
    } else {
      setLicenseDetails(null);
      setLicenseError(null);
      setCallLogs([]);
    }
  }, [selectedLead, checkLicense, fetchCallLogs]);

  const makeCall = useCallback(async () => {
    if (!selectedLead) {
      setCallStatus('Please select a lead first');
      return;
    }
    
    // Verify outbound number is selected and has a valid phone number
    if (!selectedOutboundNumber) {
      setCallStatus('Please select an outbound number first');
      return;
    }

    if (!selectedOutboundNumber.phone || !selectedOutboundNumber.phone.trim()) {
      setCallStatus('Selected outbound number is invalid. Please select a valid number.');
      return;
    }

    // Check if license exists for the lead's state
    if (!licenseDetails) {
      const leadState = getLeadState(selectedLead);
      setCallStatus(`License required for state: ${leadState || 'Unknown'}. Please upload license in Profile.`);
      return;
    }

    // Get mortgage_id from lead
    const mortgageId = selectedLead.originalData?.mortgage_id || selectedLead.mortgage_id || selectedLead.identifier || selectedLead.id;
    if (!mortgageId) {
      setCallStatus('Lead mortgage ID not found');
      return;
    }

    // Generate UUID4
    const callUuid = uuidv4();
    
    // Format phone number for API (E.164 format with + prefix)
    const formatPhoneForAPI = (phone) => {
      if (!phone) return '';
      // Remove all non-digits first
      const digits = phone.replace(/\D/g, '');
      if (!digits) return '';
      
      // If it starts with 1 and has 11 digits, it's US/Canada - add +
      if (digits.length === 11 && digits.startsWith('1')) {
        return `+${digits}`;
      }
      // If it has 10 digits, assume US/Canada and add +1
      if (digits.length === 10) {
        return `+1${digits}`;
      }
      // For other lengths, add + prefix
      return `+${digits}`;
    };

    const toNumber = formatPhoneForAPI(selectedLead.phone);
    if (!toNumber || toNumber.length < 10) {
      setCallStatus('Lead phone number is invalid');
      return;
    }
    
    try {
      setCallStatus('Initializing call...');
      setIsDialing(true);
      setIsCallEnded(false);
      
      // Initialize Twilio with call parameters (this will call the API)
      await initializeTwilio(toNumber, mortgageId, callUuid);
      
      // Wait a bit for device to be ready
      if (!deviceRef.current) {
        throw new Error('Device not initialized');
      }

      setCallStatus('Dialing...');
      
      // Format phone numbers for Twilio (ensure E.164 format with +)
      const formatPhoneForTwilio = (phone) => {
        if (!phone) return '';
        // Remove all non-digits first
        const digits = phone.replace(/\D/g, '');
        // If it starts with 1 and has 11 digits, it's US/Canada - add +
        if (digits.length === 11 && digits.startsWith('1')) {
          return `+${digits}`;
        }
        // If it has 10 digits, assume US/Canada and add +1
        if (digits.length === 10) {
          return `+1${digits}`;
        }
        // If it already has +, return as is
        if (phone.startsWith('+')) {
          return phone;
        }
        // Otherwise, add + prefix
        return `+${digits}`;
      };

      callRef.current = await deviceRef.current.connect({ 
        params: { 
          To: formatPhoneForTwilio(selectedLead.phone),
          From: formatPhoneForTwilio(selectedOutboundNumber.phone),
          CallerId: formatPhoneForTwilio(selectedOutboundNumber.phone),
          leadId: selectedLead.id
        } 
      });

      console.log(formatPhoneForTwilio(selectedLead.phone), formatPhoneForTwilio(selectedOutboundNumber.phone))
      console.log(callRef.current)
      console.log(deviceRef.current)

      window.currentTwilioCall = callRef.current;

      callRef.current.on('accept', () => {
        setCallStatus('Connected');
        setIsCallActive(true);
        setIsDialing(false);
        startCallTimer();
        setTranscript('Call in progress... Live transcription will appear here.');
        
        if (audioElementRef.current) {
          audioElementRef.current.play().catch(e => console.log('Audio play prevented:', e));
        }
        
        const now = new Date();
        const newCall = {
          date: now.toISOString().split('T')[0],
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          status: 'connected',
          duration: '0:00'
        };
        setCallHistory(prev => [newCall, ...prev]);
      });

      callRef.current.on('disconnect', () => {
        // Get current duration from ref before stopping timer
        const currentDuration = callDurationRef.current;
        const duration = formatCallDuration(currentDuration);
        setCallStatus('Call ended');
        setIsCallActive(false);
        setIsDialing(false);
        setIsCallEnded(true);
        stopCallTimer();
        callDurationRef.current = 0;
        setCallDuration(0);
        setTranscript('Call ended. Transcription will be saved.');
        
        window.currentTwilioCall = null;
        
        if (currentDuration > 0) {
          setCallHistory(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[0] = { ...updated[0], duration, status: 'completed' };
            }
            return updated;
          });
        }
        
        callRef.current = null;
      });

      callRef.current.on('error', (error) => {
        setCallStatus(`Call error: ${error.message}`);
        setIsCallActive(false);
        setIsDialing(false);
        setIsCallEnded(true);
        stopCallTimer();
        
        window.currentTwilioCall = null;
        callRef.current = null;
      });

      callRef.current.on('mute', (isMuted) => {
        console.log(`Call ${isMuted ? 'muted' : 'unmuted'}`);
      });

    } catch (error) {
      console.error('Call failed:', error);
      setCallStatus(`Call failed: ${error.message || 'Unknown error'}`);
      setIsDialing(false);
      setIsCallEnded(true);
      
      // Clean up device if initialization failed
      if (deviceRef.current && !isInitializedRef.current) {
        try {
          deviceRef.current.destroy();
          deviceRef.current = null;
        } catch (cleanupError) {
          console.error('Error cleaning up device:', cleanupError);
        }
      }
      
      window.currentTwilioCall = null;
    }
  }, [selectedLead, selectedOutboundNumber, licenseDetails, getLeadState, initializeTwilio, startCallTimer, stopCallTimer, formatCallDuration]);

  const hangupCall = useCallback(() => {
    if (callRef.current) {
      callRef.current.disconnect();
    } else if (window.currentTwilioCall) {
      window.currentTwilioCall.disconnect();
    }
    setIsCallActive(false);
    setIsDialing(false);
    setIsCallEnded(true);
    stopCallTimer();
    setCallStatus('Call ended');
    
    window.currentTwilioCall = null;
  }, [stopCallTimer]);

  const setCallMute = useCallback(async (mute) => {
    const call = callRef.current || window.currentTwilioCall;
    
    if (call && typeof call.mute === 'function' && typeof call.unmute === 'function') {
      try {
        if (mute) {
          await call.mute();
          console.log('Call muted');
        } else {
          await call.unmute();
          console.log('Call unmuted');
        }
      } catch (error) {
        console.error('Error toggling mute:', error);
      }
    } else {
      console.warn('No active call found for mute control');
    }
  }, []);

  const getCurrentCall = useCallback(() => {
    return callRef.current || window.currentTwilioCall;
  }, []);

  const value = {
    // State
    callStatus,
    isCallActive,
    isDialing,
    isCallEnded,
    callDuration,
    selectedLead,
    selectedOutboundNumber,
    transcript,
    callHistory,
    callLogs,
    callLogsLoading,
    showScheduleModal,
    
    // Actions
    setSelectedLead,
    setSelectedOutboundNumber,
    makeCall,
    hangupCall,
    setCallMute,
    getCurrentCall,
    formatCallDuration,
    requestMicrophonePermission,
    setShowScheduleModal,
    fetchCallLogs,
    licenseDetails,
    licenseError,
    licenseLoading,
    checkLicense
  };

  return (
    <CallContext value={value}>
      {children}
    </CallContext>
  );
}

CallProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

