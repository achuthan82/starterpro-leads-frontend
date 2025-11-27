import { useState, useEffect, Fragment } from 'react';
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle
} from "@headlessui/react";
import { XMarkIcon, PhoneIcon } from '@heroicons/react/24/outline';
import dialerService from 'utils/dialerService';
import { toast } from 'sonner';

const PurchaseNumberModal = ({ isOpen, onClose, onPurchaseSuccess }) => {
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [friendlyName, setFriendlyName] = useState('');

  // Fetch available numbers
  useEffect(() => {
    if (isOpen) {
      fetchAvailableNumbers();
      setSelectedNumber(null);
      setFriendlyName('');
    }
  }, [isOpen]);

  const fetchAvailableNumbers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await dialerService.getAvailableNumbers();
      const numbers = response?.data || response || [];
      setAvailableNumbers(Array.isArray(numbers) ? numbers : []);
    } catch (err) {
      console.error('Error fetching available numbers:', err);
      setError(err?.message || 'Failed to fetch available numbers');
      toast.error(err?.message || 'Failed to load available numbers');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNumber = (number) => {
    setSelectedNumber(number);
    // Auto-fill friendly name if not set
    const phone = number?.phone || number?.phoneNumber || number;
    if (!friendlyName && phone) {
      const formatted = formatPhoneNumber(phone);
      setFriendlyName(formatted || '');
    }
  };

  const handlePurchase = async () => {
    // Extract phone number from selectedNumber (could be object or string)
    const phoneNumber = selectedNumber?.phone || selectedNumber?.phoneNumber || selectedNumber;
    
    if (!selectedNumber || !phoneNumber) {
      toast.error('Please select a phone number');
      return;
    }

    if (!friendlyName || !friendlyName.trim()) {
      toast.error('Please enter a friendly name');
      return;
    }

    setPurchasing(true);
    setError(null);

    try {
      const payload = {
        phone: phoneNumber,
        friendly_name: friendlyName.trim()
      };

      const response = await dialerService.purchaseNumber(payload);
      
      toast.success('Phone number purchased successfully!');
      
      if (onPurchaseSuccess) {
        onPurchaseSuccess(response?.data || response);
      }
      
      onClose();
    } catch (err) {
      console.error('Error purchasing number:', err);
      setError(err?.message || 'Failed to purchase number');
      toast.error(err?.message || 'Failed to purchase number');
    } finally {
      setPurchasing(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    // Remove +1 and format
    const cleaned = phone.replace(/^\+1/, '').replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
        onClose={onClose}
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
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" />
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
          <DialogPanel className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-800 shadow-xl px-6 py-8 transition-all sm:px-8">
            {/* Close Icon */}
            <div className="absolute right-4 top-4">
              <button
                onClick={onClose}
                disabled={purchasing}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Heading */}
            <DialogTitle
              as="h3"
              className="text-2xl text-center font-semibold text-gray-800 dark:text-white mb-2"
            >
              Purchase Phone Number
            </DialogTitle>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
              Select an available phone number and provide a friendly name
            </p>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a2463] dark:border-blue-400"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading available numbers...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Available Numbers List */}
            {!loading && !error && availableNumbers.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Phone Number
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                  {availableNumbers.map((number, index) => {
                    const phone = number.phone || number.phoneNumber || number;
                    const isSelected = selectedNumber && (
                      (selectedNumber.phone || selectedNumber.phoneNumber || selectedNumber) === phone
                    );
                    
                    return (
                      <div
                        key={index}
                        onClick={() => handleSelectNumber(number)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#0a2463] dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <PhoneIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatPhoneNumber(phone)}
                          </span>
                          {isSelected && (
                            <div className="ml-auto w-5 h-5 rounded-full border-2 border-[#0a2463] dark:border-blue-500 bg-[#0a2463] dark:bg-blue-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Numbers State */}
            {!loading && !error && availableNumbers.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 mb-6">
                <PhoneIcon className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                <p>No available phone numbers found</p>
                <p className="text-sm mt-2">Please try again later or contact support</p>
              </div>
            )}

            {/* Friendly Name Input */}
            {selectedNumber && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Friendly Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={friendlyName}
                  onChange={(e) => setFriendlyName(e.target.value)}
                  disabled={purchasing}
                  placeholder="e.g., My Business Line"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[var(--color-atoll)] dark:focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  A descriptive name to identify this number
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {!loading && (
              <div className="flex items-center justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 space-x-3">
                <button
                  onClick={onClose}
                  disabled={purchasing}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={!selectedNumber || !friendlyName?.trim() || purchasing}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    selectedNumber && friendlyName?.trim() && !purchasing
                      ? 'bg-[#0a2463] dark:bg-blue-500 text-white hover:bg-[#0a2463]/90 dark:hover:bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {purchasing ? 'Purchasing...' : 'Purchase Number'}
                </button>
              </div>
            )}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default PurchaseNumberModal;

