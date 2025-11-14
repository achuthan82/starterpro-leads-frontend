import { useState, useEffect } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import MortgageProtectionModal from './MortgageProtectionModal';
import { LEAD_STATUS, LEAD_STATUSES, STATUS_NAME_TO_ID } from 'constants/app.constant';
import { JWT_HOST_API } from 'configs/auth.config';
import { toast } from 'sonner';
// import LeadInfoPDF from './LeadInfoPDF';

const LeadInfo = ({ lead, onUpdateStatus, callHistory, callLogs = [], callLogsLoading = false }) => {
  const [currentStatus, setCurrentStatus] = useState(lead?.status || '');
  const [currentStatusId, setCurrentStatusId] = useState(null);
  const [isMortgageModalOpen, setIsMortgageModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  console.log(formData)

  useEffect(() => {
    if (lead) {
      // Get status from lead - could be status name or lead_status ID
      const leadStatus = lead.originalData?.lead_status || lead.lead_status || lead.status;
      
      // If it's a number, it's a status ID
      if (typeof leadStatus === 'number') {
        setCurrentStatusId(leadStatus);
        setCurrentStatus(LEAD_STATUS[leadStatus] || '');
      } else if (typeof leadStatus === 'string') {
        // If it's a string, try to find the ID
        const statusId = STATUS_NAME_TO_ID[leadStatus.toUpperCase()] || Object.keys(LEAD_STATUS).find(key => LEAD_STATUS[key] === leadStatus);
        if (statusId) {
          setCurrentStatusId(Number(statusId));
          setCurrentStatus(leadStatus);
        } else {
          setCurrentStatus(leadStatus);
          setCurrentStatusId(null);
        }
      }
    }
  }, [lead]);

  const handleFormSubmit = (data) => {
    setFormData(data);
  };

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

  // Get status badge class using the same system as LeadManagement
  const getStatusBadgeClass = (statusId) => {
    if (!statusId) return '';
    return `shieldnest-badge-${statusId}`;
  };

  // Handle status change using the same API as LeadManagement
  const handleStatusChange = async (e) => {
    const newStatusId = Number(e.target.value);
    if (!newStatusId || !lead) return;
    
    setStatusLoading(true);
    try {
      // Prepare payload - same as LeadManagement
      const agentId = lead.originalData?.agent_id || lead.agent_id || lead.agentId;
      const mortgageId = lead.originalData?.mortgage_id || lead.mortgage_id || lead.identifier || lead.id;
      
      if (!agentId || !mortgageId) {
        toast.error('Missing agent or mortgage ID');
        setStatusLoading(false);
        return;
      }
      
      const payload = {
        agent_id: agentId,
        lead_status: newStatusId,
        mortgage_ids: [mortgageId]
      };
      
      // Call API (category=1) - same endpoint as LeadManagement
      const response = await fetch(`${JWT_HOST_API}/leads/status/1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (response.ok && (data.success || data.status === 200)) {
        toast.success(data.message || 'Status updated successfully!');
        setCurrentStatusId(newStatusId);
        setCurrentStatus(LEAD_STATUS[newStatusId] || '');
        // Call the onUpdateStatus callback if provided
        if (onUpdateStatus) {
          onUpdateStatus(lead.id, LEAD_STATUS[newStatusId] || newStatusId);
        }
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Lead Information</h4>
          <div className="flex items-center gap-2">

            {/* Styled PDF component */}
            {/* {formData && (
              <LeadInfoPDF formData={formData} />
            )} */}

            {/* Mortgage Protection button */}
            <button
              onClick={() => setIsMortgageModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors duration-200"
              title="Click here to add Mortgage Protection"
            >
              <ShieldCheckIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        {currentStatusId && (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full hover:opacity-80 transition-opacity status-badge ${getStatusBadgeClass(
              currentStatusId
            )}`}
          >
            {currentStatus || LEAD_STATUS[currentStatusId] || ''}
          </span>
        )} 
        {/* Lead Details */}
        <div className="grid grid-cols-2 gap-4 my-4">
          {lead.age && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{lead.age}</p>
          </div>
          )}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Home Value</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              ${lead.homeValue?.toLocaleString()}
            </p>
          </div>
          {lead.mortgage && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Mortgage</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              ${lead.mortgage?.toLocaleString()}
            </p>
          </div>
          )}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Territory</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{lead.originalData?.state}-{lead.originalData?.zip}</p>
          </div>
        </div>

        {/* Notes */}
        {lead.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Notes</p>
          <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm">
            {lead.notes}
          </p>
        </div> 
        )}

        {/* Update Status */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Update Status</p>
          <select
            value={currentStatusId || ''}
            onChange={handleStatusChange}
            disabled={statusLoading}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-atoll)] dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              statusLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <option value="">Select Status</option>
            {LEAD_STATUSES.map(status => (
              <option key={status?.value} value={status?.value}>{status?.label}</option>
            ))}
          </select>
          {statusLoading && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Updating status...</p>
          )}
        </div>

        {/* Call History */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Call History</h4>
          {callLogsLoading ? (
            <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">
              Loading call history...
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {callLogs.length > 0 ? (
                callLogs.map((log, index) => {
                  // Try to get status ID from call status
                  const callStatusId = typeof log.status === 'number' 
                    ? log.status 
                    : STATUS_NAME_TO_ID[log.status?.toUpperCase()] || Object.keys(LEAD_STATUS).find(key => LEAD_STATUS[key] === log.status);
                  return (
                    <div key={log.id || index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        {callStatusId && (
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full status-badge ${getStatusBadgeClass(callStatusId)}`}>
                            {LEAD_STATUS[callStatusId] || log.status}
                          </span>
                        )}
                        {!callStatusId && (
                          <div className={`w-2 h-2 rounded-full bg-gray-400`}></div>
                        )}
                        <span className="text-gray-600 dark:text-gray-400">
                          {log.date} · {log.time}
                        </span>
                      </div>
                      {log.duration && (
                        <span className="text-gray-500 dark:text-gray-500 text-xs">{log.duration}</span>
                      )}
                    </div>
                  );
                })
              ) : callHistory.length > 0 ? (
                // Fallback to local callHistory if API logs are empty
                callHistory.map((call, index) => {
                  const callStatusId = typeof call.status === 'number' 
                    ? call.status 
                    : STATUS_NAME_TO_ID[call.status?.toUpperCase()] || Object.keys(LEAD_STATUS).find(key => LEAD_STATUS[key] === call.status);
                  return (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        {callStatusId && (
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full status-badge ${getStatusBadgeClass(callStatusId)}`}>
                            {LEAD_STATUS[callStatusId] || call.status}
                          </span>
                        )}
                        {!callStatusId && (
                          <div className={`w-2 h-2 rounded-full bg-gray-400`}></div>
                        )}
                        <span className="text-gray-600 dark:text-gray-400">
                          {call.date} · {call.time}
                        </span>
                      </div>
                      {call.duration && (
                        <span className="text-gray-500 dark:text-gray-500 text-xs">{call.duration}</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">
                  No call history
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mortgage Protection Modal */}
      <MortgageProtectionModal
        isOpen={isMortgageModalOpen}
        close={() => setIsMortgageModalOpen(false)}
        onFormSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default LeadInfo;