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
//   const [autoRecharge, setAutoRecharge] = useState(true);
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
          {/* Wallet Overview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Balance Card */}
            <Card className="bg-white dark:bg-gray-800 shieldnest-shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Your balance</h3>
              </div>
              <div className="mb-4">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(walletBalance)}
                </p>
              </div>
              <button
                onClick={handleAddFunds}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add Funds</span>
              </button>
            </Card>

            {/* Auto-Recharge Card */}
            {/* <Card className="bg-white dark:bg-gray-800 shieldnest-shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Auto-Recharge</h3>
                <Switch
                  checked={autoRecharge}
                  onChange={(e) => setAutoRecharge(e.target.checked)}
                />
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  When bal &lt; $10, add $50
                </p>
              </div>
            </Card> */}

            {/* Monthly Volume Card */}
            <Card className="bg-white dark:bg-gray-800 shieldnest-shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Monthly Volume</h3>
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

