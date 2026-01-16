import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Button, Spinner } from 'components/ui';
import SharedSidebar from '../components/SharedSidebar';
import Chart from 'react-apexcharts';
import { DatePicker } from 'components/shared/form/Datepicker';
import dashboardService from 'utils/dashboardService';
import ReactPaginate from 'react-paginate';
import {
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  PhoneIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
  XMarkIcon as XIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

const TwilioExpenseAndReports = () => {
  // Event mapping with icons and descriptions
  const EVENT_MAP = useMemo(() => ({
    1: { 
      name: "Number Purchase", 
      color: "#10b981",
      icon: "📞",
      description: "Purchase of new phone numbers"
    },
    2: { 
      name: "Outbound Call", 
      color: "#3b82f6",
      icon: "📤",
      description: "Outgoing voice calls"
    },
    3: { 
      name: "Outbound SMS", 
      color: "#f59e0b",
      icon: "💬",
      description: "Outgoing text messages"
    },
    4: { 
      name: "Inbound SMS", 
      color: "#8b5cf6",
      icon: "📥",
      description: "Incoming text messages"
    },
    5: { 
      name: "Inbound Call", 
      color: "#ef4444",
      icon: "📥",
      description: "Incoming voice calls"
    },
    6: { 
      name: "Number Renewal", 
      color: "#14b8a6",
      icon: "🔄",
      description: "Monthly number renewal"
    }
  }), []);

  // Get current month's start and end dates
  const getCurrentMonthDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      startDate: formatDate(firstDay),
      endDate: formatDate(lastDay)
    };
  };

  const initialDates = getCurrentMonthDates();
  
  // const [walletBalance, setWalletBalance] = useState(null);
  // const [walletBalanceLoading, setWalletBalanceLoading] = useState(true);
  // const [walletBalanceError, setWalletBalanceError] = useState(null);
  const [totalRecharge, setTotalRecharge] = useState(0);
  const [totalRechargeLoading, setTotalRechargeLoading] = useState(false);
  const [totalRechargeError, setTotalRechargeError] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: initialDates.startDate,
    endDate: initialDates.endDate
  });
  const [dateError, setDateError] = useState('');
  const [usageData, setUsageData] = useState([]);
  const [usageColors, setUsageColors] = useState([]);
  const [usageLabels, setUsageLabels] = useState([]);
  const [creditsTotal, setCreditsTotal] = useState(0);

  const [agentExpenses, setAgentExpenses] = useState([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState(null);
  const [page, setPage] = useState(1);          
  const [perPage] = useState(5);
  const [total, setTotal] = useState(0);        
  const [agentSearchTerm, setAgentSearchTerm] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  const [dailyChartData, setDailyChartData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("1");

  // New states for Deduction History
  const [deductionHistory, setDeductionHistory] = useState([]);
  const [deductionLoading, setDeductionLoading] = useState(false);
  const [deductionPage, setDeductionPage] = useState(1);
  const [deductionPerPage] = useState(5);
  const [deductionTotal, setDeductionTotal] = useState(0);
  const [deductionSearchTerm, setDeductionSearchTerm] = useState("");
  const [selectedDeductionEvent, setSelectedDeductionEvent] = useState(1);

  const randomColors = [
    "#0a2463", "#5ab453", "#92c933", "#FF2ECF", "#E000AD", "#FFA71A", "#FF4F1A",
    "#384766", "#506877", "#3D4E70", "#4A4A4F", "#6D7EA1", "#70838F", "#B8008C", "#FF75DF"
  ];

  // Format date from YYYY-MM-DD to MM-DD-YYYY for API
  const formatDateForAPI = useCallback((dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return `${month}-${day}-${year}`;
  }, []);

  // Fetch Twilio wallet balance
  // useEffect(() => {
  //   const fetchTwilioBalance = async () => {
  //     try {
  //       setWalletBalanceLoading(true);
  //       setWalletBalanceError(null);
  //       const response = await dashboardService.getTwilioWalletBalance();
  //       const balance = response?.data?.twilio_balance || 0;
  //       setWalletBalance(parseFloat(balance) || 0);
  //     } catch (err) {
  //       console.error('Error fetching Twilio wallet balance:', err);
  //       setWalletBalanceError('Failed to load wallet balance');
  //       setWalletBalance(0);
  //     } finally {
  //       setWalletBalanceLoading(false);
  //     }
  //   };

  //   fetchTwilioBalance();
  // }, []);

  // Fetch total recharge when date range changes
  useEffect(() => {
    const fetchTotalRecharge = async () => {
      if (!dateFilter.startDate || !dateFilter.endDate) {
        return;
      }

      try {
        setTotalRechargeLoading(true);
        setTotalRechargeError(null);
        const formattedStartDate = formatDateForAPI(dateFilter.startDate);
        const formattedEndDate = formatDateForAPI(dateFilter.endDate);
        
        const response = await dashboardService.getWalletRechargeSum(formattedStartDate, formattedEndDate);
        const total = response?.data?.total || 0;
        setTotalRecharge(parseFloat(total) || 0);
      } catch (err) {
        console.error('Error fetching total recharge:', err);
        setTotalRechargeError('Failed to load total recharge');
        setTotalRecharge(0);
      } finally {
        setTotalRechargeLoading(false);
      }
    };

    fetchTotalRecharge();
  }, [dateFilter.startDate, dateFilter.endDate, formatDateForAPI]);

  // Handle date range change
  const handleDateRangeChange = (selectedDates) => {
    const formatDate = (date) => {
      if (!date) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (selectedDates && selectedDates.length === 2) {
      const startDate = selectedDates[0];
      const endDate = selectedDates[1];
      
      const sortedDates = [startDate, endDate].sort((a, b) => a - b);
      
      const newDateFilter = {
        startDate: formatDate(sortedDates[0]),
        endDate: formatDate(sortedDates[1])
      };
      
      setDateFilter(newDateFilter);
      setDateError('');
    } else if (selectedDates && selectedDates.length === 1) {
      const selectedDate = selectedDates[0];
      const selectedDateObj = new Date(selectedDate);
      selectedDateObj.setHours(0, 0, 0, 0);
      
      const currentStartDate = dateFilter.startDate ? new Date(dateFilter.startDate + 'T00:00:00') : null;
      const currentEndDate = dateFilter.endDate ? new Date(dateFilter.endDate + 'T00:00:00') : null;
      
      if (currentStartDate && currentEndDate) {
        currentStartDate.setHours(0, 0, 0, 0);
        currentEndDate.setHours(0, 0, 0, 0);
        
        if (selectedDateObj < currentStartDate) {
          setDateFilter(prev => ({
            startDate: formatDate(selectedDate),
            endDate: prev.endDate
          }));
        } else if (selectedDateObj > currentEndDate) {
          setDateFilter(prev => ({
            startDate: prev.startDate,
            endDate: formatDate(selectedDate)
          }));
        } else {
          const startDiff = Math.abs(selectedDateObj.getTime() - currentStartDate.getTime());
          const endDiff = Math.abs(selectedDateObj.getTime() - currentEndDate.getTime());
          
          if (startDiff <= endDiff) {
            setDateFilter(prev => ({
              startDate: formatDate(selectedDate),
              endDate: prev.endDate
            }));
          } else {
            setDateFilter(prev => ({
              startDate: prev.startDate,
              endDate: formatDate(selectedDate)
            }));
          }
        }
      } else if (currentStartDate) {
        setDateFilter(prev => ({
          ...prev,
          endDate: formatDate(selectedDate)
        }));
      } else {
        setDateFilter(prev => ({
          ...prev,
          startDate: formatDate(selectedDate)
        }));
      }
    }
  };

  // CSV helper functions
  const escapeCSVValue = (value) => {
    if (value == null || value === undefined) return "";
    let stringVal = String(value);
    stringVal = stringVal.replace(/"/g, '""');
    if (stringVal.search(/("|,|\n)/g) >= 0) {
      stringVal = `"${stringVal}"`;
    }
    return stringVal;
  };

  const formatHeader = (key) => {
    if (key.includes(' ')) {
      return key
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatValue = (key, value) => {
    if (value === null || value === undefined) {
      return '0';
    }
    if (key === 'total_credits_used') {
      return String(value);
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      return `$${numValue.toFixed(2)}`;
    }
    return String(value);
  };

  const convertJsonToCSV = (jsonData) => {
    // Handle single object (not array)
    if (!Array.isArray(jsonData) && typeof jsonData === 'object' && jsonData !== null) {
      const incomeThroughPlatformSubscription = parseFloat(jsonData.income_through_platform_subscription || 0) || 0;
      const marketplaceTotalAmount = parseFloat(jsonData.marketplace_total_amount || 0) || 0;
      const totalCreditsUsed = parseFloat(jsonData.total_credits_used || 0) || 0;
      const netIncome = incomeThroughPlatformSubscription + marketplaceTotalAmount + (totalCreditsUsed / 1000);

      const dataWithNetIncome = {
        ...jsonData,
        'Net Income': netIncome
      };

      const keys = Object.keys(dataWithNetIncome);
      if (keys.length === 0) {
        return '';
      }

      const sortedKeys = keys.sort((a, b) => {
        if (a === 'Net Income') return 1;
        if (b === 'Net Income') return -1;
        return a.localeCompare(b);
      });

      let csvContent = sortedKeys.map(header => escapeCSVValue(formatHeader(header))).join(',') + '\n';
      const row = sortedKeys.map(header => {
        const value = dataWithNetIncome[header];
        if (header === 'Net Income') {
          return escapeCSVValue(`$${netIncome.toFixed(2)}`);
        }
        return escapeCSVValue(formatValue(header, value));
      });
      csvContent += row.join(',') + '\n';

      return csvContent;
    }

    // Handle array of objects
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return '';
    }

    const allKeys = new Set();
    jsonData.forEach(obj => {
      Object.keys(obj).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys).sort();
    let csvContent = headers.map(header => escapeCSVValue(formatHeader(header))).join(',') + '\n';

    jsonData.forEach(obj => {
      const row = headers.map(header => {
        const value = obj[header];
        return escapeCSVValue(formatValue(header, value));
      });
      csvContent += row.join(',') + '\n';
    });

    return csvContent;
  };

  // Handle export expense report
  const handleExportExpenseReport = async () => {
    if (!dateFilter.startDate || !dateFilter.endDate) {
      toast.error('Please select a date range to export');
      return;
    }

    setExportLoading(true);
    
    try {
      const formattedStartDate = formatDateForAPI(dateFilter.startDate);
      const formattedEndDate = formatDateForAPI(dateFilter.endDate);
      
      const blob = await dashboardService.downloadCostChargeSum(formattedStartDate, formattedEndDate);
      
      const text = await blob.text();
      let jsonResponse;
      
      try {
        jsonResponse = JSON.parse(text);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Invalid response format from server');
      }

      const expenseData = jsonResponse.data;
      
      if (!expenseData || (Array.isArray(expenseData) && expenseData.length === 0)) {
        toast.error('No expense data found to export');
        return;
      }

      const csvContent = convertJsonToCSV(expenseData);
      const BOM = '\uFEFF';
      const csvBlob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

      const startDateFormatted = dateFilter.startDate.replace(/-/g, '_');
      const endDateFormatted = dateFilter.endDate.replace(/-/g, '_');
      const filename = `expense_report_${startDateFormatted}_to_${endDateFormatted}.csv`;

      const url = URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Expense report exported successfully');
    } catch (err) {
      console.error('Error exporting expense report:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to export expense report');
    } finally {
      setExportLoading(false);
    }
  };

  // Filter agent expenses based on search term
  const filteredAgentExpenses = agentExpenses.filter(agent => {
    if (!agentSearchTerm) return true;
    const searchLower = agentSearchTerm.toLowerCase();
    return (
      agent.agentName?.toLowerCase().includes(searchLower) 
    );
  });

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    // Remove country codes and format
    const cleaned = phone.replace(/^\+1|\+91|\+/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Map API data to unified format based on event type
  const mapDeductionData = useCallback((apiData, eventType) => {
    if (!apiData || !Array.isArray(apiData)) return [];

    return apiData.map((item, index) => {
      // Create base object
      const baseItem = {
        id: `${eventType}-${index}-${Date.now()}`,
        event_type: eventType,
        deduction_date: item.deduction_date,
        credits_used: item.credits_used || 0
      };

      // Add fields based on event type
      switch(eventType) {
        case 1: // Number Purchase
          return {
            ...baseItem,
            friendly_name: item.friendly_name || '',
            phone: item.phone || '',
            is_toll_free: item.is_toll_free || false,
            state: item.state || '',
            communication_type: 1,
            duration_seconds: 0
          };
          
        case 2: // Outbound Call
        case 5: // Inbound Call
          return {
            ...baseItem,
            from: item.from || '',
            to: item.to || '',
            lead_name: item.lead_name || '',
            mortgage_id: item.mortgage_id || '',
            duration_seconds: item.duration_seconds || 0,
            communication_type: 1 // Voice
          };
          
        case 3: // Outbound SMS
        case 4: // Inbound SMS
          return {
            ...baseItem,
            from: item.from || '',
            to: item.to || '',
            lead_name: item.lead_name || '',
            mortgage_id: item.mortgage_id || '',
            duration_seconds: 0,
            communication_type: 2 // SMS
          };
          
        case 6: // Number Renewal
          return {
            ...baseItem,
            friendly_name: item.friendly_name || '',
            phone: item.phone || '',
            is_toll_free: item.is_toll_free || false,
            state: item.state || '',
            communication_type: 1,
            duration_seconds: 0
          };
          
        default:
          return baseItem;
      }
    });
  }, []);

  // Fetch deduction history
  const fetchDeductionHistory = useCallback(async (pageNum = 1) => {
    try {
      setDeductionLoading(true);
      
      const formattedStartDate = formatDateForAPI(dateFilter.startDate);
      const formattedEndDate = formatDateForAPI(dateFilter.endDate);
      
      console.log('Fetching deduction history with:', {
        page: pageNum,
        perPage: deductionPerPage,
        event: selectedDeductionEvent,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        timeZone: 'Asia/Kolkata'
      });

      // Call the service method with correct parameters
      const response = await dashboardService.getDeductionHistory(
        pageNum,
        deductionPerPage,
        selectedDeductionEvent,
        formattedStartDate,
        formattedEndDate,
        'Asia/Kolkata'
      );
      
      console.log('Deduction History API Response:', response);
      
      // Check if response has data
      if (response && response.status === 200) {
        const deductionsData = response.data || [];
        const paginationInfo = response.pagination || {};
        const totalCount = paginationInfo?.total || deductionsData.length || 0;
        
        // Map API data to unified format
        const mappedData = mapDeductionData(deductionsData, selectedDeductionEvent);
        
        setDeductionHistory(mappedData);
        setDeductionTotal(totalCount);
        
        // If there's pagination info, use it
        if (paginationInfo && paginationInfo.total) {
          setDeductionTotal(paginationInfo.total);
        }
      } else {
        console.warn('Unexpected response structure:', response);
        setDeductionHistory([]);
        setDeductionTotal(0);
      }
      
    } catch (err) {
      console.error('Error fetching deduction history:', err);
      console.error('Error details:', err.response?.data || err.message || err);
      toast.error(err.response?.data?.message || 'Failed to load deduction history');
      setDeductionHistory([]);
      setDeductionTotal(0);
    } finally {
      setDeductionLoading(false);
    }
  }, [dateFilter.startDate, dateFilter.endDate, selectedDeductionEvent, deductionPerPage, formatDateForAPI, mapDeductionData]);

  // Fetch deduction history when filters change
  useEffect(() => {
    if (dateFilter.startDate && dateFilter.endDate) {
      fetchDeductionHistory(deductionPage);
    }
  }, [fetchDeductionHistory, deductionPage, dateFilter.startDate, dateFilter.endDate]);

  // Handle deduction history pagination
  const handleDeductionPagination = (selected) => {
    const selectedPage = selected.selected + 1;
    setDeductionPage(selectedPage);
  };

  // Deduction History Custom Pagination
  const DeductionPagination = () => {
    const pageCount = Math.ceil(deductionTotal / deductionPerPage);
    if (pageCount <= 1) return null;

    return (
      <ReactPaginate
        previousLabel="«"
        nextLabel="»"
        forcePage={deductionPage - 1}
        onPageChange={handleDeductionPagination}
        pageCount={pageCount}
        breakLabel="..."
        containerClassName="flex space-x-2 mt-4 justify-end"
        pageLinkClassName="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
        previousLinkClassName="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
        nextLinkClassName="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
        breakLinkClassName="px-4 py-2 border border-gray-300 rounded-full"
        activeLinkClassName="bg-[#0a2463] text-white"
      />
    );
  };

  // Filter deduction history based on search term
  const filteredDeductionHistory = useMemo(() => {
    if (!deductionSearchTerm) return deductionHistory;
    
    const searchLower = deductionSearchTerm.toLowerCase();
    return deductionHistory.filter(deduction => {
      // Search across all relevant fields based on event type
      const searchableFields = [];
      
      // Common fields for all events
      searchableFields.push(
        deduction.lead_name || '',
        deduction.mortgage_id || '',
        String(deduction.credits_used || '')
      );
      
      // Event-specific fields
      switch(deduction.event_type) {
        case 1: // Number Purchase
        case 6: // Number Renewal
          searchableFields.push(
            deduction.friendly_name || '',
            deduction.phone || '',
            deduction.state || '',
            deduction.is_toll_free ? 'toll free' : 'local'
          );
          break;
          
        case 2: // Outbound Call
        case 3: // Outbound SMS
        case 4: // Inbound SMS
        case 5: // Inbound Call
          searchableFields.push(
            deduction.from || '',
            deduction.to || ''
          );
          break;
      }
      
      return searchableFields.some(field => 
        field.toLowerCase().includes(searchLower)
      );
    });
  }, [deductionHistory, deductionSearchTerm]);

  // Get table columns based on selected event type
  const getTableColumns = () => {
    const baseColumns = [
      { key: 'deduction_date', label: 'Date & Time', width: '15%' },
      // { key: 'event_badge', label: 'Event Type', width: '12%' },
      { key: 'credits_used', label: 'Credits Used', width: '10%' }
    ];

    switch(selectedDeductionEvent) {
      case 1: // Number Purchase
      case 6: // Number Renewal
        return [
          ...baseColumns,
          { key: 'phone_info', label: 'Phone Number', width: '18%' },
          { key: 'friendly_name', label: 'Friendly Name', width: '15%' },
          { key: 'phone_details', label: 'Phone Details', width: '15%' },
          { key: 'duration', label: 'Duration', width: '10%' }
        ];
        
      case 2: // Outbound Call
      case 5: // Inbound Call
        return [
          ...baseColumns,
          { key: 'from_number', label: 'From', width: '15%' },
          { key: 'to_number', label: 'To', width: '15%' },
          { key: 'lead_info', label: 'Lead Info', width: '15%' },
          { key: 'duration', label: 'Duration', width: '10%' }
        ];
        
      case 3: // Outbound SMS
      case 4: // Inbound SMS
        return [
          ...baseColumns,
          { key: 'from_number', label: 'From', width: '15%' },
          { key: 'to_number', label: 'To', width: '15%' },
          { key: 'lead_info', label: 'Lead Info', width: '15%' },
          { key: 'message_type', label: 'Type', width: '10%' }
        ];
        
      default:
        return baseColumns;
    }
  };

  // Render table cell based on column key
  const renderTableCell = (deduction, columnKey) => {
    // const eventInfo = EVENT_MAP[deduction.event_type] || EVENT_MAP[1];
    
    switch(columnKey) {
      case 'deduction_date':
        return (
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {formatDisplayDateTime(deduction.deduction_date)}
          </div>
        );
        
      // case 'event_badge':
      //   return (
      //     <span 
      //       className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
      //       style={{ backgroundColor: `${eventInfo.color}20`, color: eventInfo.color }}
      //     >
      //       <span className="mr-1">{eventInfo.icon}</span>
      //       {eventInfo.name}
      //     </span>
      //   );
        
      case 'credits_used':
        return (
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {(deduction.credits_used || 0).toLocaleString()}
            </div>
            {/* <div className="text-xs text-gray-500 dark:text-gray-400">
              ${(deduction.credits_used || 0).toFixed(2)}
            </div> */}
          </div>
        );
        
      case 'phone_info':
        return (
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatPhoneNumber(deduction.phone)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {deduction.phone || 'N/A'}
            </div>
          </div>
        );
        
      case 'friendly_name':
        return (
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {deduction.friendly_name || 'N/A'}
          </div>
        );
        
      case 'phone_details':
        return (
          <div className="space-y-1">
            <div className="text-xs">
              {deduction.is_toll_free ? (
                <span className="inline-flex items-center text-green-600 dark:text-green-400">
                  <CheckIcon className="w-3 h-3 mr-1" />
                  Toll Free
                </span>
              ) : (
                <span className="inline-flex items-center text-gray-600 dark:text-gray-400">
                  <XIcon className="w-3 h-3 mr-1" />
                  Local
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              State: {deduction.state || 'N/A'}
            </div>
          </div>
        );
        
      case 'from_number':
        return (
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatPhoneNumber(deduction.from)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {deduction.from || 'N/A'}
            </div>
          </div>
        );
        
      case 'to_number':
        return (
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatPhoneNumber(deduction.to)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {deduction.to || 'N/A'}
            </div>
          </div>
        );
        
      case 'lead_info':
        return (
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {deduction.lead_name || 'N/A'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ID: {deduction.mortgage_id || 'N/A'}
            </div>
          </div>
        );
        
      case 'duration':
        if (deduction.duration_seconds > 0) {
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
              <PhoneIcon className="w-3 h-3 mr-1" />
              {deduction.duration_seconds}s
            </span>
          );
        }
        return <span className="text-sm text-gray-500 dark:text-gray-400">-</span>;
        
      case 'message_type':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            <DevicePhoneMobileIcon className="w-3 h-3 mr-1" />
            SMS
          </span>
        );
        
      default:
        return null;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date and time for display
  const formatDisplayDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      // Assuming format: "01-16-2026 15:34:21"
      const [datePart, timePart] = dateTimeString.split(' ');
      const [month, day, year] = datePart.split('-');
      return `${day}/${month}/${year} ${timePart || ''}`;
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateTimeString;
    }
  };

  // Donut chart configuration for Service Breakdown
  const serviceBreakdownOptions = useMemo(() => ({
    chart: { type: "donut", height: 350 },
    labels: usageLabels,
    colors: usageColors,
    plotOptions: {
      pie: {
        dataLabels: {
          offset: -10,
          style: {
            colors: ["#fff"],
            fontWeight: "bold"
          },
          formatter: (val, opts) => {
            const seriesIndex = opts.seriesIndex;
            const value = opts.w.config.series[seriesIndex];
            return `$${value.toFixed(2)}`;
          }
        },
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              color: "#000"
            },
            value: {
              color: "#000",
              formatter: (val) => `$${Number(val).toFixed(2)}`
            },
            total: {
              show: true,
              label: "Total",
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return `${formatCurrency(total)}`;
              }
            }
          }
        }
      }
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      formatter: (label, opts) => {
        const value = opts.w.globals.series[opts.seriesIndex];
        return `${label}: $${value.toFixed(2)}`;
      }
    },
    tooltip: {
      y: {
        formatter: (val) => `$${val.toFixed(2)}`
      }
    }
  }), [usageLabels, usageColors, formatCurrency]);

  // Fetch usage breakdown
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const start = formatDateForAPI(dateFilter.startDate);
        const end = formatDateForAPI(dateFilter.endDate);

        const res = await dashboardService.getWalletUsageBreakdown(start, end);
        const apiData = res?.data || [];

        const series = [];
        const labels = [];
        const colors = [];

        let totalInThousands = 0;

        Object.keys(EVENT_MAP).forEach((eventId) => {
          const found = apiData.find((e) => Number(e.event) === Number(eventId));
          const value = found?.total_credits_used/1000 || 0;

          series.push(value);
          labels.push(EVENT_MAP[eventId].name);
          colors.push(EVENT_MAP[eventId].color);

          totalInThousands += value;
        });

        setUsageData(series);
        setUsageLabels(labels);
        setUsageColors(colors);
        setCreditsTotal(totalInThousands);

      } catch (err) {
        console.log("Error loading breakdown:", err);
      }
    };

    fetchUsage();
  }, [dateFilter.startDate, dateFilter.endDate, formatDateForAPI, EVENT_MAP]);

  // Fetch agent-wise usage
  const fetchAgentWiseUsage = useCallback(async () => {
    try {
      setAgentExpenses([]);
      setAgentLoading(true);
      setAgentError(null);

      const start = formatDateForAPI(dateFilter.startDate);
      const end = formatDateForAPI(dateFilter.endDate);

      const res = await dashboardService.getAgentWiseUsage(
        start,
        end,
        page,
        perPage,
        agentSearchTerm
      );

      const apiData = res?.data || [];

      const mapped = apiData.map((item) => {
        const inboundCall = Number(item.inbound_call_total_credits) || 0;
        const outboundCall = Number(item.outbound_call_total_credits) || 0;
        const inboundSms = Number(item.inbound_sms_total_credits) || 0;
        const outboundSms = Number(item.outbound_sms_total_credits) || 0;
        const numberPurchase = Number(item.number_purchase_total_credits) || 0;
        const numberRenewal = Number(item.number_renewal_total_credits) || 0;

        const totalCredits =
          (inboundCall +
            outboundCall +
            inboundSms +
            outboundSms +
            numberPurchase +
            numberRenewal) / 1000; 

        return {
          id: item.id,
          agentName: item.name,
          agentEmail: item.email,
          agentPhone: item.phone,
          inboundCallTotalCredits: inboundCall,
          outboundCallTotalCredits: outboundCall,
          inboundSmsTotalCredits: inboundSms,
          outboundSmsTotalCredits: outboundSms,
          numberPurchaseTotalCredits: numberPurchase,
          numberRenewalTotalCredits: numberRenewal,
          totalCredits,
          rechargedAmount: Number(item.recharged_amount) || 0
        };
      });

      setAgentExpenses(mapped);
      setTotal(res?.pagination?.total || 0);
    } catch (err) {
      setAgentError("Failed to load agent-wise usage: " + err.message);
      setAgentExpenses([]);
    } finally {
      setAgentLoading(false);
    }
  }, [dateFilter.startDate, dateFilter.endDate, agentSearchTerm, page, perPage, formatDateForAPI]);

  useEffect(() => {
    fetchAgentWiseUsage();
  }, [fetchAgentWiseUsage]);

  // Agent pagination component
  const CustomPagination = () => {
    const pageCount = Math.ceil(total / perPage);
    if (pageCount <= 1) return null;

    return (
      <ReactPaginate
        previousLabel="«"
        nextLabel="»"
        forcePage={page - 1}
        onPageChange={handlePagination}
        pageCount={pageCount}
        breakLabel="..."
        containerClassName="flex space-x-2 mt-4 justify-end"
        pageLinkClassName="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
        previousLinkClassName="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
        nextLinkClassName="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
        breakLinkClassName="px-4 py-2 border border-gray-300 rounded-full"
        activeLinkClassName="bg-[#0a2463] text-white"
      />
    );
  };

  const handlePagination = (selected) => {
    const selectedPage = selected.selected + 1;
    setPage(selectedPage);
  };

  // Fetch daily spend
  useEffect(() => {
    const fetchDailySpend = async () => {
      try {
        const start = formatDateForAPI(dateFilter.startDate);
        const end = formatDateForAPI(dateFilter.endDate);

        const res = await dashboardService.getDailySpend(start, end);
        const apiData = res?.data || [];

        const filtered = apiData.filter(
          (item) => Number(item.event) === Number(selectedEvent)
        );

        const formatted = filtered.map((item) => {
          const [mm, dd] = item.date.split("-");
          const value = (item.total_credits || 0) / 1000;
          return {
            date: `${dd}/${mm}`,
            value: value
          };
        });

        setDailyChartData(formatted);
      } catch (err) {
        console.log("Error fetching daily spend:", err);
      }
    };

    fetchDailySpend();
  }, [dateFilter.startDate, dateFilter.endDate, selectedEvent, formatDateForAPI]);

  const dailySpendChartOptions = useMemo(() => ({
    chart: {
      type: "line",
      toolbar: { show: false }
    },
    colors: [EVENT_MAP[selectedEvent]?.color || "#3b82f6"],
    stroke: { width: 3, curve: "smooth" },
    xaxis: {
      categories: dailyChartData.map((i) => i.date)
    },
    yaxis: {
      labels: {
        formatter: (val) => `$${val.toFixed(2)}`
      }
    },
    legend: { show: false }
  }), [selectedEvent, EVENT_MAP, dailyChartData]);

  const dailySpendSeries = useMemo(() => [
    {
      name: EVENT_MAP[selectedEvent]?.name || "Event",
      data: dailyChartData.map((i) => i.value)
    }
  ], [selectedEvent, EVENT_MAP, dailyChartData]);

  // Get table columns for current event
  const tableColumns = getTableColumns();

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      {/* Sidebar */}
      <SharedSidebar currentPath="/twilio/expense-reports" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6 pt-20 lg:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0a2463] dark:text-[#4d9fff]">Twilio Expense and Reports</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Track your wallet balance and usage analytics</p>
            </div>
            
            {/* Date Range Picker and Export Button */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range:</span>
                </div>
                <div className="min-w-[250px] max-w-[350px]">
                  <DatePicker
                    value={dateFilter.startDate && dateFilter.endDate ? [
                      new Date(dateFilter.startDate + 'T00:00:00'),
                      new Date(dateFilter.endDate + 'T00:00:00')
                    ] : undefined}
                    onChange={handleDateRangeChange}
                    options={{
                      mode: 'range',
                      dateFormat: 'Y-m-d',
                      defaultDate: dateFilter.startDate && dateFilter.endDate ? [
                        new Date(dateFilter.startDate + 'T00:00:00'),
                        new Date(dateFilter.endDate + 'T00:00:00')
                      ] : undefined,
                    }}
                    placeholder="Select date range"
                    className="w-full text-sm"
                  />
                  {dateError && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{dateError}</p>
                  )}
                </div>
              </div>
              <Button
                onClick={handleExportExpenseReport}
                disabled={exportLoading || !dateFilter.startDate || !dateFilter.endDate}
                color="primary"
                className="flex items-center gap-2 text-white dark:bg-[#0a2463] dark:hover:bg-[#0a2463]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                {exportLoading ? 'Exporting...' : 'Export'}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Summary Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
            {/* Total Recharge Card */}
            <Card className="bg-white dark:bg-gray-800 shieldnest-shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Recharge</h3>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div>
                {totalRechargeLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                ) : totalRechargeError ? (
                  <div>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                      Error
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{totalRechargeError}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(totalRecharge)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Recharge for selected date range
                    </p>
                  </>
                )}
              </div>
            </Card>

            {/* Total Spend Card */}
            <Card className="bg-white dark:bg-gray-800 shieldnest-shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Spend</h3>
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <ArrowTrendingDownIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(creditsTotal)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Spend for selected date range</p>
              </div>
            </Card>

            {/* Balance Card */}
            {/* <Card className="bg-white dark:bg-gray-800 shieldnest-shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Twilio balance</h3>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold">$</span>
                </div>
              </div>
              <div className="mb-4">
                {walletBalanceLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                ) : walletBalanceError ? (
                  <div>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                      Error
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{walletBalanceError}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(walletBalance || 0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Current available Twilio balance</p>
                  </>
                )}
              </div>
            </Card> */}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Daily Spend Chart */}
            <Card className="bg-white dark:bg-gray-800 shieldnest-shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Daily Spend</h2>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                  style={{ 
                    color: EVENT_MAP[selectedEvent]?.color || "#3b82f6", 
                    fontWeight: "bold" 
                  }}
                >
                  {Object.keys(EVENT_MAP).map((id) => (
                    <option key={id} value={id}>
                      {EVENT_MAP[id].name}
                    </option>
                  ))}
                </select>
              </div>
              {dailyChartData.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-gray-500 dark:text-gray-400">No data available for selected event</p>
                </div>
              ) : (
                <Chart
                  options={dailySpendChartOptions}
                  series={dailySpendSeries}
                  type="line"
                  height={350}
                />
              )}
            </Card>

            {/* Service Breakdown Chart */}
            <Card className="bg-white dark:bg-gray-800 shieldnest-shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Service Breakdown
              </h2>
              {usageData.length === 0 ? (
                <div className='text-center p-4'>
                  <p className="text-md text-gray-600 dark:text-gray-400">Loading data...</p>
                </div>
              ) : (
                <Chart
                  options={serviceBreakdownOptions}
                  series={usageData}
                  type="donut"
                  height={350}
                />
              )}
            </Card>
          </div>

          {/* Agent-wise Expense Table */}
          <Card className="bg-white dark:bg-gray-800 shieldnest-shadow overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Agent-wise Expense</h3>
                
                {/* Search Filter */}
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search by agent name"
                      value={agentSearchTerm}
                      onChange={(e) => {
                        setAgentSearchTerm(e.target.value);
                        setPage(1);
                      }}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-64"
                    />
                  </div>
                  {agentSearchTerm && (
                    <button
                      onClick={() => setAgentSearchTerm('')}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      title="Clear search"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Inbound Call Total Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Outbound Call Total Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Inbound SMS Total Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Outbound SMS Total Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Number Purchase Total Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Number Renewal Total Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Credits in Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Recharged Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {agentLoading ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <Spinner />
                          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading agent data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAgentExpenses.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No agents found</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {agentSearchTerm ? 'Try adjusting your search terms' : 'No agent expenses available'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAgentExpenses.map((agent, index) => {
                      const color = randomColors[index % randomColors.length];
                      return (
                        <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: color }}
                              >
                                <span className="text-white font-medium text-sm">
                                  {agent.agentName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {agent.agentName}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {agent.agentEmail}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {agent.agentPhone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {agent?.inboundCallTotalCredits.toFixed(2) || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {agent?.outboundCallTotalCredits.toFixed(2) || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {agent?.inboundSmsTotalCredits.toFixed(2) || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {agent?.outboundSmsTotalCredits.toFixed(2) || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {agent?.numberPurchaseTotalCredits.toFixed(2) || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {agent?.numberRenewalTotalCredits.toFixed(2) || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {formatCurrency(agent.totalCredits)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {formatCurrency(agent.rechargedAmount || 0)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              {agentError && (
                <div className='text-center p-4'>
                  <p className="text-md text-red-600 p-4">{agentError}</p>
                </div>
              )}
            </div>
            <div className="p-4">
              <CustomPagination />
            </div>
          </Card>

          {/* Deduction History Table */}
          <Card className="bg-white dark:bg-gray-800 shieldnest-shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Deduction History</h3>
                
                <div className="flex items-center space-x-3">
                  {/* Event Filter */}
                  <select
                    value={selectedDeductionEvent}
                    onChange={(e) => {
                      setSelectedDeductionEvent(Number(e.target.value));
                      setDeductionPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                  >
                    {Object.entries(EVENT_MAP).map(([id, event]) => (
                      <option key={id} value={Number(id)}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Search Filter */}
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search by lead name, phone number, mortgage ID..."
                      value={deductionSearchTerm}
                      onChange={(e) => setDeductionSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-64"
                    />
                    {deductionSearchTerm && (
                      <button
                        onClick={() => setDeductionSearchTerm('')}
                        className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                 
                </div>
              </div>
             
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {tableColumns.map((column) => (
                      <th 
                        key={column.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        style={{ width: column.width }}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {deductionLoading ? (
                    <tr>
                      <td colSpan={tableColumns.length} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <Spinner />
                          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading deduction history...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredDeductionHistory.length === 0 ? (
                    <tr>
                      <td colSpan={tableColumns.length} className="px-6 py-8 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No deductions found</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {deductionSearchTerm || selectedDeductionEvent !== 0 ? 
                              'Try adjusting your filters' : 
                              'No deduction records available for the selected date range'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDeductionHistory.map((deduction, index) => {
                      // Removed unused 'color' variable that was causing the ESLint error
                      return (
                        <tr key={deduction.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          {tableColumns.map((column) => (
                            <td key={column.key} className="px-6 py-4">
                              {renderTableCell(deduction, column.key)}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4">
              <DeductionPagination />
            </div>

            {/* Summary Section */}
            {/* {filteredDeductionHistory.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Records</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {filteredDeductionHistory.length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Credits Used</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {filteredDeductionHistory.reduce((sum, d) => sum + (d.credits_used || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Event Type</p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {EVENT_MAP[selectedDeductionEvent]?.name}
                    </p>
                  </div>
                </div>
              </div>
            )} */}
          </Card>
        </main>
      </div>
    </div>
  );
};

export default TwilioExpenseAndReports;