import { useState, useEffect } from 'react';
import { Card, Spinner, Button } from 'components/ui';
import SharedSidebar from './components/SharedSidebar';
import { leadsService, subscriptionService } from 'utils/apiService';

import { 
  CurrencyDollarIcon,
  UserGroupIcon,
  // UsersIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const Territories = () => {
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [territories, setTerritories] = useState([]);
  const [usaStates, setUsaStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  const [metricsData, setMetricsData] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(null);

  const PER_PAGE_OPTIONS = [6, 9, 12, 18];
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(9);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / perPage);

  // Tab configuration
  const tabs = [
    { id: 'active', label: 'Active Territories' },
    { id: 'inactive', label: 'Inactive Territories' }
  ];

  console.log('territories', usaStates);
  
  const getStatusBadgeClass = (status) => {
    const classes = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Active',
      pending: 'Pending',
      inactive: 'Inactive'
    };
    return labels[status] || status;
  };

  // Fetch metrics data
  const fetchMetricsData = async (tabId = activeTab) => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const response = await leadsService.getTerritoriesCount(1, tabId);
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

    // const totalSilver = (metricsData.silver_leads || 0) + (metricsData.silver_sold || 0) + (metricsData.silver_suppressed || 0);
    const converted = (metricsData.sold || 0) + (metricsData.incomplete_sold || 0);

    return [
      {
        title: `${activeTab === 'active' ? 'Active' : 'Inactive'} Territories`,
        value: territories?.length.toString() || '0',
        change: '+0%',
        changeType: 'positive',
        icon: MapPinIcon,
        color: 'shieldnest-bg1 text-white'
      },
      {
        title: 'Total Leads',
        value: metricsData?.total?.toString() || '0',
        change: '+0%',
        changeType: 'positive',
        icon: UserGroupIcon,
        color: 'shieldnest-bg2 text-white'
      },
      {
        title: 'Converted',
        value: converted.toString(),
        change: '+0%',
        changeType: 'positive',
        icon: CurrencyDollarIcon,
        color: 'shieldnest-bg2 text-white'
      },
      // {
      //   title: 'Total Silver',
      //   value: totalSilver.toString(),
      //   change: '+0%',
      //   changeType: 'positive',
      //   icon: CurrencyDollarIcon,
      //   color: 'bg-gray-100 text-gray-500'
      // }
    ];
  };

  // Fetch territories and states data
  const fetchData = async (tabId = activeTab) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching territories for tab:', tabId);
      
      // Fetch territories data with tab filter
      const territoriesResponse = await leadsService.getTerritories(1, page, perPage, tabId);
      console.log('Territories API response:', territoriesResponse);

      // Fetch USA states data
      const statesResponse = await subscriptionService.getUsaStates();
      console.log('USA States API response:', statesResponse);

      // Process states data to create a mapping
      const statesMap = {};
      if (statesResponse?.data?.data) {
        Object.keys(statesResponse.data.data).map(function(key) {
          statesMap[statesResponse.data.data[key]] = key;
        })
      }
      setUsaStates(statesMap);

      // Process territories data
      let processedTerritories = [];
      if (territoriesResponse.data && Array.isArray(territoriesResponse.data)) {
        processedTerritories = territoriesResponse.data.map(territory => {
          const stateName = statesMap[territory.state] || territory.state;
          const totalLeads = territory.completed + territory.incomplete;
          const conversionRate = totalLeads > 0 
            ? ((territory.sold / (totalLeads + territory.sold)) * 100).toFixed(1)
            : 0;

          return {
            id: territory.state,
            name: stateName,
            code: territory.state,
            status: activeTab === 'active' ? 'active' : 'inactive',
            leads: totalLeads || 0,
            conversions: territory.sold || 0,
            revenue: territory.revenue || 0,
            conversionRate: parseFloat(conversionRate),
            cities: [], // API doesn't provide cities, keeping empty for now
            zipCodes: [], // API doesn't provide zip codes, keeping empty for now
            lastActivity: territory.last_activity || 'Never'
          };
        });
      }

      setTerritories(processedTerritories);
      setTotal(territoriesResponse.data.pagination?.total || 0);

    } catch (err) {
      console.error('Error fetching territories data:', err);
      setError('Failed to load territories data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1); // Reset to first page when changing tabs
    fetchData(tabId);
    fetchMetricsData(tabId);
  };

  useEffect(() => {
    fetchData();
    fetchMetricsData();
  }, []);

  // Refetch data when page or perPage changes
  useEffect(() => {
    if (page > 1 || perPage !== 9) { // Skip initial load
      fetchData(activeTab);
    }
  }, [page, perPage]);

  const borderColors = [
    "#0a2463", "#5ab453", "#92c933", "#FF2ECF", "#E000AD", "#FFA71A", "#FF4F1A",
    "#384766", "#506877", "#3D4E70", "#4A4A4F", "#6D7EA1", "#70838F", "#B8008C", "#FF75DF"
  ];

  console.log('territories', territories);

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)]">
      {/* Sidebar */}
      <SharedSidebar currentPath="/territories" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-atoll)]">Mailing Territories</h1>
              <p className="text-gray-600 mt-1">Manage your sales territories and coverage areas</p>
            </div>
            {/* <div className="flex items-center space-x-3">
              <button className="bg-[#f4d03f] text-white px-4 py-2 rounded-lg hover:bg-[#e6c035] transition-colors flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>Add Territory</span>
              </button>
            </div> */}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-[var(--color-atoll)] text-[var(--color-atoll)]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600">Loading territories...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-[var(--color-atoll)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-atoll)]/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Territory Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                {/* <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Territories</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {territories.filter(t => t.status === 'active').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </Card> */}

          {/* <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {territories.reduce((sum, t) => sum + t.leads, 0).toLocaleString()}
                </p>
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
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${territories.reduce((sum, t) => sum + t.revenue, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {(territories.filter(t => t.status === 'active').reduce((sum, t) => sum + t.conversionRate, 0) / territories.filter(t => t.status === 'active').length).toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card> */}
        </div> 

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metricsLoading ? (
            Array.from({ length: 2 }).map((_, index) => (
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
              <div key={index} className="shieldnest-white-column rounded-xl p-6 flex items-center justify-between min-h-[120px]" style={{ borderLeft: `5px solid ${borderColors[index % borderColors.length]}` }}>
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

        {/* Territories Grid */}
        {territories.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab === 'active' ? 'Active' : 'Inactive'} Territories Found</h3>
              <p className="text-gray-600">You don&apos;t have any territories assigned yet.</p>
            </div>
          </div>
        ) : (
          <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-gray-700 font-medium">Showing page {page} of {totalPages || 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Per page:</span>
              <select
                className="border rounded px-2 py-1"
                value={perPage}
                onChange={e => { 
                  setPerPage(Number(e.target.value)); 
                  setPage(1);
                  // fetchData(activeTab);
                }}
              >
                {PER_PAGE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {territories.map((territory) => (
            <Card key={territory.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-400">
              <div className="p-6" style={{borderBottom: '5px solid #0a2463'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[var(--color-atoll)] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{territory.code}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{territory.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(territory.status)}`}>
                        {getStatusLabel(territory.status)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTerritory(territory)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Leads {territory.completed}</p>
                    <p className="text-xl font-bold text-gray-900">{territory.leads.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Conversions</p>
                    <p className="text-xl font-bold text-gray-900">{territory.conversions}</p>
                  </div>
                  {/* <div>
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-xl font-bold text-green-600">${territory.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rate</p>
                    <p className="text-xl font-bold text-gray-900">{territory.conversionRate}%</p>
                  </div> */}
                </div>

                {/* <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Top Cities</p>
                  <div className="flex flex-wrap gap-1">
                    {territory.cities.length > 0 ? (
                      <>
                        {territory.cities.slice(0, 3).map((city, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            {city}
                          </span>
                        ))}
                        {territory.cities.length > 3 && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            +{territory.cities.length - 3} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No city data available</span>
                    )}
                  </div>
                </div> 

                <div className="text-xs text-gray-500">
                  Last activity: {territory.lastActivity}
                </div>*/}
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
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => {
                const newPage = Math.max(1, page - 1);
                setPage(newPage);
                // fetchData(activeTab);
              }}
            >
              Previous
            </Button>
            <span>Page {page} of {totalPages || 1}</span>
            <Button
              variant="outline"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => {
                const newPage = Math.min(totalPages, page + 1);
                setPage(newPage);
                // fetchData(activeTab);
              }}
            >
              Next
            </Button>
          </div>
          </>
        )}
            </>
          )}
        </main>
      </div>

      {/* Territory Detail Modal */}
      {selectedTerritory && (
        <div className="fixed inset-0 bg-gray-600/65 overflow-y-auto h-full w-full z-50" style={{width:' 100vw'}}>
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-lg bg-white mb-10">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-[var(--color-atoll)]">{selectedTerritory.name} Territory</h3>
              <button onClick={() => setSelectedTerritory(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-[var(--color-atoll)] mb-4">Coverage Areas</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Cities</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedTerritory.cities.length > 0 ? (
                          selectedTerritory.cities.map((city, index) => (
                            <span key={index} className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                              {city}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 italic">No city data available</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">ZIP Codes</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedTerritory.zipCodes.length > 0 ? (
                          selectedTerritory.zipCodes.map((zip, index) => (
                            <span key={index} className="inline-flex px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                              {zip}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 italic">No ZIP code data available</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-[var(--color-atoll)] mb-4">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Leads</span>
                      <span className="font-medium">{selectedTerritory.leads.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversions</span>
                      <span className="font-medium">{selectedTerritory.conversions}</span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-gray-600">Revenue Generated</span>
                      <span className="font-medium text-green-600">${selectedTerritory.revenue.toLocaleString()}</span>
                    </div> */}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversion Rate</span>
                      <span className="font-medium">{selectedTerritory.conversionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-200 space-x-3">
              <button 
                onClick={() => setSelectedTerritory(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              {/* <button className="px-4 py-2 text-sm bg-[var(--color-atoll)] text-white rounded-md hover:bg-[var(--color-atoll)]/90">
                Edit Territory
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Territories; 