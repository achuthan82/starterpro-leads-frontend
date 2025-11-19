import { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/solid";
import { useAuthContext } from "app/contexts/auth/context";

export default function ScriptTranscript({ 
  activeTabs = ["script"], 
  onTabToggle, 
  // eslint-disable-next-line no-unused-vars
  selectedScript = "Opening", 
  // eslint-disable-next-line no-unused-vars
  onScriptChange, 
  // eslint-disable-next-line no-unused-vars
  lead, 
  transcript = "Call transcription will appear here when connected", 
  isCallActive = false,
  callLogs = [],
  callLogsLoading = false
}) {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState(activeTabs[0] || "script");
  
  // Sync with parent activeTabs
  useEffect(() => {
    if (activeTabs.length > 0 && activeTabs[0] !== activeTab) {
      setActiveTab(activeTabs[0]);
    }
  }, [activeTabs]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabToggle) {
      onTabToggle(tab);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4">
      {/* Tabs Header */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
        <button
          onClick={() => handleTabClick("script")}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition ${
            activeTab === "script"
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
          }`}
        >
          <DocumentTextIcon className="w-5 h-5" />
          Script
        </button>

        <button
          onClick={() => handleTabClick("transcript")}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition ${
            activeTab === "transcript"
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
          }`}
        >
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
          Live Transcript
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "script" && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-200">Call Script</h2>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Opening", color: "indigo" },
              { name: "Qualification", color: "green" },
              { name: "Objections", color: "yellow" },
              { name: "Closing", color: "purple" },
              { name: "Follow-up", color: "red" },
              { name: "Appointment", color: "blue" },
              { name: "Voicemail", color: "gray" },
              { name: "Referral", color: "pink" },
            ].map((tag) => (
              <span
                key={tag.name}
                className={`text-xs font-medium px-2 py-1 rounded-md ${
                  tag.color === "indigo"
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                    : tag.color === "green"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : tag.color === "yellow"
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    : tag.color === "purple"
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                    : tag.color === "red"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    : tag.color === "blue"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : tag.color === "gray"
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    : "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400"
                }`}
              >
                {tag.name}
              </span>
            ))}
          </div>

          {/* Script Text */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Hi Michael, this is Sarah Wilson from {user?.agency?.name}. I hope I&apos;m catching you at a good
            time.
            <br />
            <br />
            I&apos;m calling because you recently responded to our information about mortgage protection
            insurance. I understand you own a home in FL-33101 and may be interested in protecting
            your family&apos;s mortgage payments if something unexpected happens to you.
          </div>
        </div>
      )}

      {activeTab === "transcript" && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-200">
            {isCallActive ? "Live Transcription" : "Call Transcripts"}
          </h2>

          {isCallActive ? (
            // Show live transcript during active call
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 leading-relaxed min-h-[200px]">
              {transcript || "Call transcription will appear here when connected"}
            </div>
          ) : callLogsLoading ? (
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-10 rounded-lg">
              <ChatBubbleLeftEllipsisIcon className="w-8 h-8 opacity-50 mb-2 animate-pulse" />
              <p>Loading transcripts...</p>
            </div>
          ) : callLogs.length > 0 ? (
            // Show call logs transcripts
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {callLogs.map((log) => {
                // Get transcription data from API response
                const transcriptionData = log.transcription_data || log.transcription || {};
                const aggregatedText = transcriptionData.aggregated_text || '';
                const sentences = transcriptionData.sentences || [];
                const hasTranscript = aggregatedText && aggregatedText.trim();
                const transcriptionStatus = log.transcription_status;
                
                return (
                  <div key={log.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {log.date} · {log.time}
                      </div>
                      <div className="flex items-center gap-3">
                        {log.duration && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Duration: {log.duration}
                          </div>
                        )}
                        {transcriptionStatus && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            transcriptionStatus === 'completed' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : transcriptionStatus === 'processing'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}>
                            {transcriptionStatus}
                          </span>
                        )}
                      </div>
                    </div>
                    {hasTranscript ? (
                      <div className="space-y-3">
                        {/* Aggregated Text */}
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Full Transcript:</div>
                          {aggregatedText}
                        </div>
                        
                        {/* Sentences with speaker labels */}
                        {sentences.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Detailed Transcript:</div>
                            {sentences.map((sentence, idx) => {
                              const isCustomer = sentence.speaker === 'Customer';
                              const startTime = parseFloat(sentence.start_time || 0);
                              const endTime = parseFloat(sentence.end_time || 0);
                              const timeStr = `${Math.floor(startTime)}s - ${Math.floor(endTime)}s`;
                              
                              return (
                                <div 
                                  key={idx} 
                                  className={`p-2 rounded text-sm ${
                                    isCustomer
                                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-400'
                                      : 'bg-gray-100 dark:bg-gray-800 border-l-2 border-gray-400'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`text-xs font-medium ${
                                      isCustomer
                                        ? 'text-blue-700 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                      {isCustomer ? 'Customer' : 'Agent'}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {timeStr}
                                    </span>
                                  </div>
                                  <div className={`text-gray-800 dark:text-gray-200 ${
                                    isCustomer ? 'font-medium' : ''
                                  }`}>
                                    {sentence.text}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : transcriptionStatus === 'processing' ? (
                      <div className="text-sm text-yellow-600 dark:text-yellow-400 italic">
                        Transcription is being processed...
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 dark:text-gray-500 italic">
                        No transcription available for this call
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-10 rounded-lg">
              <ChatBubbleLeftEllipsisIcon className="w-8 h-8 opacity-50 mb-2" />
              <p>No call transcripts available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
