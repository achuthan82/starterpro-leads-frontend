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
import { useAuthContext } from 'app/contexts/auth/context';
const SideLeadBank = () => {
    const cartItems = JSON.parse(sessionStorage.getItem('cart')) || []
    const {user} = useAuthContext()
    const [selectedStates, setSelectedStates] = useState([]);
    const [modalState, setModalState] = useState({ open: false, state: null });
    const [cartOpen, setCartOpen] = useState(false);
    const [pricingData, setPricingData] = useState(null);
    const [pricingLoading, setPricingLoading] = useState(true);
    const [pricingError, setPricingError] = useState(null);
    const [options, setOptions] = useState([]);
    const  [cartData, setCartData] = useState(cartItems)
    const [selectedAgency, setSelectedAgency] = useState({value:user?.agency?.id, label:user?.agency?.name})
    const [totalLeads, setTotalLeads] = useState(null);
    const [totalLeadsLoading, setTotalLeadsLoading] = useState(true);
    
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

    useEffect(() => {
      const fetchTotalLeads = async () => {
        setTotalLeadsLoading(true);
        try {
          const response = await leadsService.getSideBankTotalLeads();
          setTotalLeads(response?.data?.total_available_leads || response?.total_available_leads || 0);
        } catch (error) {
          console.error('Error fetching total available leads:', error);
          setTotalLeads(0);
        } finally {
          setTotalLeadsLoading(false);
        }
      };
      fetchTotalLeads();
    }, []);
  
    return (
      <CartProvider>
        <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
          {/* Sidebar */}
          <SharedSidebar currentPath="/side-leads" />
  
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="px-0">
                <div className="mt-10 xl:mt-0 flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-[#0a2463] dark:text-blue-400">Starterpro Side Bank</h1>
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
              <LeadStateFilter selected={selectedStates} onChange={setSelectedStates} options={options} setOptions={setOptions} selectedAgency={selectedAgency} setSelectedAgency={setSelectedAgency}/>
              {pricingLoading && <div className="text-gray-900 dark:text-gray-100">Loading pricing...</div>}
              {pricingError && <div className="text-red-500 dark:text-red-400">{pricingError}</div>}
              {!pricingLoading && !pricingError && (
                <LeadStateList
                  selectedAgency={selectedAgency} 
                  options={options}
                  selectedStates={selectedStates}
                  pricingData={pricingData}
                  onViewLeads={(state) => setModalState({ open: true, state })}
                />
              )}
            </main>
          </div>
          <MarketplaceLeadDetailsModal open={modalState.open} state={modalState.state} onClose={() => setModalState({ open: false, state: null })} pricingData={pricingData} cartData={cartData} setCartData={setCartData} selectedAgency={selectedAgency} />
          {/* Total Leads Display */}
          <div className="fixed top-4 right-30 z-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-lg flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 w-25 h-16">
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium leading-tight">Total Leads:</span>
              <span className="text-xs font-bold text-[#0a2463] dark:text-blue-400 leading-tight">
                {totalLeadsLoading ? '...' : totalLeads?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
          <CartButton onClick={() => setCartOpen(true)} cartData={cartData}/>
          <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} cartData={cartData} setCartData={setCartData} selectedAgency={selectedAgency}/>
        </div>
      </CartProvider>
    );
  };
  

export default SideLeadBank
