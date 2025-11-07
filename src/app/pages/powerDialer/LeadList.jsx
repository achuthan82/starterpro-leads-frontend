import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  PhoneIcon, 
  MapPinIcon, 
  PaperClipIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';
import { dialerService } from 'utils/apiService';
import { LEAD_STATUS, STATUS_NAME_TO_ID } from 'constants/app.constant';
import { toast } from 'sonner';

const LeadList = ({ selectedLead, onSelectLead, searchTerm, onSearchChange }) => {
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const statusOptions = [
    'All Statuses',
    ...Object.values(LEAD_STATUS).filter(status => status !== 'UNKNOWN')
  ];

  // Fetch leads from API
  const fetchLeads = async (page = currentPage, name = searchTerm, lead_status = selectedStatus) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        per_page: perPage
      };

      // Add optional filters
      if (name && name.trim()) {
        params.name = name.trim();
      }

      if (lead_status && lead_status !== 'All Statuses' && lead_status !== 'all') {
        // Convert status name to ID if it's a status name
        const statusId = STATUS_NAME_TO_ID[lead_status] || lead_status;
        params.lead_status = statusId;
      }

      const response = await dialerService.getPaginatedLeads(params);
      
      // Handle different response formats
      const leadsData = response.data || response.leads || [];
      const pagination = response.pagination || {};
      const total = pagination.total || response.total || response.total_count || 0;
      const perPageFromAPI = pagination.per_page || perPage;
      const totalPagesCalc = Math.ceil(total / perPageFromAPI);

      // Transform API data to match component structure
      const transformedLeads = leadsData.map(lead => ({
        id: lead.assignee_id || lead.id || lead.mortgage_id,
        name: lead.full_name || lead.name || 'Unknown',
        phone: lead.ivr_response?.number || lead.ivr_response?.ani || lead.phone || lead.lead_phone_number || 'N/A',
        territory: `${lead.city || ''} ${lead.state || ''} ${lead.zip || lead.zipcode || ''}`.trim() || 'N/A',
        status: LEAD_STATUS[lead.lead_status] || lead.lead_status || 'Unknown',
        lastContact: lead.call_in_date_time || lead.last_contact || '',
        age: lead.ivr_response?.age || lead.age || '',
        homeValue: lead.loan_amount || '',
        mortgage: lead.mortgage_amount || '',
        notes: lead.notes || '',
        initials: (lead.full_name || lead.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
        // Keep original data for reference
        originalData: lead
      }));

      setLeads(transformedLeads);
      setTotalRecords(total);
      setTotalPages(totalPagesCalc);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err.message || 'Failed to fetch leads');
      toast.error(err.message || 'Failed to load leads. Please try again.');
      setLeads([]);
      setTotalRecords(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leads on component mount and when filters change
  useEffect(() => {
    fetchLeads(1, searchTerm, selectedStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedStatus]);

  // Handle status change
  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchLeads(newPage, searchTerm, selectedStatus);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      'First Call': (
        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
      ),
      'Second Call': (
        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
      ),
      'Qualified': (
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
      ),
      'Callback': (
        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
      ),
      'Scheduled': (
        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
      ),
      'Not Interested': (
        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
      ),
      'Sold': (
        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
      )
    };
    return icons[status] || <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>;
  };

  const getStatusColor = (status) => {
    const colors = {
      'First Call': 'text-blue-600',
      'Second Call': 'text-purple-600',
      'Qualified': 'text-green-600',
      'Callback': 'text-yellow-600',
      'Scheduled': 'text-indigo-600',
      'Not Interested': 'text-red-600',
      'Sold': 'text-emerald-600'
    };
    return colors[status] || 'text-gray-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full">
      {/* Search */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-atoll)] focus:border-[var(--color-atoll)] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <select 
          value={selectedStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-atoll)] focus:border-[var(--color-atoll)] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-4 text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-atoll)] dark:border-blue-400"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading leads...</p>
        </div>
      )}

      {/* Leads List */}
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {!loading && leads.map((lead) => (
          <div
            key={lead.id}
            onClick={() => onSelectLead(lead)}
            className={`p-4 rounded-lg cursor-pointer transition-all border-l-4 ${
              selectedLead?.id === lead.id
                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-[var(--color-atoll)] border border-blue-200 dark:border-blue-700'
                : 'bg-white dark:bg-gray-800 border-l-transparent border border-gray-200 dark:border-gray-700 hover:border-[var(--color-atoll)] dark:hover:border-[var(--color-atoll)]'
            }`}
          >
            {/* Lead Header with Name and Dial Icon */}
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">{lead.name}</h3>
              <div className="flex items-center space-x-2">
                <div className={`flex items-center text-xs font-medium ${getStatusColor(lead.status)}`}>
                  {getStatusIcon(lead.status)}
                  {lead.status}
                </div>
              </div>
            </div>
            
            {/* Lead Details with Heroicons */}
            <div className="space-y-2 ml-1">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                {lead.phone}
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-500 mt-4">
                <PaperClipIcon className="w-4 h-4 mr-2 text-gray-400" />
                {lead.territory}
              </div>
              {lead.lastContact && (
                <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                  <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                  Last: {lead.lastContact}
                </div>
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLead(lead);
                  }}
                  className="p-1 text-gray-400 hover:text-[var(--color-atoll)] transition-colors"
                >
                  <PhoneIcon className="w-5 h-5 text-blue-900" />
                </button>
                 </div>
              )}
            </div>
          </div>
        ))}
        
        {!loading && leads.length === 0 && !error && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {selectedStatus === 'All Statuses' ? 'No leads found' : `No ${selectedStatus} leads found`}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalRecords)} of {totalRecords} leads
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className={`px-3 py-1 rounded border text-sm ${
                  currentPage <= 1
                    ? 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 bg-white dark:bg-gray-700'
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`px-3 py-1 rounded border text-sm ${
                  currentPage >= totalPages
                    ? 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 bg-white dark:bg-gray-700'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Status Legend:</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {statusOptions.slice(1).map(status => (
            <div key={status} className="flex items-center text-gray-600 dark:text-gray-400">
              {getStatusIcon(status)}
              <span>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadList;