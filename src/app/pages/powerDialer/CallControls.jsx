import {
  MicrophoneIcon,
  PhoneXMarkIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  NoSymbolIcon
} from '@heroicons/react/24/solid';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef, useCallback } from 'react';

const CallControls = ({
  isCallActive,
  isDialing,
  isCallEnded,
  onMakeCall,
  onHangupCall,
  selectedLead,
  callDuration,
  onMuteToggle,
  currentCall,
  selectedOutboundNumber,
  onScheduleAppointment,
  licenseDetails,
  licenseError,
  licenseLoading,
  walletBalance
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [audioPermission, setAudioPermission] = useState(false);
  const audioContextRef = useRef(null);

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTwilioCall = useCallback(() => {
    return window.currentTwilioCall || currentCall || null;
  }, [currentCall]);

  useEffect(() => {
    checkAudioPermissions();
  }, []);

  useEffect(() => {
    const call = getTwilioCall();
    if (call && typeof call.isMuted === 'function') {
      setIsMuted(call.isMuted());
    }
  }, [isCallActive, getTwilioCall]);

  useEffect(() => {
    if (isCallEnded || (!isCallActive && !isDialing)) {
      setIsMuted(false);
      setIsSpeakerOn(true);

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  }, [isCallActive, isDialing, isCallEnded]);

  const checkAudioPermissions = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
      setAudioPermission(permissionStatus.state === 'granted');
      permissionStatus.onchange = () => {
        setAudioPermission(permissionStatus.state === 'granted');
      };
    } catch (error) {
      console.warn('Permission API not supported:', error);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setAudioPermission(true);
      } catch {
        setAudioPermission(false);
      }
    }
  };

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
      setAudioPermission(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setAudioPermission(false);
      return false;
    }
  };

  // ✅ MUTE CONTROL
  const handleMuteToggle = async () => {
    if (!audioPermission) {
      const granted = await requestMicrophonePermission();
      if (!granted) {
        alert('Microphone permission is required to control mute.');
        return;
      }
    }

    const call = getTwilioCall();
    if (!call) return;

    const newMuteState = !isMuted;
    try {
      call.mute(newMuteState);
      setIsMuted(newMuteState);
      console.log(`Microphone ${newMuteState ? 'muted' : 'unmuted'}`);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }

    if (onMuteToggle) {
      onMuteToggle(newMuteState);
    }
  };

  // ✅ SPEAKER CONTROL (Twilio SDK)
  const handleSpeakerToggle = async () => {
    const newSpeakerState = !isSpeakerOn;
    setIsSpeakerOn(newSpeakerState);
    try {
      await toggleSpeakerOutput(newSpeakerState);
    } catch (error) {
      console.error('Error toggling speaker:', error);
    }
  };

  const toggleSpeakerOutput = async (speakerOn) => {
    try {
      const twilioDevice = window.twilioDevice;
      if (!twilioDevice || !twilioDevice.audio) {
        console.warn('No active Twilio Device found for speaker control');
        return;
      }

      // Request permission to get audio devices
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const outputDevices = devices.filter((d) => d.kind === 'audiooutput');

      if (outputDevices.length === 0) {
        console.warn('No audio output devices available.');
        return;
      }

      const speakerDevice = outputDevices.find((d) => /speaker/i.test(d.label));

      if (speakerOn && speakerDevice) {
        // Route to external speaker
        twilioDevice.audio.speakerDevices.set([speakerDevice.deviceId]);
        console.log(`✅ Audio routed to speaker: ${speakerDevice.label}`);
      } else {
        // Reset to default
        twilioDevice.audio.speakerDevices.set(outputDevices.map(d => d.deviceId));
        console.log('🔄 Audio routed to default output');
      }
    } catch (error) {
      console.error('Speaker toggle failed:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // --- UI ---
  if (!selectedLead) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Ready to Make Calls</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Select a lead from the list to start calling</p>
      </div>
    );
  }

  // Check if call is allowed
  // Verify outbound number exists and has a valid phone number
  const hasValidOutboundNumber = selectedOutboundNumber && 
    selectedOutboundNumber.phone && 
    selectedOutboundNumber.phone.trim();
  // Check if wallet balance is sufficient (must be > 0)
  const hasSufficientBalance = walletBalance !== null && walletBalance > 0;
  const canMakeCall = hasValidOutboundNumber && licenseDetails && !licenseError && hasSufficientBalance;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 w-full max-w-sm text-center">
      {!audioPermission && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg p-3 mb-4 text-sm">
          <p>Microphone access required</p>
          <button
            onClick={requestMicrophonePermission}
            className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
          >
            Grant Permission
          </button>
        </div>
      )}

      {/* License Warning */}
      {selectedLead && !licenseLoading && !licenseDetails && licenseError && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg p-3 mb-4 text-sm">
          <p className="font-medium">⚠️ License Required</p>
          <p className="mt-1 text-xs">{licenseError}</p>
          <p className="mt-2 text-xs">Please upload license in Profile page.</p>
        </div>
      )}

      {/* License Loading */}
      {selectedLead && licenseLoading && (
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg p-3 mb-4 text-sm">
          <p>Checking license...</p>
        </div>
      )}

      {/* License Verified */}
      {selectedLead && licenseDetails && !licenseError && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg p-3 mb-4 text-sm">
          <p className="font-medium">✓ License Verified</p>
          <p className="mt-1 text-xs">State: {licenseDetails.state || 'N/A'}</p>
        </div>
      )}

      {/* Wallet Balance Warning */}
      {selectedLead && (!hasSufficientBalance && walletBalance !== null) && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg p-3 mb-4 text-sm">
          <p className="font-medium">⚠️ Insufficient Wallet Balance</p>
          <p className="mt-1 text-xs">
            Your wallet balance is ${typeof walletBalance === 'number' && !isNaN(walletBalance) ? parseFloat(walletBalance).toFixed(2) : '0.00'}. 
            Please recharge your wallet to make calls.
          </p>
        </div>
      )}

      {/* Outbound Number Warning */}
      {selectedLead && !hasValidOutboundNumber && (
        <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg p-3 mb-4 text-sm">
          <p className="font-medium">⚠️ Outbound Number Required</p>
          <p className="mt-1 text-xs">Please select a valid outbound number to make calls.</p>
        </div>
      )}

      {/* Lead info */}
      <div className="flex flex-col items-center mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
          <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">
            {getInitials(selectedLead.name)}
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{selectedLead.name}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{selectedLead.phone}</p>
      </div>

      {/* Status */}
      {isDialing && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full px-4 py-1 inline-block font-medium text-sm mb-4">
          Dialing...
        </div>
      )}
      {isCallActive && callDuration > 0 && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full px-4 py-1 inline-block font-medium text-sm mb-4">
          Connected • {formatCallDuration(callDuration)}
        </div>
      )}
      {isCallEnded && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full px-4 py-1 inline-block font-medium text-sm mb-4">
          Call Ended
        </div>
      )}

      {/* Indicators */}
      {(isCallActive || isDialing) && (
        <div className="flex justify-center gap-4 mb-4 text-xs">
          <div className={`flex items-center gap-1 px-2 py-1 rounded ${
            isMuted ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {isMuted ? <NoSymbolIcon className="w-3 h-3" /> : <MicrophoneIcon className="w-3 h-3" />}
            <span>{isMuted ? 'Muted' : 'Mic On'}</span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded ${
            isSpeakerOn ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {isSpeakerOn ? <SpeakerWaveIcon className="w-3 h-3" /> : <SpeakerXMarkIcon className="w-3 h-3" />}
            <span>{isSpeakerOn ? 'Speaker On' : 'Receiver'}</span>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-center gap-6 mt-4">
        {/* Mute */}
        <button
          onClick={handleMuteToggle}
          disabled={!isCallActive && !isDialing}
          className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 ${
            isMuted
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 shadow-inner'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 shadow-sm'
          } ${(!isCallActive && !isDialing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMuted ? <NoSymbolIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
        </button>

        {/* Schedule Appointment */}
        <button
          onClick={onScheduleAppointment}
          disabled={!selectedLead}
          className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 ${
            selectedLead
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40 shadow-sm'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 opacity-50 cursor-not-allowed'
          }`}
          title={selectedLead ? 'Schedule appointment' : 'Select a lead to schedule appointment'}
        >
          <CalendarIcon className="w-6 h-6" />
        </button>

        {/* Hangup / Call */}
        <button
          onClick={isCallActive || isDialing ? onHangupCall : onMakeCall}
          disabled={(!canMakeCall && !isCallActive && !isDialing)}
          className={`w-16 h-16 flex items-center justify-center rounded-full shadow-md transition-all duration-200 ${
            isCallActive || isDialing
              ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transform hover:scale-105'
              : !canMakeCall
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transform hover:scale-105'
          }`}
          title={
            isCallActive || isDialing 
              ? 'Hang up call' 
              : !hasSufficientBalance
              ? 'Insufficient wallet balance. Please recharge to make calls.'
              : !hasValidOutboundNumber 
              ? 'Please select a valid outbound number first' 
              : !licenseDetails
              ? 'License required for this state. Please upload license in Profile.'
              : 'Make call'
          }
        >
          <PhoneXMarkIcon className="w-8 h-8 text-white" />
        </button>

        {/* Speaker */}
        <button
          onClick={handleSpeakerToggle}
          disabled={!isCallActive && !isDialing}
          className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 ${
            isSpeakerOn
              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 shadow-inner'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 shadow-sm'
          } ${(!isCallActive && !isDialing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={isSpeakerOn ? 'Switch to receiver' : 'Switch to speaker'}
        >
          {isSpeakerOn ? <SpeakerWaveIcon className="w-6 h-6" /> : <SpeakerXMarkIcon className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};

export default CallControls;
