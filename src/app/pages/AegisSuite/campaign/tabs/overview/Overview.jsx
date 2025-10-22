import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  MegaphoneIcon,
  EnvelopeIcon,
  HomeIcon,
  CursorArrowRaysIcon,
} from '@heroicons/react/24/solid'; // heroicons (optional)

const lineData = [
  { day: 'Mon', email: 420, sms: 120 },
  { day: 'Tue', email: 380, sms: 140 },
  { day: 'Wed', email: 460, sms: 110 },
  { day: 'Thu', email: 520, sms: 150 },
  { day: 'Fri', email: 480, sms: 130 },
  { day: 'Sat', email: 390, sms: 100 },
  { day: 'Sun', email: 410, sms: 120 },
];

const pieData = [
  { name: 'Email', value: 65, color: '#0d6efd' },
  { name: 'SMS', value: 25, color: '#22c55e' },
  { name: 'Multi-channel', value: 10, color: '#84cc16' },
];

export default function Overview() {
  const cards = [
    {
      title: 'Total Campaigns',
      value: '24',
      change: '+3 this month',
      iconColor: 'bg-[#0B5C77]',
      icon: <MegaphoneIcon className="w-6 h-6 text-white" />,
    },
    {
      title: 'Messages Sent',
      value: '8,456',
      change: '+15% vs last month',
      iconColor: 'bg-[#22C55E]',
      icon: <EnvelopeIcon className="w-6 h-6 text-white" />,
    },
    {
      title: 'Open Rate',
      value: '42.3%',
      change: '+2.1% improvement',
      iconColor: 'bg-[#84CC16]',
      icon: <HomeIcon className="w-6 h-6 text-white" />,
    },
    {
      title: 'Click Rate',
      value: '18.7%',
      change: 'Above average',
      iconColor: 'bg-[#94A3B8]',
      icon: <CursorArrowRaysIcon className="w-6 h-6 text-white" />,
    },
  ];

  const campaigns = [
    {
      name: 'Spring Insurance Special',
      channel: 'Email • Sent to 2,450 contacts',
      stat: '45.2% Open Rate',
      badge: 'Delivered',
    },
    {
      name: 'Appointment Reminder',
      channel: 'SMS • Sent to 155 contacts',
      stat: '92% Delivery Rate',
      badge: 'Sent',
    },
    {
      name: 'Monthly Newsletter',
      channel: 'Email • 3,200 recipients',
      stat: 'Scheduled Tomorrow at 9:00 AM',
      badge: 'Scheduled',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-white to-[#E6F0F3] rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between"
          >
            <div>
              <h3 className="text-gray-700 text-sm font-medium">{card.title}</h3>
              <p className="text-2xl font-bold text-[var(--color-atoll)] mt-1">
                {card.value}
              </p>
              <p className="text-green-600 text-xs mt-1">{card.change}</p>
            </div>
            <div
              className={`w-12 h-12 ${card.iconColor} rounded-full flex items-center justify-center`}
            >
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-[var(--color-atoll)] mb-4">
          Recent Campaigns
        </h2>

       {campaigns.map((c, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-gradient-to-r from-white to-[#F7FAFC] hover:bg-gray-100 transition rounded-md p-4"
          >
            <div className="flex items-center space-x-3">
              {/* Icon */}
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-xl ${
                  c.iconType === 'email' ? 'bg-[#0B5C77]' : 'bg-[#22C55E]'
                }`}
              >
                {c.iconType === 'email' ? (
                  <EnvelopeIcon className="w-5 h-5 text-white" />
                ) : (
                  <MegaphoneIcon className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Text */}
              <div>
                <h3 className="font-medium text-gray-800">{c.name}</h3>
                <p className="text-sm text-gray-500">{c.channel}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{c.stat}</span>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  c.badge === 'Delivered'
                    ? 'bg-green-100 text-green-700'
                    : c.badge === 'Sent'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {c.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[var(--color-atoll)] mb-4">
            Campaign Performance (Last 7 Days)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="email"
                  stroke="#0d6efd"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="sms"
                  stroke="#22c55e"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[var(--color-atoll)] mb-4">
            Channel Distribution
          </h2>
          <div className="h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
