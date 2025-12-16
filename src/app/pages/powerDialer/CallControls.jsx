import {
  MicrophoneIcon,
  PhoneXMarkIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  NoSymbolIcon
} from '@heroicons/react/24/solid';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCallContext } from 'app/contexts/call/context';

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
  const { selectedPhoneNumber: contextSelectedPhoneNumber, setSelectedPhoneNumber: setContextSelectedPhoneNumber } = useCallContext();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [audioPermission, setAudioPermission] = useState(false);
  const audioContextRef = useRef(null);
  const [availablePhoneNumbers, setAvailablePhoneNumbers] = useState([]);
  // Use context selectedPhoneNumber if available, otherwise use local state as fallback
  const [localSelectedPhoneNumber, setLocalSelectedPhoneNumber] = useState('');
  const selectedPhoneNumber = contextSelectedPhoneNumber || localSelectedPhoneNumber;

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTwilioCall = useCallback(() => {
    return window.currentTwilioCall || currentCall || null;
  }, [currentCall]);

  // Extract all available phone numbers from lead data
  const extractPhoneNumbers = useCallback((lead) => {
    if (!lead) return [];
    
    const phoneNumbers = new Set();
    
    // Check ivr_response first (number and ani)
    const ivrResponse = lead.originalData?.ivr_response;
    
    if (ivrResponse) {
      if (ivrResponse.number && ivrResponse.number.trim()) {
        phoneNumbers.add(ivrResponse.number.trim());
      }
      if (ivrResponse.ani && ivrResponse.ani.trim()) {
        phoneNumbers.add(ivrResponse.ani.trim());
      }
    }
    
    // If ivr_response has no phone numbers, check ivr_logs
    // Also check ivr_logs to get all available numbers (no duplicates)
    if (lead.originalData?.ivr_logs && Array.isArray(lead.originalData.ivr_logs)) {
      lead.originalData.ivr_logs.forEach((log) => {
        if (log.number && log.number.trim()) {
          phoneNumbers.add(log.number.trim());
        }
        if (log.ani && log.ani.trim()) {
          phoneNumbers.add(log.ani.trim());
        }
      });
    }
    
    // Also check direct phone fields as fallback
    if (lead.phone && lead.phone.trim()) {
      phoneNumbers.add(lead.phone.trim());
    }
    if (lead.originalData?.phone && lead.originalData.phone.trim()) {
      phoneNumbers.add(lead.originalData.phone.trim());
    }
    
    return Array.from(phoneNumbers).filter(num => num && num !== 'N/A');
  }, []);

  // Update available phone numbers when lead changes
  useEffect(() => {
    // Don't update phone numbers if a call is in progress - preserve the selected number
    if (isCallActive || isDialing) {
      return;
    }
    
    if (selectedLead) {
      const numbers = extractPhoneNumbers(selectedLead);
      setAvailablePhoneNumbers(numbers);
      
      // Only set default phone number if:
      // 1. No phone number is currently selected in context, OR
      // 2. The currently selected number is not in the available numbers for this lead
      const currentSelected = contextSelectedPhoneNumber || localSelectedPhoneNumber;
      // Check if current number is valid (exists in available numbers or matches lead's phone)
      const isCurrentNumberValid = currentSelected && (
        numbers.includes(currentSelected) || 
        currentSelected === selectedLead.phone ||
        currentSelected === selectedLead.originalData?.phone
      );
      
      // Only reset if current number is not valid AND we're not in the middle of making a call
      if (!isCurrentNumberValid && !isDialing && !isCallActive) {
        // Set the first available number as selected, or use the lead's phone
        const defaultNumber = numbers.length > 0 ? (selectedLead.phone || numbers[0]) : (selectedLead.phone || '');
        // Update both context and local state only if we're setting a new default
        if (setContextSelectedPhoneNumber && defaultNumber) {
          setContextSelectedPhoneNumber(defaultNumber);
        }
        if (defaultNumber) {
          setLocalSelectedPhoneNumber(defaultNumber);
        }
      }
    } else {
      setAvailablePhoneNumbers([]);
      // Clear both context and local state only if lead is cleared
      if (setContextSelectedPhoneNumber) {
        setContextSelectedPhoneNumber(null);
      }
      setLocalSelectedPhoneNumber('');
    }
  }, [selectedLead, extractPhoneNumbers, setContextSelectedPhoneNumber, contextSelectedPhoneNumber, localSelectedPhoneNumber, isCallActive, isDialing]);

  // Format phone number for display
  const formatPhoneDisplay = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/^\+1/, '').replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Handle phone number selection change
  const handlePhoneNumberChange = (phone) => {
    // Update both context and local state
    if (setContextSelectedPhoneNumber) {
      setContextSelectedPhoneNumber(phone);
    }
    setLocalSelectedPhoneNumber(phone);
  };

  // Override makeCall to use selected phone number
  const handleMakeCallWithSelectedNumber = useCallback(() => {
    // Use the currently selected phone number (from context or local state)
    // This is the number the user selected from the dropdown
    // Prioritize context value as it's the source of truth
    let phoneToUse = contextSelectedPhoneNumber || selectedPhoneNumber;
    
    // If no phone number is selected, fall back to available numbers or lead's phone
    if (!phoneToUse || phoneToUse === '') {
      if (availablePhoneNumbers.length > 0) {
        phoneToUse = availablePhoneNumbers[0];
      } else {
        phoneToUse = selectedLead?.phone;
      }
    }
    
    if (!phoneToUse) {
      console.error('No phone number available to make call');
      return;
    }
    
    // CRITICAL: Store the phone number in context FIRST, before making the call
    // This ensures it's preserved even if useEffect runs
    if (setContextSelectedPhoneNumber) {
      setContextSelectedPhoneNumber(phoneToUse);
    }
    
    // Also update local state to keep in sync
    setLocalSelectedPhoneNumber(phoneToUse);
    
    // Make the call with the selected phone number
    // Pass the phone number directly to onMakeCall
    // The phone number is already stored in context, so it will be preserved
    if (onMakeCall) {
      // Pass the selected phone number to makeCall - this is the "to number"
      console.log('CallControls - Making call to selected number:', phoneToUse);
      onMakeCall(phoneToUse);
    }
  }, [contextSelectedPhoneNumber, selectedPhoneNumber, availablePhoneNumbers, selectedLead, onMakeCall, setContextSelectedPhoneNumber]);

  useEffect(() => {
    // Wait a bit for navigator to be fully available
    const checkPermissions = async () => {
      // Retry mechanism in case navigator.mediaDevices isn't immediately available
      let retries = 3;
      while (retries > 0) {
        if (navigator && navigator.mediaDevices) {
          await checkAudioPermissions();
          return; // Exit if successful
        }
        retries--;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Only set permission to false if we're sure it's not available
      // Don't show warning as this might be normal in some contexts
      if (!navigator || !navigator.mediaDevices) {
        setAudioPermission(false);
      }
    };
    
    checkPermissions();
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
    // Check if navigator and getUserMedia are available
    if (!navigator) {
      console.warn('navigator is not available');
      setAudioPermission(false);
      return;
    }

    if (!navigator.mediaDevices) {
      console.warn('navigator.mediaDevices is not available in this browser');
      setAudioPermission(false);
      return;
    }

    if (!navigator.mediaDevices.getUserMedia) {
      console.warn('getUserMedia is not supported in this browser');
      setAudioPermission(false);
      return;
    }

    try {
      // Try Permission API first (not supported in all browsers, especially Safari)
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
          setAudioPermission(permissionStatus.state === 'granted');
          permissionStatus.onchange = () => {
            setAudioPermission(permissionStatus.state === 'granted');
          };
          return;
        } catch (permError) {
          // Permission API not supported or failed, fall through to getUserMedia check
          console.warn('Permission API not supported:', permError);
        }
      }
      
      // Fallback: Try to get a media stream to check permission
      // Use basic constraints to avoid browser compatibility issues
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setAudioPermission(true);
      } catch (streamError) {
        // Permission not granted or other error
        console.warn('Microphone access check failed:', streamError);
        setAudioPermission(false);
      }
    } catch (error) {
      console.warn('Error checking audio permissions:', error);
      setAudioPermission(false);
    }
  };

  const requestMicrophonePermission = async () => {
  console.log("Navigator:", navigator);

  // 1️⃣ Check if browser supports audio
  if (!navigator?.mediaDevices?.getUserMedia) {
    alert("Microphone access is not supported in this browser.");
    setAudioPermission(false);
    return false;
  }

  // 2️⃣ Check if microphone devices exist before requesting permission
  const devices = await navigator.mediaDevices.enumerateDevices();
  const hasMic = devices.some(d => d.kind === "audioinput");

  if (!hasMic) {
    alert(
      "No microphone detected.\n\n" +
      "👉 If you are on Windows, enable microphone in:\n" +
      "Settings → Privacy & Security → Microphone.\n\n" +
      "👉 If using a desktop PC, plug in a microphone or headset."
    );
    setAudioPermission(false);
    return false;
  }

  try {
    let stream;

    // 3️⃣ Try getting permission
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (basicError) {
      // Retry with advanced constraints
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch {
  throw basicError;
      }
    }

    // 4️⃣ If permission granted
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setAudioPermission(true);
      console.log("Microphone permission granted.");
      return true;
    }

  } catch (error) {
    console.error("Microphone permission error:", error);

    let errorMessage = "Microphone permission is required.";

    switch (error.name) {
      case "NotAllowedError":
      case "PermissionDeniedError":
        errorMessage =
          "Microphone permission was denied.\n\n" +
          "➡️ FIX:\n" +
          "1. Click the padlock (🔒) in the browser address bar.\n" +
          "2. Set Microphone → Allow.\n" +
          "3. Reload the page.";
        break;

      case "NotFoundError":
      case "DevicesNotFoundError":
        errorMessage =
          "No microphone found on this device.\n" +
          "Please connect a microphone and try again.";
        break;

      case "SecurityError":
        errorMessage =
          "Microphone access requires HTTPS or localhost.\n" +
          "Make sure you're running on https:// or http://localhost.";
        break;

      case "NotReadableError":
      case "TrackStartError":
        errorMessage =
          "Your microphone is being used by another app.\n" +
          "Close Zoom / Teams / WhatsApp Desktop and try again.";
        break;

      case "OverconstrainedError":
      case "ConstraintNotSatisfiedError":
        errorMessage =
          "Microphone settings are not supported by this device.";
        break;

      default:
        errorMessage =
          "Unable to access the microphone.\n" +
          "Please check browser & OS microphone permissions.";
    }

    alert(errorMessage);
    setAudioPermission(false);
    return false;
  }

  setAudioPermission(false);
  return false;
};

  // const requestMicrophonePermission = async () => {
  //   console.log(navigator)
  //   // Check if getUserMedia is available
  //   if (!navigator?.mediaDevices?.getUserMedia) {
  //     const errorMsg = 'Microphone access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.';
  //     alert(errorMsg);
  //     setAudioPermission(false);
  //     return false;
  //   }

  //   try {
  //     // Simple approach: just try to get user media
  //     // The browser will handle all the checks and throw appropriate errors
  //     let stream;
      
  //     // Try with basic audio first (most compatible)
  //     try {
  //       stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //     } catch (basicError) {
  //       // If basic fails, try with enhanced constraints
  //       try {
  //         stream = await navigator.mediaDevices.getUserMedia({
  //           audio: {
  //             echoCancellation: true,
  //             noiseSuppression: true,
  //             autoGainControl: true
  //           }
  //         });
  //       } catch {
  //         throw basicError; // Throw the original error
  //       }
  //     }

  //     // Successfully got stream
  //     if (stream) {
  //       stream.getTracks().forEach(track => track.stop());
  //       setAudioPermission(true);
  //       console.log('Microphone permission granted');
  //       return true;
  //     }
  //   } catch (error) {
  //     console.error('Microphone permission error:', error);
  //     setAudioPermission(false);
      
  //     // Provide user-friendly error messages
  //     let errorMessage = 'Microphone permission is required for calling.';
      
  //     if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
  //       errorMessage = 'Microphone permission was denied. Please allow microphone access in your browser settings and try again.';
  //     } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
  //       errorMessage = 'No microphone found. Please connect a microphone and try again.';
  //     } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
  //       errorMessage = 'Microphone is already in use by another application. Please close other applications using the microphone and try again.';
  //     } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
  //       errorMessage = 'Microphone settings are not supported. Please try again.';
  //     } else if (error.name === 'SecurityError') {
  //       errorMessage = 'Microphone access requires HTTPS or localhost. Please access this page over a secure connection.';
  //     } else if (error.name === 'TypeError' || error.message?.includes('getUserMedia')) {
  //       errorMessage = 'Microphone access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.';
  //     }
      
  //     alert(errorMessage);
  //     return false;
  //   }
    
  //   return false;
  // };

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

      // Check if navigator.mediaDevices is available
      if (!navigator || !navigator.mediaDevices) {
        console.warn('navigator.mediaDevices not available for speaker control');
        return;
      }

      // Request permission to get audio devices (if not already granted)
      if (!audioPermission && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (permError) {
          console.warn('Permission needed for speaker control:', permError);
          // Continue anyway, as we might still be able to enumerate devices
        }
      }
      
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

  const isCallInProgress = isCallActive || isDialing;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 w-full max-w-sm text-center ${
      isCallInProgress ? 'p-3' : 'p-6'
    }`}>
      {!audioPermission && !isCallInProgress && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg p-2 mb-3 text-xs">
          <p>Microphone access required</p>
          <button
            onClick={async () => {
              await requestMicrophonePermission();
              // Re-check permissions after request
              await checkAudioPermissions();
            }}
            className="mt-1.5 px-2 py-0.5 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition-colors"
          >
            Grant Permission
          </button>
        </div>
      )}

      {/* License Warning - Hide during active call */}
      {selectedLead && !licenseLoading && !licenseDetails && licenseError && !isCallInProgress && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg p-2 mb-3 text-xs">
          <p className="font-medium text-xs">⚠️ License Required</p>
          <p className="mt-0.5 text-xs">{licenseError}</p>
          <p className="mt-1 text-xs">Please upload license in Profile page.</p>
        </div>
      )}

      {/* License Loading - Hide during active call */}
      {selectedLead && licenseLoading && !isCallInProgress && (
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg p-2 mb-3 text-xs">
          <p className="text-xs">Checking license...</p>
        </div>
      )}

      {/* License Verified - Hide during active call */}
      {selectedLead && licenseDetails && !licenseError && !isCallInProgress && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg p-2 mb-3 text-xs">
          <p className="font-medium text-xs">✓ License Verified</p>
          <p className="mt-0.5 text-xs">State: {licenseDetails.state || 'N/A'}</p>
        </div>
      )}

      {/* Wallet Balance Warning - Hide during active call */}
      {selectedLead && (!hasSufficientBalance && walletBalance !== null) && !isCallInProgress && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg p-2 mb-3 text-xs">
          <p className="font-medium text-xs">⚠️ Insufficient Wallet Balance</p>
          <p className="mt-0.5 text-xs">
            Your wallet balance is ${typeof walletBalance === 'number' && !isNaN(walletBalance) ? parseFloat(walletBalance).toFixed(2) : '0.00'}. 
            Please recharge your wallet to make calls.
          </p>
        </div>
      )}

      {/* Outbound Number Warning - Hide during active call */}
      {selectedLead && !hasValidOutboundNumber && !isCallInProgress && (
        <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg p-2 mb-3 text-xs">
          <p className="font-medium text-xs">⚠️ Outbound Number Required</p>
          <p className="mt-0.5 text-xs">Please select a valid outbound number to make calls.</p>
        </div>
      )}

      {/* Lead info - Hide avatar during active call, reduce size */}
      <div className={`flex items-center justify-center gap-3 ${isCallInProgress ? 'mb-2' : 'mb-4'}`}>
        {!isCallInProgress && (
          <div className={`${isCallInProgress ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0`}>
            <span className={`text-blue-600 dark:text-blue-400 font-bold ${isCallInProgress ? 'text-xs' : 'text-sm'}`}>
              {getInitials(selectedLead.name)}
            </span>
          </div>
        )}
        <div className="flex flex-col items-center">
          <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${isCallInProgress ? 'text-sm' : 'text-base'}`}>
            {selectedLead.name}
          </h3>
          {!isCallInProgress && availablePhoneNumbers.length > 1 ? (
            <div className="mt-1 w-full">
              <select
                value={selectedPhoneNumber}
                onChange={(e) => handlePhoneNumberChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:border-[var(--color-atoll)] focus:ring-2 focus:ring-[var(--color-atoll)] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
              >
                {availablePhoneNumbers.map((phone, index) => (
                  <option key={index} value={phone}>
                    {formatPhoneDisplay(phone)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className={`text-gray-600 dark:text-gray-300 ${isCallInProgress ? 'text-xs' : 'text-xs'}`}>
              {formatPhoneDisplay(contextSelectedPhoneNumber || selectedPhoneNumber || selectedLead?.phone || 'N/A')}
            </p>
          )}
        </div>
      </div>

      {/* Status - Smaller during active call */}
      {isDialing && (
        <div className={`bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full inline-block font-medium ${isCallInProgress ? 'px-1.5 py-0.5 text-xs mb-2' : 'px-3 py-0.5 text-xs mb-3'}`}>
          Dialing...
        </div>
      )}
      {isCallActive && callDuration > 0 && (
        <div className={`bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full inline-block font-medium ${isCallInProgress ? 'px-1.5 py-0.5 text-xs mb-2' : 'px-3 py-0.5 text-xs mb-3'}`}>
          Connected • {formatCallDuration(callDuration)}
        </div>
      )}
      {isCallEnded && !isCallInProgress && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full px-3 py-0.5 inline-block font-medium text-xs mb-3">
          Call Ended
        </div>
      )}

      {/* Indicators - Smaller during active call */}
      {(isCallActive || isDialing) && (
        <div className={`flex justify-center gap-3 ${isCallInProgress ? 'mb-2 text-xs' : 'mb-3 text-xs'}`}>
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
            isMuted ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {isMuted ? <NoSymbolIcon className={isCallInProgress ? "w-2 h-2" : "w-2.5 h-2.5"} /> : <MicrophoneIcon className={isCallInProgress ? "w-2 h-2" : "w-2.5 h-2.5"} />}
            <span className="text-xs">{isMuted ? 'Muted' : 'Mic On'}</span>
          </div>
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
            isSpeakerOn ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {isSpeakerOn ? <SpeakerWaveIcon className={isCallInProgress ? "w-2 h-2" : "w-2.5 h-2.5"} /> : <SpeakerXMarkIcon className={isCallInProgress ? "w-2 h-2" : "w-2.5 h-2.5"} />}
            <span className="text-xs">{isSpeakerOn ? 'Speaker On' : 'Receiver'}</span>
          </div>
        </div>
      )}

      {/* Buttons - Smaller during active call */}
      <div className={`flex items-center justify-center ${isCallInProgress ? 'gap-2 mt-2' : 'gap-4 mt-3'}`}>
        {/* Mute */}
        <button
          onClick={handleMuteToggle}
          disabled={!isCallActive && !isDialing}
          className={`${isCallInProgress ? 'w-8 h-8' : 'w-10 h-10'} flex items-center justify-center rounded-full transition-all duration-200 ${
            isMuted
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 shadow-inner'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 shadow-sm'
          } ${(!isCallActive && !isDialing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMuted ? <NoSymbolIcon className={isCallInProgress ? "w-4 h-4" : "w-5 h-5"} /> : <MicrophoneIcon className={isCallInProgress ? "w-4 h-4" : "w-5 h-5"} />}
        </button>

        {/* Schedule Appointment */}
        <button
          onClick={onScheduleAppointment}
          disabled={!selectedLead}
          className={`${isCallInProgress ? 'w-8 h-8' : 'w-10 h-10'} flex items-center justify-center rounded-full transition-all duration-200 ${
            selectedLead
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40 shadow-sm'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 opacity-50 cursor-not-allowed'
          }`}
          title={selectedLead ? 'Schedule appointment' : 'Select a lead to schedule appointment'}
        >
          <CalendarIcon className={isCallInProgress ? "w-4 h-4" : "w-5 h-5"} />
        </button>

        {/* Hangup / Call */}
        <button
          onClick={isCallActive || isDialing ? onHangupCall : handleMakeCallWithSelectedNumber}
          disabled={(!canMakeCall && !isCallActive && !isDialing)}
          className={`${isCallInProgress ? 'w-10 h-10' : 'w-14 h-14'} flex items-center justify-center rounded-full shadow-md transition-all duration-200 ${
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
          <PhoneXMarkIcon className={isCallInProgress ? "w-5 h-5" : "w-7 h-7"} />
        </button>

        {/* Speaker */}
        <button
          onClick={handleSpeakerToggle}
          disabled={!isCallActive && !isDialing}
          className={`${isCallInProgress ? 'w-8 h-8' : 'w-10 h-10'} flex items-center justify-center rounded-full transition-all duration-200 ${
            isSpeakerOn
              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 shadow-inner'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 shadow-sm'
          } ${(!isCallActive && !isDialing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={isSpeakerOn ? 'Switch to receiver' : 'Switch to speaker'}
        >
          {isSpeakerOn ? <SpeakerWaveIcon className={isCallInProgress ? "w-4 h-4" : "w-5 h-5"} /> : <SpeakerXMarkIcon className={isCallInProgress ? "w-4 h-4" : "w-5 h-5"} />}
        </button>
      </div>
    </div>
  );
};

export default CallControls;
