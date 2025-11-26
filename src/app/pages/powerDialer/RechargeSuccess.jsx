import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const RechargeSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear session storage after a delay
    const timer = setTimeout(() => {
      sessionStorage.removeItem('wallet_recharge_session_id');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center w-full max-w-2xl transition-colors duration-300">
        <CheckCircleIcon className="mx-auto mb-4 w-16 h-16 text-green-500 dark:text-green-400" />
        
        <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">
          Wallet Recharge Successful!
        </h1>

        <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
          Thank you for recharging your wallet.
        </p>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Your wallet balance has been updated. You can now use it for making calls.
        </p>

        <div className="mt-8">
          <button
            onClick={() => navigate('/power-dialer')}
            className="inline-block px-6 py-2 bg-[var(--color-atoll)] dark:bg-blue-400 text-white rounded font-semibold hover:bg-[var(--color-atoll)]/90 dark:hover:bg-blue-500 transition"
          >
            Back to Power Dialer
          </button>
        </div>
      </div>
    </div>
  );
};

export default RechargeSuccess;

