import { useState } from 'react';
import { Card } from 'components/ui';
import SharedSidebar from './components/SharedSidebar';

const Campaigns = () => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const campaigns = [
    {
      id: 1,
      name: '5,000 Mailer Campaign',
      type: 'Direct Mail',
      status: 'active',
      budget: 15000,
      spent: 12450,
      leads: 847,
      conversions: 198,
      revenue: 89500,
      startDate: 'Apr 15, 2024',
      endDate: 'Jul 15, 2024',
      territories: ['Florida', 'Georgia'],
      description: 'Targeted direct mail campaign for life insurance prospects in Southeast markets.',
      performance: 'excellent'
    },
    {
      id: 2,
      name: 'Digital Marketing Campaign',
      type: 'Digital',
      status: 'active',
      budget: 8500,
      spent: 6200,
      leads: 432,
      conversions: 89,
      revenue: 34200,
      startDate: 'May 1, 2024',
      endDate: 'Aug 1, 2024',
      territories: ['California', 'Texas'],
      description: 'Facebook and Google Ads targeting homeowners interested in property insurance.',
      performance: 'good'
    },
    {
      id: 3,
      name: 'Referral Program',
      type: 'Referral',
      status: 'active',
      budget: 5000,
      spent: 2100,
      leads: 156,
      conversions: 67,
      revenue: 78900,
      startDate: 'Mar 1, 2024',
      endDate: 'Ongoing',
      territories: ['All Active'],
      description: 'Customer referral incentive program with bonus rewards.',
      performance: 'excellent'
    },
    {
      id: 4,
      name: 'Cold Calling Blitz',
      type: 'Telemarketing',
      status: 'completed',
      budget: 3000,
      spent: 3000,
      leads: 89,
      conversions: 12,
      revenue: 15600,
      startDate: 'Feb 1, 2024',
      endDate: 'Feb 28, 2024',
      territories: ['New York'],
      description: 'Intensive cold calling campaign for business insurance prospects.',
      performance: 'poor'
    },
    {
      id: 5,
      name: 'Summer Auto Insurance Push',
      type: 'Digital',
      status: 'scheduled',
      budget: 12000,
      spent: 0,
      leads: 0,
      conversions: 0,
      revenue: 0,
      startDate: 'Jun 1, 2024',
      endDate: 'Aug 31, 2024',
      territories: ['California', 'Florida'],
      description: 'Summer auto insurance campaign targeting vacation travelers.',
      performance: 'pending'
    }
  ];

  const getStatusBadgeClass = (status) => {
    const classes = {
      active: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      paused: 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  const getPerformanceBadgeClass = (performance) => {
    const classes = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      average: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return classes[performance] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Direct Mail': '📬',
      'Digital': '💻',
      'Referral': '👥',
      'Telemarketing': '📞',
      'Event': '🎪'
    };
    return icons[type] || '📊';
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    return filterStatus === 'all' || campaign.status === filterStatus;
  });

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)]">
      {/* Sidebar */}
      <SharedSidebar currentPath="/campaigns" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-atoll)]">My Campaigns</h1>
              <p className="text-gray-600 mt-1">Manage and track your marketing campaigns</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:border-[var(--color-atoll)] focus:outline-none"
              >
                <option value="all">All Campaigns</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
              <button className="bg-[#f4d03f] text-white px-4 py-2 rounded-lg hover:bg-[#e6c035] transition-colors flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>New Campaign</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
        {/* Campaign Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">${totalBudget.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Amount Spent</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">${totalSpent.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{((totalSpent / totalBudget) * 100).toFixed(1)}% of budget</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalLeads.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">${totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600">
                  {totalSpent > 0 ? `${((totalRevenue / totalSpent) * 100).toFixed(0)}% ROI` : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getTypeIcon(campaign.type)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-500">{campaign.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCampaign(campaign)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceBadgeClass(campaign.performance)}`}>
                    {campaign.performance}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{campaign.description}</p>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Budget</span>
                    <span className="text-sm font-medium">${campaign.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Spent</span>
                    <span className="text-sm font-medium">${campaign.spent.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[var(--color-atoll)] h-2 rounded-full"
                      style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-sm text-gray-500">Leads</p>
                      <p className="text-lg font-bold text-gray-900">{campaign.leads}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Revenue</p>
                      <p className="text-lg font-bold text-green-600">${campaign.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{campaign.startDate}</span>
                    <span>{campaign.endDate}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3">
                <div className="flex justify-between items-center">
                  <button className="text-[var(--color-atoll)] hover:text-[var(--color-atoll)]/80 text-sm font-medium">
                    View Details
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 text-sm">
                    Edit
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        </main>
      </div>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-lg bg-white mb-10">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{getTypeIcon(selectedCampaign.type)}</div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--color-atoll)]">{selectedCampaign.name}</h3>
                  <p className="text-gray-600">{selectedCampaign.type} Campaign</p>
                </div>
              </div>
              <button onClick={() => setSelectedCampaign(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-[var(--color-atoll)] mb-4">Campaign Details</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Description</p>
                      <p className="text-gray-600">{selectedCampaign.description}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Duration</p>
                      <p className="text-gray-600">{selectedCampaign.startDate} - {selectedCampaign.endDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Target Territories</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedCampaign.territories.map((territory, index) => (
                          <span key={index} className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                            {territory}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-[var(--color-atoll)] mb-4">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget Allocated</span>
                      <span className="font-medium">${selectedCampaign.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Spent</span>
                      <span className="font-medium">${selectedCampaign.spent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Leads Generated</span>
                      <span className="font-medium">{selectedCampaign.leads.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversions</span>
                      <span className="font-medium">{selectedCampaign.conversions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue Generated</span>
                      <span className="font-medium text-green-600">${selectedCampaign.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ROI</span>
                      <span className="font-medium">
                        {selectedCampaign.spent > 0 ? `${((selectedCampaign.revenue / selectedCampaign.spent) * 100).toFixed(0)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-200 space-x-3">
              <button 
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm bg-[var(--color-atoll)] text-white rounded-md hover:bg-[var(--color-atoll)]/90">
                Edit Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns; 