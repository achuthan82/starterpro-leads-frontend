import { useState, useEffect } from "react";
import { ShieldCheckIcon, PencilIcon } from "@heroicons/react/24/outline";
import MortgageProtectionModal from "./MortgageProtectionModal";
import {
  LEAD_STATUS,
  LEAD_STATUSES,
  STATUS_NAME_TO_ID,
} from "constants/app.constant";
import { JWT_HOST_API } from "configs/auth.config";
import { toast } from "sonner";
import leadsService from "utils/leadsService";
// import LeadDetailsModal from "../AegisSuite/LeadDetailsModal";
// import LeadInfoPDF from './LeadInfoPDF';

const LeadInfo = ({
  lead,
  onUpdateStatus,
  callHistory,
  callLogs = [],
  callLogsLoading = false,
}) => {
  const [currentStatus, setCurrentStatus] = useState(lead?.status || "");
  const [currentStatusId, setCurrentStatusId] = useState(null);
  const [isMortgageModalOpen, setIsMortgageModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showUp, setShowUp] = useState(false);
  const [showUpLoading, setShowUpLoading] = useState(false);
  const [addNote, setAddNote] = useState(false);
  const [note, setNote] = useState("");
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState("");
  // const [statusHistory, setStatusHistory] = useState([]);
  // const [selectedLead, setSelectedLead] = useState(null);
  console.log(formData);
  // const getStatusName = (statusId) => {
  //   if (!statusId) return "";
  //   return LEAD_STATUS[statusId] || statusId;
  // };
  useEffect(() => {
    if (lead) {
      // Get status from lead - could be status name or lead_status ID
      const leadStatus =
        lead.originalData?.lead_status || lead.lead_status || lead.status;

      // If it's a number, it's a status ID
      if (typeof leadStatus === "number") {
        setCurrentStatusId(leadStatus);
        setCurrentStatus(LEAD_STATUS[leadStatus] || "");
      } else if (typeof leadStatus === "string") {
        // If it's a string, try to find the ID
        const statusId =
          STATUS_NAME_TO_ID[leadStatus.toUpperCase()] ||
          Object.keys(LEAD_STATUS).find(
            (key) => LEAD_STATUS[key] === leadStatus,
          );
        if (statusId) {
          setCurrentStatusId(Number(statusId));
          setCurrentStatus(leadStatus);
        } else {
          setCurrentStatus(leadStatus);
          setCurrentStatusId(null);
        }
      }

      // Get show_up status from lead data
      const showUpValue = lead.originalData?.show_up ?? lead.show_up ?? false;
      setShowUp(Boolean(showUpValue));
    }
  }, [lead]);

  const handleFormSubmit = (data) => {
    setFormData(data);
  };

  if (!lead) {
    return (
      <div className="h-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="py-8 text-center">
          <p className="mb-2 text-lg text-gray-500 dark:text-gray-400">
            Ready to Make Calls
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Select a lead from the list to start calling
          </p>
        </div>
      </div>
    );
  }

  // Get status badge class using the same system as LeadManagement
  const getStatusBadgeClass = (statusId) => {
    if (!statusId) return "";
    return `shieldnest-badge-${statusId}`;
  };

  // Handle show up toggle
  const handleShowUpToggle = async () => {
    if (!lead) return;

    const newShowUpValue = !showUp;
    const previousShowUpValue = showUp; // Store previous value for error revert
    setShowUpLoading(true);

    try {
      // Get mortgage_id from lead
      const mortgageId =
        lead.originalData?.mortgage_id ||
        lead.mortgage_id ||
        lead.identifier ||
        lead.id;

      // Get agent_id from logged in user
      const storedAgentId = localStorage.getItem("agentId");
      const storedUser = localStorage.getItem("currentUser");
      let agentId = null;

      if (storedAgentId) {
        agentId = parseInt(storedAgentId);
      } else if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.agents && user.agents.length > 0) {
          agentId = user.agents[0].id;
        } else {
          agentId = user.agent_id || user.id;
        }
      }

      if (!mortgageId || !agentId) {
        toast.error("Missing mortgage ID or agent ID");
        setShowUpLoading(false);
        return;
      }

      const payload = {
        mortgage_id: mortgageId.toString(),
        agent_id: agentId,
        show_up: newShowUpValue,
      };

      const response = await leadsService.updateShowUpStatus(payload);

      if (response?.status === 200 || response?.success) {
        setShowUp(newShowUpValue);
        toast.success(
          response?.message || "Show up status updated successfully!",
        );
      } else {
        toast.error(response?.message || "Failed to update show up status");
        // Revert on error
        setShowUp(previousShowUpValue);
      }
    } catch (err) {
      console.error("Error updating show up status:", err);
      toast.error(err.message || "Failed to update show up status");
      // Revert the toggle on error
      setShowUp(previousShowUpValue);
    } finally {
      setShowUpLoading(false);
    }
  };

  // Handle status change using the same API as LeadManagement
  const handleStatusChange = async (e) => {
    const newStatusId = Number(e.target.value);
    if (!newStatusId || !lead) return;

    setStatusLoading(true);
    try {
      // Prepare payload - same as LeadManagement
      const agentId =
        lead.originalData?.agent_id || lead.agent_id || lead.agentId;
      const mortgageId =
        lead.originalData?.mortgage_id ||
        lead.mortgage_id ||
        lead.identifier ||
        lead.id;

      if (!agentId || !mortgageId) {
        toast.error("Missing agent or mortgage ID");
        setStatusLoading(false);
        return;
      }

      const payload = {
        agent_id: agentId,
        lead_status: newStatusId,
        mortgage_ids: [mortgageId],
      };

      // Call API (category=1) - same endpoint as LeadManagement
      const response = await fetch(`${JWT_HOST_API}/leads/status/1`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && (data.success || data.status === 200)) {
        toast.success(data.message || "Status updated successfully!");
        setCurrentStatusId(newStatusId);
        setCurrentStatus(LEAD_STATUS[newStatusId] || "");
        // Call the onUpdateStatus callback if provided
        if (onUpdateStatus) {
          onUpdateStatus(lead.id, LEAD_STATUS[newStatusId] || newStatusId);
        }
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };
  /*const fetchStatusHistory = async (agentId, assigneeId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await leadsService.getLeadStatusHistory(
        agentId,
        assigneeId,
      );

      console.log("API Response:", response);

      // Handle different response formats
      const statusHistory = response.data || response.leads || [];
      setStatusHistory(statusHistory);
    } catch (err) {
      setError(`Failed to fetch Lead Status History: ${err.message}`);
      console.error("Error fetching status history:", err);
      setStatusHistory([]);
    } finally {
      setLoading(false);
    }
  };*/

  const handleAddNote = async () => {
    if (!lead) return;
    const response = await leadsService.updateLeadNote(
      lead.originalData?.mortgage_id ||
        lead.mortgage_id ||
        lead.identifier ||
        lead.id,
      note || "",
      lead.originalData?.agent_id || lead.agent_id || lead.agentId,
    );
    console.log("Note update response:", response);
    if (response?.status === 200 || response?.success) {
      setAddNote(false);
      setNote("");      
      toast.success(response?.message || "Note added successfully!");
    } else {
      toast.error(response?.message || "Failed to add note");
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex-1">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Lead Information
              {currentStatusId && (
                <span
                  style={{ fontSize: "10px" }}
                  className={`status-badge ml-2 inline-flex rounded-full px-2 py-0.5 font-semibold transition-opacity hover:opacity-80 ${getStatusBadgeClass(
                    currentStatusId,
                  )}`}
                >
                  {currentStatus || LEAD_STATUS[currentStatusId] || ""}
                </span>
              )}
            </h4>
            {/* <button
              onClick={() => {
                setSelectedLead(lead.originalData);
              }}
              className="dark:text-dark-200 flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
              title="View Detailed Info"
            >
              <EyeIcon className="h-5 w-5" />
            </button> */}
          </div>
          <div className="flex items-center gap-2">
            {/* Styled PDF component */}
            {/* {formData && (
              <LeadInfoPDF formData={formData} />
            )} */}

            {/* Mortgage Protection button */}
            <button
              onClick={() => setIsMortgageModalOpen(true)}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700"
              title="Click here to add Mortgage Protection"
            >
              <ShieldCheckIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Lead Details */}
        <div className="my-4 grid grid-cols-2 gap-4">
          {/* Notes */}
          {lead.notes ? (
            <div className="mb-1 col-span-2">
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                Notes
              </p>
              <p className="rounded-lg bg-gray-50 text-sm text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                {lead.notes} {!addNote && (
                  <button
                  onClick={() => {setAddNote(true); setNote(lead?.notes || "")}}
                  className="cursor-pointer ml-2"
                >
                  <PencilIcon className="h-3 w-3 cursor-pointer" />
                </button>
                )}
              </p>
            </div>
          ) : <div className="mb-1 col-span-2">
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                Notes
              </p>
              <p className="rounded-lg bg-gray-50 text-sm text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                {!addNote && (
                  <button
                  onClick={() => {setAddNote(true); setNote(lead?.notes || "")}}
                  className="cursor-pointer"
                >
                  <PencilIcon className="h-4 w-4 cursor-pointer" />
                </button>
                )}
                {addNote && (
                  <>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-md border border-gray-500 bg-white p-2 text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-[var(--color-atoll)] focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-500" rows="4" />
                    <button onClick={() => {
                      handleAddNote();
                      setAddNote(false);
                      setNote("");
                    }} className="rounded-md bg-[var(--color-atoll)] px-4 py-2 text-xs text-white hover:bg-[var(--color-atoll)]/90 dark:bg-blue-500 dark:hover:bg-blue-600">Add Note</button>
                    <button onClick={() => {
                      setAddNote(false);
                      setNote("");
                    }} className="rounded-md ml-2 bg-gray-500 px-4 py-2 text-xs text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700">Cancel</button>
                  </>
                )}
              </p>
            </div>}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loan Amount
            </p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              ${lead?.homeValue}
            </p>
          </div>
          
          {lead?.originalData?.lender_name && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Mortgage Lender
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {lead?.originalData?.lender_name}
              </p>
            </div>
          )}
          {lead.ivr_response?.age && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Client Age</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {lead.ivr_response?.age}
              </p>
            </div>
          )}
          {lead.ivr_response?.coborrower && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Co-Borrower</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {lead.ivr_response?.coborrower === "1" ? "Yes" : "No"}
              </p>
            </div>
          )}
          {lead.ivr_response?.tobacco && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Smoker</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {lead.ivr_response?.tobacco === "1" ? "Yes" : "No"}
              </p>
            </div>
          )}
          {lead.ivr_response?.health && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Medical Issues</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {lead.ivr_response?.health === "1" ? "Yes" : "No"}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Address
            </p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {lead?.address}
            </p>
          </div>
          {/* <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Territory
            </p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {lead.originalData?.state}-{lead.originalData?.zip}
            </p>
          </div> */}
        </div>

        {/* Show Up Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Up
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Toggle to mark lead as show up
              </p>
            </div>
            <button
              type="button"
              onClick={handleShowUpToggle}
              disabled={showUpLoading}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-[var(--color-atoll)] focus:ring-offset-2 focus:outline-none ${
                showUp
                  ? "bg-green-600 dark:bg-green-500"
                  : "bg-gray-200 dark:bg-gray-600"
              } ${showUpLoading ? "cursor-not-allowed opacity-50" : ""}`}
              role="switch"
              aria-checked={showUp}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  showUp ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          {showUpLoading && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Updating...
            </p>
          )}
        </div>

        {/* Update Status */}
        <div className="mb-6">
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            Update Status
          </p>
          <select
            value={currentStatusId || ""}
            onChange={handleStatusChange}
            disabled={statusLoading}
            className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-[var(--color-atoll)] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400 ${
              statusLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            <option value="">Select Status</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status?.value} value={status?.value}>
                {status?.label}
              </option>
            ))}
          </select>
          {statusLoading && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Updating status...
            </p>
          )}
        </div>

        {/* Call History */}
        <div>
          <h4 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
            Call History
          </h4>
          {callLogsLoading ? (
            <div className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">
              Loading call history...
            </div>
          ) : (
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {callLogs.length > 0 ? (
                callLogs.map((log, index) => {
                  // Try to get status ID from call status
                  const callStatusId =
                    typeof log.status === "number"
                      ? log.status
                      : STATUS_NAME_TO_ID[log.status?.toUpperCase()] ||
                        Object.keys(LEAD_STATUS).find(
                          (key) => LEAD_STATUS[key] === log.status,
                        );
                  return (
                    <div
                      key={log.id || index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        {callStatusId && (
                          <span
                            className={`status-badge inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass(callStatusId)}`}
                          >
                            {LEAD_STATUS[callStatusId] || log.status}
                          </span>
                        )}
                        {!callStatusId && (
                          <div
                            className={`h-2 w-2 rounded-full bg-gray-400`}
                          ></div>
                        )}
                        <span className="text-gray-600 dark:text-gray-400">
                          {log.date} · {log.time}
                        </span>
                      </div>
                      {log.duration && (
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {log.duration}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : callHistory.length > 0 ? (
                // Fallback to local callHistory if API logs are empty
                callHistory.map((call, index) => {
                  const callStatusId =
                    typeof call.status === "number"
                      ? call.status
                      : STATUS_NAME_TO_ID[call.status?.toUpperCase()] ||
                        Object.keys(LEAD_STATUS).find(
                          (key) => LEAD_STATUS[key] === call.status,
                        );
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        {callStatusId && (
                          <span
                            className={`status-badge inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass(callStatusId)}`}
                          >
                            {LEAD_STATUS[callStatusId] || call.status}
                          </span>
                        )}
                        {!callStatusId && (
                          <div
                            className={`h-2 w-2 rounded-full bg-gray-400`}
                          ></div>
                        )}
                        <span className="text-gray-600 dark:text-gray-400">
                          {call.date} · {call.time}
                        </span>
                      </div>
                      {call.duration && (
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {call.duration}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">
                  No call history
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/*selectedLead && (
        <LeadDetailsModal
          statusHistory={statusHistory}
          loading={loading}
          error={error}
          selectedLead={selectedLead}
          setSelectedLead={setSelectedLead}
          restricted={true}
          fetchStatusHistory={fetchStatusHistory}
          getStatusName={getStatusName}
        />
      )*/}

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
