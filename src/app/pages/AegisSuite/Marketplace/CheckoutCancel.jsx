// import React from 'react';

const CheckoutCancel = () => (
 <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 dark:bg-gray-900 transition-colors duration-300">
  <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center w-full max-w-md transition-colors duration-300">
    <h1 className="text-3xl font-bold text-red-700 dark:text-red-400 mb-4">
      Payment Cancelled
    </h1>

    <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
      Your payment was not completed.
    </p>
    <p className="text-gray-500 dark:text-gray-400 mb-6">
      You can try again or contact support if you need help.
    </p>

    <a
      href="/marketplace"
      className="inline-block mt-4 px-6 py-2 bg-[var(--color-atoll)] dark:bg-blue-400 text-white rounded font-semibold hover:bg-[var(--color-atoll)]/90 transition"
    >
      Back to Marketplace
    </a>
  </div>
</div>

);

export default CheckoutCancel; 