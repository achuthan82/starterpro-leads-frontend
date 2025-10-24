import { Link } from 'react-router';
import { Card } from 'components/ui';
import { 
  ChartBarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  TrophyIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Overview = () => {
  const features = [
    {
      title: "Agent Dashboard",
      description: "Comprehensive dashboard for insurance agents with lead management, analytics, and performance tracking.",
      href: "/agent-dashboard",
      icon: ChartBarIcon,
      color: "from-blue-500 to-blue-600",
      stats: [
        { label: "Total Leads", value: "2,847" },
        { label: "Converted", value: "1,234" },
        { label: "Revenue", value: "$89,320" }
      ],
      features: [
        "Lead Management System",
        "Performance Analytics",
        "Real-time Notifications",
        "Territory Management"
      ]
    },
    {
      title: "Lead Marketplace",
      description: "Buy and sell premium insurance leads with advanced filtering and real-time inventory management.",
      href: "/marketplace",
      icon: ShoppingBagIcon,
      color: "from-purple-500 to-purple-600",
      stats: [
        { label: "Available Leads", value: "14,394" },
        { label: "Fresh Today", value: "780" },
        { label: "Avg Quality", value: "4.7★" }
      ],
      features: [
        "State-based Lead Filtering",
        "Real-time Inventory",
        "Quality Scoring",
        "Territory Targeting"
      ]
    }
  ];

  const quickStats = [
    {
      label: "Active Agents",
      value: "1,247",
      icon: UserGroupIcon,
      color: "text-[#0a2463] bg-blue-50"
    },
    {
      label: "Monthly Revenue",
      value: "$892K",
      icon: CurrencyDollarIcon,
      color: "text-[#f4d03f] bg-yellow-50"
    },
    {
      label: "Conversion Rate",
      value: "12.5%",
      icon: TrophyIcon,
      color: "text-[#0a2463] bg-blue-50"
    },
    {
      label: "Response Time",
      value: "< 2min",
      icon: ClockIcon,
      color: "text-[#f4d03f] bg-yellow-50"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-ecru-white)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0a2463] to-[#f4d03f] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <ShieldCheckIcon className="w-16 h-16 text-white mr-4" />
              <h1 className="text-5xl font-bold">Starterpro</h1>
            </div>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              The ultimate insurance lead management platform. Streamline your lead acquisition, 
              manage your pipeline, and accelerate your insurance business growth.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/agent-dashboard"
                className="bg-white dark:bg-gray-800 text-[#0a2463] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Access Dashboard
              </Link>
              <Link
                to="/marketplace"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white dark:bg-gray-800 hover:text-[#0a2463] transition-colors"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300">
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${feature.color} p-6 text-white`}>
                <div className="flex items-center mb-4">
                  <feature.icon className="w-8 h-8 mr-3" />
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                </div>
                <p className="text-blue-100 mb-4">{feature.description}</p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {feature.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="text-center">
                      <div className="text-lg font-bold">{stat.value}</div>
                      <div className="text-xs text-blue-100">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Key Features</h4>
                <ul className="space-y-2 mb-6">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 bg-[#f4d03f] rounded-full mr-3"></div>
                      {item}
                    </li>
                  ))}
                </ul>
                
                <Link
                  to={feature.href}
                  className="inline-flex items-center text-[#0a2463] font-semibold hover:text-[#0a2463]/80 transition-colors"
                >
                  Access {feature.title}
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Getting Started */}
        <Card className="p-8 text-center bg-gradient-to-r from-[var(--color-beryl-green)] to-[var(--color-botticelli)]">
          <h3 className="text-2xl font-bold text-[#0a2463] mb-4">
            Ready to Transform Your Insurance Business?
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Join thousands of insurance professionals who trust ShieldNest for their lead management 
            and marketplace needs. Start maximizing your conversion rates today.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/agent-dashboard"
              className="bg-[#0a2463] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0a1a4a] transition-colors"
            >
              Start Managing Leads
            </Link>
            <Link
              to="/marketplace"
              className="bg-[#f4d03f] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e6c035] transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Overview; 