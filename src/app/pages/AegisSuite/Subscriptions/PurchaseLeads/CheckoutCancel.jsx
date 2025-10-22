import { useNavigate } from 'react-router';
import {  Button } from 'components/ui';
import { XCircleIcon } from '@heroicons/react/24/outline';
const CheckoutCancel = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
  <div className="w-full max-w-[750px] rounded-lg shadow-md bg-white p-6 text-center">
    <XCircleIcon className="mx-auto mb-5 h-28 w-28 text-red-500" />

    <h2 className="text-2xl font-semibold mb-1">Subscription Cancelled</h2>

    <p className="text-gray-500 mb-2">
      Your subscription was cancelled. No charges were made to your account.
    </p>

    <div className="mt-6">
      <Button
        color='primary'
        onClick={() => navigate('/subscriptions')}
        className="inline-block rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 transition"
      >
        Back to Subscriptions
      </Button>
    </div>
  </div>
</div>

  );
};

export default CheckoutCancel; 