import { useState, useEffect, Fragment } from 'react';
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle
} from "@headlessui/react";
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { dialerService } from 'utils/apiService';
import { toast } from 'sonner';

const OutboundNumberModal = ({ isOpen, onClose, selectedLead, onSelectNumber }) => {
  const [outboundNumbers, setOutboundNumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);

  // Extract state from lead (could be from state field or territory)
  const getLeadState = () => {
    if (!selectedLead) return null;
    
    // Try to get state from originalData if available
    const leadState = selectedLead.originalData?.state || selectedLead.state;
    
    // If state is in format like "FL-33101", extract "FL"
    if (leadState && typeof leadState === 'string') {
      // Handle format like "FL-33101" or "FL 33101"
      const match = leadState.match(/^([A-Z]{2})[-\s]/);
      if (match) return match[1];
      // If it's just a 2-letter code, return it
      if (leadState.length === 2 && /^[A-Z]{2}$/.test(leadState)) {
        return leadState.toUpperCase();
      }
    }
    
    return leadState;
  };

  // Extract state from outbound number (could be in state field or friendly_name)
  const getOutboundNumberState = (number) => {
    // First check if state field exists and is not "active" (status)
    if (number.state && number.state !== 'active' && number.state.length === 2) {
      return number.state.toUpperCase();
    }
    
    // Try to extract from friendly_name (e.g., "Local Miami" -> "FL" or "Miami, FL")
    if (number.friendly_name) {
      // Look for state abbreviations in friendly_name
      const stateMatch = number.friendly_name.match(/\b([A-Z]{2})\b/);
      if (stateMatch) {
        return stateMatch[1];
      }
      
      // Try to match common city names to states (basic mapping)
      const cityToState = {
        'Miami': 'FL',
        'Fort Lauderdale': 'FL',
        'Tampa': 'FL',
        'Orlando': 'FL',
        'Jacksonville': 'FL',
        'Los Angeles': 'CA',
        'San Francisco': 'CA',
        'San Diego': 'CA',
        'New York': 'NY',
        'Chicago': 'IL',
        'Houston': 'TX',
        'Dallas': 'TX',
        'Phoenix': 'AZ',
        'Philadelphia': 'PA'
      };
      
      for (const [city, state] of Object.entries(cityToState)) {
        if (number.friendly_name.toLowerCase().includes(city.toLowerCase())) {
          return state;
        }
      }
    }
    
    return null;
  };

  // Fetch outbound numbers
  useEffect(() => {
    if (isOpen) {
      fetchOutboundNumbers();
    }
  }, [isOpen]);

  const fetchOutboundNumbers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await dialerService.getOutboundNumbers();
      const numbers = response.data || [];
      setOutboundNumbers(numbers);
      
      // Auto-select recommended number if available
      const leadState = getLeadState();
      if (leadState && numbers.length > 0) {
        // Find number that matches lead's state
        const recommended = numbers.find(num => {
          const numState = getOutboundNumberState(num);
          return numState && numState.toLowerCase() === leadState.toLowerCase();
        });
        if (recommended) {
          setSelectedNumber(recommended);
        } else if (numbers.length > 0) {
          // If no match, select first active number
          setSelectedNumber(numbers.find(num => num.state === 'active') || numbers[0]);
        }
      } else if (numbers.length > 0) {
        setSelectedNumber(numbers.find(num => num.state === 'active') || numbers[0]);
      }
    } catch (err) {
      console.error('Error fetching outbound numbers:', err);
      setError(err.message || 'Failed to fetch outbound numbers');
      toast.error(err.message || 'Failed to load outbound numbers');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (number) => {
    setSelectedNumber(number);
  };

  const handleConfirm = () => {
    if (selectedNumber) {
      onSelectNumber(selectedNumber);
      onClose();
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

  const leadState = getLeadState();
  const recommendedNumber = leadState 
    ? outboundNumbers.find(num => {
        const numState = getOutboundNumberState(num);
        return numState && numState.toLowerCase() === leadState.toLowerCase();
      })
    : null;

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
          <DialogPanel className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 shadow-xl px-6 py-8 transition-all sm:px-8">
            {/* Close Icon */}
            <div className="absolute right-4 top-4">
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Heading */}
            <DialogTitle
              as="h3"
              className="text-2xl text-center font-semibold text-gray-800 dark:text-white mb-2"
            >
              Select Outbound Number
            </DialogTitle>

            {selectedLead && (
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
                Calling {selectedLead.name} {selectedLead.originalData?.city && `in ${selectedLead.originalData.city}`} {selectedLead.originalData?.state && `, ${selectedLead.originalData.state}`}
              </p>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a2463] dark:border-blue-400"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading outbound numbers...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Outbound Numbers List */}
            {!loading && !error && outboundNumbers.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {outboundNumbers.map((number) => {
                  const isRecommended = recommendedNumber && number.id === recommendedNumber.id;
                  const isSelected = selectedNumber && number.id === selectedNumber.id;
                  
                  return (
                    <div
                      key={number.id}
                      onClick={() => handleSelect(number)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#0a2463] dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {formatPhoneNumber(number.phone)}
                            </span>
                            {isRecommended && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full flex items-center gap-1">
                                <CheckCircleIcon className="w-3 h-3" />
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {number.friendly_name || 'Outbound Number'}
                          </p>
                          {getOutboundNumberState(number) && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              State: {getOutboundNumberState(number)}
                            </p>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-[#0a2463] dark:border-blue-500 bg-[#0a2463] dark:bg-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* No Numbers State */}
            {!loading && !error && outboundNumbers.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No outbound numbers available</p>
              </div>
            )}

            {/* Action Buttons */}
            {!loading && outboundNumbers.length > 0 && (
              <div className="flex items-center justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedNumber}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    selectedNumber
                      ? 'bg-[#0a2463] dark:bg-blue-500 text-white hover:bg-[#0a2463]/90 dark:hover:bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Select Number
                </button>
              </div>
            )}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default OutboundNumberModal;

