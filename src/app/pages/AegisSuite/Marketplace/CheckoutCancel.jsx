// import React from 'react';

const CheckoutCancel = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 transition-colors duration-300 dark:bg-gray-900">
    <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow transition-colors duration-300 dark:bg-gray-800">
      <h1 className="mb-4 text-3xl font-bold text-red-700 dark:text-red-400">
        Payment Cancelled
      </h1>

      <p className="mb-2 text-lg text-gray-700 dark:text-gray-200">
        Your payment was not completed.
      </p>
      <p className="mb-6 text-gray-500 dark:text-gray-400">
        You can try again or contact support if you need help.
      </p>

      <a
        href="/marketplace"
        className="mt-4 inline-block rounded bg-[var(--color-atoll)] px-6 py-2 font-semibold text-white transition hover:bg-[var(--color-atoll)]/90 dark:bg-blue-400"
      >
        Back to Marketplace
      </a>
    </div>
  </div>
);

export default CheckoutCancel;
