import { MicrophoneIcon, PhoneXMarkIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';

const CallControls = ({
  isCallActive,
  isDialing,
  isCallEnded,
  onMakeCall,
  onHangupCall,
  selectedLead,
  callDuration
}) => {
  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedLead) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <p className="text-gray-500 text-lg font-medium">Ready to Make Calls</p>
        <p className="text-gray-400 text-sm mt-1">Select a lead from the list to start calling</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-sm mx-auto text-center">
      {/* Profile Circle */}
      <div className="flex flex-col items-center mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
          <span className="text-blue-600 font-bold text-xl">{selectedLead.initials}</span>
        </div>
        <h3 className="font-semibold text-gray-900 text-lg">{selectedLead.name}</h3>
        <p className="text-gray-600 text-sm">{selectedLead.phone}</p>
        <p className="text-gray-500 text-sm mt-1">Calling from: (305) 123-4567</p>
      </div>

      {/* Status Label */}
      {isDialing && (
        <div className="bg-yellow-100 text-yellow-700 rounded-full px-4 py-1 inline-block font-medium text-sm mb-4">
          Dialing...
        </div>
      )}
      {isCallActive && (
        <div className="bg-green-100 text-green-700 rounded-full px-4 py-1 inline-block font-medium text-sm mb-4">
          Connected • {formatCallDuration(callDuration)}
        </div>
      )}
      {isCallEnded && (
        <div className="bg-red-100 text-red-700 rounded-full px-4 py-1 inline-block font-medium text-sm mb-4">
          Call Ended
        </div>
      )}

      {/* Call Control Buttons */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <button className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition">
          <MicrophoneIcon className="w-6 h-6 text-gray-600" />
        </button>

        <button
          onClick={isCallActive || isDialing ? onHangupCall : onMakeCall}
          className={`w-16 h-16 flex items-center justify-center rounded-full shadow-md transition ${
            isCallActive || isDialing
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          <PhoneXMarkIcon className="w-8 h-8 text-white" />
        </button>

        <button className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition">
          <SpeakerWaveIcon className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default CallControls;
