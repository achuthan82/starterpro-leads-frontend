import { useState } from 'react';
// import { Card } from 'components/ui';
import SharedSidebar from '../components/SharedSidebar';
import OrdersTab from './OrdersTab';
import SubscriptionsTab from './SubscriptionsTab';

const OrdersAndSubscriptions = () => {
  const [activeTab, setActiveTab] = useState('orders');

  const tabs = [
    { id: 'orders', label: 'Orders' },
    { id: 'subscriptions', label: 'Subscriptions' }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)]">
      {/* Sidebar */}
      <SharedSidebar currentPath="/orders-subscriptions" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-atoll)]">Orders & Subscriptions</h1>
              <p className="text-gray-600 mt-1">Manage your orders and subscription history</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-[var(--color-atoll)] text-[var(--color-atoll)]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'subscriptions' && <SubscriptionsTab />}
        </main>
      </div>
    </div>
  );
};

export default OrdersAndSubscriptions; 