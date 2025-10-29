import { useState, useEffect } from 'react';

const LeadInfo = ({ lead, onUpdateStatus, callHistory }) => {
  const [currentStatus, setCurrentStatus] = useState(lead?.status || '');
  console.log(callHistory)
  useEffect(() => {
    // Update when parent sends a new lead or updated data
    if (lead?.status !== currentStatus) {
      setCurrentStatus(lead?.status || '');
    }
  }, [lead]);

  if (!lead) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Ready to Make Calls</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Select a lead from the list to start calling
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    console.log(status)
    const colors = {
      'first call': 'bg-blue-600',
      'second call': 'bg-purple-600',
      'qualified': 'bg-green-600',
      'callback': 'bg-yellow-600',
      'scheduled': 'bg-indigo-600',
      'not interested': 'bg-red-600',
      'sold': 'bg-emerald-600'
    };
    return colors[status] || 'bg-gray-600';
  };

    const getStatusColors = (status) => {
    console.log(status)
    const colors = {
     'First Call': 'bg-blue-600',
      'Second Call': 'bg-purple-600',
      'Qualified': 'bg-green-600',
      'Callback': 'bg-yellow-600',
      'Scheduled': 'bg-indigo-600',
      'Not Interested': 'bg-red-600',
      'Sold': 'bg-emerald-600'
    };
    return colors[status] || 'bg-gray-600';
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setCurrentStatus(newStatus);
    onUpdateStatus(lead.id, newStatus);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Lead Information</h4>
          {currentStatus && (
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full text-white ${getStatusColors(
                currentStatus
              )}`}
            >
              {currentStatus}
            </span>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{lead.age}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Home Value</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              ${lead.homeValue?.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Mortgage</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              ${lead.mortgage?.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Territory</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{lead.territory}</p>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Notes</p>
          <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm">
            {lead.notes}
          </p>
        </div>

        {/* Status Dropdown */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Update Status</p>
          <select
            value={currentStatus}
            onChange={handleStatusChange}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-atoll)] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
          >
            <option value="First Call">First Call</option>
            <option value="Second Call">Second Call</option>
            <option value="Qualified">Qualified</option>
            <option value="Callback">Callback</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Not Interested">Not Interested</option>
            <option value="Sold">Sold</option>
          </select>
        </div>

        {/* Call History */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Call History</h4>
          <div className="space-y-2">
            {callHistory.length > 0 ? (
              callHistory.map((call, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(call.status)}`}
                    ></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {call.date} · {call.time}
                    </span>
                  </div>
                  <span>{call.status}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">
                No call history
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadInfo;
