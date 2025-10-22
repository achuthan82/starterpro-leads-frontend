import { useState } from "react";
import {
  PencilSquareIcon,
  DocumentDuplicateIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import CreateMessageTemplateModal from "./CreateMessageTemplateModal";

const templateTypes = [
  { value: "all", label: "All Types" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];

const tabs = [
  { value: "all", label: "All Templates" },
  { value: "welcome", label: "Welcome" },
  { value: "followup", label: "Follow-up" },
  { value: "promotional", label: "Promotional" },
  { value: "reminder", label: "Reminder" }
];

const templatesData = [
  {
    id: 1,
    type: "email",
    category: "welcome",
    name: "Welcome New Lead",
    subject: "Automated welcome email for new leads",
    description:
      "Dear {FirstName}, Welcome to ShieldNest! We're excited to help you protect what matters most.",
    used: 45,
    usedText: "Used 45 times",
  },
  {
    id: 2,
    type: "sms",
    category: "reminder",
    name: "Appointment Reminder",
    subject: "SMS reminder for scheduled appointments",
    description:
      "Hi {FirstName}, reminder: Your appointment is tomorrow at {Time}. Reply YES to confirm or CANCEL to reschedule.",
    used: 128,
    usedText: "Used 128 times",
  },
  {
    id: 3,
    type: "email",
    category: "promotional",
    name: "Monthly Newsletter",
    subject: "Insurance tips and updates newsletter",
    description:
      "Your Monthly Insurance Update – Tips to save on premiums, coverage options, and more.",
    used: 12,
    usedText: "Used 12 times",
  },
];

const typePill = (type) =>
  type === "sms"
    ? <span className="bg-yellow-100 text-[#f4d03f] text-xs px-2 py-1 rounded font-semibold mr-2">SMS</span>
    : <span className="bg-blue-100 text-[#0a2463] text-xs px-2 py-1 rounded font-semibold mr-2">Email</span>;

const Templates = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState(templateTypes[0]);
  const filteredTemplates = templatesData.filter(
    (tpl) =>
      (activeTab === "all" || tpl.category === activeTab) &&
      (typeFilter.value === "all" || tpl.type === typeFilter.value)
  );

  return (
    <div className="px-8 py-6">

      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded border font-medium transition
                ${activeTab === tab.value ? "bg-[#0a2463] text-white border-[#0a2463]" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Type dropdown + Create Button */}
        <div className="flex gap-2 items-center">
          <select
            value={typeFilter.value}
            onChange={e => {
              const option = templateTypes.find(t => t.value === e.target.value);
              setTypeFilter(option);
            }}
            className="border border-gray-300 rounded px-3 py-2 text-[15px] font-medium text-gray-700 focus:outline-none"
            style={{ minWidth: "110px" }}
          >
            {templateTypes.map(opt => (
              <option value={opt.value} key={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            className="bg-[#0a2463] px-4 py-2 rounded-lg text-white hover:bg-[#1e40af] font-medium flex items-center space-x-1"
            onClick={() => setShowCreateTemplateModal(true)}
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map(tpl => (
          <div
            key={tpl.id}
            className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-2 border border-gray-100 min-h-[230px]"
          >
            <div className="flex justify-between items-center mb-1">
              {typePill(tpl.type)}
              <div className="flex gap-2">
                <button className="text-gray-400 hover:text-blue-500" title="Edit">
                  <PencilSquareIcon className="w-5 h-5"/>
                </button>
                <button className="text-gray-400 hover:text-green-500" title="Copy">
                  <DocumentDuplicateIcon className="w-5 h-5"/>
                </button>
              </div>
            </div>
            <div className="font-semibold text-[16px] text-gray-900">{tpl.name}</div>
            <div className="text-sm text-gray-500 mb-1 whitespace-pre-line pb-2 border-b">{tpl.subject}</div>
            <div className="text-sm text-gray-500 mb-2 whitespace-pre-line">{tpl.description}</div>
            <div className="flex items-center justify-between mt-auto">
              <div className="text-xs text-gray-400">{tpl.usedText}</div>
              <a href="#" className="text-[#0a2463] font-semibold text-sm hover:underline">Use Template</a>
            </div>
          </div>
        ))}

        {/* Create New Template Card */}
        <button
          className="border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-6 gap-2 min-h-[300px] rounded-xl cursor-pointer"
          onClick={() => setShowCreateTemplateModal(true)}
        >
          <div className="rounded-full bg-gray-200 p-4 mb-1">
            <span className=""><PlusIcon className="w-6 h-6"/></span>
          </div>
          <span className="text-md font-semibold text-gray-900 mt-2">Create New Template</span>
          <span className="text-sm text-gray-500">Design your message</span>
        </button>
      </div>

       <CreateMessageTemplateModal
          isOpen={showCreateTemplateModal}
          close={() => setShowCreateTemplateModal(false)}
        />
    </div>
  );
};

export default Templates;
