import { useState, useEffect } from 'react';
import { Card } from 'components/ui';
import SharedSidebar from '../components/SharedSidebar';
import Chart from 'react-apexcharts';
import { DatePicker } from 'components/shared/form/Datepicker';
import dashboardService from 'utils/dashboardService';
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
  const [totalSpend] = useState(375.50);
  const [dateFilter, setDateFilter] = useState({
    startDate: initialDates.startDate,
    endDate: initialDates.endDate
  });
  const [dateError, setDateError] = useState('');
  const [agentSearchTerm, setAgentSearchTerm] = useState('');
  const [usageData, setUsageData] = useState([]);
  const [usageColors, setUsageColors] = useState([]);
  const [usageLabels, setUsageLabels] = useState([]);

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
  
  // Mock data - replace with actual API calls
  const [dailySpendData] = useState([
    { date: 'Oct 8', smsCost: 45, voiceCost: 32 },
    { date: 'Oct 16', smsCost: 38, voiceCost: 28 },
    { date: 'Oct 18', smsCost: 42, voiceCost: 35 },
    { date: 'Oct 21', smsCost: 35, voiceCost: 30 },
    { date: 'Oct 24', smsCost: 40, voiceCost: 33 }
  ]);

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
  const [agentExpenses] = useState([
    {
      id: 1,
      agentId: 'A001',
      agentName: 'John Smith',
      smsCost: 125.50,
      voiceCost: 89.30,
      inboundCost: 45.20,
      totalCost: 260.00,
      transactions: 45
    },
    {
      id: 2,
      agentId: 'A002',
      agentName: 'Sarah Johnson',
      smsCost: 98.75,
      voiceCost: 112.40,
      inboundCost: 32.10,
      totalCost: 243.25,
      transactions: 38
    },
    {
      id: 3,
      agentId: 'A003',
      agentName: 'Michael Brown',
      smsCost: 67.20,
      voiceCost: 54.80,
      inboundCost: 28.50,
      totalCost: 150.50,
      transactions: 22
    },
    {
      id: 4,
      agentId: 'A004',
      agentName: 'Emily Davis',
      smsCost: 145.30,
      voiceCost: 78.90,
      inboundCost: 41.60,
      totalCost: 265.80,
      transactions: 52
    }
  ]);

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
      agent.agentName?.toLowerCase().includes(searchLower) ||
      agent.agentId?.toLowerCase().includes(searchLower)
    );
  });

  // Line chart configuration for Daily Spend
  const dailySpendChartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      height: 350
    },
    colors: ['#22c55e', '#3b82f6'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: dailySpendData.map(d => d.date),
      labels: {
        style: {
          colors: '#6b7280'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${value}`,
        style: {
          colors: '#6b7280'
        }
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right'
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toFixed(2)}`
      }
    }
  };

  const dailySpendSeries = [
    {
      name: 'SMS Cost',
      data: dailySpendData.map(d => d.smsCost)
    },
    {
      name: 'Voice Cost (30 Days)',
      data: dailySpendData.map(d => d.voiceCost)
    }
  ];

  // Donut chart configuration for Service Breakdown
const serviceBreakdownOptions = {
  chart: { type: "donut", height: 350 },
  labels: usageLabels,
  colors: usageColors,
  plotOptions: {
    pie: {
      donut: {
        size: "70%",
        labels: {
          show: true,
          total: {
            show: true,
            label: "Total",
            color: "#000",
            formatter: () =>
              usageData.reduce((acc, val) => acc + Number(val), 0).toFixed(2),
          },
          value: {
            color: "#000"
          }
        }
      }
    }
  },
  legend: { position: "bottom", horizontalAlign: "center" },
  dataLabels: {
    enabled: true,
    style: {
      fontSize: "14px",
      fontWeight: "bold",
      colors: ["#fff"]  // <-- FIX WHITE TEXT ISSUE
    },
    formatter: (val) => `${val.toFixed(1)}%`,
  },
  tooltip: {
    y: {
      formatter: (val) => val.toFixed(2)
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

        // Build 6 fixed event outputs
        const series = [];
        const labels = [];
        const colors = [];

        Object.keys(EVENT_MAP).forEach((eventId) => {
          const found = apiData.find((e) => Number(e.event) === Number(eventId));

          series.push(found?.total_credits_used || 0);
          labels.push(EVENT_MAP[eventId].name);
          colors.push(EVENT_MAP[eventId].color);
        });

        setUsageData(series);
        setUsageLabels(labels);
        setUsageColors(colors);
      } catch (error) {
        console.log("Error loading breakdown", error);
      }
    };

    fetchUsage();
  }, [dateFilter]);

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      {/* Sidebar */}
      <SharedSidebar currentPath="/admin/expense-reports" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
                  {formatCurrency(totalSpend)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">All time expenses</p>
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
            <Card className="bg-white dark:bg-gray-800 shieldnest-shadow p-6">
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
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Daily Spend Chart */}
            <Card className="bg-white dark:bg-gray-800 shieldnest-shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Daily Spend (Last 30 Days)
              </h2>
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
             <Chart
                options={serviceBreakdownOptions}
                series={usageData}
                type="donut"
                height={350}
              />
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
                      placeholder="Search by agent name or ID..."
                      value={agentSearchTerm}
                      onChange={(e) => setAgentSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0a2463] dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-64"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      SMS Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Voice Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Inbound Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Transactions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAgentExpenses.length === 0 ? (
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
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {agent.agentId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatCurrency(agent.smsCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatCurrency(agent.voiceCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatCurrency(agent.inboundCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(agent.totalCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {agent.transactions}
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
                {filteredAgentExpenses.length > 0 && (
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
                )}
              </table>
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

