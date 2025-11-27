import { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/solid";
import { useAuthContext } from "app/contexts/auth/context";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function ScriptTranscript({ 
  activeTabs = ["script"], 
  onTabToggle, 
  lead, 
  transcript = "Call transcription will appear here when connected", 
  isCallActive = false,
  callLogs = [],
  callLogsLoading = false
}) {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState(activeTabs[0] || "script");
  const [selectedBadge, setSelectedBadge] = useState(null);
  
  // Sync with parent activeTabs
  useEffect(() => {
    if (activeTabs.length > 0 && activeTabs[0] !== activeTab) {
      setActiveTab(activeTabs[0]);
    }
  }, [activeTabs, activeTab]);

  // Script content for each badge
  const scriptContent = {
    Opening: `Hello ${lead?.name || lead?.first_name + ' ' + lead?.last_name || '[Lead Name]'}, this is [Your Name] from ${user?.agency?.name || 'ShieldNest'}. I hope I'm catching you at a good time.

I'm calling because you recently responded to our information about mortgage protection insurance. I understand you own a home in ${lead?.originalData?.state || '[State]'} and may be interested in protecting your family's mortgage payments if something unexpected happens to you.`,
    
    Qualification: `I'm following up on your interest in mortgage protection. Could you tell me a bit about your current situation?

- What is your current mortgage balance?
- How long have you had your mortgage?
- Do you have any existing life insurance coverage?
- What are your main concerns about protecting your mortgage?`,
    
    Objections: `I understand your concerns. Many of our clients felt the same way initially, but here's how we can help:

- "I can't afford it" → We offer flexible payment plans that can fit your budget
- "I already have insurance" → This specifically covers your mortgage, which may not be fully covered by other policies
- "I'm too young" → The best time to protect your family is now, when rates are most affordable
- "I need to think about it" → I understand. What specific concerns do you have that I can address?`,
    
    Closing: `Based on our discussion, the mortgage protection plan would provide you with peace of mind. 

Key benefits:
- Your mortgage will be paid off if something happens to you
- Your family can stay in their home
- Flexible coverage options
- Affordable monthly payments

Shall we proceed with the application?`,
    
    'Follow-up': `I wanted to follow up on our previous conversation about mortgage protection. Have you had any additional thoughts or questions?

I'm here to help answer any concerns you might have and ensure you have all the information you need to make an informed decision.`,
    
    Appointment: `Would you be available for a 15-minute call on [date] at [time] to discuss this further?

This will give us a chance to:
- Review your specific needs
- Answer any questions you have
- Discuss coverage options
- Find a plan that works for your budget`,
    
    Voicemail: `Hi ${lead?.name || '[Lead Name]'}, this is [Your Name] from ${user?.agency?.name || 'ShieldNest'} calling about mortgage protection. 

I wanted to reach out because you recently showed interest in protecting your mortgage. Please call me back at [your number] when you have a moment. I'd love to discuss how we can help protect your family's home.

Thank you, and have a great day!`,
    
    Referral: `While I have you on the line, do you know anyone else who might benefit from mortgage protection?

Many of our clients find value in sharing this protection with friends and family who also own homes. If you know someone who might be interested, I'd be happy to help them as well.`
  };

  // Objection handlers content
  const objectionHandlersContent = `Here are effective objection handlers for common concerns:

**&quot;I can&apos;t afford it right now&quot;**
I completely understand budget concerns. The good news is that mortgage protection is often more affordable than people think. We offer flexible payment plans, and many clients find it costs less than their daily coffee. Would you like to see some options that might fit your budget?

**&quot;I already have life insurance&quot;**
That&apos;s great that you have life insurance! However, mortgage protection is specifically designed to pay off your mortgage directly, which means your family won&apos;t have to worry about making monthly payments. It works alongside your existing coverage. Would you like to see how they complement each other?

**&quot;I&apos;m too young/healthy&quot;**
You&apos;re absolutely right that you&apos;re healthy now, and that&apos;s exactly why this is the best time to protect your family. Rates are lowest when you&apos;re young and healthy, and you never know what the future holds. It&apos;s about protecting your family&apos;s home, not just yourself.

**&quot;I need to think about it&quot;**
I completely understand wanting to think it over. What specific concerns do you have that I can help address? Sometimes having more information can help with the decision-making process.

**&quot;I&apos;m not interested&quot;**
I appreciate your honesty. Can I ask what specifically makes you feel this isn&apos;t right for you? I want to make sure you have all the information, and if it&apos;s truly not a fit, I&apos;ll respect that.

**&quot;I&apos;ll do it later&quot;**
I understand the temptation to put it off, but the reality is that life is unpredictable. The best time to protect your family is now, when you&apos;re healthy and rates are affordable. What would need to change for you to feel ready to move forward?`;

  const handleBadgeClick = (badgeName) => {
    if (selectedBadge === badgeName) {
      setSelectedBadge(null);
    } else {
      setSelectedBadge(badgeName);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabToggle) {
      onTabToggle(tab);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4">
      {/* Tabs Header */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => handleTabClick("script")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium transition-all whitespace-nowrap ${
            activeTab === "script"
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400 -mb-[1px]"
              : "text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          }`}
        >
          <DocumentTextIcon className="w-4 h-4 flex-shrink-0" />
          <span>Script</span>
        </button>

        <button
          onClick={() => handleTabClick("objections")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium transition-all whitespace-nowrap ${
            activeTab === "objections"
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400 -mb-[1px]"
              : "text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          }`}
        >
          <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
          <span>Objections</span>
        </button>

        <button
          onClick={() => handleTabClick("transcript")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium transition-all whitespace-nowrap ${
            activeTab === "transcript"
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400 -mb-[1px]"
              : "text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          }`}
        >
          <ChatBubbleLeftEllipsisIcon className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Live Transcript</span>
          <span className="sm:hidden">Transcript</span>
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
            ].map((tag) => {
              const isSelected = selectedBadge === tag.name;
              return (
                <button
                  key={tag.name}
                  onClick={() => handleBadgeClick(tag.name)}
                  className={`text-xs font-medium px-2 py-1 rounded-md transition-all cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800"
                      : ""
                  } ${
                    tag.color === "indigo"
                      ? isSelected
                        ? "bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 ring-indigo-500"
                        : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                      : tag.color === "green"
                      ? isSelected
                        ? "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 ring-green-500"
                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800"
                      : tag.color === "yellow"
                      ? isSelected
                        ? "bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 ring-yellow-500"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-800"
                      : tag.color === "purple"
                      ? isSelected
                        ? "bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 ring-purple-500"
                        : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800"
                      : tag.color === "red"
                      ? isSelected
                        ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 ring-red-500"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
                      : tag.color === "blue"
                      ? isSelected
                        ? "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 ring-blue-500"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800"
                      : tag.color === "gray"
                      ? isSelected
                        ? "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 ring-gray-500"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      : isSelected
                      ? "bg-pink-200 dark:bg-pink-800 text-pink-800 dark:text-pink-200 ring-pink-500"
                      : "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-800"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>

          {/* Script Text */}
          {selectedBadge && scriptContent[selectedBadge] ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap border-2 border-blue-200 dark:border-blue-800">
              <div className="font-semibold mb-2 text-blue-700 dark:text-blue-400">
                {selectedBadge} Script:
              </div>
              {scriptContent[selectedBadge]}
            </div>
          ) : (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 italic">
              Click on a badge above to view its script content
            </div>
          )}
        </div>
      )}

      {activeTab === "objections" && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-200">Objection Handlers</h2>

          {/* Objection Handlers Badge */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBadgeClick("Objection Handlers")}
              className={`text-xs font-medium px-3 py-2 rounded-md transition-all cursor-pointer ${
                selectedBadge === "Objection Handlers"
                  ? "bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-yellow-500"
                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-800"
              }`}
            >
              Objection Handlers
            </button>
          </div>

          {/* Objection Handlers Content */}
          {selectedBadge === "Objection Handlers" ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap border-2 border-yellow-200 dark:border-yellow-800">
              <div className="font-semibold mb-2 text-yellow-700 dark:text-yellow-400">
                Objection Handlers:
              </div>
              {objectionHandlersContent}
            </div>
          ) : (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 italic">
              Click on &quot;Objection Handlers&quot; badge above to view objection handling strategies
            </div>
          )}
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
