import { useNavigate } from 'react-router';
import { XCircleIcon } from '@heroicons/react/24/outline';

const RechargeCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center w-full max-w-md transition-colors duration-300">
        <XCircleIcon className="mx-auto mb-4 w-16 h-16 text-red-500 dark:text-red-400" />
        
        <h1 className="text-3xl font-bold text-red-700 dark:text-red-400 mb-4">
          Recharge Cancelled
        </h1>

        <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
          Your wallet recharge was not completed.
        </p>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          No charges were made to your account. You can try again anytime.
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

export default RechargeCancel;

