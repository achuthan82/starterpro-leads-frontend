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
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <div className="bg-white p-8 rounded shadow text-center w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Payment Successful!</h1>
        <p className="text-lg text-gray-700 mb-2">Thank you for your purchase.</p>
        <p className="text-gray-500 mb-6">Your leads are being processed. You will receive a confirmation email soon.</p>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {sessionData && (
          <div className="overflow-x-auto mb-6">
            <h4>Order Details</h4>
            <table className="min-w-full border text-left text-sm">
              <thead>
                <tr className="bg-green-100">
                  {/* {Object.keys(sessionData).map(key => ( */}
                    <th className="px-4 py-2 border-b font-semibold">Invoice Id</th>
                    <th className="px-4 py-2 border-b font-semibold">Total amount</th>
                    <th className="px-4 py-2 border-b font-semibold">Payment Status</th>
                  {/* ))} */}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* {Object.values(sessionData).map((val, idx) => ( */}
                    <td className="px-4 py-2 border-b">{sessionData.invoice_id ? sessionData.invoice_id : marketplaceInvoiceId ? marketplaceInvoiceId : ''}</td>
                    <td className="px-4 py-2 border-b">${sessionData.amount_total}</td>
                    <td className="px-4 py-2 border-b" style={{textTransform: 'capitalize'}}>{sessionData.payment_status}</td>
                  {/* ))} */}
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <a href="/marketplace" className="inline-block mt-4 px-6 py-2 bg-[var(--color-atoll)] text-white rounded hover:bg-[var(--color-atoll)]/90 font-semibold">Back to Marketplace</a>
      </div>
    </div>
  );
};

export default CheckoutSuccess; 