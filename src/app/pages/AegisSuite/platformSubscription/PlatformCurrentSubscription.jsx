// import { useState } from 'react';
// import { PencilIcon } from '@heroicons/react/24/solid';

import { Button, Card, Tag } from 'components/ui';
// import ChangeStatesModal from './ChangeStatesModal';
import CancelSubscription from './PlatformCancelSubscription';
import { useDisclosure } from "hooks";
// import { useNavigate } from 'react-router';

const PlatformCurrentSubscription = ({ subscription, fetchSubscription, noData }) => {
    // const navigate = useNavigate()
    // const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOpen, { open, close }] = useDisclosure(false);
    console.log('subscription', subscription)
    if (!subscription || subscription.status === 204) {
        return (
            <Card>
                <div>
                {/* <Button variant='outline' onClick={() => navigate('/shieldnest/subscriptions/cancel')}>Click to navigate</Button> */}
            </div>
                <div className="text-center p-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 dark:text-white">No Subscription Found</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {noData}
                        {/* You do not have an active subscription. Please choose a plan from the available plans below. */}
                    </p>
                </div>
            </Card>
        );
    }

    //   const { plan, status, states } = subscription;

    // const getNextWednesday = () => {
    //     const date = new Date();
    //     const day = date.getDay();
    //     const diff = day <= 3 ? 3 - day : 10 - day;
    //     date.setDate(date.getDate() + diff);
    //     return date.toLocaleDateString('en-US', {
    //         month: 'long',
    //         day: 'numeric',
    //         year: 'numeric',
    //     });
    // };

    //   const isWeekly = plan?.interval?.toLowerCase() === 'week';

    return (
        <div> 
            
            {/* <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            Payment Method Expiring Soon
                            <a href="#" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-2">
                                Update Now
                            </a>
                        </p>
                        <p className="text-sm text-yellow-700">Your card ending in 4242 expires in 30 days. Update it to avoid service interruption.</p>
                    </div>
                </div>
            </div> */}

            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
            {/* Header */}
            <div className="bg-[#0a2463] px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                Current Subscription
                </h2>

                {subscription?.status === 'active' && (
                <Tag className="bg-green-100 text-green-800 px-3 py-1">
                    Active
                </Tag>
                )}

                {subscription?.status !== 'active' && (
                <Tag
                    className={`px-3 py-1 ${
                    subscription?.status === 'canceled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                >
                    {subscription?.status ?? 'Pending'}
                </Tag>
                )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 bg-white dark:bg-gray-800">
                {/* Plan & Billing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan */}
                <div>
                    {/* <p className="text-sm text-gray-500">Plan</p> */}
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {subscription?.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Monthly mailer subscription
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Start date: <span className="font-semibold">{subscription?.started_at}</span>
                    </p>
                </div>

                {/* Billing */}
                <div>
                    <p className="text-sm text-gray-500">Billing Cycle</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    ${subscription?.net_price}
                    <span className="text-sm text-gray-500"> / month</span>
                    </p>

                    {/* {subscription?.status === 'active' && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Next billing date: <span className="font-medium">{getNextWednesday()}</span>
                    </p>
                    )} */}
                </div>
                </div>

                {/* Status Message */}
                {subscription?.status !== 'active' && subscription?.status !== null && (
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-700">
                    Please activate your subscription to continue using the service.
                </div>
                )}

                {subscription?.status === null && (
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 space-y-3">
                    <p className="text-sm text-yellow-700 leading-relaxed">
                    Your subscription is pending. If your payment is successful, your
                    first billing date will be this coming Wednesday,
                    after which your subscription will be activated.
                    <br />
                    <br />
                    If payment fails, please cancel this subscription and subscribe again.
                    </p>

                    <Button
                    variant="outline"
                    onClick={open}
                    className="bg-red-500 hover:bg-red-600 text-white"
                    >
                    Cancel Subscription
                    </Button>
                </div>
                )}

                {/* Actions */}
                {subscription?.status === 'active' && (
                <div className="flex justify-end">
                    <Button
                    variant="outline"
                    onClick={open}
                    className="bg-red-500 hover:bg-red-600 text-white"
                    >
                    Cancel Subscription
                    </Button>
                </div>
                )}
            </div>
            </Card>

            {/* <ChangeStatesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} subscription={subscription} fetchSubscription={fetchSubscription}  /> */}
            <CancelSubscription isOpen={isOpen} close={close} fetchSubscription={fetchSubscription} subscriptionId={subscription?.db_subscription_id}/>
        </div>
    );
};

export default PlatformCurrentSubscription; 