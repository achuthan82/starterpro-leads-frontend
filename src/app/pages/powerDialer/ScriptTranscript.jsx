import { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/solid";
import { useAuthContext } from "app/contexts/auth/context";
import { toast } from "sonner";
import { IoBulbOutline } from "react-icons/io5";
import profileService from "utils/profileService";

export default function ScriptTranscript({
  activeTabs = ["script"],
  onTabToggle,
  lead,
  transcript = "Call transcription will appear here when connected",
  isCallActive = false,
  callLogs = [],
  callLogsLoading = false,
}) {
  const tabs = { script: 1, objections: 2 };
  const { user } = useAuthContext();
  console.log(user);
  const [activeTab, setActiveTab] = useState(activeTabs[0] || "script");
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [selectedObjection, setSelectedObjection] = useState(null);
  const [scriptContent, setScriptContent] = useState(null);
  const [scriptHeaders, setScriptHeaders] = useState([]);
  const [objectionHandlersList, setObjectionHandlersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const getScriptData = (type) => {
    setLoading(true);
    const params = { page: 1, per_page: 20, type_: type };
    profileService
      .getScript(params)
      .then((response) => {
        if (response.data.status === 200) {
          if (type === 1) {
            setScriptHeaders(
              response.data.data.map((item) => {
                return { name: item.title, color: "pink" };
              }),
            );

            setScriptContent(
              response.data.data.reduce((acc, item) => {
                acc[item.title] = item.description;
                return acc;
              }, {}),
            );
          }
          if (type === 2) {
            console.log(
              "objections",
              response.data.data.map((item) => {
                return {
                  title: item.title,
                  color: "orange",
                  steps: item.description,
                };
              }),
            );
            setObjectionHandlersList(
              response.data.data.map((item) => {
                return {
                  title: item.title,
                  color: "orange",
                  steps: item.description,
                };
              }),
            );
          }
          // setScript(response.data.data);
        } else if (response.data.status === 204) {
          // setScript([]);
        } else {
          toast.error(response?.data?.message || "Failed to fetch scripts");
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to fetch scripts");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Sync with parent activeTabs
  useEffect(() => {
    if (activeTabs.length > 0) {
      const newTab = activeTabs[0];
      if (newTab !== activeTab) {
        setActiveTab(newTab);
      }
    }
  }, [activeTabs]);
  useEffect(() => {
    if (tabs[activeTab]) {
      getScriptData(tabs[activeTab]);
    }
  }, [activeTab]);

  const splitIntoSteps = (html) => {
    if (!html) return [];

    const container = document.createElement("div");
    container.innerHTML = html;

    const paragraphs = [...container.querySelectorAll("p")];

    return paragraphs
      .map((p) => p.innerHTML.trim())
      .filter((line) => line !== "" && line !== "<br>");
  };

  // Script content for each badge
  //   const scriptContent = {
  //     Opening: `Hello, may I speak with ${lead?.name || lead?.first_name + ' ' + lead?.last_name || '[LEAD_NAME]'}?

  //               Hi ${lead?.name || lead?.first_name + ' ' + lead?.last_name || '[LEAD_NAME]'}, my name is ${user?.name || '[YOUR_NAME]'} calling from ${user?.agency?.name || 'StarterProleads'}.

  //               I understand you recently purchased a home with a mortgage of approximately ${lead?.originalData?.loan_amount || '[LOAN_AMOUNT]'}. Do you have a moment to discuss protecting your family's investment?

  //               Great! The reason for my call today is to ensure your family would be protected if something unexpected were to happen to you.`,

  //   Proposition: `Let me ask you - if something were to happen to you tomorrow, would your family be able to keep the house?

  //                 Mortgage protection insurance ensures your mortgage is paid off, so your loved ones never have to worry about losing their home.

  //                 It's surprisingly affordable - for someone your age, we're typically looking at around $[ESTIMATED_PREMIUM] per month.

  //                 That's less than what most people spend on their daily coffee!`,

  //     Qualification: `To provide you with an accurate quote, I need to ask a few quick questions. Is that okay?

  //                     Are you between 18 and 65 years old?

  //                     Are you a US citizen or permanent resident?

  //                     Are you currently in good health?

  //                     Have you been hospitalized in the last 12 months?`,

  // //     Objections: `I understand your concerns. Many of our clients felt the same way initially, but here's how we can help:

  // // - "I can't afford it" → We offer flexible payment plans that can fit your budget
  // // - "I already have insurance" → This specifically covers your mortgage, which may not be fully covered by other policies
  // // - "I'm too young" → The best time to protect your family is now, when rates are most affordable
  // // - "I need to think about it" → I understand. What specific concerns do you have that I can address?`,

  //     Closing: `Based on what you've shared, I can get you coverage starting at just $[QUOTE_AMOUNT] per month.

  //               This would give your family complete peace of mind knowing the mortgage would be taken care of.

  //               Shall we go ahead and lock in this rate for you today?

  //               Perfect! Let me get some additional information to complete your application.`,

  // //     Appointment: `Would you be available for a 15-minute call on [date] at [time] to discuss this further?

  // // This will give us a chance to:
  // // - Review your specific needs
  // // - Answer any questions you have
  // // - Discuss coverage options
  // // - Find a plan that works for your budget`,

  // //     Voicemail: `Hi ${lead?.name || '[Lead Name]'}, this is [Your Name] from ${user?.agency?.name || 'ShieldNest'} calling about mortgage protection.

  // // I wanted to reach out because you recently showed interest in protecting your mortgage. Please call me back at [your number] when you have a moment. I'd love to discuss how we can help protect your family's home.

  // // Thank you, and have a great day!`,

  // //     Referral: `While I have you on the line, do you know anyone else who might benefit from mortgage protection?

  // // Many of our clients find value in sharing this protection with friends and family who also own homes. If you know someone who might be interested, I'd be happy to help them as well.`
  //   };

  // Objection handlers content
  // const objectionHandlersList = [
  //   {
  //     title: "I need to think about it",
  //     color: "orange",
  //     steps: [
  //       "I completely understand wanting to think it over. What specific concerns would you like to think about?",
  //       "That's fair. Let me ask - if you were to think about it and decide yes, what would need to happen between now and then?",
  //       "I appreciate that. Most people who say that are really concerned about one of three things: the cost, whether they really need it, or if now is the right time. Which of these resonates with you?",
  //     ],
  //   },
  //   {
  //     title: "It's too expensive",
  //     color: "blue",
  //     steps: [
  //       "I understand cost is a factor. Let me ask - compared to what? Most people spend more on cable TV or eating out each month.",
  //       "Fair point. What if I told you it costs less than $[DAILY_COST] per day to protect your family's home? Is that too expensive?",
  //       "I hear you. Let me ask though - what would be too expensive is your family losing the house, right? This prevents that.",
  //     ],
  //   },
  //   {
  //     title: "I already have life insurance",
  //     color: "indigo",
  //     steps: [
  //       "That's excellent that you're thinking ahead! Can I ask - is that life insurance specifically designated to pay off your mortgage?",
  //       "Great! How much coverage do you have? Would it be enough to pay off the entire mortgage and leave money for your family's other needs?",
  //       "Perfect! This would work alongside your existing policy to specifically protect your home. Think of it as a safety net for your safety net.",
  //     ],
  //   },
  //   {
  //     title: "I need to talk to my spouse",
  //     color: "green",
  //     steps: [
  //       "Absolutely, this is a family decision. Is your spouse available now? I'd be happy to explain it to both of you.",
  //       "That makes complete sense. What if we scheduled a time when you're both available? When works best for you both?",
  //       "Of course! Let me send you some information to review together. Would you prefer email or text?",
  //     ],
  //   },
  //   {
  //     title: "I'm not interested",
  //     color: "rose",
  //     steps: [
  //       "I appreciate your honesty. Can I ask - is it that you're not interested in protecting your family, or is it just not a priority right now?",
  //       "Fair enough. Let me ask one question - if your family could keep the house without any mortgage payments if something happened to you, would that interest you?",
  //       "I understand. Before I let you go, can you help me understand - is it the product itself or just the timing that's not right?",
  //     ],
  //   },
  //   {
  //     title: "Can you send me information?",
  //     color: "yellow",
  //     steps: [
  //       "Absolutely! I can send that right over. While I have you though, what specific questions do you have that I could answer right now?",
  //       "Of course. I'll send you everything. Just so the information is relevant - are you more concerned about the coverage amount or the monthly cost?",
  //       "Sure thing! Let me ask first - what's the best email for you, and is there anything specific you'd like me to include?",
  //     ],
  //   },
  // ];

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
  const getValue = (obj, path) => {
    return path.split(".").reduce((acc, key) => {
      return acc?.[key];
    }, obj);
  };

  const renderTemplate = (html, lead) => {
    if (!html) return "";

    return html.replace(/{{\s*([\w.]+)\s*}}/g, (_, field) => {
      const value = getValue(lead, field);
      return value ?? "";
    });
  };

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800">
      {/* Tabs Header */}
      <div className="mb-4 flex gap-1 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => handleTabClick("script")}
          className={`flex items-center gap-1 rounded-t-lg px-3 py-1 text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === "script"
              ? "-mb-[1px] border-b-2 border-blue-500 bg-blue-100 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400"
              : "text-gray-600 hover:bg-gray-50 hover:text-blue-500 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-blue-400"
          }`}
        >
          <DocumentTextIcon className="h-3 w-3 flex-shrink-0" />
          <span>Script</span>
        </button>

        <button
          onClick={() => handleTabClick("objections")}
          className={`flex items-center gap-1 rounded-t-lg px-3 py-1 text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === "objections"
              ? "-mb-[1px] border-b-2 border-blue-500 bg-blue-100 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400"
              : "text-gray-600 hover:bg-gray-50 hover:text-blue-500 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-blue-400"
          }`}
        >
          <IoBulbOutline className="h-3 w-3 flex-shrink-0" />
          <span>Objections</span>
        </button>

        <button
          onClick={() => handleTabClick("transcript")}
          className={`flex items-center gap-1 rounded-t-lg px-3 py-1 text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === "transcript"
              ? "-mb-[1px] border-b-2 border-blue-500 bg-blue-100 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400"
              : "text-gray-600 hover:bg-gray-50 hover:text-blue-500 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-blue-400"
          }`}
        >
          <ChatBubbleLeftEllipsisIcon className="h-3 w-3 flex-shrink-0" />
          <span className="hidden sm:inline">Live Transcript</span>
          {/* <span className="sm:hidden">Transcript</span> */}
        </button>
      </div>
      {loading && (
        <div className="flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
          <span className="ml-2 text-gray-900 dark:text-gray-100">
            Loading...
          </span>
        </div>
      )}
      {/* Tab Content */}
      {activeTab === "script" && (
        <div className="space-y-3">
          {!loading && (
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Call Script
            </h2>
          )}

          {/* Tags */}
          {!loading && (
            <div className="flex flex-wrap gap-2">
              {scriptHeaders && scriptHeaders.length > 0 ? (
                scriptHeaders.map((tag) => {
                  const isSelected = selectedBadge === tag.name;
                  return (
                    <button
                      key={tag.name}
                      onClick={() => handleBadgeClick(tag.name)}
                      className={`cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition-all ${
                        isSelected
                          ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800"
                          : ""
                      } ${
                        tag.color === "indigo"
                          ? isSelected
                            ? "bg-indigo-200 text-indigo-800 ring-indigo-500 dark:bg-indigo-800 dark:text-indigo-200"
                            : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800"
                          : tag.color === "green"
                            ? isSelected
                              ? "bg-green-200 text-green-800 ring-green-500 dark:bg-green-800 dark:text-green-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-800"
                            : tag.color === "yellow"
                              ? isSelected
                                ? "bg-yellow-200 text-yellow-800 ring-yellow-500 dark:bg-yellow-800 dark:text-yellow-200"
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-800"
                              : tag.color === "purple"
                                ? isSelected
                                  ? "bg-purple-200 text-purple-800 ring-purple-500 dark:bg-purple-800 dark:text-purple-200"
                                  : "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-800"
                                : tag.color === "red"
                                  ? isSelected
                                    ? "bg-red-200 text-red-800 ring-red-500 dark:bg-red-800 dark:text-red-200"
                                    : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800"
                                  : tag.color === "blue"
                                    ? isSelected
                                      ? "bg-blue-200 text-blue-800 ring-blue-500 dark:bg-blue-800 dark:text-blue-200"
                                      : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800"
                                    : tag.color === "gray"
                                      ? isSelected
                                        ? "bg-gray-200 text-gray-800 ring-gray-500 dark:bg-gray-600 dark:text-gray-200"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                      : isSelected
                                        ? "bg-pink-200 text-pink-800 ring-pink-500 dark:bg-pink-800 dark:text-pink-200"
                                        : "bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:hover:bg-pink-800"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })
              ) : (
                <div className="mb-3 flex w-full items-center justify-center">
                  <span>No data found</span>
                </div>
              )}
            </div>
          )}

          {/* Script Text */}
          {!loading && scriptHeaders && scriptHeaders.length > 0 && (
            <div>
              {lead && selectedBadge && scriptContent[selectedBadge] ? (
                <div className="space-y-4">
                  {splitIntoSteps(
                    renderTemplate(scriptContent[selectedBadge], lead),
                  ).map((line, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg border p-4"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A1A3F] text-white">
                        {index + 1}
                      </div>

                      <p
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: line }}
                      ></p>
                    </div>
                  ))}

                  {/* Copy Button */}
                  <button
                    onClick={() => {
                      const rendered = renderTemplate(
                        scriptContent[selectedBadge],
                        lead,
                      );
                      navigator.clipboard.writeText(rendered);
                      toast.success("Script copied!");
                    }}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2m2 0h6a2 2 0 002-2V10a2 2 0 00-2-2h-2M8 16v2a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2h-2"
                      />
                    </svg>
                    Copy Script
                  </button>
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500 italic dark:bg-gray-700 dark:text-gray-400">
                  Select a lead and switch between the badges to view its script
                  content.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "objections" && (
        <div className="space-y-3">
          {!loading && (
            <h2 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-200">
              Objection Handlers
            </h2>
          )}

          {/* --- Tabs --- */}
          {!loading && (
            <div className="flex flex-wrap gap-2">
              {objectionHandlersList && objectionHandlersList.length > 0 ? (
                objectionHandlersList.map((obj) => {
                  const isSelected = selectedObjection === obj.title;

                  return (
                    <button
                      key={obj.title}
                      onClick={() => setSelectedObjection(obj.title)}
                      className={`cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition-all ${
                        isSelected
                          ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800"
                          : ""
                      } ${
                        obj.color === "orange"
                          ? isSelected
                            ? "bg-orange-200 text-orange-800 ring-orange-500"
                            : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                          : obj.color === "blue"
                            ? isSelected
                              ? "bg-blue-200 text-blue-800 ring-blue-500"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : obj.color === "indigo"
                              ? isSelected
                                ? "bg-indigo-200 text-indigo-800 ring-indigo-500"
                                : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                              : obj.color === "green"
                                ? isSelected
                                  ? "bg-green-200 text-green-800 ring-green-500"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                                : obj.color === "rose"
                                  ? isSelected
                                    ? "bg-rose-200 text-rose-800 ring-rose-500"
                                    : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      }`}
                    >
                      {obj.title}
                    </button>
                  );
                })
              ) : (
                <div className="mb-3 flex w-full items-center justify-center">
                  <span>No data found</span>
                </div>
              )}
            </div>
          )}

          {/* --- Steps View --- */}
          {!loading &&
            objectionHandlersList &&
            objectionHandlersList.length > 0 && (
              <div>
                {" "}
                {selectedObjection ? (
                  <div className="space-y-4">
                    {(() => {
                      const selected = objectionHandlersList.find(
                        (item) => item.title === selectedObjection,
                      );

                      if (!selected) return null;

                      // Convert dynamic {{values}}
                      const renderedText = renderTemplate(selected.steps, lead);

                      // Break into individual steps
                      const stepLines = splitIntoSteps(renderedText);

                      return stepLines.map((line, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"
                        >
                          {/* Number circle */}
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#0A1A3F] text-sm font-bold text-white">
                            {index + 1}
                          </div>

                          {/* Line text */}
                          <p
                            className="text-sm leading-relaxed text-gray-700 dark:text-gray-200"
                            dangerouslySetInnerHTML={{ __html: line }}
                          ></p>
                        </div>
                      ));
                    })()}

                    {/* --- Copy Button --- */}
                    <button
                      onClick={() => {
                        const obj = objectionHandlersList.find(
                          (o) => o.title === selectedObjection,
                        );
                        const fullText = obj.steps.join("\n");
                        navigator.clipboard.writeText(fullText);
                        toast.success("Objection handler copied!");
                      }}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2m2 0h6a2 2 0 002-2V10a2 2 0 00-2-2h-2M8 16v2a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2h-2"
                        />
                      </svg>
                      Copy Handler
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500 italic dark:bg-gray-700 dark:text-gray-400">
                    Click on each badge above to view objection handling
                    strategies
                  </div>
                )}
              </div>
            )}
        </div>
      )}

      {activeTab === "transcript" && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            {isCallActive ? "Live Transcription" : "Call Transcripts"}
          </h2>

          {isCallActive ? (
            // Show live transcript during active call
            <div className="min-h-[200px] rounded-lg bg-gray-50 p-3 text-sm leading-relaxed text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {transcript ||
                "Call transcription will appear here when connected"}
            </div>
          ) : callLogsLoading ? (
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-10 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              <ChatBubbleLeftEllipsisIcon className="mb-2 h-8 w-8 animate-pulse opacity-50" />
              <p>Loading transcripts...</p>
            </div>
          ) : callLogs.length > 0 ? (
            // Show call logs transcripts
            <div className="max-h-[500px] space-y-4 overflow-y-auto">
              {callLogs.map((log) => {
                // Get transcription data from API response
                const transcriptionData =
                  log.transcription_data || log.transcription || {};
                const aggregatedText = transcriptionData.aggregated_text || "";
                const sentences = transcriptionData.sentences || [];
                const hasTranscript = aggregatedText && aggregatedText.trim();
                const transcriptionStatus = log.transcription_status;

                return (
                  <div
                    key={log.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <div className="mb-2 flex items-center justify-between">
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
                          <span
                            className={`rounded px-2 py-1 text-xs ${
                              transcriptionStatus === "completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : transcriptionStatus === "processing"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {transcriptionStatus}
                          </span>
                        )}
                      </div>
                    </div>
                    {hasTranscript ? (
                      <div className="space-y-3">
                        {/* Aggregated Text */}
                        <div className="rounded border border-gray-200 bg-white p-3 text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          <div className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                            Full Transcript:
                          </div>
                          {aggregatedText}
                        </div>

                        {/* Sentences with speaker labels */}
                        {sentences.length > 0 && (
                          <div className="space-y-2">
                            <div className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                              Detailed Transcript:
                            </div>
                            {sentences.map((sentence, idx) => {
                              const isCustomer =
                                sentence.speaker === "Customer";
                              const startTime = parseFloat(
                                sentence.start_time || 0,
                              );
                              const endTime = parseFloat(
                                sentence.end_time || 0,
                              );
                              const timeStr = `${Math.floor(startTime)}s - ${Math.floor(endTime)}s`;

                              return (
                                <div
                                  key={idx}
                                  className={`rounded p-2 text-sm ${
                                    isCustomer
                                      ? "border-l-2 border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                      : "border-l-2 border-gray-400 bg-gray-100 dark:bg-gray-800"
                                  }`}
                                >
                                  <div className="mb-1 flex items-center justify-between">
                                    <span
                                      className={`text-xs font-medium ${
                                        isCustomer
                                          ? "text-blue-700 dark:text-blue-400"
                                          : "text-gray-700 dark:text-gray-300"
                                      }`}
                                    >
                                      {isCustomer ? "Customer" : "Agent"}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {timeStr}
                                    </span>
                                  </div>
                                  <div
                                    className={`text-gray-800 dark:text-gray-200 ${
                                      isCustomer ? "font-medium" : ""
                                    }`}
                                  >
                                    {sentence.text}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : transcriptionStatus === "processing" ? (
                      <div className="text-sm text-yellow-600 italic dark:text-yellow-400">
                        Transcription is being processed...
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic dark:text-gray-500">
                        No transcription available for this call
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-10 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              <ChatBubbleLeftEllipsisIcon className="mb-2 h-8 w-8 opacity-50" />
              <p>No call transcripts available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
