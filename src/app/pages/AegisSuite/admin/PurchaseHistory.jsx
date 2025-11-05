import React, { useState, useEffect } from 'react';
import { Card, Spinner } from 'components/ui';
import SharedSidebar from '../components/SharedSidebar';
import { ordersService } from 'utils/apiService';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  // EyeIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
// import { useNavigate } from 'react-router';

const PurchaseHistory = () => {
  // const navigate = useNavigate()
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMarketPlace, setIsMarketPlace] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [dateError, setDateError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Toggle row expansion
  const toggleRowExpansion = (purchaseId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(purchaseId)) {
      newExpandedRows.delete(purchaseId);
    } else {
      newExpandedRows.add(purchaseId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Format date to MM-DD-YYYY
  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  // Fetch purchase history data
  const fetchPurchaseHistory = async (page = 1, startDate = null, endDate = null, status = null, name = null, isMarketPlace) => {
    console.log(isMarketPlace)
    try {
      setLoading(true);
      setError(null);

      // Format dates for API
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);

      const response = await ordersService.getPurchaseHistory(
        page,
        perPage,
        null, // timezone will be auto-detected
        1, // is_fresh_leads
        formattedStartDate,
        formattedEndDate,
        status,
        name,
        isMarketPlace
      );

      console.log('Purchase history API response:', response);

      if (response.data && Array.isArray(response.data)) {
        setPurchases(response.data);
        setTotalRecords(response.pagination?.total || response.data.length);
        setTotalPages(response.pagination?.last_page || Math.ceil((response.pagination?.total || response.data.length) / perPage));
      } else {
        setPurchases([]);
        setTotalRecords(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching purchase history:', err);

      // Handle different error scenarios
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError('Unauthorized access. Please log in again.');
            break;
          case 403:
            setError('Access forbidden. You do not have permission to view purchase history.');
            break;
          case 404:
            setError('Purchase history not found.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError(`Error loading purchase history: ${err.response.data?.message || err.message}`);
        }
      } else if (err.request) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(`Error loading purchase history: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseHistory(currentPage, dateFilter.startDate, dateFilter.endDate, paymentStatus, searchTerm, isMarketPlace);
  }, [currentPage, perPage, searchTerm, isMarketPlace]);
  
  /*const moveTo = (item) => {
    if (item?.states_chosen) {
      navigate(`/subscriptions/invoice/${item.id}?from=0`)
    } else {
      navigate(`/subscriptions/invoice/${item.id}?from=1`)
    }
  }*/

  /*const handleSearch = () => {
    setCurrentPage(1);
    fetchPurchaseHistory(1, searchTerm, dateFilter.startDate, dateFilter.endDate);
  };*/

  const handleDateFilter = () => {
    console.log(isMarketPlace)
    // Validate date range
    if (dateFilter.startDate && dateFilter.endDate) {
      const startDate = new Date(dateFilter.startDate);
      const endDate = new Date(dateFilter.endDate);

      if (endDate < startDate) {
        setDateError('End date cannot be earlier than start date');
        return;
      }
    }

    setDateError('');
    setCurrentPage(1);
    fetchPurchaseHistory(1, dateFilter.startDate, dateFilter.endDate, paymentStatus, searchTerm, isMarketPlace);
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setDateFilter(prev => ({ ...prev, startDate: newStartDate }));

    // Clear end date if it's now earlier than start date
    if (newStartDate && dateFilter.endDate) {
      const startDate = new Date(newStartDate);
      const endDate = new Date(dateFilter.endDate);

      if (endDate < startDate) {
        setDateFilter(prev => ({ ...prev, endDate: '' }));
        setDateError('Please select an end date after the start date');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setDateFilter(prev => ({ ...prev, endDate: newEndDate }));

    // Validate end date
    if (newEndDate && dateFilter.startDate) {
      const startDate = new Date(dateFilter.startDate);
      const endDate = new Date(newEndDate);

      if (endDate < startDate) {
        setDateError('End date cannot be earlier than start date');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  };

  const handleClearFilters = () => {
    setDateFilter({ startDate: '', endDate: '' });
    setDateError('');
    setSearchTerm('');
    setPaymentStatus('');
    setCurrentPage(1);
    setSearchTerm('')
    fetchPurchaseHistory(1, null, null, null);
  };

  const handlePaymentStatusChange = (e) => {
    const status = e.target.value;
    setPaymentStatus(status);
    setCurrentPage(1);
    fetchPurchaseHistory(1, dateFilter.startDate, dateFilter.endDate, status, searchTerm, isMarketPlace);
  };

  const handleDownload = async () => {
    try {
      // Validate that both start and end dates are selected
      if (!dateFilter.startDate || !dateFilter.endDate) {
        setError('Please select both start date and end date to download data');
        return;
      }

      // Clear any previous errors and success messages
      setError(null);
      setSuccessMessage('');
      setDownloading(true);

      // Format dates for API
      const formattedStartDate = formatDateForAPI(dateFilter.startDate);
      const formattedEndDate = formatDateForAPI(dateFilter.endDate);

      await ordersService.downloadPurchaseHistory(
        formattedStartDate,
        formattedEndDate,
        paymentStatus || null,
        1, // is_fresh_leads,
        searchTerm,
        isMarketPlace
      );

      // Show success message
      setSuccessMessage('Download completed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000); // Clear after 3 seconds
    } catch (error) {
      console.error('Download error:', error);
      setError(`Download failed: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const getPaymentStatusBadge = (status) => {
    const statusClasses = {
      paid: 'bg-green-600 text-white',
      pending: 'bg-yellow-600 text-white',
      failed: 'bg-red-600 text-white',
      succeeded: 'bg-green-600 text-white',
      cancelled: 'bg-gray-600 text-white'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.log('error', error);
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      {/* Sidebar */}
      <SharedSidebar currentPath="/admin/purchase-history" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0a2463] dark:text-[#4d9fff]">Purchase History</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">View all purchase transactions</p>
            </div>
            {/* <div className="flex items-center space-x-3">
              <button className="bg-[#f4d03f] text-white px-4 py-2 rounded-lg hover:bg-[#e6c035] transition-colors flex items-center space-x-2">
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div> */}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-800">{successMessage}</span>
              </div>
            </div>
          )}
          {/* Filters */}
          <Card className="p-6 mb-6 bg-white dark:bg-gray-800 shieldnest-shadow">
            {/* Active Filters Indicator */}
            {(dateFilter.startDate || dateFilter.endDate || paymentStatus) && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FunnelIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                    <div className="flex items-center space-x-4">
                      {(dateFilter.startDate || dateFilter.endDate) && (
                        <span className="text-sm text-blue-700">
                          Date: {dateFilter.startDate && dateFilter.endDate
                            ? `${dateFilter.startDate} to ${dateFilter.endDate}`
                            : dateFilter.startDate
                              ? `From ${dateFilter.startDate}`
                              : `Until ${dateFilter.endDate}`
                          }
                        </span>
                      )}
                      {paymentStatus && (
                        <span className="text-sm text-blue-700">
                          Status: {paymentStatus}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a2463] focus:border-transparent"
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2 ">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={handlePaymentStatusChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a2463] focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="succeeded">Succeeded</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={handleStartDateChange}
                    max={dateFilter.endDate || undefined}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a2463] focus:border-transparent"
                  />
                  <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">End Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={handleEndDateChange}
                    min={dateFilter.startDate || undefined}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#0a2463] focus:border-transparent ${dateError ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                  <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
                {dateError && (
                  <p className="mt-1 text-sm text-red-600">{dateError}</p>
                )}
              </div>

              {/* Filter Button */}
              <div className="flex items-end">
                <button
                  onClick={handleDateFilter}
                  disabled={dateError}
                  className="w-full bg-[#0a2463] dark:bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-[#0a2463]/90 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FunnelIcon className="w-4 h-4" />
                  <span>Filter</span>
                </button>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={handleClearFilters}
                  className="w-full bg-gray-50 dark:bg-gray-700 text-white dark:text-gray-100 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </Card>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600 dark:text-gray-300">Loading purchase history...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Data</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    fetchPurchaseHistory(currentPage, dateFilter.startDate, dateFilter.endDate, paymentStatus, searchTerm, isMarketPlace);
                  }}
                  className="bg-[#0a2463] text-white px-4 py-2 rounded-lg hover:bg-[#0a2463]/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <>


              {/* Purchase History Table */}
              <Card className="overflow-hidden bg-white dark:bg-gray-800 shieldnest-shadow">
                {/* Table Header with Download Button */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className='flex items-center'>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mr-5">Purchase History</h3>
                    <span className='text-dark'><input style={{position: "relative", top: "2px"}} type="checkbox" checked={isMarketPlace} onChange={() => {setCurrentPage(1); setIsMarketPlace(!isMarketPlace)}} />&nbsp;&nbsp;MarketPlace Purchases</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {!dateFilter.startDate || !dateFilter.endDate ? (
                          <span className="text-red-600">Select start and end dates to download</span>
                        ) : (
                          <span>Download data from {dateFilter.startDate} to {dateFilter.endDate}</span>
                        )}
                      </div>
                      <button
                        onClick={handleDownload}
                        disabled={downloading || purchases.length === 0 || !dateFilter.startDate || !dateFilter.endDate}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!dateFilter.startDate || !dateFilter.endDate ?
                          'Please select both start date and end date to download' :
                          `Download data from ${dateFilter.startDate} to ${dateFilter.endDate}${paymentStatus ? ` (Status: ${paymentStatus})` : ''}`
                        }
                      >
                        {downloading ? (
                          <>
                            <Spinner size="sm" />
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            <span>Download</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {isMarketPlace && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase tracking-wider w-12">
                            {/* Expand/Collapse column header */}
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase tracking-wider">
                          Customer
                        </th>
                        {!isMarketPlace && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase tracking-wider">
                          Item
                        </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase tracking-wider">
                          Payment Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase tracking-wider">
                          Date
                        </th>
                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th> */}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                      {purchases.length === 0 ? (
                        <tr>
                          <td colSpan={isMarketPlace ? "6" : "5"} className="px-6 py-12 text-center">
                            <div className="text-gray-500 dark:text-gray-400">
                              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No purchases found</h3>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No purchase history available for the selected filters.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        purchases.map((purchase) => (
                          <React.Fragment key={purchase.id}>
                            <tr className="hover:bg-gray-50 dark:bg-gray-700">
                              {isMarketPlace && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button
                                    title="Expand to view items"
                                    onClick={() => toggleRowExpansion(purchase.id)}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-colors"
                                  >
                                    {expandedRows.has(purchase.id) ? (
                                      <ChevronDownIcon className="w-4 h-4" />
                                    ) : (
                                      <ChevronRightIcon className="w-4 h-4" />
                                    )}
                                  </button>
                                </td>
                              )}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{purchase.name}</div>
                              </td>
                              {!isMarketPlace && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{purchase.description}</div>
                                </td>
                              )}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">{purchase.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatCurrency(purchase.amount_received)}
                              </div>
                              {purchase.discounted_price && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                  {formatCurrency(purchase.original_price)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadge(purchase.payment_status)}`}>
                                {purchase.payment_status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {formatDate(purchase.created_at)}
                            </td>
                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-[#0a2463] hover:text-[#0a2463]/80 flex items-center space-x-1" onClick={() => moveTo(purchase)}>
                                <EyeIcon className="w-4 h-4" />
                                <span>View/Download</span>
                              </button>
                            </td> */}
                          </tr>
                          {/* Expanded row for MarketPlace purchases */}
                          {isMarketPlace && expandedRows.has(purchase.id) && purchase.invoice_data && purchase.invoice_data.items && (
                            <tr>
                              <td colSpan={isMarketPlace ? "6" : "5"} className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Invoice Items</h4>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Title
                                          </th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Description
                                          </th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            State
                                          </th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Quantity
                                          </th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Unit Price
                                          </th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Subtotal
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                                        {purchase.invoice_data.items.map((item, index) => (
                                          <tr key={index} className="hover:bg-gray-50 dark:bg-gray-700">
                                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                              {item.title}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                                              {item.description}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                              {item.state}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                              {item.quantity}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                              {formatCurrency(item.unit_price)}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                              {formatCurrency(item.subtotal)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center">
                                      <div className="text-sm text-gray-600 dark:text-gray-300">
                                        <div>Subtotal: {formatCurrency(purchase.invoice_data.subtotal)}</div>
                                        <div>Total Amount: {formatCurrency(purchase.invoice_data.total_amount)}</div>
                                        {purchase.invoice_data.commission && (
                                          <div>Commission: {purchase.invoice_data.commission}%</div>
                                        )}
                                      </div>
                                      <div className="text-sm text-gray-600 dark:text-gray-300">
                                        <div>Invoice #: {purchase.invoice_data.invoice_number}</div>
                                        <div>Purchase Date: {purchase.invoice_data.purchase_date}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {purchases.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Show</span>
                        <select
                          value={perPage}
                          onChange={(e) => handlePerPageChange(Number(e.target.value))}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-gray-700">entries</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-700"
                        >
                          Previous
                        </button>

                        <span className="text-sm text-gray-700">
                          Page {currentPage} of {totalPages}
                        </span>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-700"
                        >
                          Next
                        </button>
                      </div>

                      <div className="text-sm text-gray-700">
                        Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalRecords)} of {totalRecords} entries
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default PurchaseHistory; 