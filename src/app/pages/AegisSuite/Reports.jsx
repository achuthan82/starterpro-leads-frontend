import { useState } from 'react';
// import { useNavigate } from 'react-router';
import { Card } from 'components/ui';
import SharedSidebar from './components/SharedSidebar';
// import { useAuthContext } from 'app/contexts/auth/context';
import RoleGuard from 'middleware/RoleGuard';
import { 
  ChartBarIcon,
  ArrowDownTrayIcon,
  //MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import AnalyticsDashboard from './reports/AnalyticsDashboard';
import reportService from 'utils/reportService';

const ReportsContent = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // const navigate = useNavigate();
  // const { logout } = useAuthContext();

  // Category options for the first dropdown
  const categoryOptions = [
    {
      id: 1,
      name: 'Mailing Campaign',
      options: [
        { id: 1, name: 'Mailed Lead', value: 1 }
      ]
    }
  ];

  // Handle logout for 401 errors
  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //     navigate('/shieldnest/login');
  //   } catch (error) {
  //     console.error('Logout error:', error);
  //     // Fallback: clear localStorage and redirect
  //     localStorage.removeItem('authToken');
  //     localStorage.removeItem('isAuthenticated');
  //     localStorage.removeItem('userRole');
  //     localStorage.removeItem('userEmail');
  //     localStorage.removeItem('agentId');
  //     localStorage.removeItem('currentUser');
  //     navigate('/shieldnest/login');
  //   }
  // };

  // Fetch campaigns based on selected type
  const fetchCampaigns = async (categoryId, search = '') => {
    if (!categoryId) return;

    setIsLoadingCampaigns(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const data = await reportService.getCampaigns({ categoryId, search, token });
      setCampaigns(data.data || data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to fetch campaigns. Please try again.');
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  // Handle type selection
  const handleTypeChange = (value) => {
    setSelectedType(value);
    setSelectedCampaign('');
    setCampaigns([]);
    setSearchTerm('');
    
    if (value) {
      fetchCampaigns(value);
    }
  };

  // Handle search for campaigns
  /*const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (selectedType) {
      fetchCampaigns(selectedType, value);
    }
  };*/

  // Handle download file
  const handleDownload = async () => {
    if (!selectedType || !selectedCampaign) return;

    console.log('selectedType', selectedType);
    console.log('selectedCampaign', selectedCampaign);

    setIsDownloading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const selectedCampaignData = campaigns.find(campaign => campaign.id === parseInt(selectedCampaign));
      console.log('campaigns', campaigns);
      console.log('selectedCampaignData', selectedCampaignData);

      if (!selectedCampaignData) {
        throw new Error('Selected campaign not found');
      }

      // First, get the JSON response to process the data
      const response = await reportService.downloadCampaignFile({
        campaignId: selectedCampaign,
        campaignName: selectedCampaignData.name,
        token
      });

      // Convert blob to text to get JSON data
      const text = await response.text();
      let jsonData;
      
      try {
        jsonData = JSON.parse(text);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Invalid response format from server');
      }

      // Use the helper method to convert JSON to CSV
      const csvContent = reportService.convertToCSV(jsonData);

      // Debug: Log the CSV content (first 500 characters)
      console.log('Generated CSV content (first 500 chars):', csvContent.substring(0, 500));

      // Create blob from CSV content with BOM for Excel compatibility
      const BOM = '\uFEFF';
      const csvBlob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (selectedCampaignData.name || 'download') + '.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Filter category options based on search
  const filteredCategoryOptions = categoryOptions.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.options.some(option => 
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      {/* Sidebar */}
      <SharedSidebar currentPath="/reports" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0a2463] dark:text-blue-400">Reports</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Generate and download reports</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports'
                      ? 'border-[#0a2463] dark:border-blue-400 text-[#0a2463] dark:text-blue-400 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                >
                  <ChartBarIcon className="w-5 h-5 inline mr-2" />
                  Reports
                </button>
                <button
                  onClick={() => setActiveTab('downloads')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'downloads'
                      ? 'border-[#0a2463] dark:border-blue-400 text-[#0a2463] dark:text-blue-400 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                >
                  <ArrowDownTrayIcon className="w-5 h-5 inline mr-2" />
                  Downloads
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'reports' && (
            <AnalyticsDashboard />
          )}

          {activeTab === 'downloads' && (
            <Card className="p-6 bg-white dark:bg-gray-800 shieldnest-shadow overflow-hidden rounded-xl">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-[#0a2463] mb-6">Download Files</h3>
                
                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                {/* Choose Type Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Choose Type
                  </label>
                  {/* <div className="relative">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#0a2463] focus:outline-none mb-2"
                    />
                    <MagnifyingGlassIcon className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div> */}
                  
                  <select
                    value={selectedType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#0a2463] focus:outline-none"
                  >
                    <option value="">Select a category</option>
                    {filteredCategoryOptions.map((category) => (
                      <optgroup key={category.id} label={category.name}>
                        {category.options.map((option) => (
                          <option key={option.id} value={option.value}>
                            {option.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Choose Campaign Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Choose Campaign
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCampaign}
                      onChange={(e) => {console.log(e); setSelectedCampaign(e.target.value)}}
                      disabled={!selectedType || isLoadingCampaigns}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#0a2463] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {isLoadingCampaigns ? 'Loading campaigns...' : 'Select a campaign'}
                      </option>
                      {campaigns && campaigns.length > 0 && campaigns.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                    {isLoadingCampaigns && (
                      <div className="absolute right-3 top-2.5">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0a2463]"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Download Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleDownload}
                    disabled={!selectedType || !selectedCampaign || isDownloading}
                    className="flex items-center px-6 py-3 bg-[#0a2463] text-white rounded-lg hover:bg-[#0a2463]/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                        Download File
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

const Reports = () => {
  return (
    <RoleGuard allowedRoles="admin">
      <ReportsContent />
    </RoleGuard>
  );
};

export default Reports; 