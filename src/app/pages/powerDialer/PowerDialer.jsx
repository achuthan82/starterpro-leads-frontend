import { useState, useEffect, useRef } from 'react';
import { Device } from '@twilio/voice-sdk';
import { UserIcon, CpuChipIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import SharedSidebar from '../AegisSuite/components/SharedSidebar';
import LeadList from './LeadList';
import LeadInfo from './LeadInfo';
import CallControls from './CallControls';
import ScriptTranscript from './ScriptTranscript';
import OutboundNumberModal from './OutboundNumberModal';

const PowerDialer = () => {
  // State for leads and selection
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [callStatus, setCallStatus] = useState('Ready to Make Calls');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isDialing, setIsDialing] = useState(false);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [callingMode, setCallingMode] = useState('Human Agent');
  const [selectedScript, setSelectedScript] = useState('Opening');
  const [transcript, setTranscript] = useState('Call transcription will appear here when connected');
  const [activeTabs, setActiveTabs] = useState(['script']);
  const [callDuration, setCallDuration] = useState(0);
  const [callHistory, setCallHistory] = useState([
    { date: '2024-01-15', time: '8:42', status: 'interested', duration: '2:30' },
    { date: '2024-01-10', time: '14:15', status: 'callback', duration: '1:45' },
    { date: '2024-01-08', time: '11:20', status: 'not interested', duration: '0:45' }
  ]);
  const [selectedOutboundNumber, setSelectedOutboundNumber] = useState(null);
  const [showOutboundModal, setShowOutboundModal] = useState(false);

  const handleTabToggle = (tab) => {
    setActiveTabs((prev) =>
      prev.includes(tab)
        ? prev.filter((t) => t !== tab)
        : [...prev, tab]
    );
  };

  // Refs
  const deviceRef = useRef(null);
  const callRef = useRef(null);
  const callTimerRef = useRef(null);
  const audioElementRef = useRef(null);

  // Initialize audio element for better browser compatibility
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

  // Request microphone permissions on component mount
  useEffect(() => {
    requestMicrophonePermission();
  }, []);

  // Initialize Twilio Device
  useEffect(() => {
    initializeTwilio();
    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy();
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      // Clean up global call reference
      window.currentTwilioCall = null;
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

  const requestMicrophonePermission = async () => {
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
    } catch (error) {
      console.warn('Microphone permission not granted:', error);
      setCallStatus('Microphone access is required for calling');
    }
  };

  const initializeTwilio = async () => {
    try {
      setCallStatus('Initializing calling system...');
      
      await requestMicrophonePermission();
      
      const response = await fetch('https://call.abacies.com/react/token', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.token) {
        throw new Error('No token in response');
      }
      
      deviceRef.current = new Device(data.token, {
        codecPreferences: ['opus', 'pcmu'],
        debug: true,
        enableRingingState: true,
        closeProtection: true
      });

      deviceRef.current.on('registered', () => {
        setCallStatus('Ready to Make Calls');
      });

      deviceRef.current.on('error', (error) => {
        console.error('Device error:', error);
        setCallStatus(`Device error: ${error.message}`);
      });

      deviceRef.current.on('incoming', (call) => {
        console.log('Incoming call:', call);
      });

      deviceRef.current.register();

    } catch (error) {
      console.error('Initialization failed:', error);
      setCallStatus(`Initialization failed: ${error.message}`);
    }
  };

  const startCallTimer = () => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    // Remove +1 and format
    const cleaned = phone.replace(/^\+1/, '').replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const makeCall = async () => {
    if (!deviceRef.current || !selectedLead) {
      setCallStatus('Please select a lead first');
      return;
    }
    
    if (!selectedOutboundNumber) {
      setCallStatus('Please select an outbound number first');
      setShowOutboundModal(true);
      return;
    }
    
    try {
      setCallStatus('Dialing...');
      setIsDialing(true);
      setIsCallEnded(false);
      
      await requestMicrophonePermission();
      
      callRef.current = await deviceRef.current.connect({ 
        params: { 
          To: selectedLead.phone.replace(/\D/g, ''),
          from: 'power-dialer',
          leadId: selectedLead.id
        } 
      });

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
        const duration = formatCallDuration(callDuration);
        setCallStatus('Call ended');
        setIsCallActive(false);
        setIsDialing(false);
        setIsCallEnded(true);
        stopCallTimer();
        setCallDuration(0);
        setTranscript('Call ended. Transcription will be saved.');
        
        window.currentTwilioCall = null;
        
        if (callDuration > 0) {
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
        setIsCallActive(prev => !prev);
        setIsCallActive(prev => !prev);
      });

    } catch (error) {
      console.error('Call failed:', error);
      setCallStatus(`Call failed: ${error.message}`);
      setIsDialing(false);
      setIsCallEnded(true);
      
      window.currentTwilioCall = null;
    }
  };

  const hangupCall = () => {
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
  };

  const setCallMute = async (mute) => {
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
  };

  const getCurrentCall = () => {
    return callRef.current || window.currentTwilioCall;
  };

  const updateLeadStatus = (leadId, newStatus) => {
    // Status update will be handled by the API in LeadList component
    // This function is kept for compatibility with LeadInfo component
    console.log('Lead status update requested:', { leadId, newStatus });
  };

  // Handle outbound number selection
  const handleSelectOutboundNumber = (number) => {
    setSelectedOutboundNumber(number);
  };

  // Reset outbound number when lead changes
  useEffect(() => {
    if (selectedLead) {
      // Reset outbound number when a new lead is selected
      setSelectedOutboundNumber(null);
      setShowOutboundModal(true);
    } else {
      // Clear outbound number when no lead is selected
      setSelectedOutboundNumber(null);
    }
  }, [selectedLead?.id]); // Only trigger when lead ID changes

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      <SharedSidebar currentPath="/power-dialer" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">Power Dialer</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Advanced calling system with AI assistance</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Calling Mode:</span>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setCallingMode('Human Agent')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${
                    callingMode === 'Human Agent'
                      ? 'bg-white dark:bg-gray-600 text-[var(--color-atoll)] dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <UserIcon className="w-4 h-4 mr-1"/> Human Agent
                </button>
                <button
                  onClick={() => setCallingMode('AI Agent')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${
                    callingMode === 'AI Agent'
                      ? 'bg-white dark:bg-gray-600 text-[var(--color-atoll)] dark:text-gray-100 shadow-sm '
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <CpuChipIcon className="w-4 h-4 mr-1"/> AI Agent
                </button>
              </div>
            </div>
          </div>
          
          {/* Calling from Number Section */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Calling from:</span>
              {selectedOutboundNumber ? (
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-gray-900 dark:text-white">
                    {formatPhoneNumber(selectedOutboundNumber.phone)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">→</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedOutboundNumber.friendly_name || 'Outbound Number'}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-400 dark:text-gray-500 italic">No number selected</span>
              )}
            </div>
            <button
              onClick={() => setShowOutboundModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Change Number
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left Column - Leads List */}
            <div className="col-span-4">
              <LeadList
                selectedLead={selectedLead}
                onSelectLead={setSelectedLead}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>

            {/* Middle Column - Call Controls and Lead Info */}
            <div className="col-span-4 flex flex-col space-y-6">
              {/* Call Controls */}
              <CallControls
                isCallActive={isCallActive}
                isDialing={isDialing}
                isCallEnded={isCallEnded}
                onMakeCall={makeCall}
                onHangupCall={hangupCall}
                selectedLead={selectedLead}
                callDuration={callDuration}
                onMuteToggle={setCallMute}
                currentCall={getCurrentCall()}
                selectedOutboundNumber={selectedOutboundNumber}
              />

              {/* Lead Information */}
              <LeadInfo
                lead={selectedLead}
                onUpdateStatus={updateLeadStatus}
                callStatus={callStatus}
                isDialing={isDialing}
                isCallActive={isCallActive}
                callDuration={callDuration}
                callHistory={callHistory}
              />
            </div>

            {/* Right Column - Script and Transcript */}
            <div className="col-span-4">
              <ScriptTranscript
                activeTabs={activeTabs}
                onTabToggle={handleTabToggle}
                selectedScript={selectedScript}
                onScriptChange={setSelectedScript}
                lead={selectedLead}
                transcript={transcript}
                isCallActive={isCallActive}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Outbound Number Selection Modal */}
      <OutboundNumberModal
        isOpen={showOutboundModal}
        onClose={() => setShowOutboundModal(false)}
        selectedLead={selectedLead}
        onSelectNumber={handleSelectOutboundNumber}
      />
    </div>
  );
};

export default PowerDialer;