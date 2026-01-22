import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_KEY } from 'configs/auth.config';
import dialerService from 'utils/dialerService';

const RechargeModal = ({ isOpen, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const presetAmounts = [50, 100, 200];

  const toFloatWithoutRounding = (num, decimalPlaces) => {
    const numStr = String(num);
    const dotIndex = numStr.indexOf('.');
    if (dotIndex === -1) return parseFloat(numStr);

    const desiredLength = dotIndex + 1 + decimalPlaces;
    const truncatedStr = numStr.substring(0, desiredLength);
    return parseFloat(truncatedStr);
  };

  const calculateCommission = (amount) => {
    return toFloatWithoutRounding((amount * 0.04 * 100) / 100, 2);
  };

  const calculateTotal = (amount) => {
    const commission = calculateCommission(amount);
    return toFloatWithoutRounding(amount + commission, 2);
  };

  const getRechargeAmount = () => {
    if (selectedAmount !== null) return selectedAmount;
    const custom = parseFloat(customAmount);
    return isNaN(custom) || custom < 50 ? null : custom;
  };

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setError(null);
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedAmount(null);

    const numValue = parseFloat(value);
    if (value && (!numValue || numValue < 50)) {
      setError('Minimum recharge amount is $50');
    } else {
      setError(null);
    }
  };

  const handleRecharge = async () => {
    const rechargeAmount = getRechargeAmount();

    if (!rechargeAmount || rechargeAmount < 50) {
      setError('Please select an amount (minimum $50)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const totalAmount = calculateTotal(rechargeAmount);
      const roundedRechargeAmount = toFloatWithoutRounding(rechargeAmount, 2);
      const roundedTotalAmount = toFloatWithoutRounding(totalAmount, 2);

      const payload = {
        recharged_amount: roundedRechargeAmount,
        total_amount: roundedTotalAmount,
        success_url: `${window.location.origin}/power-dialer/recharge-success`,
        cancel_url: `${window.location.origin}/power-dialer/recharge-cancel`
      };

      const response = await dialerService.createWalletRechargeSession(payload);

      if (!response?.data?.session_id) {
        setError(response?.message || 'Failed to create checkout session');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('wallet_recharge_session_id', response.data.session_id);

      const stripe = await loadStripe(STRIPE_KEY);
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: response.data.session_id });
      } else {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error('Error during recharge:', err);
      setError(err?.message || 'Failed to process recharge. Please try again.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedAmount(null);
      setCustomAmount('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const rechargeAmount = getRechargeAmount();
  const commission = rechargeAmount ? calculateCommission(rechargeAmount) : 0;
  const totalAmount = rechargeAmount ? calculateTotal(rechargeAmount) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
        data-testid="btn-close-recharge-wallet-modal"
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 mx-4 animate-slide-up">

        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={loading}
          data-testid="btn-x-close-recharge-wallet-modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">
            Recharge Wallet
          </h2>
        </div>

        {/* Preset Amounts */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Amount
          </label>
          <div className="grid grid-cols-3 gap-3">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleAmountSelect(amount)}
                disabled={loading}
                data-testid="btn-select-amount"
                className={`px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                  selectedAmount === amount
                    ? 'border-[var(--color-atoll)] bg-[var(--color-atoll)]/10 text-[var(--color-atoll)] dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[var(--color-atoll)] dark:hover:border-blue-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Or Enter Custom Amount (Minimum $50)
          </label>
          <input
            type="number"
            min="50"
            step="0.01"
            value={customAmount}
            onChange={handleCustomAmountChange}
            disabled={loading}
            data-testid="btn-custom-amount"
            placeholder="Enter amount"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[var(--color-atoll)] dark:focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        {/* Summary */}
        {rechargeAmount && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Recharge Amount:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                ${rechargeAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Processing Fee (4%):</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                ${commission.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-gray-300 dark:border-gray-600">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Total:</span>
              <span className="font-bold text-[var(--color-atoll)] dark:text-blue-400">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            data-testid="btn-close-recharge-wallet-modal"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRecharge}
            disabled={loading || !rechargeAmount || rechargeAmount < 50}
            data-testid="btn-proceed-recharge-wallet-modal"
            className="flex-1 px-4 py-2 bg-[var(--color-atoll)] dark:bg-blue-600 text-white rounded-lg hover:bg-[var(--color-atoll)]/90 dark:hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default RechargeModal;
