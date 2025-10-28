import { useState } from 'react';
import { Card } from 'components/ui';
import SharedSidebar from './components/SharedSidebar';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

const LeadMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedState, setSelectedState] = useState(null);

  // Sample state data
  const statesData = [
    {
      name: 'Florida',
      code: 'FL',
      totalLeads: 2847,
      freshLeads: 156,
      price: 28.50,
      quality: 4.8,
      conversionRate: 12.5,
      ageDistribution: [
        { range: '0-24 hours', count: 156, percentage: 65 },
        { range: '1-3 days', count: 89, percentage: 25 },
        { range: '4-7 days', count: 45, percentage: 10 }
      ],
      leadTypes: [
        { type: 'Auto Insurance', count: 1247, price: 32.00 },
        { type: 'Home Insurance', count: 856, price: 28.50 },
        { type: 'Life Insurance', count: 744, price: 45.00 }
      ],
      territories: [
        { zip: '33101', city: 'Miami', leads: 45, price: 35.00 },
        { zip: '33109', city: 'Miami Beach', leads: 32, price: 42.00 },
        { zip: '33134', city: 'Coral Gables', leads: 28, price: 38.50 }
      ]
    },
    {
      name: 'Texas',
      code: 'TX',
      totalLeads: 3124,
      freshLeads: 189,
      price: 24.75,
      quality: 4.6,
      conversionRate: 11.8,
      ageDistribution: [
        { range: '0-24 hours', count: 189, percentage: 68 },
        { range: '1-3 days', count: 95, percentage: 22 },
        { range: '4-7 days', count: 48, percentage: 10 }
      ],
      leadTypes: [
        { type: 'Auto Insurance', count: 1456, price: 28.00 },
        { type: 'Home Insurance', count: 978, price: 24.75 },
        { type: 'Life Insurance', count: 690, price: 38.50 }
      ],
      territories: [
        { zip: '75201', city: 'Dallas', leads: 52, price: 28.00 },
        { zip: '77001', city: 'Houston', leads: 48, price: 26.50 },
        { zip: '78701', city: 'Austin', leads: 35, price: 31.00 }
      ]
    },
    {
      name: 'California',
      code: 'CA',
      totalLeads: 4567,
      freshLeads: 234,
      price: 42.50,
      quality: 4.9,
      conversionRate: 14.2,
      ageDistribution: [
        { range: '0-24 hours', count: 234, percentage: 72 },
        { range: '1-3 days', count: 118, percentage: 20 },
        { range: '4-7 days', count: 67, percentage: 8 }
      ],
      leadTypes: [
        { type: 'Auto Insurance', count: 2134, price: 45.00 },
        { type: 'Home Insurance', count: 1456, price: 42.50 },
        { type: 'Life Insurance', count: 977, price: 65.00 }
      ],
      territories: [
        { zip: '90210', city: 'Beverly Hills', leads: 25, price: 65.00 },
        { zip: '94102', city: 'San Francisco', leads: 38, price: 58.00 },
        { zip: '90001', city: 'Los Angeles', leads: 67, price: 48.50 }
      ]
    },
    {
      name: 'New York',
      code: 'NY',
      totalLeads: 3856,
      freshLeads: 201,
      price: 38.75,
      quality: 4.7,
      conversionRate: 13.1,
      ageDistribution: [
        { range: '0-24 hours', count: 201, percentage: 69 },
        { range: '1-3 days', count: 112, percentage: 23 },
        { range: '4-7 days', count: 58, percentage: 8 }
      ],
      leadTypes: [
        { type: 'Auto Insurance', count: 1689, price: 42.00 },
        { type: 'Home Insurance', count: 1234, price: 38.75 },
        { type: 'Life Insurance', count: 933, price: 55.00 }
      ],
      territories: [
        { zip: '10001', city: 'New York', leads: 58, price: 45.00 },
        { zip: '11201', city: 'Brooklyn', leads: 42, price: 38.75 },
        { zip: '10025', city: 'Manhattan', leads: 35, price: 52.00 }
      ]
    }
  ];

  const regions = [
    { id: 'all', name: 'All Regions' },
    { id: 'southeast', name: 'Southeast' },
    { id: 'southwest', name: 'Southwest' },
    { id: 'west', name: 'West Coast' },
    { id: 'northeast', name: 'Northeast' }
  ];

  const filteredStates = statesData.filter(state => {
    const matchesSearch = state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         state.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const openStateDetail = (state) => {
    setSelectedState(state);
  };

  const closeStateDetail = () => {
    setSelectedState(null);
  };

  const purchaseLeads = (leadType, quantity) => {
    // Implementation for purchasing leads
    alert(`Purchasing ${quantity} ${leadType} leads`);
  };

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)]">
      {/* Sidebar */}
      <SharedSidebar currentPath="/marketplace" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-[var(--color-atoll)] to-blue-600 text-white py-6 shadow-lg">
          <div className="px-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-1">ShieldNest Lead Marketplace</h1>
                <p className="text-blue-100 text-lg">Premium Insurance Leads at Your Fingertips</p>
              </div>
              
              <div className="flex gap-8 items-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">14,394</div>
                  <div className="text-sm text-blue-100">Total Leads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">780</div>
                  <div className="text-sm text-blue-100">Fresh Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">4.7★</div>
                  <div className="text-sm text-blue-100">Avg Quality</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto px-6 py-8">
        {/* Filter Section */}
        <Card className="mb-8 dark:bg-gray-800">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[var(--color-atoll)] mb-4 dark:text-gray-100">Find Your Perfect Leads</h2>
            
            {/* Search Box */}
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by state name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-[var(--color-botticelli)] rounded-lg focus:border-[var(--color-atoll)] focus:outline-none text-lg"
              />
            </div>

            {/* Region Filters */}
            <div className="flex gap-2 flex-wrap">
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegion(region.id)}
                  className={`px-4 py-2 rounded-full border-2 transition-all ${
                    selectedRegion === region.id
                      ? 'bg-[var(--color-atoll)] text-white border-[var(--color-atoll)]'
                      : 'bg-white text-gray-700 border-[var(--color-botticelli)] hover:border-[var(--color-atoll)]'
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* States Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStates.map((state) => (
            <Card key={state.code} className="hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
              <div className="p-6">
                {/* State Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-[var(--color-atoll)]">{state.name}</h3>
                  <span className="bg-[var(--color-botticelli)] text-[var(--color-atoll)] px-3 py-1 rounded-full text-sm font-semibold">
                    {state.code}
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{state.totalLeads.toLocaleString()}</div>
                    <div className="text-xs text-blue-500">Total Leads</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{state.freshLeads}</div>
                    <div className="text-xs text-green-500">Fresh Leads</div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-700">Starting at</span>
                  <span className="text-2xl font-bold text-[var(--color-fern)]">${state.price}</span>
                </div>

                {/* Quality Indicators */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quality Score</span>
                    <div className="flex items-center">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium ml-1">{state.quality}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="text-sm font-medium text-green-600">{state.conversionRate}%</span>
                  </div>
                </div>

                {/* Age Distribution Bar */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Lead Freshness</div>
                  <div className="flex rounded-full overflow-hidden h-2 bg-gray-200">
                    {state.ageDistribution.map((age, index) => (
                      <div
                        key={index}
                        style={{ width: `${age.percentage}%` }}
                        className={`h-full ${
                          index === 0 ? 'bg-green-500' :
                          index === 1 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Fresh</span>
                    <span>Recent</span>
                    <span>Older</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openStateDetail(state)}
                    className="flex-1 bg-[var(--color-atoll)] text-white py-2 px-4 rounded-lg hover:bg-[var(--color-atoll)]/90 transition-colors font-medium"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => alert(`Added ${state.name} leads to cart!`)}
                    className="bg-[var(--color-fern)] text-white py-2 px-4 rounded-lg hover:bg-[var(--color-fern)]/90 transition-colors"
                    title="Add to Cart"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        </main>
      </div>

      {/* State Detail Modal */}
      {selectedState && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-lg bg-white mb-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[var(--color-atoll)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{selectedState.code}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--color-atoll)]">{selectedState.name} Leads</h3>
                  <p className="text-gray-600">{selectedState.totalLeads.toLocaleString()} total leads available</p>
                </div>
              </div>
              <button onClick={closeStateDetail} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Types */}
                <div>
                  <h4 className="text-lg font-semibold text-[var(--color-atoll)] mb-4">Available Lead Types</h4>
                  <div className="space-y-3">
                    {selectedState.leadTypes.map((leadType, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-semibold text-gray-900">{leadType.type}</h5>
                            <p className="text-sm text-gray-600">{leadType.count} leads available</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-[var(--color-fern)]">${leadType.price}</div>
                            <button
                              onClick={() => purchaseLeads(leadType.type, 10)}
                              className="text-sm bg-[var(--color-atoll)] text-white px-3 py-1 rounded mt-1 hover:bg-[var(--color-atoll)]/90"
                            >
                              Buy 10
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Territories */}
                <div>
                  <h4 className="text-lg font-semibold text-[var(--color-atoll)] mb-4">Top Territories</h4>
                  <div className="space-y-3">
                    {selectedState.territories.map((territory, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <MapPinIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <h5 className="font-semibold text-gray-900">{territory.city}</h5>
                              <p className="text-sm text-gray-600">ZIP: {territory.zip}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">{territory.leads} leads</div>
                            <div className="font-bold text-[var(--color-fern)]">${territory.price}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Age Distribution Details */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-[var(--color-atoll)] mb-4">Lead Age Distribution</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedState.ageDistribution.map((age, index) => (
                    <Card key={index} className="p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{age.count}</div>
                      <div className="text-sm text-gray-600 mb-2">{age.range}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            index === 0 ? 'bg-green-500' :
                            index === 1 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${age.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{age.percentage}%</div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadMarketplace; 