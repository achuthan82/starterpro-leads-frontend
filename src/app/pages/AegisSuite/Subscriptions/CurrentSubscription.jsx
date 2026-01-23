import { useState } from 'react';
import { PencilIcon } from '@heroicons/react/24/solid';

import { Button, Card, Tag } from 'components/ui';
import ChangeStatesModal from './ChangeStatesModal';
import CancelSubscription from './CancelSubscription';
import { useDisclosure } from "hooks";
// import { useNavigate } from 'react-router';

const CurrentSubscription = ({ subscription, fetchSubscription }) => {
    // const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false);
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
                        You do not have an active subscription. Please choose a plan from the available plans below.
                    </p>
                </div>
            </Card>
        );
    }

    //   const { plan, status, states } = subscription;

    const getNextWednesday = () => {
        const date = new Date();
        const day = date.getDay();
        const diff = day <= 3 ? 3 - day : 10 - day;
        date.setDate(date.getDate() + diff);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

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

            <Card className="bg-white dark:bg-gray-800">
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">Current Subscription</h2>
                        </div>
                        {subscription?.status === 'active' && <Tag className="bg-green-100 text-green-800">Active</Tag>}
                        {subscription?.status !== 'active' && <Tag className={`${subscription?.status === 'canceled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{subscription?.status ? subscription?.status : 'Pending'}</Tag>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div>
                            <h4 className="text-gray-500 dark:text-gray-400 dark:text-gray-400">Plan</h4>
                            <p className="text-lg font-semibold">{subscription?.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 dark:text-gray-300">
                                {/*isWeekly ? 'Weekly' : 'Monthly'*/} Monthly mailer subscription
                            </p>
                        </div>
                        <div>
                            <h4 className="text-gray-500 dark:text-gray-400 dark:text-gray-400">Billing Cycle</h4>
                            <p className="text-lg font-semibold">
                                ${subscription?.net_price}
                                <span className="text-sm">/month</span>
                            </p>
                            {subscription?.status === 'active' && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 dark:text-gray-300">
                                    Next billing: {getNextWednesday()}
                                </p>
                            )}
                        </div>
                        <div>
                            <div className="flex justify-between items-center">
                                <h4 className="text-gray-500 dark:text-gray-400 dark:text-gray-400">States</h4>
                                {subscription?.status === 'active' && <PencilIcon className='w-4 h-4 text-gray-500 dark:text-gray-400 dark:text-gray-400' onClick={() => setIsModalOpen(true)} />}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {subscription?.states_chosen && subscription?.states_chosen.length > 0 ? (
                                    subscription?.states_chosen.map((state) => <Tag key={state}>{state}</Tag>)
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No states chosen.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    {subscription?.status !== 'active' && subscription?.status !== null &&
                    <div className="mt-8 flex gap-2 text-yellow-500">
                        Please activate your subscription to continue.
                    </div>
                    }
                    {subscription?.status === null &&
                    <div className="mt-8 flex gap-2 flex-col text-yellow-500">
                        <p>Your subscription is pending. If you are successfully completed the payment, coming wednesday will be your first billing date after that you will be activated. If payment failed, please cancel this subscription and subscribe again.</p>
                        <Button variant="outline" onClick={open} className="max-w-fit bg-red-500 hover:bg-red-600 text-white" data-testid="btn-cancel-subscription">Cancel Subscription</Button>
                    </div>
                    }
                    {subscription?.status === 'active' &&
                    <div className="mt-8 flex gap-2">
                        {/* <Button variant="solid" color="primary">Change Plan</Button> */}
                        {/* <Button variant="outline">Pause Subscription</Button> */}
                        <Button variant="outline" onClick={open} className="bg-red-500 hover:bg-red-600 text-white" data-testid="btn-cancel-subscription">Cancel Subscription</Button>
                    </div>
                    }
                </div>
            </Card>
            <ChangeStatesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} subscription={subscription} fetchSubscription={fetchSubscription}  />
            <CancelSubscription isOpen={isOpen} close={close} fetchSubscription={fetchSubscription} subscriptionId={subscription?.db_subscription_id}/>
        </div>
    );
};

export default CurrentSubscription; 