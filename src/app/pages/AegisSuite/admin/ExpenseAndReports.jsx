import { useState, useEffect } from 'react';
import { Card } from 'components/ui';
import SharedSidebar from '../components/SharedSidebar';
import Chart from 'react-apexcharts';
import { DatePicker } from 'components/shared/form/Datepicker';
import dashboardService from 'utils/dashboardService';
import ReactPaginate from 'react-paginate';
// import { Switch } from 'components/ui';
import {
//   ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const ExpenseAndReports = () => {
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
  
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletBalanceLoading, setWalletBalanceLoading] = useState(true);
  const [walletBalanceError, setWalletBalanceError] = useState(null);
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
  const [creditsTotal, setCreditsTotal] = useState([]);

  const [agentExpenses, setAgentExpenses] = useState([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState(null);
  const [page, setPage] = useState(1);          
  const [perPage] = useState(5);
  const [total, setTotal] = useState(0);        
  const [agentSearchTerm, setAgentSearchTerm] = useState("");

  const [dailyChartData, setDailyChartData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(1); // default event 1

  // Format date from YYYY-MM-DD to MM-DD-YYYY for API
  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return `${month}-${day}-${year}`;
  };

  // Fetch Twilio wallet balance
  useEffect(() => {
    const fetchTwilioBalance = async () => {
      try {
        setWalletBalanceLoading(true);
        setWalletBalanceError(null);
        const response = await dashboardService.getTwilioWalletBalance();
        // Extract balance from response structure: { data: { twilio_balance: 47.18 }, message: "Success", status: 200 }
        const balance = response?.data?.twilio_balance || 0;
        setWalletBalance(parseFloat(balance) || 0);
      } catch (error) {
        console.error('Error fetching Twilio wallet balance:', error);
        setWalletBalanceError('Failed to load wallet balance');
        setWalletBalance(0);
      } finally {
        setWalletBalanceLoading(false);
      }
    };

    fetchTwilioBalance();
  }, []);

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
        // Extract total from response structure: { data: { total: 1531.5 }, message: "Success", status: 200 }
        const total = response?.data?.total || 0;
        setTotalRecharge(parseFloat(total) || 0);
      } catch (error) {
        console.error('Error fetching total recharge:', error);
        setTotalRechargeError('Failed to load total recharge');
        setTotalRecharge(0);
      } finally {
        setTotalRechargeLoading(false);
      }
    };

    fetchTotalRecharge();
  }, [dateFilter.startDate, dateFilter.endDate]);
  

  // const [serviceBreakdown] = useState([
  //   { name: 'SMS', value: 50, color: '#22c55e' },
  //   { name: 'Voice', value: 30, color: '#3b82f6' },
  //   { name: 'Inbound', value: 20, color: '#f97316' }
  // ]);

  /*const [transactions] = useState([
    {
      id: 1,
      date: 'Oct 22',
      type: 'Message',
      description: 'Outbound',
      amount: -0.08,
      status: 'Success'
    },
    {
      id: 2,
      date: 'Oct 22',
      type: 'Voice',
      description: 'Daily Usage: 400 SMS segments',
      amount: -10.40,
      status: 'Deduced'
    },
    {
      id: 3,
      date: 'Oct 21',
      type: 'Debit',
      description: 'Monthly Rental: +1 S55-0199',
      amount: -0.05,
      status: 'Deduced'
    }
  ]); */

  // Agent-wise expense data

  const randomColors = [
    "#0a2463", "#5ab453", "#92c933", "#FF2ECF", "#E000AD", "#FFA71A", "#FF4F1A",
    "#384766", "#506877", "#3D4E70", "#4A4A4F", "#6D7EA1", "#70838F", "#B8008C", "#FF75DF"
  ];

  // Handle date range change (single input with range mode) - auto apply on change
  const handleDateRangeChange = (selectedDates) => {
    if (selectedDates.length === 2) {
      // Both dates selected - apply filter automatically
      const startDate = selectedDates[0];
      const endDate = selectedDates[1];
      
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const newDateFilter = {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      };
      
      setDateFilter(newDateFilter);
      setDateError('');
      
      // Auto-apply filter when both dates are selected
      // TODO: Fetch data with new date range
      console.log('Filtering with dates:', newDateFilter);
    } else if (selectedDates.length === 1) {
      // Only start date selected, wait for end date
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      setDateFilter(prev => ({
        ...prev,
        startDate: formatDate(selectedDates[0])
      }));
    } else {
      // No dates selected - reset to current month
      const currentMonth = getCurrentMonthDates();
      setDateFilter({
        startDate: currentMonth.startDate,
        endDate: currentMonth.endDate
      });
      setDateError('');
      
      // TODO: Fetch data with reset dates
      console.log('Resetting to current month:', currentMonth);
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

  // Donut chart configuration for Service Breakdown
  const serviceBreakdownOptions = {
    chart: { type: "donut", height: 350 },
    labels: usageLabels,
    colors: usageColors,

    plotOptions: {
      pie: {
        dataLabels: {
          offset: -10,
          style: {
            colors: ["#fff"], // Label color white
            fontWeight: "bold"
          },
          formatter: (val, opts) => {
            const seriesIndex = opts.seriesIndex;
            const value = opts.w.config.series[seriesIndex];

            return `$${value.toFixed(2)}`;  // <-- $ + 2 decimals
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
              formatter: (val) => `$${Number(val).toFixed(2)}`  // <-- center value
            },
            total: {
              show: true,
              label: "Total",
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return `${formatCurrency(total)}`; // <-- Total in dollars
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
        return `${label}: $${value.toFixed(2)}`;  // <-- Add $ + 2 digits in legend
      }
    },

    tooltip: {
      y: {
        formatter: (val) => `$${val.toFixed(2)}`  // <-- Tooltip formatting
      }
    }
  };

  // const serviceBreakdownSeries = serviceBreakdown.map(s => s.value);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  /*const getStatusBadge = (status) => {
    const statusClasses = {
      Success: 'bg-green-600 text-white',
      Deduced: 'bg-orange-600 text-white',
      Failed: 'bg-red-600 text-white',
      Pending: 'bg-yellow-600 text-white'
    };
    return statusClasses[status] || 'bg-gray-600 text-white';
  };

  const getTypeIcon = (type) => {
    const iconColors = {
      Message: 'text-green-600',
      Voice: 'text-red-600',
      Debit: 'text-green-600',
      Credit: 'text-blue-600'
    };
    return iconColors[type] || 'text-gray-600';
  };

  const handleDownloadCSV = async () => {
    try {
      setDownloading(true);
      // TODO: Implement CSV download functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Downloading CSV...');
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
  };*/

  const EVENT_MAP = {
    1: { name: "Number Purchase", color: "#10b981" },   // green
    2: { name: "Outbound Call", color: "#3b82f6" },     // blue
    3: { name: "Outbound SMS", color: "#f59e0b" },      // amber
    4: { name: "Inbound SMS", color: "#8b5cf6" },       // purple
    5: { name: "Inbound Call", color: "#ef4444" },      // red
    6: { name: "Number Renewal", color: "#14b8a6" }     // teal
  };

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

      let totalInThousands = 0; // <-- final result

      Object.keys(EVENT_MAP).forEach((eventId) => {
        const found = apiData.find((e) => Number(e.event) === Number(eventId));

        const value = found?.total_credits_used/1000 || 0;

        console.log(value,'value');

        series.push(value);
        labels.push(EVENT_MAP[eventId].name);
        colors.push(EVENT_MAP[eventId].color);

        totalInThousands += value;   // <-- divide and accumulate
      });

      setUsageData(series);
      setUsageLabels(labels);
      setUsageColors(colors);

      // 🚀 Store total (already divided by 1000)
      setCreditsTotal(totalInThousands);

    } catch (error) {
      console.log("Error loading breakdown:", error);
    }
  };

  fetchUsage();
}, [dateFilter]);


  useEffect(() => {
    const fetchAgentWiseUsage = async () => {
      try {
        setAgentExpenses([])
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
      } catch (error) {
        setAgentError("Failed to load agent-wise usage", error);
        setAgentExpenses([]);
      } finally {
        setAgentLoading(false);
      }
    };

    fetchAgentWiseUsage();
  }, [dateFilter, agentSearchTerm, page]);

  const CustomPagination = () => {
    const pageCount = Math.ceil(total / perPage);
    if (pageCount <= 1) return null;

    return (
      <ReactPaginate
        previousLabel="«"
        nextLabel="»"
        forcePage={page - 1}   // convert API page → ReactPaginate page
        onPageChange={handlePagination}
        pageCount={pageCount}
        breakLabel="..."
        containerClassName="flex space-x-2 mt-4 justify-end"
        pageLinkClassName="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
        previousLinkClassName="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
        nextLinkClassName="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
        breakLinkClassName="px-4 py-2 border border-gray-300 rounded-full"
        activeLinkClassName="bg-[#0a2463] text-white" // Dark blue like your screenshot
      />
    );
  };

  const handlePagination = (selected) => {
    const selectedPage = selected.selected + 1; // convert 0-based → 1-based
    setPage(selectedPage);
  };


  useEffect(() => {
    const fetchDailySpend = async () => {
      try {
        const start = formatDateForAPI(dateFilter.startDate);
        const end = formatDateForAPI(dateFilter.endDate);

        const res = await dashboardService.getDailySpend(start, end);
        const apiData = res?.data || [];

        // Filter by selected event
        const filtered = apiData.filter(
          (item) => Number(item.event) === Number(selectedEvent)
        );

        // Convert API mm-dd-yyyy → readable date label
        const formatted = filtered.map((item) => {
          const [mm, dd] = item.date.split("-"); // API format: "12-22-2025"
          const value = (item.total_credits || 0) / 1000;
            return {
              date: `${dd}/${mm}`,  // FINAL FORMAT: dd/mm
              value: value
            };
        });

        setDailyChartData(formatted);
      } catch (error) {
        console.log("Error:", error);
      }
    };

    fetchDailySpend();
  }, [dateFilter, selectedEvent]);

  const dailySpendChartOptions = {
    chart: {
      type: "line",
      toolbar: { show: false }
    },
    colors: [EVENT_MAP[selectedEvent].color],
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
  };

  const dailySpendSeries = [
    {
      name: EVENT_MAP[selectedEvent].name,
      data: dailyChartData.map((i) => i.value)
    }
  ];

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      {/* Sidebar */}
      <SharedSidebar currentPath="/admin/expense-reports" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6 pt-20 lg:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0a2463] dark:text-[#4d9fff]">Expense and Reports</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Track your wallet balance and usage analytics</p>
            </div>
            
            {/* Date Range Picker - Right side of heading */}
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range:</span>
              </div>
              <div className="min-w-[250px] max-w-[350px]">
                <DatePicker
                  value={dateFilter.startDate && dateFilter.endDate ? [dateFilter.startDate, dateFilter.endDate] : undefined}
                  onChange={handleDateRangeChange}
                  options={{
                    mode: 'range',
                    dateFormat: 'Y-m-d',
                    defaultDate: [dateFilter.startDate, dateFilter.endDate],
                  }}
                  placeholder="Select date range"
                  className="w-full text-sm"
                />
                {dateError && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{dateError}</p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Summary Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-6">
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
            <Card className="bg-white dark:bg-gray-800 shieldnest-shadow p-6">
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
              {/* <button
                onClick={handleAddFunds}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add Funds</span>
              </button> */}
            </Card>

            {/* Monthly Volume Card */}
            {/* <Card className="bg-white dark:bg-gray-800 shieldnest-shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Monthly Volume</h3>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">+12%</span>
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">2401 Mins Voice</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">-5%</span>
                  </div>
                </div>
              </div>
            </Card> */}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Daily Spend Chart */}
           <Card className="bg-white dark:bg-gray-800 shieldnest-shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Daily Spend</h2>

                {/* Event Filter */}
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                  style={{ color: EVENT_MAP[selectedEvent].color, fontWeight: "bold" }}
                >
                  {Object.keys(EVENT_MAP).map((id) => (
                    <option key={id} value={id}>
                      {EVENT_MAP[id].name}
                    </option>
                  ))}
                </select>
              </div>

              <Chart
                options={dailySpendChartOptions}
                series={dailySpendSeries}
                type="line"
                height={350}
              />
            </Card>


            {/* Service Breakdown Chart */}
            <Card className="bg-white dark:bg-gray-800 shieldnest-shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Service Breakdown
              </h2>
              {usageData.length == 0 ? (
                <div className='text-center'>
                <p className="text-md text-gray-600 p-4">Loading data...</p>
                </div>
              ) : (
              <Chart
                options={serviceBreakdownOptions}
                series={usageData}
                type="donut"
                height={350}
              />)}
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
                        setPage(1); // reset to first page when searching
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
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
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
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Phone
                    </th> */}
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
                      Total Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Recharged Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAgentExpenses.length === 0 && !agentLoading  ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
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
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {agent.agentPhone}
                        </td> */}
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
                  }))}
                </tbody>
                {/* {filteredAgentExpenses.length > 0 && (
                  <tfoot className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(filteredAgentExpenses.reduce((sum, agent) => sum + agent.smsCost, 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(filteredAgentExpenses.reduce((sum, agent) => sum + agent.voiceCost, 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(filteredAgentExpenses.reduce((sum, agent) => sum + agent.inboundCost, 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(filteredAgentExpenses.reduce((sum, agent) => sum + agent.totalCost, 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {filteredAgentExpenses.reduce((sum, agent) => sum + agent.transactions, 0)}
                      </td>
                    </tr>
                  </tfoot>
                )} */}
              </table>
              <div className='text-center'>
              {agentLoading && (
                <p className="text-md text-gray-600 p-4">Loading agent data...</p>
              )}

              {agentError && (
                <p className="text-md text-red-600 p-4">{agentError}</p>
              )}
              </div>
            </div>
            <div className="p-4">
              <CustomPagination />
            </div>


          </Card>

          {/* Transaction Ledger */}
          {/* <Card className="bg-white dark:bg-gray-800 shieldnest-shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Transaction Ledger</h3>
                <button
                  onClick={handleDownloadCSV}
                  disabled={downloading}
                  className="bg-[#0a2463] dark:bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-[#0a2463]/90 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>{downloading ? 'Downloading...' : 'Download CSV'}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${getTypeIcon(transaction.type)}`}>
                              {transaction.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </Card> */}
        </main>
      </div>
    </div>
  );
};

export default ExpenseAndReports;

