import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router';
import { Card } from 'components/ui';
import SharedSidebar from './components/SharedSidebar';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  CalendarIcon,
  // TrophyIcon,
  // ClockIcon,
  // EyeIcon,
  // PencilIcon,
  // TrashIcon,
  XMarkIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
// import axios from 'utils/axios';
import { apiUtils } from 'utils/apiService';
import dashboardService from 'utils/dashboardService';
import { LEAD_STATUS } from 'constants/app.constant';

const AgentDashboard = () => {
  // const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  console.log('userData', userData);
  const [selectedLead, setSelectedLead] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState(null);
  const [limit, setLimit] = useState(3);
  const [metricsData, setMetricsData] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(null);

  // Fetch metrics data
  const fetchMetricsData = async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const response = await dashboardService.getDashboardCount(1);
      setMetricsData(response?.data);
    } catch (error) {
      console.error('Error fetching metrics data:', error);
      setMetricsError('Failed to load metrics data');
    } finally {
      setMetricsLoading(false);
    }
  };

  // Calculate metrics from API data
  const getMetrics = () => {
    if (!metricsData) return [];

    const totalLeads = (metricsData.completed || 0) + (metricsData.incomplete || 0);
    const totalGold = (metricsData.completed || 0) + (metricsData.completed_sold || 0) + (metricsData.gold_suppressed || 0);
    const totalSilver = (metricsData.incomplete || 0) + (metricsData.incomplete_sold || 0) + (metricsData.silver_suppressed || 0);

    return [
      {
        title: 'Total Leads',
        value: totalLeads?.toString() || '0',
        change: '+0%',
        changeType: 'positive',
        icon: UserGroupIcon,
        color: 'shieldnest-bg1 text-white'
      },
      {
        title: 'Total Completed',
        value: totalGold.toString(),
        change: '+0%',
        changeType: 'positive',
        icon: CurrencyDollarIcon,
        color: 'shieldnest-bg2 text-white'
      },
      {
        title: 'Total Incomplete',
        value: totalSilver.toString(),
        change: '+0%',
        changeType: 'positive',
        icon: CurrencyDollarIcon,
        color: 'shieldnest-bg3 text-white'
      }
    ];
  };

  useEffect(() => {
    fetchMetricsData();
  }, []);

  useEffect(() => {
    const fetchRecentLeads = async () => {
      setLeadsLoading(true);
      setLeadsError(null);
      try {
        const res = await dashboardService.getRecentLeads(limit);
        setRecentLeads(res.data || []);
      } catch (err) {
        setLeadsError(apiUtils.formatError(err));
      } finally {
        setLeadsLoading(false);
      }
    };
    fetchRecentLeads();
  }, [limit]);

  /*const getStatusBadgeClass = (status) => {
    const classes = {
      1: 'shieldnest-status',
      6: 'bg-shieldnest2-900 text-white',
      12: 'bg-shieldnest3-900 text-white',
    };
    return classes[status] || 'bg-shieldnest1-900 text-white';
  };*/

  const closeLeadDetail = () => {
    setSelectedLead(null);
  };

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)]">
      {/* Sidebar */}
      <SharedSidebar currentPath="/agent-dashboard" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-atoll)]">Dashboard Overview</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {userData?.name}! Here&apos;s your lead summary for today.</p>
            </div>
            {/* <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/lead-management')}
                className="bg-[#f4d03f] text-white px-4 py-2 rounded-lg hover:bg-[#e6c035] transition-colors"
              >
                New Lead
              </button>
              <button 
                onClick={() => alert('Notifications: 3 new leads awaiting follow-up')}
                className="w-8 h-8 bg-[var(--color-atoll)] rounded-full flex items-center justify-center relative hover:bg-opacity-90 transition-colors"
              >
                <span className="text-white text-sm">🔔</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
            </div> */}
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {metricsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-slate-100 border border-slate-200 rounded-xl p-6 flex flex-col justify-between min-h-[120px]">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))
            ) : metricsError ? (
              <div className="col-span-4">
                <div className="bg-gradient-to-br from-white to-slate-100 border border-slate-200 rounded-xl p-6 text-center text-red-600">
                  <p>{metricsError}</p>
                  <button 
                    onClick={fetchMetricsData}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : (
              getMetrics().map((metric, index) => (
                <div key={index} className="shieldnest-gradient-column rounded-xl p-6 flex items-center justify-between min-h-[120px]">
                  <div className="flex flex-col justify-between h-full">
                    <p className="text-base font-medium text-slate-700 mb-1">{metric.title}</p>
                    <p className="text-3xl font-bold text-slate-800 mb-1">{metric.value}</p>
                    {metric.change && metric.change !== '+0%' && (
                      <p className={`text-sm mt-2 font-medium ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-500'}`}>{metric.change}</p>
                    )}
                  </div>
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ml-4 ${metric.color}`}>
                    <metric.icon className="w-7 h-7" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Leads Table */}
          <Card className="overflow-hidden bg-white border-none shieldnest-shadow">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-atoll)]">Recent Leads</h3>
                <p className="text-sm text-gray-600 mt-1">Latest leads requiring your attention</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show</span>
                <select
                  className="border rounded px-2 py-1"
                  value={limit}
                  onChange={e => setLimit(Number(e.target.value))}
                >
                  {[3, 5, 10, 20].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-600">leads</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              {leadsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : leadsError ? (
                // <div className="text-red-500 bg-red-100 p-4 rounded-md">{leadsError}</div>
                <div className="text-yellow-500 p-4 rounded-md">No Recent Leads</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lead
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Territory
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th> */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {/* <div className="w-10 h-10 bg-[var(--color-atoll)] rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {lead.full_name?.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div> */}
                            {(() => {
                              const avatarColors = [
                                "#0a2463", "#f4d03f", "#0a2463", "#f4d03f", "#0a2463", "#f4d03f", "#0a2463",
                                "#f4d03f", "#0a2463", "#f4d03f", "#0a2463", "#f4d03f", "#0a2463", "#f4d03f", "#0a2463"
                              ];
                              const color = avatarColors[recentLeads.indexOf(lead) % avatarColors.length];
                              return (
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: color }}
                                >
                                  <span className="text-white font-medium text-sm">
                                    {lead.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                  </span>
                                </div>
                              );
                            })()}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{lead.full_name}</div>
                              <div className="text-sm text-gray-500">ID: {lead.mortgage_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{lead.city}</div>
                          <div className="text-sm text-gray-500">{lead.state}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{lead.call_in_date_time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full shieldnest-badge-${(lead.lead_status)}`}>
                            {LEAD_STATUS[lead.lead_status] || lead.lead_status}
                          </span>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              // onClick={() => setSelectedLead(lead)}
                              className="text-[var(--color-atoll)] hover:text-[var(--color-atoll)]/80"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </main>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-lg bg-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[var(--color-atoll)] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedLead.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--color-atoll)]">{selectedLead.name}</h3>
                  <p className="text-gray-600">{selectedLead.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full shieldnest-badge-${(selectedLead.status)}`}>
                      {selectedLead.statusLabel || selectedLead.status}
                    </span>
                    <span className="text-sm text-gray-500">Lead ID: #{selectedLead.id}</span>
                  </div>
                </div>
              </div>
              <button onClick={closeLeadDetail} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact Information */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-[var(--color-atoll)] mb-4">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <PhoneIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{selectedLead.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{selectedLead.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPinIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Territory</p>
                          <p className="font-medium">{selectedLead.territory}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Created</p>
                          <p className="font-medium">{selectedLead.created}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lead Source */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-800 mb-4">Lead Source</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-600">Campaign</span>
                        <span className="text-sm font-medium text-blue-800">{selectedLead.campaign}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-600">Source</span>
                        <span className="text-sm font-medium text-blue-800">{selectedLead.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-600">Code</span>
                        <span className="text-sm font-medium text-blue-800">{selectedLead.code}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lead Activity & Notes */}
                <div className="lg:col-span-2">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-[var(--color-atoll)] mb-4">Lead Activity & Notes</h4>
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-800">Lead Created</span>
                          <span className="text-xs text-green-600">{selectedLead.created}</span>
                        </div>
                        <p className="text-sm text-green-700">
                          New lead generated from {selectedLead.campaign}. Initial contact required.
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-800">System Note</span>
                          <span className="text-xs text-blue-600">Auto-generated</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          Lead source verified. Territory assignment: {selectedLead.territory}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard; 