import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { Card, Checkbox } from "components/ui";
import SharedSidebar from "../components/SharedSidebar";
import { adminService, leadsService, stateService } from "utils/apiService";
import {
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import {
  LEAD_STATUS,
  LEAD_STATUSES,
  SOURCE_MAPPING,
} from "constants/app.constant";
import { toast } from "sonner";

const AgentLeads = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const user_id = searchParams.get("user");
  const source = { 1: "New MTG", 2: "RETRO MTG", 3: "FEX" };
  const [agent, setAgent] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("gold"); // Default to gold leads
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [filters, setFilters] = useState({
    lead_status: "",
    state: "",
    name: "",
    campaign: "",
  });
  const [states, setStates] = useState([]);
  const [printLeads, setPrintLeads] = useState([]);
  // Summary data for tabs
  const [summary, setSummary] = useState({
    goldLeads: 0,
    partialLeads: 0,
    mailedLeads: 0,
    totalLeads: 0,
  });
  const [purchased, setPurchased] = useState(false);
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
    if (!statusId) return "";
    return LEAD_STATUS[statusId] || statusId;
  };

  // Helper function to get source name from ID
  const getSourceName = (sourceId) => {
    if (!sourceId) return "";
    return SOURCE_MAPPING[sourceId] || sourceId;
  };

  // Tab configuration
  const tabs = [
    { id: "gold", label: "Completed", count: summary.goldLeads },
    { id: "partial", label: "Incomplete", count: summary.partialLeads },
    { id: "mailed", label: "Mailed Leads", count: summary.mailedLeads },
  ];

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
  useEffect(() => {
    fetchAgentData();
    fetchAgentSummary();
  }, [agentId]);

  useEffect(() => {
    fetchAgentLeads(1, 10, "gold", {}, false);
  }, []);

  const fetchAgentData = async () => {
    try {
      // Try to get agent details using the admin agents API with agentId as a filter
      console.log("Fetching agent data for agentId:", agentId);

      // First try the direct agent details endpoint
      let agentData = null;
      try {
        const response = await adminService.getAgentDetails(agentId);
        console.log("Agent details response:", response);
        agentData = response?.data?.data || response;
        console.log("Agent data from details endpoint:", agentData);
      } catch (detailsError) {
        console.log(
          "Agent details endpoint failed, trying agents list...",
          detailsError,
        );

        // Fallback: Get from agents list
        const agentsResponse = await adminService.getAgents({
          search: agentId,
          page: 1,
          limit: 10,
        });
        console.log("Agents list response:", agentsResponse);

        const agents = agentsResponse.data || agentsResponse.agents || [];
        agentData = agents.find(
          (agent) => agent.id == agentId || agent.agent_id == agentId,
        );
        console.log("Found agent from list:", agentData);
      }

      if (agentData) {
        // Normalize the agent data structure
        const normalizedAgent = {
          id: agentData.id || agentData.agent_id || agentId,
          name:
            agentData.name ||
            agentData.agent_name ||
            agentData.full_name ||
            `Agent ${agentId}`,
          email:
            agentData.email || agentData.agent_email || "Email not available",
          phone:
            agentData.phone ||
            agentData.agent_phone ||
            agentData.phone_number ||
            "Phone not available",
          role:
            agentData.role ||
            agentData.agent_role ||
            agentData.status ||
            "Agent",
        };

        console.log("Setting normalized agent data:", normalizedAgent);
        setAgent(normalizedAgent);
      } else {
        throw new Error("Agent not found");
      }
    } catch (error) {
      console.error("Error fetching agent details:", error);
      // Set fallback agent data so we can still show something
      const fallbackAgent = {
        id: agentId,
        name: `Agent ${agentId}`,
        email: "Email not available",
        phone: "Phone not available",
        role: "Agent",
      };
      console.log("Using fallback agent data:", fallbackAgent);
      setAgent(fallbackAgent);
    }
  };
  const fetchAgentSummary = async (text) => {
    try {
      const response = await leadsService.getAgentLeadsCount(
        agentId,
        1,
        text,
        user_id,
      );

      console.log("Summary API Response:", response);

      const data = response.data || response;

      console.log("data", data);

      const goldCount = data.completed || 0;
      const partialCount = data.incomplete || 0;
      const mailedCount = data.mailed || 0;
      const soldCount = data.sold || 0;
      const totalCount = goldCount + partialCount || 0;

      console.log("goldCount", soldCount);

      // Calculate conversion rate: ((Rich Leads + Partial Leads) / Total Leads) * 100
      const conversionRate =
        totalCount > 0
          ? (((goldCount + partialCount) / totalCount) * 100).toFixed(1)
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

  const fetchAgentLeads = async (
    page,
    per_page,
    active_tab,
    filter,
    purchase,
  ) => {
    console.log("test", filter);

    try {
      setLoading(true);

      const combinedFilters = Object.entries(filter).reduce((acc, item) => {
        if (item[1] && item[1] !== "all") {
          acc[item[0]] = item[1];
        }
        return acc;
      }, {});
      console.log("combined", combinedFilters);
      const response = await leadsService.getLeadsByAgent(
        agentId,
        active_tab,
        combinedFilters,
        page,
        per_page,
        purchase,
        user_id,
      );

      console.log("Agent leads response:", response);

      // Handle different response formats
      const leadsData = response.data || response.leads || [];

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

      setLeads(leadsData);
      setTotalRecords(total);
      setTotalPages(totalPagesCalc);
    } catch (error) {
      console.error("Error fetching agent leads:", error);
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
        if (item[1] && item[1] !== "all") {
          acc[item[0]] = item[1];
        }
        return acc;
      }, {});
      if (statusFilter !== "all") {
        combinedFilters.lead_status = statusFilter;
      }

      const response = await leadsService.getLeadsByAgent(
        agentId,
        activeTab,
        combinedFilters,
        1, // currentPage
        totalRecords,
        purchased,
        user_id,
      );

      console.log("Agent leads response:", response);

      // Handle different response formats
      const leadsData = response.data || response.leads || [];
      downloadCsv(leadsData);
      // Extract pagination info from API response
    } catch (error) {
      console.error("Error fetching agent leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchTerm("");
    setStatusFilter("all");
    setSelectedLeads([]);
    setFilters({ lead_status: "", state: "", name: "", campaign: "" });
    setCurrentPage(1);
    fetchAgentLeads(1, perPage, tabId, {}, purchased);
    setPrintLeads([]);
  };
  const handleTypeChange = (sts) => {
    setSearchTerm("");
    setStatusFilter("all");
    setSelectedLeads([]);
    setFilters({ lead_status: "", state: "", name: "", campaign: "" });
    setCurrentPage(1);
    fetchAgentLeads(1, perPage, activeTab, {}, sts);
    fetchAgentSummary(sts ? "market-place" : null);
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchAgentLeads(newPage, perPage, activeTab, filters, purchased);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    let newFilters = { ...filters };
    if (value) {
      newFilters = { ...filters, [filterKey]: value };
      setFilters(newFilters);
    } else {
      newFilters = { ...filters, [filterKey]: "" };
      setFilters(newFilters);
    }
    console.log(newFilters);
    setCurrentPage(1);
    fetchAgentLeads(1, perPage, activeTab, newFilters, purchased);
  };

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
      setPrintLeads([]);
    } else {
      setPrintLeads(leads);
      setSelectedLeads(leads.map((lead) => lead.assignee_id));
    }
  };

  // Handle per page change
  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    fetchAgentLeads(1, newPerPage, activeTab, filters, purchased);
  };

  // Helper functions to extract data from ivr_response
  const getIvrValue = (lead, field, defaultValue = "") => {
    // First try ivr_response (as mentioned in your requirements)
    if (lead.ivr_response && Object.keys(lead.ivr_response).length > 0) {
      //Array.isArray(lead.ivr_response) && lead.ivr_response.length > 0
      console.log("lead.ivr_response", lead.ivr_response);
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
    if (
      lead.ivr_logs &&
      Array.isArray(lead.ivr_logs) &&
      lead.ivr_logs.length > 0
    ) {
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
      setPrintLeads((prev) => [...prev, lead]);
    } else {
      setPrintLeads((prev) =>
        prev.filter((item) => item.assignee_id !== lead.assignee_id),
      );
    }
  };
  const downloadCsv = (csv) => {
    const data = csv ? csv : printLeads;
    const csvString = convertToCSV(data, columns);
    const blob = new Blob(["\uFEFF" + csvString], {
      type: "text/csv;charset=utf-8;",
    }); // BOM for Excel
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "lead_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  function escapeCSVValue(value) {
    if (value == null) return "";
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
    console.log("data-array", dataArray);
    let result = "";
    const columnDelimiter = ",";
    const lineDelimiter = "\n";

    // Add headers
    result +=
      columns.map((col) => escapeCSVValue(col.label)).join(columnDelimiter) +
      lineDelimiter;

    // Process each item
    dataArray.forEach((item) => {
      let ctr = 0;
      columns.forEach((key) => {
        if (ctr > 0) result += columnDelimiter;

        let val = item[key.customSelector];

        // Handle IVR response data for specific fields
        if (
          key.customSelector === "number" ||
          key.customSelector === "ani" ||
          key.customSelector === "age" ||
          key.customSelector === "health" ||
          key.customSelector === "coborrower" ||
          key.customSelector === "tobacco"
        ) {
          val = getIvrValue(item, key.customSelector);
          // Debug: Log the extracted IVR values for the first few items
          if (dataArray.indexOf(item) < 3) {
            console.log(
              `IVR ${key.customSelector} for lead ${item.mortgage_id}:`,
              val,
            );
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
        } else if (key.customSelector === 'call_in_date_time') {
          if (item.campaign_name.startsWith('SD')){
             result += 'N/A'
          } else {
            result += val
          }
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
      <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-800">
        <SharedSidebar currentPath="/admin/agents" />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="dark:text-white">Loading agent leads...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      {/* Sidebar */}
      <SharedSidebar currentPath="/admin/agents" />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin/agents")}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#0a2463] dark:text-blue-400">
                  Lead Management - Agent View
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                  Viewing leads for a specific agent across all categories
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Agent Info Banner */}
        {/* <div className="border-b border-gray-200 bg-gradient-to-r from-[#0a2463] to-[#f4d03f] p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm">
                  <span className="text-2xl font-bold text-white">
                    {agent?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") ||
                      agentId?.toString().slice(0, 2) ||
                      "A"}
                  </span>
                </div>
                <div>
                  <div className="mb-2 flex items-center space-x-3">
                    <h2 className="text-3xl font-bold">
                      {agent?.name || `Agent ${agentId}` || "Loading..."}
                    </h2>
                    <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                      Agent ID: {agentId}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-white/90">
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="h-4 w-4" />
                      <span>{agent?.email || "Email not available"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{agent?.phone || "Phone not available"}</span>
                    </div>
                    {(agent?.role || agent?.status) && (
                      <div className="rounded border border-white/30 bg-white/20 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                        {agent.role || agent.status || "Agent"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 text-center">
                <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">
                    {summary.totalLeads}
                  </div>
                  <div className="text-sm text-white/80">Total Leads</div>
                </div>
                <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">
                    {summary.goldLeads}
                  </div>
                  <div className="text-sm text-white/80">Completed Leads</div>
                </div>
                <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">
                    {summary.partialLeads}
                  </div>
                  <div className="text-sm text-white/80">Incomplete Leads</div>
                </div>
                <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">
                    {summary.mailedLeads}
                  </div>
                  <div className="text-sm text-white/80">Mailed Leads</div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-[#0a2463] to-[#f4d03f] p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col space-y-6 text-white lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              {/* Left Content */}
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm sm:mx-0">
                  <span className="text-2xl font-bold text-white">
                    {agent?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") ||
                      agentId?.toString().slice(0, 2) ||
                      "A"}
                  </span>
                </div>

                <div className="text-center sm:text-left">
                  <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                    <h2 className="text-3xl font-bold">
                      {agent?.name || `Agent ${agentId}` || "Loading..."}
                    </h2>
                    <span className="mt-2 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm sm:mt-0">
                      Agent ID: {agentId}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-2 text-white/90 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6">
                    <div className="flex items-center justify-center space-x-2 sm:justify-start">
                      <EnvelopeIcon className="h-4 w-4" />
                      <span>{agent?.email || "Email not available"}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 sm:justify-start">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{agent?.phone || "Phone not available"}</span>
                    </div>

                    {(agent?.role || agent?.status) && (
                      <div className="mx-auto rounded border border-white/30 bg-white/20 px-2 py-1 text-xs font-medium backdrop-blur-sm sm:mx-0">
                        {agent.role || agent.status}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4 lg:gap-6">
                <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{summary.totalLeads}</div>
                  <div className="text-sm text-white/80">Total Leads</div>
                </div>
                <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{summary.goldLeads}</div>
                  <div className="text-sm text-white/80">Completed Leads</div>
                </div>
                <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">
                    {summary.partialLeads}
                  </div>
                  <div className="text-sm text-white/80">Incomplete Leads</div>
                </div>
                <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">
                    {summary.mailedLeads}
                  </div>
                  <div className="text-sm text-white/80">Mailed Leads</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[var(--color-ecru-white)] p-6 dark:bg-gray-900">
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
                  label="View Lead Bank Leads"
                  onChange={(event) => {
                    setPurchased(event.target.checked);
                    handleTypeChange(event.target.checked);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <Card className="shieldnest-shadow mb-6 bg-white dark:bg-gray-800">
            <div className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search by  Name..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        handleFilterChange("name", e.target.value);
                      }}
                      className={`w-full rounded-lg border bg-white py-2 pr-20 pl-10 text-gray-900 focus:border-[#0a2463] focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-500 ${
                        searchTerm.trim()
                          ? "border-[#0a2463] bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      handleFilterChange("lead_status", e.target.value);
                      setStatusFilter(e.target.value);
                    }}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-500"
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
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-500"
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
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-500"
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
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
                    className={`flex items-center space-x-2 rounded-lg border px-4 py-2 transition-colors ${
                      selectedLeads.length === 0
                        ? "cursor-not-allowed border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>Export Selected</span>
                  </button>

                  <button
                    onClick={downloadAgentLeads}
                    disabled={totalRecords < 1}
                    className={`flex items-center space-x-2 rounded-lg border px-4 py-2 transition-colors ${
                      totalRecords < 1
                        ? "cursor-not-allowed border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>Export All</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Leads Table */}
          <Card className="shieldnest-shadow flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-gray-800">
            <div className="flex-shrink-0 border-b border-gray-200 p-6 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#0a2463] dark:text-blue-400">
                  {tabs.find((tab) => tab.id === activeTab)?.label} (
                  {totalRecords})
                </h3>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedLeads.length === leads.length && leads.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-[#0a2463] focus:ring-[#0a2463] dark:border-gray-600 dark:text-blue-500 dark:focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Select All
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[#0a2463] dark:border-blue-500"></div>
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
                      <span className="text-sm text-blue-700 dark:text-blue-400">
                        {selectedLeads.length} lead
                        {selectedLeads.length !== 1 ? "s" : ""} selected
                      </span>
                      <button
                        onClick={() => {
                          setSelectedLeads([]);
                          setPrintLeads([]);
                        }}
                        className="text-xs text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Clear selection
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-auto">
                  <table className="shieldnest-shadow w-full min-w-max bg-white dark:bg-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="min-w-[60px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
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
                        {!purchased && (
                          <>
                            <th className="min-w-[120px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                              Identifier
                            </th>
                            <th className="min-w-[150px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                              Campaign Name
                            </th>
                          </>
                        )}
                        <th className="min-w-[150px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          Full Name
                        </th>
                        <th className="min-w-[100px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          Source
                        </th>
                        {activeTab !== "mailed" && (
                          <th className="min-w-[140px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                            Registered Date
                          </th>
                        )}
                        <th className="min-w-[120px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          Lead Status
                        </th>
                        <th className="min-w-[150px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          Address
                        </th>
                        {activeTab !== "mailed" && (
                          <>
                            <th className="min-w-[140px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                              Lead Phone
                            </th>
                            <th className="min-w-[140px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                              From Phone
                            </th>
                          </>
                        )}
                        <th className="min-w-[100px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800">
                      {leads.length === 0 ? (
                        <tr>
                          <td
                            colSpan="10"
                            className="px-6 py-8 text-center text-gray-500 dark:text-gray-300"
                          >
                            No leads found for this agent. Try adjusting your
                            search or filters.
                          </td>
                        </tr>
                      ) : (
                        leads.map((lead, index) =>{ 
                          return (
                          <tr
                            key={lead.assignee_id || index}
                            // className="hover:bg-gray-50 hover:text-[#0a2463]"
                          >
                            {/* Select */}
                            <td className="px-3 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedLeads.includes(
                                  lead.assignee_id,
                                )}
                                onChange={(event) => {
                                  handleLeadSelection(lead.assignee_id);
                                  handlePrintLead(event, lead);
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-[#0a2463] focus:ring-[#0a2463]"
                              />
                            </td>

                            {/* Identifier */}
                            {!purchased && (
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {lead.identifier ||
                                    lead.mortgage_id ||
                                    lead.assignee_id ||
                                    ""}
                                </div>
                              </td>
                            )}

                            {/* Campaign Name */}
                            {!purchased && (
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {lead.campaign_name || ""}
                                </div>
                              </td>
                            )}

                            {/* Full Name */}
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {lead.lead_full_name ||
                                  (lead.first_name && lead.last_name
                                    ? `${lead.first_name} ${lead.last_name}`
                                    : "") ||
                                  ""}
                              </div>
                            </td>

                            {/* Source */}
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {getSourceName(lead.source_id)}
                              </div>
                            </td>

                            {/* Registered Date */}
                            {activeTab !== "mailed" && (
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-gray-100">
                                  {lead.campaign_name?.startsWith('SD') ? 'N/A' : lead.call_in_date_time}
                                </div>
                              </td>
                            )}
                            {/* Lead Status */}
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold shieldnest-badge-${lead.lead_status || lead.status}`}
                              >
                                {getStatusName(
                                  lead.lead_status || lead.status,
                                ) || ""}
                              </span>
                            </td>

                            {/* Address */}
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {lead.client_address || lead.address || ""}
                              </div>
                            </td>

                            {/* Lead Phone */}
                            {activeTab !== "mailed" && (
                              <>
                                <td className="px-3 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {getIvrValue(lead, "number") || ""}
                                  </div>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {getIvrValue(lead, "ani") || ""}
                                  </div>
                                </td>
                              </>
                            )}
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
                        )})
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
                              ? "cursor-not-allowed border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500"
                              : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          <ChevronLeftIcon className="h-4 w-4" />
                        </button>

                        {/* Page Numbers */}
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
                                    ? "border-[#0a2463] bg-[#0a2463] text-white dark:border-blue-500 dark:bg-blue-600"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
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
                              ? "cursor-not-allowed border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500"
                              : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
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
        </main>
      </div>

      {/* Lead Detail Modal (similar to Lead Management page) */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600/65 dark:bg-black/75"
          style={{ width: " 100vw" }}
        >
          <div className="relative top-10 mx-auto mb-10 w-11/12 max-w-4xl rounded-lg border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0a2463] dark:bg-blue-600">
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
                  <h3 className="text-2xl font-bold text-[#0a2463] dark:text-blue-400">
                    {selectedLead.full_name || selectedLead.name || "Unknown"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedLead.email ||
                      getIvrValue(selectedLead, "number") ||
                      "No contact info"}
                  </p>
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
                        ID:{" "}
                        {selectedLead.identifier ||
                          selectedLead.mortgage_id ||
                          selectedLead.assignee_id ||
                          ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Basic Information */}
                <div>
                  <h4 className="mb-4 text-lg font-semibold text-[#0a2463] dark:text-blue-400">
                    Basic Information
                  </h4>
                  <div className="space-y-3">
                    {!purchased && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Identifier
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {selectedLead.identifier ||
                            selectedLead.mortgage_id ||
                            selectedLead.assignee_id ||
                            ""}
                        </p>
                      </div>
                    )}
                    {!purchased && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Campaign Name
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {selectedLead.campaign_name || ""}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Full Name
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedLead.full_name || selectedLead.name || ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Source
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {source[selectedLead.source_id] || "N/A"}
                      </p>
                    </div>
                    {activeTab !== "mailed" && !selectedLead.campaign_name.startsWith('SD') && (
                      <div>
                        <p className="text-sm text-gray-500">Registered Date</p>
                        <p className="font-medium">
                          {selectedLead.call_in_date_time || ""}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Lead Status</p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold shieldnest-badge-${selectedLead.lead_status || selectedLead.status}`}
                      >
                        {getStatusName(
                          selectedLead.lead_status || selectedLead.status,
                        ) || ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact & Location */}
                <div>
                  <h4 className="mb-4 text-lg font-semibold text-[#0a2463] dark:text-blue-400">
                    Contact & Location
                  </h4>
                  <div className="space-y-3">
                    {activeTab !== "mailed" && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">
                            Lead Phone Number
                          </p>
                          <p className="font-medium">
                            {getIvrValue(selectedLead, "number") || ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            From Phone Number
                          </p>
                          <p className="font-medium">
                            {getIvrValue(selectedLead, "ani") || ""}
                          </p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Client Address</p>
                      <p className="font-medium">
                        {selectedLead.client_address ||
                          selectedLead.address ||
                          ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="font-medium">{selectedLead.city || ""}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">State</p>
                      <p className="font-medium">{selectedLead.state || ""}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Zip Code</p>
                      <p className="font-medium">
                        {selectedLead.zip || selectedLead.zipcode || ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Loan Information */}
                <div>
                  <h4 className="mb-4 text-lg font-semibold text-[#0a2463] dark:text-blue-400">
                    Loan Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Loan Amount</p>
                      <p className="font-medium">
                        {selectedLead.loan_amount
                          ? `$${selectedLead.loan_amount}`
                          : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Loan Date</p>
                      <p className="font-medium">
                        {selectedLead.loan_date || ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lender Name</p>
                      <p className="font-medium">
                        {selectedLead.lender_name || ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Borrower Age</p>
                      <p className="font-medium">
                        {getIvrValue(selectedLead, "age") || ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Lead Category:{" "}
                {tabs.find((item) => item.id === activeTab).label || ""}
              </span>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
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
