
const LiveTranscript = ({ transcript, isCallActive }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Live Transcript</h2>
      
      <div className="flex-1 bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-y-auto">
        <div className="whitespace-pre-wrap">
          {transcript}
        </div>
        
        {isCallActive && (
          <div className="flex items-center space-x-2 mt-4 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs">Live transcription active...</span>
          </div>
        )}
      </div>

      {/* Windows Activation Notice - as shown in the image */}
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
          Activate Windows<br />
          Go to Settings to activate Windows.
        </p>
      </div>
    </div>
  );
};

export default LiveTranscript;