import { useEffect, useState } from "react";
import { fetchStripeSession } from "utils/cartService";

const CheckoutSuccess = () => {
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);
  const sessionId = sessionStorage.getItem("stripe_session_id");
  const marketplaceInvoiceId = sessionStorage.getItem("marketplace_invoice_id");

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setError("No session ID found.");
        return;
      }
      try {
        const data = await fetchStripeSession(sessionId);
        setSessionData(data?.data || data);
      } catch (err) {
        setError(err.message || "Failed to fetch session data");
      }
    };
    fetchSession();
  }, [sessionId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-green-50 transition-colors duration-300 dark:bg-gray-900">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow transition-colors duration-300 dark:bg-gray-800">
        <h1 className="mb-4 text-3xl font-bold text-green-700 dark:text-green-400">
          Payment Successful!
        </h1>

        <p className="mb-2 text-lg text-gray-700 dark:text-gray-200">
          Thank you for your purchase.
        </p>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          Your leads are being processed. You will receive a confirmation email
          soon.
        </p>

        {error && <div className="mb-4 text-red-500">{error}</div>}

        {sessionData && (
          <div className="mb-6 overflow-x-auto">
            <h4 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
              Order Details
            </h4>
            <table className="min-w-full rounded border border-gray-200 text-left text-sm dark:border-gray-700">
              <thead>
                <tr className="bg-green-100 dark:bg-green-900/30">
                  <th className="border-b border-gray-200 px-4 py-2 font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-200">
                    Invoice Id
                  </th>
                  <th className="border-b border-gray-200 px-4 py-2 font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-200">
                    Total Amount
                  </th>
                  <th className="border-b border-gray-200 px-4 py-2 font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-200">
                    Payment Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-gray-200 px-4 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-300">
                    {sessionData.invoice_id || marketplaceInvoiceId || ""}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-300">
                    ${sessionData.amount_total}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-2 text-gray-700 capitalize dark:border-gray-700 dark:text-gray-300">
                    {sessionData.payment_status}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <a
          href="/marketplace"
          className="mt-4 inline-block rounded bg-[var(--color-atoll)] px-6 py-2 font-semibold text-white transition hover:bg-[var(--color-atoll)]/90 dark:bg-blue-400"
        >
          Back to Marketplace
        </a>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
