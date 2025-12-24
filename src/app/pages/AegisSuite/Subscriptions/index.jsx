import { useState, useEffect } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import clsx from 'clsx';
import SharedSidebar from '../components/SharedSidebar';

import { useAuthContext } from 'app/contexts/auth/context';
import { subscriptionService } from 'utils/apiService';
import { apiUtils } from 'utils/apiService';
import { Spinner } from 'components/ui';

import CurrentSubscription from './CurrentSubscription';
import AvailablePlans from './AvailablePlans';
import InvoiceHistory from './InvoiceHistory';
import PreviousSubscriptions from './PreviousSubscriptions';
import { useNavigate } from 'react-router';

// ----------------------------------------------------------------------

const Subscriptions = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(null);
  const fetchSubscription = async () => {
        try {
          setLoading(true);
          const response = await subscriptionService.getCurrentSubscription(user.id);
          setSubscription(response?.data?.data);
        } catch (err) {
          if (apiUtils.isAuthError(err)) {
            logout();
          } else {
            setError('Failed to fetch subscription details.');
            // if the error is 404, it means no subscription found.
            if (err?.response?.status !== 404) {
                setError(apiUtils.formatError(err));
            }
          }
        } finally {
          setLoading(false);
        }
      };
  useEffect(() => {
    console.log('Subscriptions - user:', user);
    if (user?.id) {
      fetchSubscription();
    }
  }, [user, logout]);

  const TABS = [
    { id: 'current', title: 'Current Subscription' },
    { id: 'previous', title: 'Previous Subscriptions' },
  ];

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      {/* Sidebar */}
      <SharedSidebar currentPath="/subscriptions" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
          <div className='mt-10 xl:mt-0'>
            <h1 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">Subscriptions</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your subscriptions</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
        {loading && <Spinner />}

        {error && <div className="text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-4 rounded-md">{error}</div>}

        {!loading && !error && (
          <TabGroup>
            <TabList className="border-b border-gray-200 dark:border-gray-700">
              {TABS.map((tab) => (
                <Tab
                  key={tab.id}
                  className={({ selected }) =>
                    clsx(
                      'px-4 py-2 text-sm font-medium leading-5',
                      'focus:outline-none',
                      selected
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    )
                  }
                >
                  {tab.title}
                </Tab>
              ))}
            </TabList>
            <TabPanels className="mt-4">
              <TabPanel>
                <CurrentSubscription subscription={subscription} fetchSubscription={fetchSubscription} />
              </TabPanel>
              <TabPanel>
                <PreviousSubscriptions/>
                {/* <p className='mb-0 text-gray-500'>No Previous Subscriptions Found</p> */}
              </TabPanel>
            </TabPanels>
          </TabGroup>
        )}

        <div className="mt-12">
          <AvailablePlans subscription={subscription}  />
        </div>
        <div className="mt-12">
          <InvoiceHistory navigate={navigate} />
        </div>
        </main>
      </div>  
    </div>
  );
};

export default Subscriptions; 