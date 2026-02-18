import { Fragment, useState } from "react";
import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
    DialogTitle
} from "@headlessui/react";
import { Button, Spinner } from "components/ui";
import { XCircleIcon } from '@heroicons/react/24/outline';
import platformSubscriptionService from "utils/platformSubscriptionService";
import { toast } from 'sonner';
// import { useAuthContext } from 'app/contexts/auth/context';

// import platformSubscriptionService from "utils/platformSubscriptionService";
const CancelSubscription = ({ isOpen, close, subscriptionId, fetchSubscription }) => {
    // const { logout } = useAuthContext();
    // console.log(logout)
    const [loading, setLoading] = useState(false);

    const submitData = () => {
        setLoading(true);
        // platformSubscriptionService.cancelSubscription(subscriptionId, data.reason).then((response) => {
        //     if (response.data.status === 200) {
        //         fetchSubscription();
        //         close();
        //         toast.success(response?.data?.message || 'Subscription cancellation request has been submitted please wait for a while');
        //     } else {
        //         toast.error(response?.data?.message || 'Please try again later');
        //     }
        // }).catch(() => {
        //     toast.error('Please try again later');
        // }).finally(() => {
        //     setLoading(false);
        // });

        platformSubscriptionService.temporaryCancelSubscription(subscriptionId).then((response) => {
            if (response.data.status === 200) {
                fetchSubscription();
                close();
                toast.success(response?.data?.message || 'Subscription cancellation request has been submitted please wait for a while');
            } else {
                toast.error(response?.data?.message || 'Please try again later');
            }
        }).catch(() => {
            toast.error('Please try again later');
        }).finally(() => {
            setLoading(false);
        });
    }
    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog
                    as="div"
                    data-testid="close-reason-for-cancellation-modal"
                    className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
                    onClose={close}
                >
                    {/* Overlay */}
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
                    </TransitionChild>

                    {/* Modal Content */}
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-dark-700 shadow-xl px-6 py-8 text-center transition-all sm:px-8">
                            {/* Close Icon */}
                            <div className="absolute right-4 top-4">
                                <XCircleIcon
                                    onClick={close}
                                    data-testid="btn-x-close-reason-for-cancellation-modal"
                                    className="h-7 w-7 text-error cursor-pointer hover:scale-105 transition-transform"
                                />
                            </div>

                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <XCircleIcon className="h-20 w-20 text-red-500" />
                            </div>

                            {/* Heading */}
                            <DialogTitle
                                as="h3"
                                className="text-2xl font-semibold text-gray-800 dark:text-gray-100"
                            >
                                Cancel Subscription
                            </DialogTitle>

                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                Are you sure you want to cancel your current subscription? This will submit a cancellation request
                                in line with the Cancellation &amp; Renewal Terms.
                            </p>

                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="outline"
                                    onClick={close}
                                    className="w-full sm:w-1/2"
                                    data-testid="btn-cancel-close-modal"
                                >
                                    Keep Subscription
                                </Button>
                                <Button
                                    color="error"
                                    onClick={submitData}
                                    data-testid="btn-cancel-subscription"
                                    className="w-full sm:w-1/2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 transition"
                                >
                                    {!loading ? 'Yes, Cancel Subscription' : <Spinner />}
                                </Button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </Dialog>
            </Transition>

        </>
    )
}

export default CancelSubscription