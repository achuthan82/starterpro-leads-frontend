import {
  EnvelopeIcon,
  ChatBubbleLeftEllipsisIcon,
  PlusIcon
} from "@heroicons/react/24/solid";

const campaigns = [
  {
    id: 1,
    name: "Spring Insurance Special",
    subtitle: "20% off new policies",
    icon: "email",
    type: "Email",
    recipients: "2,450",
    status: "Delivered",
    performance: { open: "45.2%", click: "18.3%" },
    schedule: "Sent 2 days ago",
    actions: ["View", "Reports"],
  },
  {
    id: 2,
    name: "Appointment Reminders",
    subtitle: "24hr advance reminder",
    icon: "sms",
    type: "SMS",
    recipients: "156",
    status: "Active",
    performance: { delivered: "92%", confirmed: "85%" },
    schedule: "Recurring Daily",
    actions: ["Edit", "Pause"],
  },
  {
    id: 3,
    name: "Monthly Newsletter",
    subtitle: "Insurance tips & updates",
    icon: "email",
    type: "Email",
    recipients: "3,200",
    status: "Scheduled",
    performance: null,
    schedule: "Tomorrow 9:00 AM",
    actions: ["Edit", "Reschedule"],
  },
];

const statusStyle = {
  Delivered: "bg-green-600 text-white",
  Active: "bg-[#0a2463] text-white",
  Scheduled: "bg-yellow-500 text-white",
};

const iconBox = (type) =>
  type === "email" ? (
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
      <EnvelopeIcon className="w-6 h-6" />
    </div>
  ) : (
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-600">
      <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
    </div>
  );

export default function ActiveCampaigns({ setShowCampaignModal}) {
  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Active Campaigns</h1>

        <div className="flex gap-3">
          <select className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none">
            <option>All Campaigns</option>
            <option>Active</option>
            <option>Scheduled</option>
            <option>Delivered</option>
          </select>
          <button
            className="bg-[#0a2463] px-4 py-2 rounded-lg text-white hover:bg-[#1e40af] font-medium flex items-center space-x-1"
            onClick={() => setShowCampaignModal(true)}
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-hidden border border-gray-200 rounded-lg shadow bg-white">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Recipients</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Performance</th>
              <th className="px-4 py-3">Schedule</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr
                key={c.id}
                className="border-t border-gray-100 hover:bg-gray-50 transition"
              >
                {/* Campaign + icon */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {iconBox(c.icon)}
                    <div>
                      <div className="font-medium text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.subtitle}</div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">{c.type}</td>
                <td className="px-4 py-4">{c.recipients}</td>

                {/* Status pill */}
                <td className="px-4 py-4">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusStyle[c.status]}`}
                  >
                    {c.status}
                  </span>
                </td>

                {/* Performance */}
                <td className="px-4 py-4">
                  {c.performance ? (
                    <div className="space-y-0.5">
                      {c.performance.open && (
                        <div>{c.performance.open} Open</div>
                      )}
                      {c.performance.click && (
                        <div>{c.performance.click} Click</div>
                      )}
                      {c.performance.delivered && (
                        <div>{c.performance.delivered} Delivered</div>
                      )}
                      {c.performance.confirmed && (
                        <div>{c.performance.confirmed} Confirmed</div>
                      )}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-4 py-4">{c.schedule}</td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex gap-4 text-sm">
                    {c.actions.map((a) => (
                      <a
                        key={a}
                        href="#"
                        className={`font-medium hover:underline ${
                          a === "Pause"
                            ? "text-red-600"
                            : a === "Reschedule"
                            ? "text-yellow-700"
                            : "text-teal-700"
                        }`}
                      >
                        {a}
                      </a>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
