import { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';

import { Button } from 'components/ui';
import { subscriptionService, apiUtils } from 'utils/apiService';
import { Spinner } from 'components/ui';

// ----------------------------------------------------------------------

const ChangeStatesModal = ({ isOpen, onClose, subscription, fetchSubscription={fetchSubscription}  }) => {
    const [states, setStates] = useState([]);
    const [selectedStates, setSelectedStates] = useState(subscription?.states_chosen?.map(s => ({ value: s, label: states.find(st => st.value === s)?.label || s })));
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const fetchStates = async () => {
                try {
                    setLoading(true);
                    const res = await subscriptionService.getUsaStates();
                    const arr = []
                    Object.keys(res.data.data).map(function (key) {
                        arr.push({ value: res.data.data[key], label: key });
                    })
                    console.log(arr);
                    setStates(arr);
                    // if (subscription?.states) {
                    //     setSelectedStates(subscription.states.map(s => ({ value: s, label: states.find(st => st.value === s)?.label || s })));
                    // }
                } catch (err) {
                    setError(apiUtils.formatError(err));
                } finally {
                    setLoading(false);
                }
            };
            fetchStates();
        }
    }, [isOpen, subscription]);

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            await subscriptionService.updateSubscriptionStates(subscription.db_subscription_id, selectedStates.map(s => s.value));
            fetchSubscription()
            onClose();
        } catch (err) {
            setError(apiUtils.formatError(err));
        } finally {
            setSubmitting(false);
        }
    };

    const isSubmitDisabled = useMemo(() => {
        return selectedStates.length < 5 || selectedStates.length > 10 || submitting;
    }, [selectedStates, submitting]);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5" onClose={onClose} data-testid="close-change-subscription-states-modal">
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

                <div className="fixed inset-0">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-dark-700">
                                <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                                    Change Subscription States
                                </DialogTitle>
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500 mb-2">
                                        State Choices - Please edit your states of choice, that you are licensed in and willing to mail to.
                                    </p>
                                    {loading ? <Spinner /> : (
                                        <Select
                                            isMulti
                                            options={states}
                                            value={selectedStates}
                                            // defaultValue={subscription?.states_chosen?.map(s => ({ value: s, label: states.find(st => st.value === s)?.label || s }))}
                                            onChange={setSelectedStates}
                                            data-testid="select-states"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">
                                        Please select between 5 and 10 states.
                                    </p>
                                </div>

                                {error && (
                                    <div className="mt-4 text-red-500 bg-red-100 p-3 rounded-md">
                                        {error}
                                    </div>
                                )}

                                <div className="mt-6 flex justify-end gap-2">
                                    <Button variant="outline" onClick={onClose} disabled={submitting} data-testid="btn-cancel-change-subscription-states-modal">
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="solid"
                                        color="primary"
                                        onClick={handleSubmit}
                                        disabled={isSubmitDisabled}
                                        isLoading={submitting}
                                        data-testid="btn-submit-change-subscription-states"
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ChangeStatesModal; 