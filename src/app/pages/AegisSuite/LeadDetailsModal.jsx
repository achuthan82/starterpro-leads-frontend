import { useState, useEffect } from "react";
import {
  ClockIcon,
  PhoneIcon,
  ChevronDownIcon,
  XMarkIcon,
  PencilIcon,
  MapPinIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";
import { SOURCE_MAPPING } from "../../../constants/app.constant";

const LeadDetailsModal = ({
  selectedLead,
  purchased,
  setSelectedLead,
  handleAddNote,
  fetchStatusHistory,
  statusHistory,
  tabs,
  activeTab,
  setStatusLead,
  setNewStatus,
  setShowStatusModal,
  getStatusName,
  restricted,
}) => {
  console.log("selected-lead", selectedLead);
  const [note, setNote] = useState(selectedLead?.notes || "");
  const [addNote, setAddNote] = useState(false);

  // Helper function to get source name from ID
  const getSourceName = (sourceId) => {
    if (!sourceId) return "";
    return SOURCE_MAPPING[sourceId] || sourceId;
  };

  useEffect(() => {
    fetchStatusHistory(
      selectedLead.agent_id,
      selectedLead.assignee_id || selectedLead?.lead_member_id,
    );
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600/65 dark:bg-gray-900/75"
      style={{ width: " 100vw" }}
    >
      <div className="relative top-10 mx-auto mb-10 max-h-[90vh] w-11/12 max-w-5xl overflow-y-auto rounded-lg border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-atoll)]">
              <span className="text-xl font-bold text-white">
                {selectedLead.full_name || selectedLead.name
                  ? (selectedLead.full_name || selectedLead.name)
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "N/A"}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">
                {selectedLead.full_name || selectedLead.name || "Unknown"}
              </h3>
              {/* {activeTab !== 'mailed' &&  */}
              <p className="text-gray-600 dark:text-gray-300">
                {selectedLead.email ||
                  selectedLead.ivr_response?.number ||
                  selectedLead?.ivr_response?.ani ||
                  "No contact info"}
              </p>
              {/* // } */}
              <div className="mt-1 flex items-center space-x-2">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold shieldnest-badge-${selectedLead.lead_status || selectedLead.status}`}
                >
                  {getStatusName(
                    selectedLead.lead_status || selectedLead.status,
                  ) || "Unknown"}
                </span>
                {!purchased && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Lead ID:{" "}
                    {selectedLead.identifier ||
                      selectedLead.mortgage_id ||
                      selectedLead.id}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedLead(null)}
            data-testid="close-lead-modal"
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="left-col">
              {/* Contact & Location */}
              <div className="contact-location mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <h4 className="mb-4 text-lg font-semibold text-[var(--color-atoll)] dark:text-blue-400">
                  Contact & Location
                </h4>
                <div className="space-y-3">
                  {/* {activeTab !== 'mailed' && */}
                  <div className="flex items-center">
                    <PhoneIcon className="mr-3 h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Phone
                      </p>
                      <p className="font-medium text-black dark:text-white">
                        {selectedLead?.ivr_response?.number ||
                          selectedLead?.ivr_response?.ani ||
                          selectedLead.lead_phone_number ||
                          selectedLead.phone ||
                          ""}
                      </p>
                    </div>
                  </div>
                  {/* // } */}
                  {/* <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Borrower Phone</p>
                            <p className="font-medium dark:text-white">{selectedLead.borrower_phone || ''}</p>
                            </div>*/}
                  <div className="flex items-center">
                    <HomeIcon className="mr-3 h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Client Address
                      </p>
                      <p className="font-medium dark:text-white">
                        {selectedLead.client_address ||
                          selectedLead.address ||
                          ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="mr-3 h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Territory
                      </p>
                      <p className="font-medium dark:text-white">
                        {selectedLead.city || ""} {selectedLead.state || ""}{" "}
                        {selectedLead.zip || selectedLead.zipcode || ""}
                      </p>
                    </div>
                  </div>
                  {/* <div>
                            <p className="text-sm text-gray-500">Zip Code</p>
                            <p className="font-medium"></p>
                            </div> 
                            <div>
                            <p className="text-sm text-gray-500">Agent Identifier</p>
                            <p className="font-medium">{selectedLead.agent_identifier || ''}</p>
                            </div> */}
                </div>
              </div>

              {/* Basic Information */}
              <div className="basic-info mb-4 rounded-lg border border-blue-300 bg-blue-100 p-4 dark:border-blue-700 dark:bg-blue-900/30">
                <h4 className="mb-4 text-lg font-semibold text-blue-900 dark:text-blue-300">
                  Lead Source
                </h4>
                <div className="space-y-3">
                  {/* <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Identifier</p>
                            <p className="font-medium dark:text-white">{selectedLead.identifier || selectedLead.mortgage_id || selectedLead.id || ''}</p>
                            </div> */}
                  {!purchased && (
                    <div className="flex justify-between">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Campaign
                      </p>
                      <p className="font-medium text-blue-900 dark:text-blue-200">
                        {selectedLead.campaign_name || ""}
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Source
                    </p>
                    <p className="font-medium text-blue-900 dark:text-blue-200">
                      {getSourceName(selectedLead.source_id) || ""}
                    </p>
                  </div>
                  {!selectedLead.campaign_name.startsWith("SD") && (
                    <div className="flex justify-between">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Registered Date
                      </p>
                      <p className="font-medium text-blue-900 dark:text-blue-200">
                        {selectedLead.call_in_date_time || ""}
                      </p>
                    </div>
                  )}

                  {/* <div>
                            <p className="text-sm text-gray-500">Lead Status</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full shieldnest-badge-${(selectedLead.lead_status || selectedLead.status)}`}>
                                {getStatusName(selectedLead.lead_status || selectedLead.status) || ''}
                            </span>
                            </div> */}
                </div>
              </div>

              {/* Loan & Borrower Information */}
              <div className="loan-borrower-info mb-4 rounded-lg bg-violet-50 p-4 dark:bg-violet-900/20">
                <h4 className="mb-4 text-lg font-semibold text-[var(--color-atoll)] dark:text-blue-400">
                  Loan & Borrower Info
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Loan Amount
                    </p>
                    <p className="font-medium dark:text-white">
                      {selectedLead.loan_amount
                        ? `$${selectedLead.loan_amount}`
                        : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Loan Date
                    </p>
                    <p className="font-medium dark:text-white">
                      {selectedLead.loan_date || ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Lender Name
                    </p>
                    <p className="font-medium dark:text-white">
                      {selectedLead.lender_name || ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Borrower Age
                    </p>
                    <p className="font-medium dark:text-white">
                      {selectedLead?.ivr_response?.age || ""}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Borrower Medical Issues
                    </p>
                    <p className="font-medium">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          selectedLead?.ivr_response?.health === "1"
                            ? "bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                            : "bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        }`}
                      >
                        {selectedLead?.ivr_response?.health === "1"
                          ? "Yes"
                          : "No"}
                      </span>
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Borrower Tobacco Use
                    </p>
                    <p className="font-medium">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          selectedLead?.ivr_response?.tobacco === "1"
                            ? "bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                            : "bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        }`}
                      >
                        {selectedLead?.ivr_response?.tobacco === "1"
                          ? "Yes"
                          : "No"}
                      </span>
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Co-Borrower
                    </p>
                    <p className="font-medium">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          selectedLead?.ivr_response?.coborrower === "1"
                            ? "bg-blue-200 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                            : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {selectedLead?.ivr_response?.coborrower === "1"
                          ? "Yes"
                          : "No"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="right-col col-span-2">
              {/* Status History */}
              <div className="contact-location mb-4 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-[var(--color-atoll)] dark:text-blue-400">
                    Status Management
                  </h4>
                  {!restricted && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setStatusLead(selectedLead);
                          setNewStatus(
                            selectedLead.lead_status ||
                              selectedLead.status ||
                              "",
                          );
                          setShowStatusModal(true);
                        }}
                        data-testid="change-status"
                        className="rounded-md bg-[var(--color-atoll)] px-4 py-2 text-xs text-white hover:bg-[var(--color-atoll)]/90 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        Change Status
                      </button>
                    </div>
                  )}
                </div>
                <hr className="my-4 dark:border-gray-600" />
                <h5 className="font-medium text-gray-900 dark:text-white">
                  Status History
                </h5>
                {statusHistory && statusHistory.length > 0 ? (
                  statusHistory.map((status, index) => (
                    <div
                      className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-100 p-4 dark:border-gray-600 dark:bg-gray-700"
                      key={index}
                    >
                      <div className="items-top flex justify-between space-y-3">
                        <div className="m-0 flex items-center">
                          <div
                            className={`h-3 w-3 shieldnest-badge-${status.lead_status || status.status} mr-4 rounded-full`}
                          ></div>
                          <div className="">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              {getStatusName(status.lead_status)}
                            </p>
                            <p className="text-sm dark:text-gray-300">
                              Status updated on {status.created_at}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
                            {index === 0
                              ? "Current Status"
                              : index === statusHistory.length - 1
                                ? "Initial Status"
                                : "Previous Status"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No status history found
                  </p>
                )}
              </div>

              {/* Note */}
              <div className="contact-location mb-4 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-[var(--color-atoll)] dark:text-blue-400">
                    Note
                  </h4>
                  {!selectedLead?.notes && !restricted && (
                    <button
                      onClick={() => setAddNote(true)}
                      data-testid="add-note"
                      className="rounded-md bg-[var(--color-atoll)] px-4 py-2 text-xs text-white hover:bg-[var(--color-atoll)]/90 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      Add Note
                    </button>
                  )}
                </div>
                {selectedLead?.notes && !addNote && (
                  <div className="mt-2 flex items-center justify-between border-l-4 border-gray-400 bg-gray-100 p-4 dark:border-gray-600 dark:bg-gray-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
                      {selectedLead.notes}
                    </p>
                    <PencilIcon
                      onClick={() => setAddNote(true)}
                      data-testid="edit-note"
                      className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    />
                  </div>
                )}
                {addNote && (
                  <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-100 p-4 dark:border-gray-600 dark:bg-gray-700">
                    <div>
                      <textarea
                        placeholder="Add your note here..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full rounded-md border border-gray-500 bg-white p-2 text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-[var(--color-atoll)] focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-500"
                        rows="4"
                        data-testid="textarea-note"
                      ></textarea>
                      <div className="mt-1 flex justify-end">
                        <button
                          onClick={() => setAddNote(false)}
                          data-testid="cancel-note"
                          className="mr-2 rounded-md border border-gray-500 px-4 py-1 text-xs text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={!note}
                          onClick={() => {
                            handleAddNote(
                              selectedLead.mortgage_id,
                              note,
                              selectedLead.agent_id,
                            );
                            setAddNote(false);
                          }}
                          data-testid="save-note"
                          className="ml-2 rounded-md bg-[var(--color-atoll)] px-4 py-1 text-xs text-white hover:bg-[var(--color-atoll)]/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* IVR Logs Section */}
          {selectedLead.ivr_logs && selectedLead.ivr_logs.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-4 flex items-center text-lg font-semibold text-[var(--color-atoll)] dark:text-blue-400">
                <PhoneIcon className="mr-2 h-5 w-5" />
                IVR Call Logs ({selectedLead.ivr_logs.length})
              </h4>
              <div className="space-y-3">
                {selectedLead.ivr_logs.map((log, index) => (
                  <details
                    key={index}
                    className="group rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <summary className="cursor-pointer rounded-lg p-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              Call #{index + 1}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {log.timestamp ||
                            !selectedLead.campaign_name.startsWith("SD")
                              ? "N/A"
                              : log.call_in_date_time || "No timestamp"}
                          </div>
                          {log.call_in_phone && (
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              📞 {log.call_in_phone}
                            </div>
                          )}
                        </div>
                        <ChevronDownIcon className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180 dark:text-gray-400" />
                      </div>
                    </summary>

                    <div className="rounded-b-lg border-t border-gray-200 bg-white px-4 pb-4 dark:border-gray-600 dark:bg-gray-800">
                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Basic Call Info */}
                        <div>
                          <h5 className="mb-2 font-semibold text-gray-800 dark:text-white">
                            Call Information
                          </h5>
                          <div className="space-y-2 text-sm">
                            {log.call_in_phone && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  Phone:
                                </span>
                                <span className="ml-2 font-medium dark:text-gray-200">
                                  {log.call_in_phone}
                                </span>
                              </div>
                            )}
                            {log.timestamp && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  Timestamp:
                                </span>
                                <span className="ml-2 font-medium dark:text-gray-200">
                                  {log.timestamp}
                                </span>
                              </div>
                            )}
                            {log.age && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  Age:
                                </span>
                                <span className="ml-2 font-medium dark:text-gray-200">
                                  {log.age}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Health Information */}
                        <div>
                          <h5 className="mb-2 font-semibold text-gray-800 dark:text-white">
                            Health Information
                          </h5>
                          <div className="space-y-2 text-sm">
                            {log.health !== undefined && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  Health:
                                </span>
                                <span
                                  className={`ml-2 rounded-full px-2 py-1 text-xs ${
                                    log.health === "1"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                                      : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                  }`}
                                >
                                  {log.health === "1" ? "Has Issues" : "Good"}
                                </span>
                              </div>
                            )}
                            {log.tobacco !== undefined && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  Tobacco:
                                </span>
                                <span
                                  className={`ml-2 rounded-full px-2 py-1 text-xs ${
                                    log.tobacco === "1"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                                      : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                  }`}
                                >
                                  {log.tobacco === "1" ? "Yes" : "No"}
                                </span>
                              </div>
                            )}
                            {log.co_borrower !== undefined && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  Co-Borrower:
                                </span>
                                <span
                                  className={`ml-2 rounded-full px-2 py-1 text-xs ${
                                    log.co_borrower === "1"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {log.co_borrower === "1" ? "Yes" : "No"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Additional Information */}
                        <div>
                          <h5 className="mb-2 font-semibold text-gray-800 dark:text-white">
                            Additional Details{" "}
                          </h5>
                          <div className="space-y-2 text-sm">
                            {log.borrower_phone && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  Borrower Phone:
                                </span>
                                <span className="ml-2 font-medium dark:text-gray-200">
                                  {log.borrower_phone}
                                </span>
                              </div>
                            )}
                            {/* Display any other fields that might be in the log */}
                            {Object.entries(log).map(([key, value]) => {
                              // console.log(key, value)
                              // Skip already displayed fields
                              if (
                                [
                                  "call_in_phone",
                                  "timestamp",
                                  "age",
                                  "health",
                                  "tobacco",
                                  "co_borrower",
                                  "borrower_phone",
                                  "status",
                                ].includes(key)
                              ) {
                                return null;
                              }
                              // Only show non-empty values
                              if (
                                value === null ||
                                value === undefined ||
                                value === ""
                              ) {
                                return null;
                              }
                              return (
                                <div key={key}>
                                  <span className="text-gray-500 capitalize dark:text-gray-400">
                                    {key.replace(/_/g, " ")}:
                                  </span>
                                  <span className="ml-2 font-medium break-words dark:text-gray-200">
                                    {String(value)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Raw Data Section (for debugging) */}
          {Object.keys(selectedLead).length > 15 && !restricted && (
            <div className="mt-6">
              <details className="group">
                <summary className="mb-4 cursor-pointer text-lg font-semibold text-[var(--color-atoll)] hover:text-[var(--color-atoll)]/80 dark:text-blue-400 dark:hover:text-blue-300">
                  Raw Data (Click to expand)
                </summary>
                <div className="mt-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <pre className="max-h-96 overflow-auto text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {JSON.stringify(selectedLead, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
          {!restricted && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Lead Category: {tabs.find((item) => item.id === activeTab).label}
            </span>
          )}

          {/* <span className="text-sm text-gray-500 dark:text-gray-400">Lead Category: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span> */}
          <div className="flex space-x-3">
            <button
              onClick={() => setSelectedLead(null)}
                data-testid="btn-close-lead-modal-footer"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeadDetailsModal;
