import { useState, useEffect, useCallback } from "react";
import { Card } from "components/ui";
import {
  // MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ReactPaginate from "react-paginate";
import orderSubscriptionService from "utils/orderSubscriptionService";

const OrdersTab = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState(new Set());
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

  // Fetch orders from API
  const fetchOrders = useCallback(
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

        // Add payment status filter if not 'all'
        if (status !== "all") {
          params.payment_status = status;
        }

        // Add search term if provided
        if (search.trim()) {
          params.search = search.trim();
        }

        console.log("Fetching orders with params:", params);

        const response = await orderSubscriptionService.getOrders(
          userId,
          params,
        );
        console.log("Orders API response:", response);

        if (response.status === 200 || response.status === 0) {
          const ordersData = response.data || [];
          const pagination = response.pagination || {};

          setOrders(ordersData);
          setTotalRecords(pagination.total || 0);
          setTotalPages(Math.ceil((pagination.total || 0) / perPage));
        } else {
          throw new Error(response.message || "Failed to fetch orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);

        // Handle specific error cases
        if (error.response?.status === 401) {
          setError("Session expired. Please login again.");
          toast.error("Session expired. Please login again.");
        } else if (error.response?.status === 403) {
          setError("You do not have permission to access this data.");
          toast.error("You do not have permission to access this data.");
        } else if (error.response?.status === 404) {
          setError("Orders not found.");
          toast.error("Orders not found.");
        } else {
          setError(`Failed to fetch orders: ${error.message}`);
          toast.error(`Failed to fetch orders: ${error.message}`);
        }

        setOrders([]);
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
    fetchOrders(1, paymentStatusFilter);
  }, [fetchOrders, paymentStatusFilter]);

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page.selected);
    fetchOrders(page.selected + 1, paymentStatusFilter);
  };

  // Handle per page change
  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(0);
    fetchOrders(1, paymentStatusFilter);
  };

  // Handle payment status filter change
  const handlePaymentStatusChange = (status) => {
    setPaymentStatusFilter(status);
    setCurrentPage(0);
    fetchOrders(1, status);
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(0);
    fetchOrders(1, paymentStatusFilter);
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
  }, [paymentStatusFilter, handleSearch]);

  // Handle row expansion toggle
  const toggleRowExpansion = (orderId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(orderId)) {
      newExpandedRows.delete(orderId);
    } else {
      newExpandedRows.add(orderId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      succeeded: {
        icon: CheckCircleIcon,
        color: "bg-green-100 text-green-800",
        label: "Succeeded",
      },
      failed: {
        icon: XCircleIcon,
        color: "bg-red-100 text-red-800",
        label: "Failed",
      },
      pending: {
        icon: ClockIcon,
        color: "bg-yellow-100 text-yellow-800",
        label: "Pending",
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
      console.error("Error formatting date:", error);
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

  // Helper function to format items array for CSV
  const formatItemsForCSV = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return "No items";
    }
    
    return items.map((item, index) => 
      `Item ${index + 1}: ${item.title || "N/A"} | Qty: ${item.quantity || 0} | State: ${item.state || "N/A"} | Unit Price: ${formatCurrency(item.unit_price || 0)} | Subtotal: ${formatCurrency(item.subtotal || 0)} | Description: ${item.description || "N/A"}`
    ).join("; ");
  };

  // Export orders to CSV
  const exportToCSV = () => {
    if (orders.length === 0) {
      toast.error("No orders to export");
      return;
    }

    const headers = [
      "Order ID",
      "Amount Received",
      "Total Amount",
      "Discounted Price",
      "Payment Status",
      "Stripe Payment ID",
      "Created At",
      // Invoice Data Headers
      "Invoice Number",
      "Purchase Date",
      "Subtotal",
      "Total Amount (Invoice)",
      "Commission",
      // Bill To Information
      "Bill To - Agency Name",
      "Bill To - Name",
      "Bill To - Email",
      "Bill To - Phone",
      // From Information
      "From - Company Name",
      "From - Email",
      "From - Phone",
      "From - Address",
      // Items Information
      "Items Details"
      // Payment Details removed
    ];

    const csvContent = [
      headers.join(","),
      ...orders.map((order) => {
        const invoiceData = order.invoice_data || {};
        const billTo = invoiceData.bill_to || {};
        const from = invoiceData.from || {};

        return [
          escapeCSV(order.id),
          escapeCSV(formatCurrency(order.amount_received || 0)),
          escapeCSV(formatCurrency(order.total_amount || 0)),
          escapeCSV(formatCurrency(order.discounted_price || 0)),
          escapeCSV(order.payment_status),
          escapeCSV(order.stripe_payment_id),
          escapeCSV(formatDate(order.created_at)),
          // Invoice Data
          escapeCSV(invoiceData.invoice_number),
          escapeCSV(invoiceData.purchase_date),
          escapeCSV(formatCurrency(invoiceData.subtotal || 0)),
          escapeCSV(formatCurrency(invoiceData.total_amount || 0)),
          escapeCSV(invoiceData.commission),
          // Bill To Information
          escapeCSV(billTo.agency_name),
          escapeCSV(billTo.name),
          escapeCSV(billTo.email),
          escapeCSV(billTo.phone),
          // From Information
          escapeCSV(from.name),
          escapeCSV(from.email),
          escapeCSV(from.phone),
          escapeCSV(from.address),
          // Items Information
          escapeCSV(formatItemsForCSV(invoiceData.items))
          // Payment Details removed
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `orders_with_invoice_data_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Orders with invoice data exported successfully");
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="bg-white dark:bg-gray-800 p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {totalRecords > 0 &&
                  `Showing ${currentPage * perPage + 1}-${Math.min((currentPage + 1) * perPage, totalRecords)} of ${totalRecords} orders`}
              </span>

              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                className="rounded border border-gray-300 px-2 py-1 text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <div >
              <select
                value={paymentStatusFilter}
                onChange={(e) => handlePaymentStatusChange(e.target.value)}
                className="w-full dark:bg-gray-800 dark:border-gray-700 rounded-lg border border-gray-300 px-3 py-2 focus:border-[var(--color-atoll)] focus:outline-none"
              >
                <option value="all">All Payment Status</option>
                <option value="succeeded">Succeeded</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="">
              <button
                onClick={exportToCSV}
                disabled={orders.length === 0}
                className={`flex items-center space-x-2 rounded-lg border px-4 py-2 transition-colors ${
                  orders.length === 0
                    ? "cursor-not-allowed border-gray-300 text-gray-400"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700"
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

      {/* Orders Table */}
      <Card className="overflow-hidden bg-white dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase w-12">
                  {/* Expand/Collapse column */}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  Amount Received
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  Total Amount
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Discounted Price
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  Payment Status
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stripe Payment ID
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
                      <span className="ml-2 text-gray-900 dark:text-gray-100">Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No orders found. Try adjusting your search or filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isExpanded = expandedRows.has(order.id);
                  const items = order.invoice_data?.items || [];
                  
                  return (
                    <>
                      {/* Main order row */}
                      <tr key={order.id} className="hover:bg-gray-50 dark:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {items.length > 0 && (
                            <button
                              onClick={() => toggleRowExpansion(order.id)}
                              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
                              title={isExpanded ? "Collapse items" : "Expand items"}
                            >
                              {isExpanded ? (
                                <ChevronUpIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                              ) : (
                                <ChevronDownIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                              )}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {order.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {formatCurrency(order.amount_received)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {formatCurrency(order.total_amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentStatusBadge(order.payment_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {formatDate(order.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                          <button
                            className="flex items-center space-x-1 text-[var(--color-atoll)] hover:text-[var(--color-atoll)]/80"
                            onClick={() =>
                              navigate(
                                `/subscriptions/invoice/${order.id}?from=1`,
                              )
                            }
                          >
                            <EyeIcon className="h-4 w-4" />
                            <span>View/Download Invoice</span>
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded items row */}
                      {isExpanded && items.length > 0 && (
                        <tr key={`${order.id}-items`} className="bg-gray-50 dark:bg-gray-700">
                          <td colSpan="8" className="px-6 py-4">
                            <div className="ml-4">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                                Invoice Items ({items.length} items)
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Title
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Description
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        State
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Quantity
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Unit Price
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Subtotal
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                                    {items.map((item, index) => (
                                      <tr key={index} className="hover:bg-gray-50 dark:bg-gray-700">
                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                          {item.title || "N/A"}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                          <div className="max-w-xs truncate" title={item.description}>
                                            {item.description || "N/A"}
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                          {item.state || "N/A"}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                          {item.quantity || 0}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                          {formatCurrency(item.unit_price || 0)}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 font-medium">
                                          {formatCurrency(item.subtotal || 0)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-6 py-3">
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

export default OrdersTab;
