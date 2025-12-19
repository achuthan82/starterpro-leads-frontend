import { useState } from 'react';
import { Card } from 'components/ui';
import SharedSidebar from '../components/SharedSidebar';
import Chart from 'react-apexcharts';
// import { Switch } from 'components/ui';
import {
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const ExpenseAndReports = () => {
  const [walletBalance] = useState(124.50);
  const [totalRecharge] = useState(500.00);
  const [totalSpend] = useState(375.50);
  const [downloading, setDownloading] = useState(false);
  
  // Mock data - replace with actual API calls
  const [dailySpendData] = useState([
    { date: 'Oct 8', smsCost: 45, voiceCost: 32 },
    { date: 'Oct 16', smsCost: 38, voiceCost: 28 },
    { date: 'Oct 18', smsCost: 42, voiceCost: 35 },
    { date: 'Oct 21', smsCost: 35, voiceCost: 30 },
    { date: 'Oct 24', smsCost: 40, voiceCost: 33 }
  ]);

  const [serviceBreakdown] = useState([
    { name: 'SMS', value: 50, color: '#22c55e' },
    { name: 'Voice', value: 30, color: '#3b82f6' },
    { name: 'Inbound', value: 20, color: '#f97316' }
  ]);

  const [transactions] = useState([
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
  ]);

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
    chart: {
      type: 'donut',
      height: 350
    },
    colors: serviceBreakdown.map(s => s.color),
    labels: serviceBreakdown.map(s => s.name),
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => '100%'
            }
          }
        }
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center'
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}%`
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}%`
      }
    }
  };

  const serviceBreakdownSeries = serviceBreakdown.map(s => s.value);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
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
  };

  const handleAddFunds = () => {
    // TODO: Implement add funds functionality
    console.log('Add funds clicked');
  };

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
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalRecharge)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">All time recharge</p>
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
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Your balance</h3>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold">$</span>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(walletBalance)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Current available balance</p>
              </div>
              <button
                onClick={handleAddFunds}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add Funds</span>
              </button>
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
                series={serviceBreakdownSeries}
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
                  {agentExpenses.map((agent, index) => {
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
                  })}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(agentExpenses.reduce((sum, agent) => sum + agent.smsCost, 0))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(agentExpenses.reduce((sum, agent) => sum + agent.voiceCost, 0))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(agentExpenses.reduce((sum, agent) => sum + agent.inboundCost, 0))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(agentExpenses.reduce((sum, agent) => sum + agent.totalCost, 0))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {agentExpenses.reduce((sum, agent) => sum + agent.transactions, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Transaction Ledger */}
          <Card className="bg-white dark:bg-gray-800 shieldnest-shadow overflow-hidden">
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
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ExpenseAndReports;

