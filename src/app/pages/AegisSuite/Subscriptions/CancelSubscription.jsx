import { Fragment, useState } from "react";
import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
    DialogTitle
} from "@headlessui/react";
import { Button, Textarea, Spinner } from "components/ui";
import { XCircleIcon } from '@heroicons/react/24/outline';
import { useForm, Controller } from "react-hook-form";
import subscriptionService from "utils/subscriptionService";
import { toast } from 'sonner';
import { useAuthContext } from 'app/contexts/auth/context';

// import subscriptionService from "utils/subscriptionService";
const CancelSubscription = ({ isOpen, close, subscriptionId, fetchSubscription }) => {
    const { logout } = useAuthContext();
    console.log(logout)
    const [loading, setLoading] = useState(false)
    const { control, handleSubmit, formState: { errors } } = useForm({
        mode: "onChange"
    });
    const submitData = (data) => {
        setLoading(true)
        subscriptionService.cancelSubscription(subscriptionId, data.reason).then((response) => {
            if (response.data.status_code === 200) {
                fetchSubscription()
                close()
                toast.success(response?.data?.message || 'Subscription cancellation request has been submitted please wait for a while')
            } else {
                toast.error(response?.data?.message || 'Please try again later')
            }
        }).catch(() => {
            toast.error('Please try again later') 

        }).finally(() => {
            setLoading(false)
        })

    }
    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog
                    as="div"
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
                                Reason for Cancellation
                            </DialogTitle>
                            <form onSubmit={handleSubmit(submitData)}>
                                {/* Subtitle */}
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    Help us improve by letting us know why you&apos;re cancelling.
                                </p>

                                {/* Textarea */}
                                <Controller
                                    name="reason"
                                    control={control}
                                    rules={{
                                        required: true,
                                    }}
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            placeholder="Enter your reason here..."
                                            rows={5}
                                            className="mt-6 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-dark-600 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-400 focus:outline-none transition"
                                        />
                                    )}
                                />
                                {errors.reason && <span className="text-red-500 mt-4 text-md">Reason is required</span>}

                                {/* Cancel Button */}
                                <Button
                                    // onClick={close}
                                    color="error"
                                    type='submit'
                                    className="mt-6 w-full rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 transition"
                                >
                                    {!loading ? 'Cancel Subscription' : <Spinner />}

                                </Button>
                            </form>
                        </DialogPanel>
                    </TransitionChild>
                </Dialog>
            </Transition>

        </>
    )
}

export default CancelSubscription