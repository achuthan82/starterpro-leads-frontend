import { useState } from "react";
import {
  DocumentTextIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/solid";

export default function ScriptTranscriptTabs() {
  const [activeTab, setActiveTab] = useState("script");

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4">
      {/* Tabs Header */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
        <button
          onClick={() => setActiveTab("script")}
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
          onClick={() => setActiveTab("transcript")}
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
            Hi Michael, this is Sarah Wilson from Aegis Suite. I hope I&apos;m catching you at a good
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
          <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-200">Live Transcription</h2>

          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-10 rounded-lg">
            <ChatBubbleLeftEllipsisIcon className="w-8 h-8 opacity-50 mb-2" />
            <p>Call transcription will appear here when connected</p>
          </div>
        </div>
      )}
    </div>
  );
}
