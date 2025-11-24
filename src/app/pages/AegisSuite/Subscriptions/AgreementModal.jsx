import { Fragment, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Button } from 'components/ui';

export default function CommitmentAgreementModal({ isOpen, onClose, billingType}) {

  const yearlyPrice = "$49.99";
  const monthlyPrice = "$69.99";
  const yearlyNonCompliance = "$89.99";
  const monthlyNonCompliance = "$129.99";

  const displayedPrice = billingType === 'yearly' ? yearlyPrice : monthlyPrice;
  const displayedNonCompliance = billingType === 'yearly' ? yearlyNonCompliance : monthlyNonCompliance;

  const [isChecked, setIsChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    // await onAgree();
    setSubmitting(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-6 sm:px-5" onClose={onClose}>

        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        {/* Modal Panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all dark:bg-dark-700">

              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Subscription Commitment Agreement
              </DialogTitle>

              <div className="mt-2 text-gray-600 text-sm leading-relaxed dark:text-gray-300">
                <p>
                  To access Starter Pro Leads at the special platform price of
                  <span className="font-semibold text-[#0a2463]"> {displayedPrice}/month</span>, you agree to purchase
                  <span className="font-semibold"> at least 50 leads per month</span>.
                </p>

                <p className="mt-4">
                  If you do not meet this commitment, your subscription fee will automatically adjust to
                  <span className="font-semibold text-red-600"> {displayedNonCompliance}/month</span> for continued access to the platform.
                </p>

                <p className="mt-4">
                  Please confirm that you have read and agree to this requirement before proceeding with your subscription.
                </p>
              </div>

              {/* Agreement Checkbox */}
              <div className="mt-6 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="h-4 w-4 border-gray-400 rounded"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  I agree to purchase at least 50 leads/month or accept the adjusted subscription pricing.
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="mt-8 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  color="primary"
                  disabled={!isChecked || submitting}
                  onClick={handleSubmit}
                  isLoading={submitting}
                >
                  Agree & Continue
                </Button>
              </div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
