import { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  PhoneIcon, 
  MapPinIcon, 
  PaperClipIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';

const LeadList = ({ leads, selectedLead, onSelectLead, searchTerm, onSearchChange }) => {
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  const statusOptions = [
    'All Statuses',
    'First Call',
    'Second Call',
    'Qualified',
    'Callback',
    'Scheduled',
    'Not Interested',
    'Sold'
  ];

  // Filter leads based on selected status
  const filteredLeads = selectedStatus === 'All Statuses' 
    ? leads 
    : leads.filter(lead => lead.status === selectedStatus);

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
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-atoll)] focus:border-[var(--color-atoll)] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Leads List */}
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {filteredLeads.map((lead) => (
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
        
        {filteredLeads.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {selectedStatus === 'All Statuses' ? 'No leads found' : `No ${selectedStatus} leads found`}
          </div>
        )}
      </div>

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