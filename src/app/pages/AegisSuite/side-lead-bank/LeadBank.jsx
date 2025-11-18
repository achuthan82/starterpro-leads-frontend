import { useState, useEffect } from "react";
import { Card, Checkbox } from "components/ui";
import SharedSidebar from "../components/SharedSidebar";
import { leadsService, stateService } from "utils/apiService";
import {
  EyeIcon,
  MagnifyingGlassIcon,
  //   ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { LEAD_STATUS, LEAD_STATUSES } from "constants/app.constant";
import { useAuthContext } from "app/contexts/auth/context";
import CopyMoveModal from "./CopyMoveModal";
import { useDisclosure } from "hooks";

const LeadBank = () => {
  const { user } = useAuthContext();
  const userRole = user?.role || localStorage.getItem("userRole") || "agent";

  const [activeTab, setActiveTab] = useState("rich");
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [states, setStates] = useState([]);
  const [filters, setFilters] = useState({
    lead_status: "",
    state: "",
    name: "",
    campaign: "",
  });
  const [setViewMarketPlace] = useState(false);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [purchased, setPurchased] = useState(false);
  const [isOpen, { open, close }] = useDisclosure(false);
  // Data states
  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState({
    totalLeads: 0,
    goldLeads: 0,
    partialLeads: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [setShowStatusModal] = useState(false);
  const [setStatusLead] = useState(null);
  const [setNewStatus] = useState("");

  // Bulk status update modal states
  //   const [ setShowBulkStatusModal] = useState(false);

  // Helper function to get status name from ID
  const getStatusName = (statusId) => {
    if (!statusId) return "";
    return LEAD_STATUS[statusId] || statusId;
  };

  // Tab configuration
  const tabs = [
    { id: "rich", label: "Completed Leads", count: summary.goldLeads },
    { id: "partial", label: "Incomplete Leads", count: summary.partialLeads },
    // Only show Mailed Leads tab for admin users
    ...(userRole === "admin"
      ? [{ id: "mailed", label: "Mailed Leads", count: summary.mailedLeads }]
      : []),
  ];

  // Fetch leads data with pagination
  const fetchLeads = async (
    category = activeTab,
    appliedFilters = {},
    page = currentPage,
    perPage = perPage,
    resetPage = false,
    fetch_market_place = false,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const pageToFetch = resetPage ? 1 : page;
      const response = await leadsService.getLeadsByCategory(
        category,
        appliedFilters,
        pageToFetch,
        perPage,
        fetch_market_place,
      );

      console.log("API Response:", response);

      // Handle different response formats
      const leadsData = response.data || response.leads || [];

      // Debug: Log the first lead to see data structure
      if (leadsData.length > 0) {
        console.log("First lead data structure:", leadsData[0]);
        console.log(
          "Agent ID in lead:",
          leadsData[0].agent_id || leadsData[0].agentId,
        );
        console.log("IVR logs:", leadsData[0].ivr_logs);
        console.log("IVR response:", leadsData[0].ivr_response);

        // Debug boolean fields specifically
        if (leadsData[0].ivr_logs && leadsData[0].ivr_logs.length > 0) {
          const latestLog =
            leadsData[0].ivr_logs[leadsData[0].ivr_logs.length - 1];
          console.log("Boolean field values from ivr_logs:");
          console.log("health:", latestLog.health, typeof latestLog.health);
          console.log("tobacco:", latestLog.tobacco, typeof latestLog.tobacco);
          console.log(
            "coborrower:",
            latestLog.coborrower,
            typeof latestLog.coborrower,
          );
        }
      }

      // Extract pagination info from API response
      const pagination = response.pagination || {};
      const total =
        pagination.total ||
        response.total ||
        response.total_count ||
        response.count ||
        0;
      const perPageFromAPI = pagination.per_page || perPage;
      const totalPagesCalc = Math.ceil(total / perPageFromAPI);

      console.log("Pagination info:", pagination);

      setLeads(leadsData);
      setTotalRecords(total);
      setTotalPages(totalPagesCalc);
      if (selectedLead && selectedLead.assignee_id) {
        setSelectedLead(
          leadsData.find(
            (lead) => lead.assignee_id === selectedLead.assignee_id,
          ),
        );
      }
      if (resetPage) {
        setCurrentPage(1);
      }
    } catch (err) {
      setError(`Failed to fetch ${category} leads: ${err.message}`);
      console.error("Error fetching leads:", err);
      setLeads([]);
      setTotalRecords(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leads status history

  // Fetch summary data for all categories
  const fetchSummary = async (text = null) => {
    try {
      const response = await leadsService.getAgentLeadsCount(null, 1, text);

      console.log("Summary API Response:", response);
      const data = response.data || response;

      console.log("data", data);

      const goldCount = data.completed || 0;
      const partialCount = data.incomplete || 0;
      const mailedCount = data.mailed || 0;
      const soldCount = data.sold || 0;
      const totalCount = goldCount + partialCount || 0;

      const conversionRate =
        totalCount > 0
          ? ((soldCount / (totalCount + soldCount)) * 100).toFixed(0)
          : 0;

      setSummary({
        totalLeads: totalCount,
        goldLeads: goldCount,
        partialLeads: partialCount,
        mailedLeads: mailedCount,
        conversionRate: conversionRate,
      });

      console.log("Summary data updated:", {
        totalLeads: totalCount,
        goldLeads: goldCount,
        partialLeads: partialCount,
        mailedLeads: mailedCount,
        conversionRate: conversionRate,
      });
    } catch (err) {
      console.error("Error fetching summary:", err);

      // Handle specific error messages
      if (err.message.includes("Unauthorized")) {
        toast.error("Session expired. Please login again.");
      } else if (err.message.includes("Forbidden")) {
        toast.error("You do not have permission to access this data.");
      } else if (err.message.includes("not found")) {
        toast.error("Agent not found or no data available.");
      } else if (err.message.includes("Server error")) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(`Failed to load summary data: ${err.message}`);
      }

      // Set default values on error
      setSummary({
        totalLeads: 0,
        goldLeads: 0,
        partialLeads: 0,
        mailedLeads: 0,
        conversionRate: 0,
      });
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchLeads(activeTab, filters, 1, perPage, true, purchased);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await leadsService.searchLeads(
        activeTab,
        searchTerm.trim(),
        1,
        perPage,
      );
      console.log("Search Response:", response);

      const leadsData = response.data || response.leads || [];

      const pagination = response.pagination || {};
      const total =
        pagination.total ||
        response.total ||
        response.total_count ||
        response.count ||
        0;
      const perPageFromAPI = pagination.per_page || perPage;
      const totalPagesCalc = Math.ceil(total / perPageFromAPI);

      setLeads(leadsData);
      setCurrentPage(1);
      setTotalRecords(total);
      setTotalPages(totalPagesCalc);

      // Show success message if search returned results
      if (leadsData.length > 0) {
        console.log(
          `Search successful: Found ${total} results for "${searchTerm}"`,
        );
      }
    } catch (err) {
      setError(`Search failed: ${err.message}`);
      console.error("Error searching leads:", err);
      setLeads([]);
      setTotalRecords(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    fetchLeads(activeTab, newFilters, 1, perPage, true, purchased);
  };

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedLeads([]);
    setSearchTerm("");
    setFilters({ lead_status: "", state: "", name: "", campaign: "" });
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchLeads(activeTab, filters, newPage, perPage, "", purchased);
    }
  };

  // Handle per page change
  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    fetchLeads(activeTab, filters, 1, newPerPage, true, purchased);
  };

  // Handle status change
  // Handle bulk status change

  // Handle add note

  // Handle lead selection
  const handleLeadSelection = (leadId) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId],
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((lead) => lead.assignee_id));
    }
  };
  console.log(selectedLeads);

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
  // Initial data fetch
  useEffect(() => {
    fetchSummary();
    // If user is agent and currently on mailed tab, redirect to rich tab
    if (userRole === "agent" && activeTab === "mailed") {
      setActiveTab("rich");
    }
  }, [userRole]);

  // Refetch when tab changes
  useEffect(() => {
    fetchLeads(activeTab, {}, 1, perPage, true, purchased);
  }, [activeTab]);

  useEffect(() => {
    getUsStates();
  }, []);
  // Handle search on Enter key
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter" && document.activeElement.type === "text") {
        handleSearch();
      }
    };

    document.addEventListener("keypress", handleKeyPress);
    return () => document.removeEventListener("keypress", handleKeyPress);
  }, [searchTerm, activeTab]);

  return (
    <div className="flex min-h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      {/* Sidebar */}
      <SharedSidebar currentPath="/side-leads" />

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0a2463] dark:text-blue-400">
                Lead Management
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Manage and track your leads across different categories
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex min-h-0 flex-1 flex-col p-6">
          {/* Tabs */}
          <div className="mb-6">
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`border-b-2 px-1 py-2 text-sm font-medium ${
                      activeTab === tab.id
                        ? "border-[#0a2463] text-[#0a2463] dark:border-blue-400 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
              <div className="flex flex-wrap gap-5">
                <Checkbox
                  label="View Market Place Leads"
                  onChange={(event) => {
                    fetchLeads(
                      activeTab,
                      filters,
                      1,
                      perPage,
                      true,
                      event.target.checked,
                    );
                    setPurchased(event.target.checked);
                    if (event.target.checked) {
                      setViewMarketPlace(true);
                      fetchSummary("market-place");
                    } else {
                      setViewMarketPlace(false);
                      fetchSummary();
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6 bg-white dark:bg-gray-800">
            <div className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon
                      className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 transform cursor-pointer text-gray-400 dark:text-gray-400"
                      onClick={handleSearch}
                    />
                    <input
                      type="text"
                      placeholder="Search by  Name..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        handleFilterChange("name", e.target.value);
                      }}
                      className={`w-full rounded-lg border bg-white py-2 pr-20 pl-10 text-gray-900 placeholder:text-gray-500 focus:border-[#0a2463] focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-400 ${
                        searchTerm.trim()
                          ? "border-[#0a2463] bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <select
                    value={filters.lead_status}
                    onChange={(e) =>
                      handleFilterChange("lead_status", e.target.value)
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                  >
                    <option value="all">All Statuses</option>
                    {LEAD_STATUSES.map((status) => (
                      <option key={status.label} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.state}
                    onChange={(e) =>
                      handleFilterChange("state", e.target.value)
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                  >
                    <option value="all">All States</option>
                    {states.map((status) => (
                      <option key={status.label} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Filter by Campaign"
                    value={filters.campaign}
                    onChange={(e) =>
                      handleFilterChange("campaign", e.target.value)
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:border-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Export Controls and Pagination Info */}
              <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedLeads.length > 0
                      ? `${selectedLeads.length} selected`
                      : ""}
                    {totalRecords > 0 && (
                      <>
                        {selectedLeads.length > 0 ? " • " : ""}
                        Showing {(currentPage - 1) * perPage + 1}-
                        {Math.min(currentPage * perPage, totalRecords)} of{" "}
                        {totalRecords} leads
                      </>
                    )}
                  </span>

                  <select
                    value={perPage}
                    onChange={(e) =>
                      handlePerPageChange(parseInt(e.target.value))
                    }
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={open}
                    disabled={selectedLeads.length === 0}
                    className={`flex items-center space-x-2 rounded-lg border px-4 py-2 transition-colors ${
                      selectedLeads.length === 0
                        ? "cursor-not-allowed border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <ArrowsRightLeftIcon className="h-4 w-4" />
                    <span>Copy/Move</span>
                  </button>

                </div>
              </div>
            </div>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Leads Table */}
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex-shrink-0 border-b border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#0a2463] dark:text-blue-400">
                  {tabs.find((tab) => tab.id === activeTab)?.label} (
                  {tabs.find((tab) => tab.id === activeTab)?.count})
                </h3>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedLeads.length === leads.length && leads.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-[#0a2463] focus:ring-[#0a2463] dark:text-blue-400"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Select All
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[#0a2463] dark:border-blue-400"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Loading leads...
                </p>
              </div>
            ) : (
              <>
                {/* Selected Leads Info */}
                {selectedLeads.length > 0 && (
                  <div className="border-b border-blue-200 bg-blue-50 px-6 py-2 dark:border-blue-800 dark:bg-blue-900/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        {selectedLeads.length} lead
                        {selectedLeads.length !== 1 ? "s" : ""} selected
                      </span>
                      <button
                        onClick={() => {
                          setSelectedLeads([]);
                        }}
                        className="text-xs text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                      >
                        Clear selection
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-auto">
                  <table className="w-full min-w-max">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="min-w-[60px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={
                              selectedLeads.length === leads.length &&
                              leads.length > 0
                            }
                            onChange={handleSelectAll}
                            className="h-4 w-4 rounded border-gray-300 text-[#0a2463] focus:ring-[#0a2463] dark:text-blue-400"
                            title="Select All"
                          />
                        </th>
                        <th className="min-w-[120px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          {!purchased ? "Identifier" : "Full Name"}
                        </th>
                        {!purchased && (
                          <th className="min-w-[150px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                            Campaign Name
                          </th>
                        )}

                        {activeTab !== "mailed" && (
                          <th className="min-w-[140px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                            Registered Date
                          </th>
                        )}
                        <th className="min-w-[120px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          Lead Status
                        </th>

                        <th className="min-w-[80px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          State
                        </th>
                        <th className="min-w-[80px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          Zip
                        </th>
                        <th className="min-w-[100px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                      {leads.length === 0 ? (
                        <tr>
                          <td
                            colSpan="20"
                            className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                          >
                            No leads found. Try adjusting your search or
                            filters.
                          </td>
                        </tr>
                      ) : (
                        leads.map((lead, index) => (
                          <tr
                            key={lead.assignee_id || index}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            {/* Select */}
                            <td className="px-3 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedLeads.includes(
                                  lead.assignee_id,
                                )}
                                onChange={() => {
                                  handleLeadSelection(lead.assignee_id);
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-[#0a2463] focus:ring-[#0a2463] dark:text-blue-400"
                              />
                            </td>

                            {/* Identifier */}
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {(() => {
                                  const avatarColors = [
                                    "#0a2463",
                                    "#5ab453",
                                    "#92c933",
                                    "#FF2ECF",
                                    "#E000AD",
                                    "#FFA71A",
                                    "#FF4F1A",
                                    "#384766",
                                    "#506877",
                                    "#3D4E70",
                                    "#4A4A4F",
                                    "#6D7EA1",
                                    "#70838F",
                                    "#B8008C",
                                    "#FF75DF",
                                  ];
                                  const color =
                                    avatarColors[
                                      leads.indexOf(lead) % avatarColors.length
                                    ];
                                  return (
                                    <div
                                      className="flex h-10 w-10 items-center justify-center rounded-full"
                                      style={{ backgroundColor: color }}
                                    >
                                      <span className="text-sm font-medium text-white">
                                        {lead.full_name
                                          ?.split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .toUpperCase() || "U"}
                                      </span>
                                    </div>
                                  );
                                })()}
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {lead.full_name}
                                  </div>
                                  {!purchased && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      ID:{" "}
                                      {lead.identifier ||
                                        lead.mortgage_id ||
                                        lead.assignee_id ||
                                        ""}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Campaign Name */}
                            {!purchased && (
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {lead.campaign_name || ""}
                                </div>
                              </td>
                            )}

                            {/* Registered Date */}
                            {activeTab !== "mailed" && (
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {lead.call_in_date_time || ""}
                                </div>
                              </td>
                            )}

                            <td className="px-3 py-4 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setStatusLead(lead);
                                  setNewStatus(
                                    lead.lead_status || lead.status || "",
                                  );
                                  setShowStatusModal(true);
                                }}
                                className={`inline-flex cursor-pointer rounded-full px-2 py-1 text-xs font-semibold transition-opacity hover:opacity-80 shieldnest-badge-${lead.lead_status || lead.status}`}
                                title="Click to change status"
                              >
                                {getStatusName(
                                  lead.lead_status || lead.status,
                                ) || ""}
                              </button>
                            </td>

                            {/* State */}
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {lead.state || ""}
                              </div>
                            </td>

                            {/* Zip */}
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {lead.zip || lead.zipcode || ""}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-3 py-4 text-sm font-medium whitespace-nowrap">
                              <button
                                onClick={() => setSelectedLead(lead)}
                                className="text-[#0a2463] hover:text-[#0a2463]/80 dark:text-blue-400 dark:hover:text-blue-300"
                                title="View Details"
                              >
                                <EyeIcon className="h-4 w-4" />
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
                  <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        Showing {(currentPage - 1) * perPage + 1} to{" "}
                        {Math.min(currentPage * perPage, totalRecords)} of{" "}
                        {totalRecords} results (Page {currentPage} of{" "}
                        {totalPages})
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className={`rounded border px-3 py-1 ${
                            currentPage <= 1
                              ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          <ChevronLeftIcon className="h-4 w-4" />
                        </button>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
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
                                className={`rounded border px-3 py-1 ${
                                  currentPage === pageNum
                                    ? "border-[#0a2463] bg-[#0a2463] text-white dark:border-blue-400 dark:bg-blue-500"
                                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          },
                        )}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                          className={`rounded border px-3 py-1 ${
                            currentPage >= totalPages
                              ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
          <CopyMoveModal isOpen={isOpen} close={close}/>
        </main>
      </div>
    </div>
  );
};

export default LeadBank;
