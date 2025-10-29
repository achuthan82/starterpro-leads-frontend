import { useEffect, useState } from 'react';
import { fetchStripeSession } from 'utils/cartService';

const CheckoutSuccess = () => {
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);
  const sessionId = sessionStorage.getItem('stripe_session_id');
  const marketplaceInvoiceId = sessionStorage.getItem('marketplace_invoice_id');

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setError('No session ID found.');
        return;
      }
      try {
        const data = await fetchStripeSession(sessionId);
        setSessionData(data?.data || data);
      } catch (err) {
        setError(err.message || 'Failed to fetch session data');
      }
    };
    fetchSession();
  }, [sessionId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 dark:bg-gray-900 transition-colors duration-300">
  <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center w-full max-w-2xl transition-colors duration-300">
    <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">
      Payment Successful!
    </h1>

    <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
      Thank you for your purchase.
    </p>
    <p className="text-gray-500 dark:text-gray-400 mb-6">
      Your leads are being processed. You will receive a confirmation email soon.
    </p>

    {error && <div className="text-red-500 mb-4">{error}</div>}

    {sessionData && (
      <div className="overflow-x-auto mb-6">
        <h4 className="text-gray-800 dark:text-gray-200 mb-2 font-semibold">Order Details</h4>
        <table className="min-w-full border text-left text-sm border-gray-200 dark:border-gray-700 rounded">
          <thead>
            <tr className="bg-green-100 dark:bg-green-900/30">
              <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-200">
                Invoice Id
              </th>
              <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-200">
                Total Amount
              </th>
              <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-200">
                Payment Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                {sessionData.invoice_id || marketplaceInvoiceId || ''}
              </td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                ${sessionData.amount_total}
              </td>
              <td
                className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 capitalize"
              >
                {sessionData.payment_status}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )}

    <a
      href="/marketplace"
      className="inline-block mt-4 px-6 py-2 bg-[var(--color-atoll)] dark:bg-blue-400 text-white rounded font-semibold hover:bg-[var(--color-atoll)]/90 transition"
    >
      Back to Marketplace
    </a>
  </div>
</div>

  );
};

export default CheckoutSuccess; 