import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Card, Checkbox } from 'components/ui';
import SharedSidebar from '../components/SharedSidebar';
import { adminService, leadsService, stateService } from 'utils/apiService';
import {
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { LEAD_STATUS, LEAD_STATUSES, SOURCE_MAPPING } from 'constants/app.constant';
import { toast } from 'sonner';

const AgentLeads = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const user_id = searchParams.get('user')
  const source = { 1: 'New MTG', 2: 'RETRO MTG', 3: 'FEX' }
  const [agent, setAgent] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('gold'); // Default to gold leads
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [filters, setFilters] = useState({
    lead_status: '',
    state: '',
    name: '',
    campaign: ''
  });
  const [states, setStates] = useState([])
  const [printLeads, setPrintLeads] = useState([])
  // Summary data for tabs
  const [summary, setSummary] = useState({
    goldLeads: 0,
    partialLeads: 0,
    mailedLeads: 0,
    totalLeads: 0
  });
  const [purchased, setPurchased] = useState(false)
  // Available statuses as per requirements
  const columns = [
    { label: "ID", customSelector: "mortgage_id" },
    { label: "Full Name", customSelector: "full_name" },
    { label: "First Name", customSelector: "first_name" },
    { label: "Last Name", customSelector: "last_name" },
    { label: "Address", customSelector: "address" },
    { label: "City", customSelector: "city" },
    { label: "State", customSelector: "state" },
    { label: "ZIP", customSelector: "zip" },
    { label: "Loan Amount", customSelector: "loan_amount" },
    { label: "Loan Date", customSelector: "loan_date" },
    { label: "Source", customSelector: "source_id" },
    { label: "Lead Status", customSelector: "lead_status" },
    { label: "Call In Time", customSelector: "call_in_date_time" },
    { label: "Campaign Name", customSelector: "campaign_name" },
    { label: "Lender Name", customSelector: "lender_name" },
    { label: "Phone Number", customSelector: "number" },
    { label: "From Number", customSelector: "ani" },
    { label: "Age", customSelector: "age" },
    { label: "Medical Condition", customSelector: "health" },
    { label: "Co-borrower", customSelector: "coborrower" },
    { label: "Smoker", customSelector: "tobacco" },
  ];
  // Helper function to get status name from ID
  const getStatusName = (statusId) => {
    if (!statusId) return '';
    return LEAD_STATUS[statusId] || statusId;
  };

  // Helper function to get source name from ID
  const getSourceName = (sourceId) => {
    if (!sourceId) return '';
    return SOURCE_MAPPING[sourceId] || sourceId;
  };

  // Tab configuration
  const tabs = [
    { id: 'gold', label: 'Completed', count: summary.goldLeads },
    { id: 'partial', label: 'Incomplete', count: summary.partialLeads },
    { id: 'mailed', label: 'Mailed Leads', count: summary.mailedLeads }
  ];

  const getUsStates = () => {
    stateService.getStates().then((response) => {
      if (response.data.status === 200) {
        const dt = response.data.data
        const arr = []
        Object.keys(dt).map(function (key) {
          arr.push({ value: dt[key], label: key });
        })
        setStates(arr)
      }
    })
  }

  useEffect(() => {
    getUsStates()
  }, [])
  useEffect(() => {
    fetchAgentData();
    fetchAgentSummary();
  }, [agentId]);

  useEffect(() => {
    fetchAgentLeads(1, 10, 'gold', {}, false);
  }, []);

  const fetchAgentData = async () => {
    try {
      // Try to get agent details using the admin agents API with agentId as a filter
      console.log('Fetching agent data for agentId:', agentId);

      // First try the direct agent details endpoint
      let agentData = null;
      try {
        const response = await adminService.getAgentDetails(agentId);
        console.log('Agent details response:', response);
        agentData = response?.data?.data || response;
        console.log('Agent data from details endpoint:', agentData);
      } catch (detailsError) {
        console.log('Agent details endpoint failed, trying agents list...', detailsError);

        // Fallback: Get from agents list
        const agentsResponse = await adminService.getAgents({
          search: agentId,
          page: 1,
          limit: 10
        });
        console.log('Agents list response:', agentsResponse);

        const agents = agentsResponse.data || agentsResponse.agents || [];
        agentData = agents.find(agent => agent.id == agentId || agent.agent_id == agentId);
        console.log('Found agent from list:', agentData);
      }

      if (agentData) {
        // Normalize the agent data structure
        const normalizedAgent = {
          id: agentData.id || agentData.agent_id || agentId,
          name: agentData.name || agentData.agent_name || agentData.full_name || `Agent ${agentId}`,
          email: agentData.email || agentData.agent_email || 'Email not available',
          phone: agentData.phone || agentData.agent_phone || agentData.phone_number || 'Phone not available',
          role: agentData.role || agentData.agent_role || agentData.status || 'Agent'
        };

        console.log('Setting normalized agent data:', normalizedAgent);
        setAgent(normalizedAgent);
      } else {
        throw new Error('Agent not found');
      }
    } catch (error) {
      console.error('Error fetching agent details:', error);
      // Set fallback agent data so we can still show something
      const fallbackAgent = {
        id: agentId,
        name: `Agent ${agentId}`,
        email: 'Email not available',
        phone: 'Phone not available',
        role: 'Agent'
      };
      console.log('Using fallback agent data:', fallbackAgent);
      setAgent(fallbackAgent);
    }
  };
  const fetchAgentSummary = async (text) => {
    try {
      const response = await leadsService.getAgentLeadsCount(agentId, 1, text, user_id);

      console.log('Summary API Response:', response);

      const data = response.data || response;

      console.log('data', data)

      const goldCount = data.completed || 0;
      const partialCount = data.incomplete || 0;
      const mailedCount = data.mailed || 0;
      const soldCount = data.sold || 0;
      const totalCount = (goldCount + partialCount) || 0;

      console.log('goldCount', soldCount)

      // Calculate conversion rate: ((Rich Leads + Partial Leads) / Total Leads) * 100
      const conversionRate = totalCount > 0 ? ((goldCount + partialCount) / totalCount * 100).toFixed(1) : 0;

      setSummary({
        totalLeads: totalCount,
        goldLeads: goldCount,
        partialLeads: partialCount,
        mailedLeads: mailedCount,
        conversionRate: conversionRate
      });

      console.log('Summary data updated:', {
        totalLeads: totalCount,
        goldLeads: goldCount,
        partialLeads: partialCount,
        mailedLeads: mailedCount,
        conversionRate: conversionRate
      });

    } catch (err) {
      console.error('Error fetching summary:', err);

      if (err.message.includes('Unauthorized')) {
        toast.error('Session expired. Please login again.');
      } else if (err.message.includes('Forbidden')) {
        toast.error('You do not have permission to access this data.');
      } else if (err.message.includes('not found')) {
        toast.error('Agent not found or no data available.');
      } else if (err.message.includes('Server error')) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(`Failed to load summary data: ${err.message}`);
      }

      // Set default values on error
      setSummary({
        totalLeads: 0,
        goldLeads: 0,
        partialLeads: 0,
        mailedLeads: 0,
        conversionRate: 0
      });
    }
  };

  const fetchAgentLeads = async (page, per_page, active_tab, filter, purchase) => {
    console.log('test', filter);

    try {
      setLoading(true);

      const combinedFilters = Object.entries(filter).reduce((acc, item) => {
        if (item[1] && item[1] !== 'all') {
          acc[item[0]] = item[1]
        }
        return acc
      }, {});
      console.log('combined', combinedFilters)
      const response = await leadsService.getLeadsByAgent(
        agentId,
        active_tab,
        combinedFilters,
        page,
        per_page,
        purchase,
        user_id
      );

      console.log('Agent leads response:', response);

      // Handle different response formats
      const leadsData = response.data || response.leads || [];

      // Extract pagination info from API response
      const pagination = response.pagination || {};
      const total = pagination.total || response.total || response.total_count || response.count || 0;
      const perPageFromAPI = pagination.per_page || perPage;
      const totalPagesCalc = Math.ceil(total / perPageFromAPI);

      setLeads(leadsData);
      setTotalRecords(total);
      setTotalPages(totalPagesCalc);
    } catch (error) {
      console.error('Error fetching agent leads:', error);
      setLeads([]);
      setTotalRecords(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };
  const downloadAgentLeads = async () => {
    try {
      // setLoading(true);

      const combinedFilters = Object.entries(filters).reduce((acc, item) => {
        if (item[1]) {
          acc[item[0]] = item[1]
        }
        return acc
      }, {});
      if (statusFilter !== 'all') {
        combinedFilters.lead_status = statusFilter;
      }

      const response = await leadsService.getLeadsByAgent(
        agentId,
        activeTab,
        combinedFilters,
        1, // currentPage
        totalRecords,
        purchased,
        user_id
      );

      console.log('Agent leads response:', response);

      // Handle different response formats
      const leadsData = response.data || response.leads || [];
      downloadCsv(leadsData)
      // Extract pagination info from API response

    } catch (error) {
      console.error('Error fetching agent leads:', error);

    } finally {
      setLoading(false);
    }
  }


  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchTerm('');
    setStatusFilter('all');
    setSelectedLeads([]);
    setFilters({ lead_status: '', state: '', name: '', campaign: '' });
    setCurrentPage(1);
    fetchAgentLeads(1, perPage, tabId, {}, purchased)
  };
  const handleTypeChange = (sts) => {
    setSearchTerm('');
    setStatusFilter('all');
    setSelectedLeads([]);
    setFilters({ lead_status: '', state: '', name: '', campaign: '' });
    setCurrentPage(1);
    fetchAgentLeads(1, perPage, activeTab, {}, sts)
    fetchAgentSummary(sts ? 'market-place' : null)
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchAgentLeads(newPage, perPage, activeTab, filters, purchased)
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    let newFilters = { ...filters }
    if (value) {
      newFilters = { ...filters, [filterKey]: value };
      setFilters(newFilters);
    } else {
      newFilters = { ...filters, [filterKey]: '' };
      setFilters(newFilters);
    }
    console.log(newFilters)
    setCurrentPage(1)
    fetchAgentLeads(1, perPage, activeTab, newFilters, purchased);
  };

  // Handle lead selection
  const handleLeadSelection = (leadId) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
      setPrintLeads([])
    } else {
      setPrintLeads(leads)
      setSelectedLeads(leads.map(lead => lead.assignee_id));
    }
  };

  // Handle per page change
  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    fetchAgentLeads(1, newPerPage, activeTab, filters, purchased);
  };

  // Helper functions to extract data from ivr_response
  const getIvrValue = (lead, field, defaultValue = '') => {
    // First try ivr_response (as mentioned in your requirements)
    if (lead.ivr_response && Object.keys(lead.ivr_response).length > 0) { //Array.isArray(lead.ivr_response) && lead.ivr_response.length > 0
      console.log('lead.ivr_response', lead.ivr_response)
      // Get the latest (most recent) ivr_response entry
      const latestResponse = lead.ivr_response;
      /*if (field === "number" || field === "ani") {
        return latestResponse['number'] || latestResponse['ani'] || '';
      }*/
      if (latestResponse[field] !== undefined) {
        return latestResponse[field];
      }
    }

    // Fallback to ivr_logs if ivr_response doesn't exist
    if (lead.ivr_logs && Array.isArray(lead.ivr_logs) && lead.ivr_logs.length > 0) {
      const latestLog = lead.ivr_logs[lead.ivr_logs.length - 1];
      if (latestLog[field] !== undefined) {
        return latestLog[field];
      }
    }

    // Final fallback to direct lead properties
    if (lead[field] !== undefined) {
      return lead[field];
    }

    return defaultValue;
  };

  // Helper function to convert boolean values to Yes/No
  const convertBooleanToYesNo = (value) => {
    if (value === "1" || value === 1 || value === true) return "Yes";
    if (value === "0" || value === 0 || value === false) return "No";
    return value || "";
  };

  /*const getStatusBadgeClass = (status) => {
    // Convert status ID to name first if it's a number
    const statusName = typeof status === 'number' ? getStatusName(status) : status;

    const statusClasses = {
      'First call': 'bg-blue-100 text-blue-800',
      'Second call': 'bg-yellow-100 text-yellow-800',
      'Third Call': 'bg-orange-100 text-orange-800',
      'Sold': 'bg-green-100 text-green-800',
      'Not interested': 'bg-red-100 text-red-800',
      'Text': 'bg-purple-100 text-purple-800',
      'Appointment': 'bg-indigo-100 text-indigo-800',
      'Sit/No Sale': 'bg-gray-100 text-gray-800',
      'No Show': 'bg-red-100 text-red-800',
      'DNC': 'bg-gray-100 text-gray-800',
    };
    return statusClasses[statusName] || 'bg-gray-100 text-gray-800';
  };*/
  const handlePrintLead = (event, lead) => {
    if (event.target.checked) {
      setPrintLeads((prev) => [...prev, lead])
    } else {
      setPrintLeads((prev) => prev.filter((item) => item.assignee_id !== lead.assignee_id))
    }
  }
  const downloadCsv = (csv) => {
    const data = csv ? csv : printLeads
    const csvString = convertToCSV(data, columns);
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "lead_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  function escapeCSVValue(value) {
    if (value == null) return '';
    let stringVal = String(value);

    // Escape double quotes by doubling them
    stringVal = stringVal.replace(/"/g, '""');

    // Wrap in double quotes if value contains comma, quote, or newline
    if (stringVal.search(/("|,|\n)/g) >= 0) {
      stringVal = `"${stringVal}"`;
    }

    return stringVal;
  }
  function convertToCSV(dataArray, columns) {
    console.log('data-array', dataArray)
    let result = "";
    const columnDelimiter = ",";
    const lineDelimiter = "\n";

    // Add headers
    result += columns.map(col => escapeCSVValue(col.label)).join(columnDelimiter) + lineDelimiter;
    
    // Process each item
    dataArray.forEach(item => {
      let ctr = 0;
      columns.forEach(key => {
        if (ctr > 0) result += columnDelimiter;

        let val = item[key.customSelector];

        // Handle IVR response data for specific fields
        if (key.customSelector === "number" || key.customSelector === "ani" || key.customSelector === "age" || key.customSelector === "health" || key.customSelector === "coborrower" || key.customSelector === "tobacco") {
          val = getIvrValue(item, key.customSelector);
          // Debug: Log the extracted IVR values for the first few items
          if (dataArray.indexOf(item) < 3) {
            console.log(`IVR ${key.customSelector} for lead ${item.mortgage_id}:`, val);
          }
        }

        if (key.customSelector === "coborrower") {
          result += convertBooleanToYesNo(val);
        } else if (key.customSelector === "tobacco") {
          result += convertBooleanToYesNo(val);
        } else if (key.customSelector === "health") {
          result += convertBooleanToYesNo(val);
        } else if (key.customSelector === "source_id") {
          if (val === 1) result += "NEW MTG";
          else if (val === 2) result += "RETRO MTG";
          else if (val === 3) result += "FEX";
          else result += val || "";
        } else if (key.customSelector === "lead_status") {
          result += LEAD_STATUS[val] || "";
        } else {
          if (typeof val === "string" && val.includes(",")) {
            result += `"${val}"`;
          } else if (typeof val === "string" && val.includes("#")) {
            result += val.replaceAll("#", "");
          } else {
            result += val !== undefined ? String(val) : "";
          }
        }

        ctr++;
      });
      result += lineDelimiter;
    });

    return result;
  }


  if (loading && !agent) {
    return (
      <div className="flex h-screen bg-[var(--color-ecru-white)]">
        <SharedSidebar currentPath="/admin/agents" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading agent leads...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)]">
      {/* Sidebar */}
      <SharedSidebar currentPath="/admin/agents" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/agents')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#0a2463]">
                  Lead Management - Agent View
                </h1>
                <p className="text-gray-600 mt-1">Viewing leads for a specific agent across all categories</p>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Agent Info Banner */}
        <div className="bg-gradient-to-r from-[#0a2463] to-[#f4d03f] p-6 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                  <span className="text-white font-bold text-2xl">
                    {agent?.name?.split(' ').map(n => n[0]).join('') || agentId?.toString().slice(0, 2) || 'A'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-3xl font-bold">
                      {agent?.name || `Agent ${agentId}` || 'Loading...'}
                    </h2>
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-white/30">
                      Agent ID: {agentId}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-white/90">
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="w-4 h-4" />
                      <span>{agent?.email || 'Email not available'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="w-4 h-4" />
                      <span>{agent?.phone || 'Phone not available'}</span>
                    </div>
                    {(agent?.role || agent?.status) && (
                      <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border border-white/30">
                        {agent.role || agent.status || 'Agent'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lead Statistics */}
              <div className="grid grid-cols-4 gap-6 text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">{summary.totalLeads}</div>
                  <div className="text-sm text-white/80">Total Leads</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-[#f4d03f]">{summary.goldLeads}</div>
                  <div className="text-sm text-white/80">Completed Leads</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-[#f4d03f]">{summary.partialLeads}</div>
                  <div className="text-sm text-white/80">Incomplete Leads</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-[#f4d03f]">{summary.mailedLeads}</div>
                  <div className="text-sm text-white/80">Mailed Leads</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 flex justify-between">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-[#0a2463] text-[#0a2463]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
              < div className="flex flex-wrap gap-5">
                <Checkbox label="View Market Place Leads" onChange={(event) => { setPurchased(event.target.checked); handleTypeChange(event.target.checked) }} />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6 bg-white shieldnest-shadow">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by  Name..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); handleFilterChange('name', e.target.value) }}
                      className={`w-full pl-10 pr-20 py-2 border rounded-lg focus:border-[#0a2463] focus:outline-none ${searchTerm.trim() ? 'border-[#0a2463] bg-blue-50' : 'border-gray-300'
                        }`}
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => { handleFilterChange('lead_status', e.target.value); setStatusFilter(e.target.value) }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#0a2463] focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    {LEAD_STATUSES.map(status => (
                      <option key={status.label} value={status.value}>{status.label}</option>
                    ))}
                  </select>

                  <select
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#0a2463] focus:outline-none"
                  >
                    <option value="all">All States</option>
                    {states.map(status => (
                      <option key={status.label} value={status.value}>{status.label}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Filter by Campaign"
                    value={filters.campaign}
                    onChange={(e) => handleFilterChange('campaign', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#0a2463] focus:outline-none"
                  />
                </div>
              </div>

              {/* Export Controls and Pagination Info */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {selectedLeads.length > 0 ? `${selectedLeads.length} selected` : ''}
                    {totalRecords > 0 && (
                      <>
                        {selectedLeads.length > 0 ? ' • ' : ''}
                        Showing {((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, totalRecords)} of {totalRecords} leads
                      </>
                    )}
                  </span>

                  <select
                    value={perPage}
                    onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadCsv()}
                    disabled={selectedLeads.length === 0}
                    className={`px-4 py-2 rounded-lg border transition-colors flex items-center space-x-2 ${selectedLeads.length === 0
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Export Selected</span>
                  </button>

                  <button
                    onClick={downloadAgentLeads}
                    disabled={totalRecords < 1}
                    className={`px-4 py-2 rounded-lg border transition-colors flex items-center space-x-2 ${totalRecords < 1
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Export All</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Leads Table */}
          <Card className="overflow-hidden flex-1 flex flex-col min-h-0 bg-white shieldnest-shadow">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#0a2463]">
                  {tabs.find(tab => tab.id === activeTab)?.label} ({totalRecords})
                </h3>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === leads.length && leads.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#0a2463] focus:ring-[#0a2463] border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a2463]"></div>
                <p className="mt-2 text-gray-600">Loading leads...</p>
              </div>
            ) : (
              <>
                {/* Selected Leads Info */}
                {selectedLeads.length > 0 && (
                  <div className="px-6 py-2 bg-blue-50 border-b border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">
                        {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selected
                      </span>
                      <button
                        onClick={() => { setSelectedLeads([]); setPrintLeads([]); }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Clear selection
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-auto">
                  <table className="w-full min-w-max bg-white shieldnest-shadow">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px]">
                          <input
                            type="checkbox"
                            checked={selectedLeads.length === leads.length && leads.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-[#0a2463] focus:ring-[#0a2463] border-gray-300 rounded"
                            title="Select All"
                          />
                        </th>
                        {!purchased && <><th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                          Identifier
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                          Campaign Name
                        </th></>}
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                          Full Name
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                          Source
                        </th>
                        {activeTab !== 'mailed' &&
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                          Registered Date
                        </th>
                        }
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                          Lead Status
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                          Address
                        </th>
                        {activeTab !== 'mailed' &&
                        <>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                          Lead Phone
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                          From Phone
                        </th>
                        </>
                        }
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leads.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                            No leads found for this agent. Try adjusting your search or filters.
                          </td>
                        </tr>
                      ) : (
                        leads.map((lead, index) => (
                          <tr key={lead.assignee_id || index} className="hover:bg-gray-50">
                            {/* Select */}
                            <td className="px-3 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedLeads.includes(lead.assignee_id)}
                                onChange={(event) => { handleLeadSelection(lead.assignee_id); handlePrintLead(event, lead) }}
                                className="w-4 h-4 text-[#0a2463] focus:ring-[#0a2463] border-gray-300 rounded"
                              />
                            </td>

                            {/* Identifier */}
                            {!purchased && <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {lead.identifier || lead.mortgage_id || lead.assignee_id || ''}
                              </div>
                            </td>}

                            {/* Campaign Name */}
                            {!purchased && <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {lead.campaign_name || ''}
                              </div>
                            </td>}

                            {/* Full Name */}
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {lead.lead_full_name || (lead.first_name && lead.last_name ? `${lead.first_name} ${lead.last_name}` : '') || ''}
                              </div>
                            </td>

                            {/* Source */}
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{getSourceName(lead.source_id)}</div>
                            </td>

                            {/* Registered Date */}
                            {activeTab !== 'mailed' &&
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {lead.call_in_date_time || ''}
                              </div>
                            </td>
                            }
                            {/* Lead Status */}
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full shieldnest-badge-${(lead.lead_status || lead.status)}`}>
                                {getStatusName(lead.lead_status || lead.status) || ''}
                              </span>
                            </td>

                            {/* Address */}
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {lead.client_address || lead.address || ''}
                              </div>
                            </td>

                            {/* Lead Phone */}
                            {activeTab !== 'mailed' &&
                            <>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {getIvrValue(lead, 'number') || ''}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {getIvrValue(lead, 'ani') || ''}
                              </div>
                            </td>
                            </>
                            }
                            {/* Actions */}
                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => setSelectedLead(lead)}
                                className="text-[#0a2463] hover:text-[#0a2463]/80"
                                title="View Details"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalRecords)} of {totalRecords} results (Page {currentPage} of {totalPages})
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className={`px-3 py-1 rounded border ${currentPage <= 1
                            ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <ChevronLeftIcon className="w-4 h-4" />
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 rounded border ${currentPage === pageNum
                                ? 'border-[#0a2463] bg-[#0a2463] text-white'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                          className={`px-3 py-1 rounded border ${currentPage >= totalPages
                            ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </main>
      </div>

      {/* Lead Detail Modal (similar to Lead Management page) */}
      {selectedLead && (
        <div className="fixed inset-0 bg-gray-600/65 overflow-y-auto h-full w-full z-50" style={{ width: ' 100vw' }}>
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-lg bg-white mb-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[#0a2463] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedLead.full_name || selectedLead.name ?
                      (selectedLead.full_name || selectedLead.name).split(' ').map(n => n[0]).join('').toUpperCase() : 'N/A'}
                  </span>
                </div>
                <div>
                  
                  <h3 className="text-2xl font-bold text-[#0a2463]">
                    {selectedLead.full_name || selectedLead.name || 'Unknown'}
                  </h3>
                  <p className="text-gray-600">
                    {(selectedLead.email || getIvrValue(selectedLead, 'number') || 'No contact info')}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full shieldnest-badge-${(selectedLead.lead_status || selectedLead.status)}`}>
                      {getStatusName(selectedLead.lead_status || selectedLead.status) || 'Unknown'}
                    </span>
                    {!purchased && 
                    <span className="text-sm text-gray-500">
                      ID: {selectedLead.identifier || selectedLead.mortgage_id || selectedLead.assignee_id || ''}
                    </span>}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-semibold text-[#0a2463] mb-4">Basic Information</h4>
                  <div className="space-y-3">
                    {!purchased &&
                    <div>
                      <p className="text-sm text-gray-500">Identifier</p>
                      <p className="font-medium">{selectedLead.identifier || selectedLead.mortgage_id || selectedLead.assignee_id || ''}</p>
                    </div>
                    }
                    {!purchased &&
                    <div>
                      <p className="text-sm text-gray-500">Campaign Name</p>
                      <p className="font-medium">{selectedLead.campaign_name || ''}</p>
                    </div>
                    }
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{selectedLead.full_name || selectedLead.name || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Source</p>
                      <p className="font-medium">{source[selectedLead.source_id] || 'N/A'}</p>
                    </div>
                    {activeTab !== 'mailed' &&
                    <div>
                      <p className="text-sm text-gray-500">Registered Date</p>
                      <p className="font-medium">{selectedLead.call_in_date_time || ''}</p>
                    </div>
                    }
                    <div>
                      <p className="text-sm text-gray-500">Lead Status</p>
                      <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full shieldnest-badge-${(selectedLead.lead_status || selectedLead.status)}`}>
                        {getStatusName(selectedLead.lead_status || selectedLead.status) || ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact & Location */}
                <div>
                  <h4 className="text-lg font-semibold text-[#0a2463] mb-4">Contact & Location</h4>
                  <div className="space-y-3">
                    {activeTab !== 'mailed' &&
                    <>
                    <div>
                      <p className="text-sm text-gray-500">Lead Phone Number</p>
                      <p className="font-medium">{getIvrValue(selectedLead, 'number') || ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">From Phone Number</p>
                      <p className="font-medium">{getIvrValue(selectedLead, 'ani') || ''}
                      </p>
                    </div>
                    </>
                    }
                    <div>
                      <p className="text-sm text-gray-500">Client Address</p>
                      <p className="font-medium">{selectedLead.client_address || selectedLead.address || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="font-medium">{selectedLead.city || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">State</p>
                      <p className="font-medium">{selectedLead.state || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Zip Code</p>
                      <p className="font-medium">{selectedLead.zip || selectedLead.zipcode || ''}</p>
                    </div>
                  </div>
                </div>

                {/* Loan Information */}
                <div>
                  <h4 className="text-lg font-semibold text-[#0a2463] mb-4">Loan Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Loan Amount</p>
                      <p className="font-medium">{selectedLead.loan_amount ? `$${selectedLead.loan_amount}` : ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Loan Date</p>
                      <p className="font-medium">{selectedLead.loan_date || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lender Name</p>
                      <p className="font-medium">{selectedLead.lender_name || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Borrower Age</p>
                      <p className="font-medium">{getIvrValue(selectedLead, 'age') || ''}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">Lead Category: {tabs.find((item) => item.id === activeTab).label || ''}</span>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentLeads; 