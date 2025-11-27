import { PlusIcon } from "@heroicons/react/24/outline";
import { useDisclosure } from "hooks";
import TemplateModal from "./templateModal";
const EmailText = () => {
  const [isOpen, { open, close }] = useDisclosure(false);
const templates = [
  {
    id: "TMP-001",
    name: "Weekly Follow-up",
    frequency: { value: "WEEKLY", label: "Weekly" },
    period: { value: 3, label: "3" },
    content: "<p>Dear customer, this is a gentle reminder regarding your scheduled follow-up.</p>",
    createdAt: "2025-01-14 10:32 AM"
  },
  {
    id: "TMP-002",
    name: "Monthly Report Reminder",
    frequency: { value: "MONTHLY", label: "Monthly" },
    period: { value: 15, label: "15" },
    content: "<p>Please be informed that your monthly report is due soon.</p>",
    createdAt: "2025-01-12 03:18 PM"
  },
  {
    id: "TMP-003",
    name: "Quarterly Review",
    frequency: { value: "QUARTERLY", label: "Quarterly" },
    period: { value: 1, label: "1" },
    content: "<p>This is to schedule your upcoming quarterly review meeting.</p>",
    createdAt: "2025-01-10 09:45 AM"
  },
  {
    id: "TMP-004",
    name: "Payment Reminder",
    frequency: { value: "DAILY", label: "Daily" },
    period: { value: 7, label: "7" },
    content: "<p>Your next payment is due in 7 days.</p>",
    createdAt: "2025-01-09 07:22 PM"
  }
];

  return (
   <div>
  <div className="mt-2 mb-2 flex justify-end">
    <button
      onClick={open}
      className="flex items-center space-x-2 rounded-lg bg-[#f4d03f] px-4 py-2 text-white transition-colors hover:bg-[#e6c035]"
    >
      <PlusIcon className="h-4 w-4" />
      <span>Add New Template</span>
    </button>
  </div>

  {/* Templates List */}
  <div className="grid gap-4 md:grid-cols-2">
    {templates.map((item) => (
      <div
        key={item.id}
        className="rounded-xl bg-white p-5 shadow transition hover:shadow-md"
      >
        <div className="mb-2 flex justify-between">
          <h3 className="text-lg font-medium text-gray-800">
            {item.frequency?.label} – {item.period?.label}
          </h3>

          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => {
            //   setEditItem(item);
            //   setIsOpen(true);
            }}
          >
            Edit
          </button>
        </div>

        <p
          className="text-gray-600 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: item.content }}
        ></p>
      </div>
    ))}
  </div>

  {/* Modal */}
  <TemplateModal isOpen={isOpen} onClose={close} />
</div>

  );
};

export default EmailText;
