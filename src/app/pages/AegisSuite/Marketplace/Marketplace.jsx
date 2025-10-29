import { useState, useEffect } from 'react';
// import { Card } from 'components/ui';
import SharedSidebar from '../components/SharedSidebar';
// import { 
  // MagnifyingGlassIcon,
  // MapPinIcon,
  // StarIcon,
  // ShoppingCartIcon
// } from '@heroicons/react/24/outline';
import LeadStateFilter from './LeadStateFilter';
import LeadStateList from './LeadStateList';
import MarketplaceLeadDetailsModal from './LeadDetailsModal';
import CartButton from './CartButton';
import CartSidebar from './CartSidebar';
import leadsService from 'utils/leadsService';
import { CartProvider } from 'app/contexts/cart/CartContext';

const Marketplace = () => {
  // const [searchTerm, setSearchTerm] = useState('');
  const [selectedStates, setSelectedStates] = useState([]);
  const [modalState, setModalState] = useState({ open: false, state: null });
  const [cartOpen, setCartOpen] = useState(false);
  const [pricingData, setPricingData] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [pricingError, setPricingError] = useState(null);

  useEffect(() => {
    const fetchPricing = async () => {
      setPricingLoading(true);
      setPricingError(null);
      try {
        const data = await leadsService.getMarketplacePricing();
        setPricingData(data?.data);
      } catch (error) {
        console.error('Error fetching pricing data:', error);
        setPricingError('Failed to load pricing data.');
      } finally {
        setPricingLoading(false);
      }
    };
    fetchPricing();
  }, []);

  return (
    <CartProvider>
      <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
        {/* Sidebar */}
        <SharedSidebar currentPath="/marketplace" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="px-0">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#0a2463] dark:text-blue-400">Starterpro Lead Bank</h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">Premium Insurance Leads at Your Fingertips</p>
                </div>
                
                {/* <div className="flex gap-8 items-center">
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
                </div> */}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto px-6 py-8">
            <LeadStateFilter selected={selectedStates} onChange={setSelectedStates} />
            {pricingLoading && <div className="text-gray-900 dark:text-gray-100">Loading pricing...</div>}
            {pricingError && <div className="text-red-500 dark:text-red-400">{pricingError}</div>}
            {!pricingLoading && !pricingError && (
              <LeadStateList
                selectedStates={selectedStates}
                pricingData={pricingData}
                onViewLeads={(state) => setModalState({ open: true, state })}
              />
            )}
          </main>
        </div>
        <MarketplaceLeadDetailsModal open={modalState.open} state={modalState.state} onClose={() => setModalState({ open: false, state: null })} pricingData={pricingData} />
        <CartButton onClick={() => setCartOpen(true)} />
        <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </CartProvider>
  );
};

export default Marketplace; 