import { useState } from "react";

export default function ScriptTranscriptTabs() {
  const [activeTab, setActiveTab] = useState("script");

  return (
    <div className="w-full bg-white rounded-xl shadow p-4">
      {/* Tabs Header */}
      <div className="flex space-x-4 border-b pb-2 mb-4">
        <button
          onClick={() => setActiveTab("script")}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition ${
            activeTab === "script"
              ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
              : "text-gray-600 hover:text-blue-500"
          }`}
        >
          Script
        </button>
        <button
          onClick={() => setActiveTab("transcript")}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition ${
            activeTab === "transcript"
              ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
              : "text-gray-600 hover:text-blue-500"
          }`}
        >
          Live Transcript
        </button>
      </div>

      {/* Content */}
      {activeTab === "script" && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg text-gray-700">Call Script</h2>
          <div className="flex flex-wrap gap-2">
            {["Opening", "Qualification", "Objections", "Closing", "Follow-up", "Appointment", "Voicemail", "Referral"].map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2 py-1 rounded-md"
                style={{
                  backgroundColor:
                    tag === "Opening"
                      ? "#E0E7FF"
                      : tag === "Qualification"
                      ? "#DCFCE7"
                      : tag === "Objections"
                      ? "#FEF9C3"
                      : tag === "Closing"
                      ? "#F3E8FF"
                      : tag === "Follow-up"
                      ? "#FEE2E2"
                      : tag === "Appointment"
                      ? "#DBEAFE"
                      : tag === "Voicemail"
                      ? "#F3F4F6"
                      : "#FCE7F3",
                  color: "#374151",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 leading-relaxed">
            Hi Michael, this is Sarah Wilson from Aegis Suite. I hope I’m catching you at a good time.
            <br /><br />
            I’m calling because you recently responded to our information about mortgage protection insurance...
          </div>
        </div>
      )}

      {activeTab === "transcript" && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg text-gray-700">Live Transcription</h2>
          <div className="flex flex-col items-center justify-center text-gray-500 bg-gray-50 p-10 rounded-lg">
           
            <p>Call transcription will appear here when connected</p>
          </div>
        </div>
      )}
    </div>
  );
}
