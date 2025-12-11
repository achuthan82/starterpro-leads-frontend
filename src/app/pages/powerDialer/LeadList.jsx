import { useState, useEffect, useCallback, useRef } from "react";
import {
  MagnifyingGlassIcon,
  PhoneIcon,
  MapPinIcon,
  // PaperClipIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
// import { useNavigate } from "react-router";
import { dialerService, stateService } from "utils/apiService";
import { LEAD_STATUS, STATUS_NAME_TO_ID } from "constants/app.constant";
import { toast } from "sonner";

const LeadList = ({
  selectedLead,
  onSelectLead,
  searchTerm,
  onSearchChange,
  onOpenSmsDrawer
}) => {
  // const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("all");
  const statusOptions = [
    "All Statuses",
    ...Object.values(LEAD_STATUS).filter((status) => status !== "UNKNOWN"),
  ];

  // Use ref to track if we're currently fetching to prevent duplicate calls
  const isFetchingRef = useRef(false);
  const lastFetchParamsRef = useRef({ searchTerm: "", selectedStatus: "" });

  // Fetch leads from API
  const fetchLeads = useCallback(
    async (
      page = currentPage,
      name = searchTerm,
      lead_status = selectedStatus,
      state= selectedState,
      itemsPerPage = perPage,
    ) => {
      // Prevent duplicate calls
      if (isFetchingRef.current) {
        return;
      }

      // Check if parameters have actually changed
      if (
        lastFetchParamsRef.current.searchTerm === name &&
        lastFetchParamsRef.current.selectedStatus === lead_status &&
        lastFetchParamsRef.current.page === page &&
        lastFetchParamsRef.current.perPage === itemsPerPage &&
        lastFetchParamsRef.current.selectedState === state
      ) {
        return;
      }

      isFetchingRef.current = true;
      lastFetchParamsRef.current = {
        searchTerm: name,
        selectedStatus: lead_status,
        page,
        perPage: itemsPerPage,
        selectedState:state
      };
      setLoading(true);
      setError(null);

      try {
        const params = {
          page,
          per_page: itemsPerPage,
        };

        // Add optional filters
        if (name && name.trim()) {
          params.name = name.trim();
        }

        if (
          lead_status &&
          lead_status !== "All Statuses" &&
          lead_status !== "all"
        ) {
          // Convert status name to ID if it's a status name
          const statusId = STATUS_NAME_TO_ID[lead_status] || lead_status;
          params.lead_status = statusId;
        }
        console.log('state', state)
        if (state && state !== 'all') {
          params.state = state
        }
        

        const response = await dialerService.getPaginatedLeads(params);

        // Handle different response formats
        const leadsData = response.data || response.leads || [];
        const pagination = response.pagination || {};
        const total =
          pagination.total || response.total || response.total_count || 0;
        const perPageFromAPI = pagination.per_page || itemsPerPage;
        const totalPagesCalc = Math.ceil(total / perPageFromAPI);

        // Transform API data to match component structure
        const transformedLeads = leadsData.map((lead) => ({
          id: lead.assignee_id || lead.id || lead.mortgage_id,
          name: lead.full_name || lead.name || "Unknown",
          phone:
            lead.ivr_response?.number ||
            lead.ivr_response?.ani ||
            lead.phone ||
            lead.lead_phone_number ||
            "N/A",
          address:
            `${lead.address || ""} ${lead.city || ""} ${lead.state || ""} ${lead.zip || lead.zipcode || ""}`.trim() ||
            "N/A",
          status:
            LEAD_STATUS[lead.lead_status] || lead.lead_status || "Unknown",
          statusId: lead.lead_status, // Keep the original status ID for badge colors
          lastContact: lead.call_in_date_time || lead.last_contact || "",
          age: lead.ivr_response?.age || lead.age || "",
          homeValue: lead.loan_amount || "",
          mortgage: lead.mortgage_amount || "",
          notes: lead.notes || "",
          initials: (lead.full_name || lead.name || "U")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2),
          // Keep original data for reference
          originalData: lead,
        }));

        setLeads(transformedLeads);
        setTotalRecords(total);
        setTotalPages(totalPagesCalc);
        setCurrentPage(page);
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError(err.message || "Failed to fetch leads");
        toast.error(err.message || "Failed to load leads. Please try again.");
        setLeads([]);
        setTotalRecords(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [currentPage, searchTerm, selectedStatus, perPage, selectedState],
  );

  // Fetch leads on component mount and when filters change (not when call state changes)
  useEffect(() => {
    // Only fetch if searchTerm or selectedStatus actually changed
    fetchLeads(1, searchTerm, selectedStatus, selectedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedStatus, selectedState]);

  // Update lead in list when selectedLead status changes
  useEffect(() => {
    if (selectedLead && selectedLead.id) {
      setLeads((prevLeads) =>
        prevLeads.map((l) => {
          // Match by id, mortgage_id, or assignee_id
          if (
            l.id === selectedLead.id ||
            l.originalData?.mortgage_id === selectedLead.originalData?.mortgage_id ||
            l.originalData?.assignee_id === selectedLead.originalData?.assignee_id ||
            l.originalData?.mortgage_id === selectedLead.mortgage_id
          ) {
            return {
              ...l,
              status: selectedLead.status || l.status,
              statusId: selectedLead.statusId || selectedLead.originalData?.lead_status || l.statusId,
              originalData: {
                ...l.originalData,
                lead_status: selectedLead.statusId || selectedLead.originalData?.lead_status || l.originalData?.lead_status,
              },
            };
          }
          return l;
        })
      );
    }
  }, [selectedLead?.statusId, selectedLead?.status, selectedLead?.originalData?.lead_status]);

  // Handle status change
  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    setCurrentPage(1);
  };
    const handleStateChange = (newState) => {
    setSelectedState(newState);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchLeads(newPage, searchTerm, selectedStatus);
    }
  };

  // Handle per page change
  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    fetchLeads(1, searchTerm, selectedStatus, selectedState, newPerPage);
  };

  // Get status ID from lead status (could be name or ID)
  const getStatusId = (status) => {
    if (!status) return null;

    // If it's already a number, return it
    if (typeof status === "number") {
      return status;
    }

    // If it's a string, try to find the ID
    if (typeof status === "string") {
      // Try STATUS_NAME_TO_ID first
      const statusId = STATUS_NAME_TO_ID[status.toUpperCase()];
      if (statusId) return statusId;

      // Try to find in LEAD_STATUS
      const foundId = Object.keys(LEAD_STATUS).find(
        (key) =>
          LEAD_STATUS[key] === status ||
          LEAD_STATUS[key] === status.toUpperCase(),
      );
      if (foundId) return Number(foundId);
    }

    return null;
  };

  // Get status badge class using the same system as LeadManagement
  const getStatusBadgeClass = (statusId) => {
    if (!statusId) return "";
    return `shieldnest-badge-${statusId}`;
  };
  const getUsStates = () => {
    stateService.getStates().then((response) => {
      if (response.data.status === 200) {
        const dt = response.data.data;
        const arr = [];
        Object.keys(dt).map(function (key) {
          arr.push({ value: dt[key], label: key });
        });
        setStates(arr);
      }
    });
  };
  useEffect(() => {
    getUsStates();
  }, []);
  return (
    <div className="h-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Search */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
        <input
          type="text"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-gray-900 focus:border-[var(--color-atoll)] focus:ring-2 focus:ring-[var(--color-atoll)] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      {/* Status Filter */}
      <div className="mb-6 grid grid-cols-12 gap-1">
        <div className="col-span-6">
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-gray-900 focus:border-[var(--color-atoll)] focus:ring-2 focus:ring-[var(--color-atoll)] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-6 ml-2">
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-gray-900 focus:border-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
          >
            <option value="all">All States</option>
            {states.map((status) => (
              <option key={status.label} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-4 py-4 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-[var(--color-atoll)] dark:border-blue-400"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading leads...
          </p>
        </div>
      )}

      {/* Leads List */}
      <div className="max-h-[calc(100vh-300px)] space-y-3 overflow-y-auto">
        {!loading &&
          leads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className={`cursor-pointer rounded-lg border-l-4 p-4 transition-all ${
                selectedLead?.id === lead.id
                  ? "border border-blue-200 border-l-[var(--color-atoll)] bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20"
                  : "border border-gray-200 border-l-transparent bg-white hover:border-[var(--color-atoll)] dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[var(--color-atoll)]"
              }`}
            >
              {/* Lead Header with Name and Dial Icon */}
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {lead.name} {lead?.originalData?.calls > 0 && <span className="text-xs text-gray-600 dark:text-gray-400">({lead?.originalData?.calls} calls)</span>}
                </h3>
                <div className="flex items-center space-x-2">
                  {(() => {
                    // Use statusId from lead data if available, otherwise try to get it from status name
                    const statusId = lead.statusId || getStatusId(lead.status);
                    return statusId ? (
                      <span
                        className={`status-badge inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass(statusId)}`}
                      >
                        {lead.status || LEAD_STATUS[statusId] || ""}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {lead.status || "Unknown"}
                      </span>
                    );
                  })()}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const mortgageId = lead.originalData?.mortgage_id || lead.mortgage_id || lead.id;
                      const leadMemberId = lead.originalData?.lead_member_id || lead.lead_member_id;
                      if (mortgageId && leadMemberId) {
                        onOpenSmsDrawer(lead);
                      } else {
                        toast.error("Missing lead information for SMS conversation");
                      }
                    }}
                    className="p-1 text-gray-400 transition-colors hover:text-green-600 dark:hover:text-green-400"
                    title="View SMS Conversation"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Lead Details with Heroicons */}
              <div className="ml-1 space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <PhoneIcon className="mr-2 h-4 w-4 text-gray-400" />
                  {lead.phone || "N/A"}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="mr-2 h-4 w-4 text-gray-400" />
                  {lead.address || "N/A"}
                </div>
                {lead.lastContact && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                      Last: {lead.lastContact}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLead(lead);
                      }}
                      className="p-1 text-gray-400 transition-colors hover:text-[var(--color-atoll)]"
                    >
                      <PhoneIcon className="h-5 w-5 text-blue-900" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

        {!loading && leads.length === 0 && !error && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            {selectedStatus === "All Statuses"
              ? "No leads found"
              : `No ${selectedStatus} leads found`}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalRecords > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-600">
          <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            {/* Left side - Info and Per Page */}
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <div className="text-xs whitespace-nowrap text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * perPage + 1} to{" "}
                {Math.min(currentPage * perPage, totalRecords)} of{" "}
                {totalRecords}
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <label className="text-xs whitespace-nowrap text-gray-600 dark:text-gray-400">
                  Per page:
                </label>
                <select
                  value={perPage}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="min-w-[60px] rounded border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-[var(--color-atoll)] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Right side - Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-shrink-0 items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={`flex items-center justify-center rounded border p-1.5 transition-colors ${
                    currentPage <= 1
                      ? "cursor-not-allowed border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                  title="Previous page"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="min-w-[60px] px-2 text-center text-xs text-gray-600 dark:text-gray-400">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={`flex items-center justify-center rounded border p-1.5 transition-colors ${
                    currentPage >= totalPages
                      ? "cursor-not-allowed border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                  title="Next page"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Legend */}
      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-600">
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          Status Legend:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {statusOptions.slice(1).map((status) => {
            const statusId = getStatusId(status);
            // Get the background color from the badge class
            const getStatusDotColor = (id) => {
              if (!id) return "bg-gray-400";
              // Map status IDs to their corresponding colors from shieldnest-theme.css
              const colorMap = {
                1: "bg-[var(--atoll)]", // NEW
                2: "bg-[var(--atoll)]", // FIRST CALL
                3: "bg-[var(--atlantis)]", // SECOND CALL
                4: "bg-[#f97316]", // THIRD CALL
                5: "bg-[#8b5cf6]", // TEXT
                6: "bg-[#3b82f6]", // APPOINTMENT
                7: "bg-[var(--fern)]", // SOLD
                8: "bg-[var(--waterloo)]", // NOT INTERESTED
                9: "bg-[var(--gray-suit)]", // SIT / NO SALE
                10: "bg-[#ef4444]", // NO SHOW
                11: "bg-[#374151]", // DNC
                12: "bg-[#4e1515]", // SUPPRESSED
                13: "bg-[#10151d]", // Suppression Denied
              };
              return colorMap[id] || "bg-gray-400";
            };
            return (
              <div key={status} className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${getStatusDotColor(statusId)}`}
                ></div>
                <span className="text-gray-600 dark:text-gray-400">
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeadList;
