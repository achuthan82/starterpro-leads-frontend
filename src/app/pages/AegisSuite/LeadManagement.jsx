import { useState, useEffect, Fragment } from "react";
import { Card, Checkbox } from "components/ui";
import SharedSidebar from "./components/SharedSidebar";
import { leadsService, stateService } from "utils/apiService";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import {
  UserGroupIcon,
  EyeIcon,
  XMarkIcon,
  // PlusIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { LEAD_STATUS, LEAD_STATUSES } from "constants/app.constant";
import { JWT_HOST_API } from "configs/auth.config";
import LeadDetailsModal from "./LeadDetailsModal";
import { useAuthContext } from "app/contexts/auth/context";

const LeadManagement = () => {
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
  const [viewMarketPlace, setViewMarketPlace] = useState(false)
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [printLeads, setPrintLeads] = useState([]);
  const [purchased, setPurchased] = useState(false);
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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusLead, setStatusLead] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Bulk status update modal states
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [bulkNewStatus, setBulkNewStatus] = useState("");
  const [statusHistory, setStatusHistory] = useState([]);

  // Available statuses as per requirements
  /*const LEAD_STATUSES = [
    { value: 1, label: 'First call' },
    { value: 2, label: 'Second call' },
    { value: 3, label: 'Third Call' },
    { value: 4, label: 'Sold' },
    { value: 5, label: 'Not interested' },
    { value: 6, label: 'Text' },
    { value: 7, label: 'Appointment' },
    { value: 8, label: 'Sit/No Sale' },
    { value: 9, label: 'No Show' },
    { value: 10, label: 'DNC' }
  ];*/
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
    { label: "Age", customSelector: "age" },
    { label: "Medical Condition", customSelector: "health" },
    { label: "Co-borrower", customSelector: "coborrower" },
    { label: "Smoker", customSelector: "tobacco" },
  ];
  // Status ID to Name mapping
  /*const STATUS_MAPPING = {
    1: 'First call',
    2: 'Second call',
    3: 'Third Call',
    4: 'Sold',
    5: 'Not interested',
    6: 'Text',
    7: 'Appointment',
    8: 'Sit/No Sale',
    9: 'No Show',
    10: 'DNC'
  };*/

  // Name to Status ID mapping (reverse mapping)
  /*const STATUS_NAME_TO_ID = {
    'First call': 1,
    'Second call': 2,
    'Third Call': 3,
    'Sold': 4,
    'Not interested': 5,
    'Text': 6,
    'Appointment': 7,
    'Sit/No Sale': 8,
    'No Show': 9,
    'DNC': 10
  };*/

  // Helper function to get status name from ID
  const getStatusName = (statusId) => {
    if (!statusId) return "";
    return LEAD_STATUS[statusId] || statusId;
  };

  // Helper function to get status ID from name
  /*const getStatusId = (statusName) => {
    if (!statusName) return null;
    return STATUS_NAME_TO_ID[statusName] || null;
  };*/

  // Helper functions to extract data from ivr_response
  const getIvrValue = (lead, field, defaultValue = "") => {
    // First try ivr_response (as mentioned in your requirements)
    if (lead.ivr_response && Object.keys(lead.ivr_response).length > 0) {
      // Array.isArray(lead.ivr_response) && lead.ivr_response.length > 0
      // Get the latest (most recent) ivr_response entry
      const latestResponse = lead.ivr_response;
      if (field === "number" || field === "ani") {
        return latestResponse["number"] || latestResponse["ani"] || "";
      } else if (latestResponse[field] !== undefined) {
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

  /*const getBorrowerAge = (lead) => getIvrValue(lead, 'age');
   const getMedicalIssues = (lead) => {
     const health = getIvrValue(lead, 'health');
     // Handle both string and number values
     if (health === 1 || health === '1') return 'Yes';
     if (health === 0 || health === '0') return 'No';
     return '';
   };
   const getTobaccoUse = (lead) => {
     const tobacco = getIvrValue(lead, 'tobacco');
     // Handle both string and number values
     if (tobacco === 1 || tobacco === '1') return 'Yes';
     if (tobacco === 0 || tobacco === '0') return 'No';
     return '';
   };
   const getCoBorrower = (lead) => {
     const coborrower = getIvrValue(lead, 'coborrower');
     // Handle both string and number values
     if (coborrower === 1 || coborrower === '1') return 'Yes';
     if (coborrower === 0 || coborrower === '0') return 'No';
     return '';
   };
   const getLeadPhone = (lead) => getIvrValue(lead, 'ani');
   const getBorrowerPhone = (lead) => getIvrValue(lead, 'number');*/

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
  const fetchStatusHistory = async (agentId, assigneeId) => {
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
  };

  // Fetch summary data for all categories
  const fetchSummary = async (text = null) => {
    try {
      // Get agent ID from localStorage
      /*const agentId = getAgentId();
      if (!agentId) {
        console.error('No agent ID found. Cannot fetch summary data.');
        setSummary({
          totalLeads: 0,
          goldLeads: 0,
          partialLeads: 0,
          mailedLeads: 0,
          conversionRate: 0
        });
        return;
      }

      console.log('Fetching summary data for agent ID:', agentId);*/

      // Call the new API endpoint
      const response = await leadsService.getAgentLeadsCount(null, 1, text);

      console.log("Summary API Response:", response);

      // Extract data from the response
      // Assuming the API returns data in this format:
      // { data: { total_leads: 100, gold_leads: 30, partial_leads: 20, mailed_leads: 50 } }
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
    setPrintLeads([]);
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
  const [statusLoading, setStatusLoading] = useState(false);
  const handleStatusChange = async () => {
    if (!statusLead || !newStatus) return;
    setStatusLoading(true);
    try {
      // Prepare payload
      const agentId = statusLead.agent_id || statusLead.agentId;
      const assigneeId = statusLead.assignee_id || statusLead.assigneeId;
      const mortgageId =
        statusLead.mortgage_id ||
        statusLead.identifier ||
        statusLead.assignee_id;
      if (!agentId || !mortgageId) {
        toast.error("Missing agent or mortgage ID");
        setStatusLoading(false);
        return;
      }
      const payload = {
        agent_id: agentId,
        lead_status: Number(newStatus),
        mortgage_ids: [mortgageId],
      };
      // Call API (category=1)
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
        setShowStatusModal(false);
        setStatusLead(null);
        setNewStatus("");
        fetchSummary(viewMarketPlace ? 'market-place' : null);
        fetchLeads(activeTab, filters, currentPage, perPage, false, purchased);
        fetchStatusHistory(agentId, assigneeId);
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = async () => {
    if (selectedLeads.length === 0 || !bulkNewStatus) return;

    console.log("selectedLeads", selectedLeads);
    console.log("bulkNewStatus", bulkNewStatus);

    try {
      // Get the status ID from status name
      // const statusId = getStatusId(bulkNewStatus);
      const statusId = bulkNewStatus;
      if (!statusId) {
        toast.error("Invalid status selected");
        return;
      }

      // Get selected leads with their data
      const selectedLeadsData = leads.filter((lead) =>
        selectedLeads.includes(lead.assignee_id),
      );

      // Check if all selected leads have agent_id
      const leadsWithoutAgentId = selectedLeadsData.filter(
        (lead) => !lead.agent_id && !lead.agentId,
      );
      if (leadsWithoutAgentId.length > 0) {
        toast.error(
          `Some selected leads are missing agent ID. Please contact support. (${leadsWithoutAgentId.length} leads)`,
        );
        return;
      }

      // Group leads by agent_id since we need to make separate API calls for different agents
      const leadsByAgent = {};
      selectedLeadsData.forEach((lead) => {
        const agentId = lead.agent_id || lead.agentId;
        if (!leadsByAgent[agentId]) {
          leadsByAgent[agentId] = [];
        }
        leadsByAgent[agentId].push(
          lead.mortgage_id || lead.identifier || lead.assignee_id,
        );
      });

      // Make API calls for each agent group
      const updatePromises = Object.entries(leadsByAgent).map(
        ([agentId, mortgageIds]) => {
          const validMortgageIds = mortgageIds.filter((id) => id);
          if (validMortgageIds.length === 0) return Promise.resolve();

          console.log("Bulk status update:", {
            mortgageIds: validMortgageIds,
            statusId,
            agentId: parseInt(agentId),
          });
          return leadsService.updateLeadStatusBulk(
            validMortgageIds,
            statusId,
            parseInt(agentId),
          );
        },
      );

      await Promise.all(updatePromises);

      setShowBulkStatusModal(false);
      setBulkNewStatus("");
      setSelectedLeads([]);
      setPrintLeads([]);
      fetchSummary(viewMarketPlace ? 'market-place' : null);
      fetchLeads(activeTab, filters, currentPage, perPage, false, purchased); // Refresh the list
      toast.success(
        `Status updated successfully for ${selectedLeadsData.length} leads!`,
      );
    } catch (err) {
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

  // Handle add note
  const handleAddNote = async (mortgageId, notes, agentId) => {
    if (!mortgageId || !agentId) return;
    try {
      const response = await leadsService.updateLeadNote(
        mortgageId,
        notes,
        agentId,
      );
      console.log("Note update response:", response);
      fetchLeads(activeTab, filters, currentPage, perPage, false, purchased); // Refresh the list
      toast.success(
        `Note updated successfully for ${selectedLead.full_name} lead!`,
      );
    } catch (err) {
      toast.error(`Failed to update note: ${err.message}`);
    }
  };

  const handlePrintLead = (event, lead) => {
    if (event.target.checked) {
      setPrintLeads((prev) => [...prev, lead]);
    } else {
      setPrintLeads((prev) =>
        prev.filter((item) => item.assignee_id !== lead.assignee_id),
      );
    }
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
      setSelectedLeads(leads.map((lead) => lead.assignee_id));
      setPrintLeads(leads);
    }
  };
  console.log(selectedLeads);
  const downloadAgentLeads = async (
    category = activeTab,
    appliedFilters = filters,
    page = 1,
  ) => {
    setError(null);

    try {
      const response = await leadsService.getLeadsByCategory(
        category,
        appliedFilters,
        page,
        totalRecords,
        purchased,
      );

      console.log("API Response:", response);

      // Handle different response formats
      const leadsData = response.data || response.leads || [];

      // Debug: Log the first lead to see data structure
      if (leadsData.length > 0) {
        downloadCsv(leadsData);
      }

      // Extract pagination info from API response
    } catch (err) {
      console.log(err);
      setError(`Failed to fetch `);
    } finally {
      setLoading(false);
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
    setPrintLeads([]);
    setSelectedLeads([]);
    toast.success(
      `${tabs.find((item) => item.id === activeTab).label} leads exported successfully`,
    );
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
  // Get status badge class
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
      'Sit/No Sale': 'bg-gray-100 text-gray-800 dark:text-gray-100',
      'No Show': 'bg-red-100 text-red-800',
      'DNC': 'bg-gray-100 text-gray-800 dark:text-gray-100',
    };
    return statusClasses[statusName] || 'bg-gray-100 text-gray-800 dark:text-gray-100';
  };*/

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
      <SharedSidebar currentPath="/lead-management" />

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
            <div className="flex items-center space-x-3">
              {/* <button
                onClick={() => alert('Add New Lead form would open here')}
                className="bg-[#f4d03f] text-white px-4 py-2 rounded-lg hover:bg-[#e6c035] transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Lead</span>
              </button> */}

              {/* Bulk Actions Button */}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex min-h-0 flex-1 flex-col p-6">
          {/* Summary Cards */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-${userRole === "admin" ? "4" : "3"} mb-6 gap-6`}
          >
            {(() => {
              const borderColors = [
                "#0a2463",
                "#f4d03f",
                "#0a2463",
                "#f4d03f",
                "#0a2463",
                "#f4d03f",
                "#0a2463",
                "#f4d03f",
                "#0a2463",
                "#f4d03f",
                "#0a2463",
                "#f4d03f",
                "#0a2463",
                "#f4d03f",
                "#0a2463",
              ];
              const summaryCards = [
                {
                  label: "Total Leads",
                  value: summary.totalLeads,
                  icon: (
                    <UserGroupIcon className="text-shieldnest-bg1 h-8 w-8" />
                  ),
                },
                {
                  label: "Completed Leads",
                  value: summary.goldLeads,
                  icon: (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                      <div className="h-4 w-4 rounded-full bg-[#f4d03f]"></div>
                    </div>
                  ),
                },
                {
                  label: "Incomplete Leads",
                  value: summary.partialLeads,
                  icon: (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <div className="h-4 w-4 rounded-full bg-[#0a2463]"></div>
                    </div>
                  ),
                },
                // Only show Conversion Rate card for admin users (since it includes mailed leads)
                ...(userRole === "admin"
                  ? [
                      {
                        label: "Conversion Rate",
                        value: summary.conversionRate + "%",
                        icon: (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                            <div className="h-4 w-4 rounded-full bg-[#f4d03f]"></div>
                          </div>
                        ),
                      },
                    ]
                  : []),
              ];
              return summaryCards.map((card, idx) => (
                <Card
                  key={card.label}
                  className="shieldnest-white-column p-6"
                  style={{
                    borderLeft: `5px solid ${borderColors[idx % borderColors.length]}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {card.label}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                        {card.value}
                      </p>
                    </div>
                    {card.icon}
                  </div>
                </Card>
              ));
            })()}
          </div>

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
                      setViewMarketPlace(true)
                      fetchSummary("market-place");
                    } else {
                      setViewMarketPlace(false)
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
                  {/* <input
                    type="text"
                    placeholder="Filter by State"
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#0a2463] focus:outline-none"
                  /> */}

                  {/* <input
                    type="text"
                    placeholder="Filter by Name"
                    value={filters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#0a2463] focus:outline-none"
                  /> */}

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
                    onClick={() => downloadCsv()}
                    disabled={selectedLeads.length === 0}
                    className={`flex items-center space-x-2 rounded-lg border px-4 py-2 transition-colors ${
                      selectedLeads.length === 0
                        ? "cursor-not-allowed border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>Export Selected</span>
                  </button>

                  <button
                    disabled={totalRecords < 1}
                    onClick={() => downloadAgentLeads()}
                    // style={{ backgroundColor: 'var(--atoll)' }}
                    className={`flex items-center space-x-2 rounded-lg border px-4 py-2 transition-colors ${
                      totalRecords < 1
                        ? "cursor-not-allowed border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>Export All</span>
                  </button>
                  {selectedLeads.length > 0 && (
                    <button
                      onClick={() => setShowBulkStatusModal(true)}
                      className="flex items-center space-x-2 rounded-lg bg-[#0a2463] px-4 py-2 text-white transition-colors hover:bg-[#0a2463]/90 dark:bg-gray-700"
                    >
                      <span>Update Status ({selectedLeads.length})</span>
                    </button>
                  )}
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
                          setPrintLeads([]);
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
                        {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[150px]">
                          Full Name
                        </th> */}
                        {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">
                          Source
                        </th> */}
                        {activeTab !== "mailed" && (
                          <th className="min-w-[140px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                            Registered Date
                          </th>
                        )}
                        <th className="min-w-[120px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          Lead Status
                        </th>
                        {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[150px]">
                          Address
                        </th> */}
                        <th className="min-w-[80px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          State
                        </th>
                        <th className="min-w-[80px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                          Zip
                        </th>
                        {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                          Loan Amount
                        </th> */}
                        {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                          Loan Date
                        </th> */}
                        {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                          Lender Name
                        </th> */}
                        {/* <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">
                          Borrower Age
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                          Medical Issues
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                          Tobacco Use
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                          Co-Borrower
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[140px]">
                          Lead Phone
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[140px]">
                          Borrower Phone
                        </th> */}
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
                                onChange={(event) => {
                                  handleLeadSelection(lead.assignee_id);
                                  handlePrintLead(event, lead);
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-[#0a2463] focus:ring-[#0a2463] dark:text-blue-400"
                              />
                            </td>

                            {/* Identifier */}
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {/* <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {lead.identifier || lead.mortgage_id || lead.assignee_id || ''}
                                </div> */}
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

                            {/* Full Name */}
                            {/* <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {lead.lead_full_name || (lead.first_name && lead.last_name ? `${lead.first_name} ${lead.last_name}` : '') || ''}
                              </div>
                            </td> */}

                            {/* Source */}
                            {/* <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">{getSourceName(lead.source_id) || ''}</div>
                            </td> */}

                            {/* Registered Date */}
                            {activeTab !== "mailed" && (
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {lead.call_in_date_time || ""}
                                </div>
                              </td>
                            )}

                            {/* Lead Status */}
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

                            {/* Address */}
                            {/* <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {lead.client_address || lead.address || ''}
                              </div>
                            </td> */}

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

                            {/* Loan Amount */}
                            {/* <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {lead.loan_amount ? `$${lead.loan_amount}` : ''}
                              </div>
                            </td> */}

                            {/* Loan Date */}
                            {/* <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {lead.loan_date || ''}
                              </div>
                            </td> */}

                            {/* Lender Name */}
                            {/* <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {lead.lender_name || ''}
                              </div>
                            </td> */}

                            {/* Borrower Age */}
                            {/* <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {getBorrowerAge(lead) || ''}
                              </div>
                            </td> */}

                            {/* Medical Issues */}
                            {/* <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {getMedicalIssues(lead) || ''}
                              </div>
                            </td>

                            {/* Tobacco Use */}
                            {/* <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {getTobaccoUse(lead) || ''}
                              </div>
                            </td> */}

                            {/* Co-Borrower */}
                            {/* <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {getCoBorrower(lead) || ''}
                              </div>
                            </td> */}

                            {/* Lead Phone */}
                            {/* <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {getLeadPhone(lead) || lead.lead_phone_number || lead.phone || ''}
                              </div>
                            </td> */}

                            {/* Borrower Phone */}
                            {/* <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {getBorrowerPhone(lead) || lead.borrower_phone || ''}
                              </div>
                            </td> */}

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
        </main>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailsModal
          purchased={purchased}
          selectedLead={selectedLead}
          activeTab={activeTab}
          statusHistory={statusHistory}
          handleAddNote={handleAddNote}
          fetchStatusHistory={fetchStatusHistory}
          setSelectedLead={setSelectedLead}
          setNewStatus={setNewStatus}
          setShowStatusModal={setShowStatusModal}
          getStatusName={getStatusName}
          setStatusLead={setStatusLead}
          tabs={tabs}
        />
      )}

      {/* Status Change Modal */}
      {showStatusModal && statusLead && (
        <Transition appear show={showStatusModal} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
            onClose={() => setShowStatusModal(false)}
          >
            {/* Overlay */}
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
            </TransitionChild>

            {/* Modal Content */}
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="dark:bg-dark-700 relative w-full max-w-lg rounded-2xl bg-white px-6 py-8 shadow-xl transition-all sm:px-8">
                {/* Close Icon */}
                <div className="absolute top-4 right-4">
                  <XCircleIcon
                    onClick={() => setShowStatusModal(false)}
                    className="text-dark h-7 w-7 cursor-pointer transition-transform hover:scale-105"
                  />
                </div>

                {/* Heading */}
                <DialogTitle
                  as="h3"
                  className="text-center text-2xl font-semibold text-gray-800 dark:text-white"
                >
                  Change Lead Status
                </DialogTitle>

                <div className="py-4">
                  <div className="mb-4">
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                      Lead: {statusLead.full_name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Current Status:{" "}
                      {LEAD_STATUS[statusLead.lead_status] || "Unknown"}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                    >
                      <option value="">Select Status</option>
                      {LEAD_STATUSES.map((status) => (
                        <option key={status?.value} value={status?.value}>
                          {status?.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusChange}
                    disabled={!newStatus || statusLoading}
                    className={`rounded-md px-4 py-2 text-sm ${
                      newStatus && !statusLoading
                        ? "bg-[#0a2463] text-white hover:bg-[#0a2463]/90 dark:bg-blue-500 dark:hover:bg-blue-600"
                        : "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {statusLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="mr-2 h-4 w-4 animate-spin text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      "Update Status"
                    )}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </Dialog>
        </Transition>
      )}

      {/* Bulk Status Change Modal */}
      {showBulkStatusModal && selectedLeads.length > 0 && (
        <Transition appear show={showBulkStatusModal} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
            onClose={() => setShowBulkStatusModal(false)}
          >
            {/* Overlay */}
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
            </TransitionChild>

            {/* Modal Content */}
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="dark:bg-dark-700 relative w-full max-w-lg rounded-2xl bg-white px-6 py-8 shadow-xl transition-all sm:px-8">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-[#0a2463] dark:text-blue-400">
                    Bulk Status Update
                  </h3>
                  <button
                    onClick={() => setShowBulkStatusModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="py-4">
                  <div className="mb-4">
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                      Selected Leads: {selectedLeads.length}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This will update the status for all selected leads.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Status
                    </label>
                    <select
                      value={bulkNewStatus}
                      onChange={(e) => setBulkNewStatus(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                    >
                      <option value="">Select Status</option>
                      {LEAD_STATUSES.map((status) => (
                        <option key={status?.value} value={status?.value}>
                          {status?.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                  <button
                    onClick={() => setShowBulkStatusModal(false)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkStatusChange}
                    disabled={!bulkNewStatus}
                    className={`rounded-md px-4 py-2 text-sm ${
                      bulkNewStatus
                        ? "bg-[#0a2463] text-white hover:bg-[#0a2463]/90 dark:bg-blue-500 dark:hover:bg-blue-600"
                        : "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                    }`}
                  >
                    Update {selectedLeads.length} Leads
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </Dialog>
        </Transition>
      )}
    </div>
  );
};

export default LeadManagement;
