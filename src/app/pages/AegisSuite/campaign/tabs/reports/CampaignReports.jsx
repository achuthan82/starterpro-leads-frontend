import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  EnvelopeIcon,
  ChatBubbleOvalLeftIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/solid";
import ExportReportModal from "./ExportReportModal";

const emailData = [
  { name: "Week 1", Open: 40, Click: 18 },
  { name: "Week 2", Open: 45, Click: 19 },
  { name: "Week 3", Open: 38, Click: 16 },
  { name: "Week 4", Open: 40, Click: 17 },
];

const smsData = [
  { name: "Week 1", Delivery: 95, Response: 30 },
  { name: "Week 2", Delivery: 96, Response: 32 },
  { name: "Week 3", Delivery: 94, Response: 28 },
  { name: "Week 4", Delivery: 97, Response: 31 },
];

const campaignDetails = [
  {
    campaign: "Spring Insurance Special",
    sent: 2450,
    delivered: "2,401 (98%)",
    opens: "1,085 (45.2%)",
    clicks: "439 (18.3%)",
    conversions: "147 (6.1%)",
    revenue: "$42,150",
  },
  {
    campaign: "Appointment Reminders",
    sent: 156,
    delivered: "144 (92.3%)",
    opens: "N/A",
    clicks: "122 (84.7%)",
    conversions: "45 (31.3%)",
    revenue: "$18,900",
  },
];

export default function CampaignDashboard() {
  const [open, setOpen] = useState(false);

  const cards = [
    {
      title: "Email Open Rate",
      value: "42.3%",
      change: "+5.2% vs last month",
      color: "bg-blue-500",
      icon: <EnvelopeIcon className="w-5 h-5 text-blue-500" />,
      progress: "w-[42%] bg-blue-500",
    },
    {
      title: "SMS Delivery Rate",
      value: "94.8%",
      change: "+1.2% vs last month",
      color: "bg-green-500",
      icon: <ChatBubbleOvalLeftIcon className="w-5 h-5 text-green-500" />,
      progress: "w-[94%] bg-green-500",
    },
    {
      title: "Click-Through Rate",
      value: "18.7%",
      change: "+2.3% vs last month",
      color: "bg-purple-500",
      icon: <CursorArrowRaysIcon className="w-5 h-5 text-purple-500" />,
      progress: "w-[18%] bg-purple-500",
    },
    {
      title: "Conversion Rate",
      value: "6.2%",
      change: "+0.8% vs last month",
      color: "bg-orange-500",
      icon: <ChartBarIcon className="w-5 h-5 text-orange-500" />,
      progress: "w-[6%] bg-orange-500",
    },
  ];

  return (
    <div className="p-6 space-y-6">
    {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">
          Campaign Reports & Analytics
        </h1>
        <div className="flex gap-3">
          <select className="border rounded px-3 py-2 text-sm">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Custom Range</option>
          </select>
           <button
            className="bg-[#0a2463] px-4 py-2 rounded-lg text-white hover:bg-[#1e40af] font-medium flex items-center space-x-2"
            onClick={() => setOpen(true)}
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span> Export Report</span>
          </button>
        </div>
      </div>
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div
            key={i}
            className="bg-white border rounded-xl shadow p-5 relative"
          >
            {/* Title + Icon */}
            <div className="flex items-start justify-between">
              <h2 className="text-sm text-gray-500">{c.title}</h2>
              {c.icon}
            </div>
            {/* Value */}
            <div className="text-2xl font-bold mt-1">{c.value}</div>
            {/* Change */}
            <div className="text-xs text-green-600 mt-1">{c.change}</div>
            {/* Progress bar */}
            <div className="h-2 w-full bg-gray-200 rounded-full mt-3">
              <div className={`h-2 rounded-full ${c.progress}`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       {/* Email Campaign Performance */}
      <div className="bg-white border rounded-xl shadow p-4">
        <h2 className="text-sm font-medium mb-3">Email Campaign Performance</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={emailData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Open" name="Open Rate" fill="#0c4a6e" />
            <Bar dataKey="Click" name="Click Rate" fill="#22c55e" />
            <Legend verticalAlign="bottom" height={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SMS Campaign Performance */}
      <div className="bg-white border rounded-xl shadow p-4">
        <h2 className="text-sm font-medium mb-3">SMS Campaign Performance</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={smsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Delivery" name="Delivery Rate" fill="#84cc16" />
            <Bar dataKey="Response" name="Response Rate" fill="#60a5fa" />
            <Legend verticalAlign="bottom" height={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      </div>

      {/* Campaign Performance Details Table */}
      <div className="bg-white border rounded-xl shadow overflow-hidden">
       <div className="flex items-center justify-between border-b">
        <h6 className="text-md font-semibold text-gray-800 p-4">
          Campaign Reports & Analytics
        </h6>
      </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Sent</th>
              <th className="px-4 py-3">Delivered</th>
              <th className="px-4 py-3">Opens</th>
              <th className="px-4 py-3">Clicks</th>
              <th className="px-4 py-3">Conversions</th>
              <th className="px-4 py-3">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {campaignDetails.map((row, i) => (
              <tr
                key={i}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium">{row.campaign}</td>
                <td className="px-4 py-3">{row.sent}</td>
                <td className="px-4 py-3">{row.delivered}</td>
                <td className="px-4 py-3">{row.opens}</td>
                <td className="px-4 py-3">{row.clicks}</td>
                <td className="px-4 py-3">{row.conversions}</td>
                <td className="px-4 py-3 text-green-600 font-semibold">
                  {row.revenue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ExportReportModal isOpen={open} close={() => setOpen(false)} />
    </div>
  );
}
