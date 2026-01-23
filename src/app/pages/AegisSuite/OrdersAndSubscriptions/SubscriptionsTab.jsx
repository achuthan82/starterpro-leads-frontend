import { useState, useEffect, useCallback } from "react";
import { Card } from "components/ui";
import {
  // MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PauseIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import ReactPaginate from "react-paginate";
import orderSubscriptionService from "utils/orderSubscriptionService";

const SubscriptionsTab = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  // const [searchTerm, setSearchTerm] = useState('');

  // Get user ID from localStorage
  const getUserId = () => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id || user.user_id;
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    return null;
  };

  // Get system timezone
  const getSystemTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  // Fetch subscriptions from API
  const fetchSubscriptions = useCallback(
    async (page = 1, status = "all", search = "") => {
      const userId = getUserId();
      if (!userId) {
        setError("User ID not found. Please login again.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = {
          timezone: getSystemTimezone() === 'Asia/Calcutta' ? 'Asia/Kolkata' : getSystemTimezone(),
          page: page,
          per_page: perPage,
        };

        // Add status filter if not 'all'
        if (status !== "all") {
          params.status = status;
        }

        // Add search term if provided
        if (search.trim()) {
          params.search = search.trim();
        }

        console.log("Fetching subscriptions with params:", params);

        const response = await orderSubscriptionService.getSubscriptions(
          userId,
          params,
        );
        console.log("Subscriptions API response:", response);

        if (response.status === 200 || response.status === 0) {
          const subscriptionsData = response.data || [];
          const pagination = response.pagination || {};

          setSubscriptions(subscriptionsData);
          setTotalRecords(pagination.total || 0);
          setTotalPages(Math.ceil((pagination.total || 0) / perPage));
        } else if (response.status === 204) {
          setSubscriptions([]);
          setTotalRecords(0);
          setTotalPages(1);
        } else {
          throw new Error(response.message || "Failed to fetch subscriptions");
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);

        // Handle specific error cases
        if (error.response?.status === 401) {
          setError("Session expired. Please login again.");
          toast.error("Session expired. Please login again.");
        } else if (error.response?.status === 403) {
          setError("You do not have permission to access this data.");
          toast.error("You do not have permission to access this data.");
        } else if (error.response?.status === 404) {
          setError("Subscriptions not found.");
          toast.error("Subscriptions not found.");
        } else {
          setError(`Failed to fetch subscriptions: ${error.message}`);
          toast.error(`Failed to fetch subscriptions: ${error.message}`);
        }

        setSubscriptions([]);
        setTotalRecords(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [perPage],
  );

  // Initial data fetch
  useEffect(() => {
    fetchSubscriptions(1, statusFilter);
  }, [fetchSubscriptions, statusFilter]);

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page.selected);
    fetchSubscriptions(page.selected + 1, statusFilter);
  };

  // Handle per page change
  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(0);
    fetchSubscriptions(1, statusFilter);
  };

  // Handle status filter change
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(0);
    fetchSubscriptions(1, status);
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(0);
    fetchSubscriptions(1, statusFilter);
  };

  // Handle search on Enter key
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter" && document.activeElement.type === "text") {
        handleSearch();
      }
    };

    document.addEventListener("keypress", handleKeyPress);
    return () => document.removeEventListener("keypress", handleKeyPress);
  }, [statusFilter]);

  // Get subscription status badge
  const getSubscriptionStatusBadge = (status) => {
    const statusConfig = {
      active: {
        icon: CheckCircleIcon,
        color: "bg-green-100 text-green-800",
        label: "Active",
      },
      canceled: {
        icon: XCircleIcon,
        color: "bg-red-100 text-red-800",
        label: "Canceled",
      },
      paused: {
        icon: PauseIcon,
        color: "bg-yellow-100 text-yellow-800",
        label: "Paused",
      },
      expired: {
        icon: ExclamationTriangleIcon,
        color: "bg-orange-100 text-orange-800",
        label: "Expired",
      },
    };

    const config = statusConfig[status] || {
      icon: ClockIcon,
      color: "bg-gray-100 text-gray-800",
      label: status || "Pending",
    };

    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
      >
        <IconComponent className="mr-1 h-3 w-3" />
        {config.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.log(error);
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount); // Assuming amount is in cents
  };

  // Helper function to escape CSV values
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return "";
    const stringValue = String(value);
    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Format states array for CSV export
  const formatStates = (states) => {
    if (!states || !Array.isArray(states) || states.length === 0) {
      return "N/A";
    }
    return states.join(", ");
  };

  // Format states array for CSV with proper escaping
  const formatStatesForCSV = (states) => {
    if (!states || !Array.isArray(states) || states.length === 0) {
      return "N/A";
    }
    return escapeCSV(states.join(", "));
  };

  // Export subscriptions to CSV
  const exportToCSV = () => {
    if (subscriptions.length === 0) {
      toast.error("No subscriptions to export");
      return;
    }

    const headers = [
      "Subscription ID",
      "Internal ID",
      "Name",
      "Status",
      "Net Price",
      "Total Amount",
      "Unit Price",
      "Discounted Price",
      "Started At",
      "Cancel At",
      "Cancelled At",
      "Created At",
      "States Chosen",
      "Acknowledgment ID",
      "Cancelation Reason",
    ];
    const csvContent = [
      headers.join(","),
      ...subscriptions.map((subscription) =>
        [
          escapeCSV(subscription.stripe_subscription_id || subscription.id || ""),
          escapeCSV(subscription.id || ""),
          escapeCSV(subscription.name || ""),
          escapeCSV(subscription.status || ""),
          escapeCSV(formatCurrency(subscription.net_price || 0)),
          escapeCSV(formatCurrency(subscription.total_amount || 0)),
          escapeCSV(formatCurrency(subscription.unit_price || 0)),
          escapeCSV(formatCurrency(subscription.discounted_price || 0)),
          escapeCSV(formatDate(subscription.started_at)),
          escapeCSV(formatDate(subscription.cancel_at)),
          escapeCSV(formatDate(subscription.cancelled_at)),
          escapeCSV(formatDate(subscription.created_at)),
          formatStatesForCSV(subscription.states_chosen),
          escapeCSV(subscription.acknowledgment_id || ""),
          escapeCSV(subscription.cancelation_reason || ""),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `subscriptions_complete_data_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Subscriptions with complete data exported successfully");
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="bg-white dark:bg-gray-700 p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row">
          {/* Search */}
          {/* <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer" onClick={handleSearch} />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-20 py-2 border rounded-lg focus:border-[var(--color-atoll)] focus:outline-none ${searchTerm.trim() ? 'border-[var(--color-atoll)] bg-blue-50' : 'border-gray-300'}`}
              />
            </div>
          </div> */}
          <div className=" flex items-center justify-between ">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-100">
                {totalRecords > 0 &&
                  `Showing ${currentPage * perPage + 1}-${Math.min((currentPage + 1) * perPage, totalRecords)} of ${totalRecords} subscriptions`}
              </span>

              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                data-testid="select-per-page"
                className="rounded border border-gray-300 px-2 py-1 text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
          {/* Status Filter */}
          <div className="flex gap-3">
            <div className="">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                data-testid="select-status-filter"
                className="w-full dark:bg-gray-800 dark:border-gray-700 rounded-lg border border-gray-300 px-3 py-2 focus:border-[var(--color-atoll)] focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="canceled">Canceled</option>
                <option value="paused">Paused</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            {/* Export Button */}
            <div className="">
              <button
                onClick={exportToCSV}
                disabled={subscriptions.length === 0}
                data-testid="btn-export-subscription"
                className={`flex dark:text-white items-center space-x-2 rounded-lg border px-4 py-2 transition-colors ${
                  subscriptions.length === 0
                    ? "cursor-not-allowed border-gray-300 text-gray-100"
                    : "border-gray-300 text-gray-700  "
                }`}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pagination Info */}
      </Card>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Subscriptions Table */}
      <Card className="overflow-hidden bg-white dark:bg-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full dark:bg-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-100 uppercase">
                  Subscription ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500  dark:text-gray-100 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500  dark:text-gray-100 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500  dark:text-gray-100 uppercase">
                  Net Price
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discounted Price
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500  dark:text-gray-100 uppercase">
                  States Chosen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500  dark:text-gray-100 uppercase">
                  Started At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 ">
              {loading ? (
                <tr className="dark:bg-gray-700">
                  <td colSpan="8" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
                      <span className="ml-2 text-gray-900 dark:text-gray-100">Loading subscriptions...</span>
                    </div>
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr className="dark:bg-gray-700">
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-100"
                  >
                    No subscriptions found. Try adjusting your search or
                    filters.
                  </td>
                </tr>
              ) : (
                subscriptions.map((subscription) => (
                  <tr
                    key={subscription.stripe_subscription_id || subscription.id}
                    // className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {subscription.stripe_subscription_id || subscription.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {subscription.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap dark:text-gray-100">
                      {getSubscriptionStatusBadge(subscription.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {formatCurrency(subscription.net_price)}
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(subscription.discounted_price)}</div>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="max-w-xs truncate text-sm text-gray-900 dark:text-gray-100"
                        title={formatStates(subscription.states_chosen)}
                      >
                        {formatStates(subscription.states_chosen)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(subscription.started_at)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
            <ReactPaginate
              previousLabel={<ChevronLeftIcon className="h-4 w-4" />}
              nextLabel={<ChevronRightIcon className="h-4 w-4" />}
              forcePage={currentPage}
              onPageChange={handlePageChange}
              pageCount={totalPages}
              breakLabel="..."
              containerClassName="flex space-x-2 justify-end react-pagination"
              pageClassName=""
              pageLinkClassName="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
              previousLinkClassName="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
              nextLinkClassName="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
              breakLinkClassName="px-4 py-2 border border-gray-300 rounded-full"
              activeLinkClassName="bg-[var(--color-atoll)] text-white"
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default SubscriptionsTab;
