import { useState } from 'react';
import { Card } from 'components/ui';
import SharedSidebar from './components/SharedSidebar';
import { 
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const ReportsAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('leads');

  const periods = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const metrics = [
    { value: 'leads', label: 'Lead Generation' },
    { value: 'conversion', label: 'Conversion Rates' },
    { value: 'revenue', label: 'Revenue Analysis' },
    { value: 'territory', label: 'Territory Performance' }
  ];

  // Overview Statistics
  const overviewStats = [
    {
      title: 'Total Leads',
      value: '2,847',
      change: '+12.5%',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'blue'
    },
    {
      title: 'Conversion Rate',
      value: '23.4%',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUpIcon,
      color: 'green'
    },
    {
      title: 'Revenue Generated',
      value: '$89,320',
      change: '+15.7%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'purple'
    },
    {
      title: 'Avg Response Time',
      value: '2.3 hrs',
      change: '-0.8 hrs',
      changeType: 'positive',
      icon: ClockIcon,
      color: 'orange'
    }
  ];

  // Territory Performance Data
  const territoryData = [
    { territory: 'Florida', leads: 847, conversions: 198, revenue: 28450, rate: 23.4 },
    { territory: 'California', leads: 734, conversions: 176, revenue: 34200, rate: 24.0 },
    { territory: 'Texas', leads: 623, conversions: 143, revenue: 19670, rate: 22.9 },
    { territory: 'New York', leads: 564, conversions: 118, revenue: 21890, rate: 20.9 },
    { territory: 'Georgia', leads: 456, conversions: 89, revenue: 15340, rate: 19.5 }
  ];

  // Performance Trends (6 months)
  const performanceTrends = [
    { month: 'Jan', leads: 420, conversions: 89, revenue: 12450 },
    { month: 'Feb', leads: 580, conversions: 124, revenue: 18900 },
    { month: 'Mar', leads: 720, conversions: 158, revenue: 24300 },
    { month: 'Apr', leads: 650, conversions: 142, revenue: 21800 },
    { month: 'May', leads: 890, conversions: 198, revenue: 31200 },
    { month: 'Jun', leads: 756, conversions: 178, revenue: 28650 }
  ];

  // Lead Sources
  const leadSources = [
    { source: 'Direct Mail', leads: 1245, percentage: 43.7, color: 'bg-[#0a2463]' },
    { source: 'Digital Marketing', leads: 867, percentage: 30.4, color: 'bg-[#f4d03f]' },
    { source: 'Referrals', leads: 456, percentage: 16.0, color: 'bg-[#0a2463]' },
    { source: 'Cold Calling', leads: 189, percentage: 6.6, color: 'bg-[#f4d03f]' },
    { source: 'Events', leads: 90, percentage: 3.2, color: 'bg-[#0a2463]' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-[#0a2463]',
      green: 'bg-yellow-50 text-[#f4d03f]',
      purple: 'bg-blue-50 text-[#0a2463]',
      orange: 'bg-yellow-50 text-[#f4d03f]'
    };
    return colors[color] || 'bg-gray-50 text-gray-600 dark:text-gray-300';
  };

  const handleExportReport = () => {
    alert('Report exported successfully! (Demo)');
  };

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      {/* Sidebar */}
      <SharedSidebar currentPath="/reports" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0a2463]">Reports & Analytics</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Performance insights and data analysis</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:border-[#0a2463] focus:outline-none"
              >
                {periods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
              <button 
                onClick={handleExportReport}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Overview Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {overviewStats.map((stat, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === 'positive' ? (
                        <TrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Performance Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#0a2463]">Performance Trends</h3>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#0a2463] focus:outline-none"
                >
                  {metrics.map((metric) => (
                    <option key={metric.value} value={metric.value}>
                      {metric.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="h-64 flex items-end justify-between space-x-2">
                {performanceTrends.map((data, index) => {
                  const maxValue = Math.max(...performanceTrends.map(d => d.leads));
                  const height = (data.leads / maxValue) * 200;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-[#0a2463] rounded-t-lg transition-all duration-300 hover:bg-[#0a1a4a]"
                        style={{ 
                          height: `${height}px`,
                          minHeight: '20px'
                        }}
                        title={`${data.month}: ${data.leads} leads`}
                      ></div>
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 text-center">
                        <div className="font-medium">{data.month}</div>
                        <div>{data.leads}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Lead Sources */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#0a2463] mb-6">Lead Sources</h3>
              <div className="space-y-4">
                {leadSources.map((source, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{source.source}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{source.leads} leads</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${source.color} transition-all duration-300`}
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{source.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Territory Performance */}
          <Card className="mb-8">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-[#0a2463]">Territory Performance</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Performance breakdown by territory</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Territory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Leads
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Conversions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Conversion Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                  {territoryData.map((territory, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{territory.territory}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{territory.leads.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{territory.conversions}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          ${territory.revenue.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{territory.rate}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-[#f4d03f] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(territory.rate / 25) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">{territory.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Performance Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Call Performance */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-[#0a2463]">Call Performance</h4>
                <PhoneIcon className="w-6 h-6 text-gray-400" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Calls</span>
                  <span className="text-sm font-medium">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Answered</span>
                  <span className="text-sm font-medium text-green-600">892 (71.5%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Avg Duration</span>
                  <span className="text-sm font-medium">4:32</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Appointments Set</span>
                  <span className="text-sm font-medium text-purple-600">156</span>
                </div>
              </div>
            </Card>

            {/* Email Performance */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-[#0a2463]">Email Performance</h4>
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Emails Sent</span>
                  <span className="text-sm font-medium">3,456</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Open Rate</span>
                  <span className="text-sm font-medium text-green-600">34.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Click Rate</span>
                  <span className="text-sm font-medium">8.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Responses</span>
                  <span className="text-sm font-medium text-purple-600">234</span>
                </div>
              </div>
            </Card>

            {/* Goal Progress */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-[#0a2463]">Goal Progress</h4>
                <ChartBarIcon className="w-6 h-6 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Monthly Leads</span>
                    <span className="text-sm font-medium">2,847 / 3,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#f4d03f] h-2 rounded-full transition-all duration-300" style={{ width: '94.9%' }}></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">94.9% complete</div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Revenue Target</span>
                    <span className="text-sm font-medium">$89.3K / $100K</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#0a2463] h-2 rounded-full transition-all duration-300" style={{ width: '89.3%' }}></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">89.3% complete</div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsAnalytics; 