// import React from 'react';

const CheckoutCancel = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
    <div className="bg-white p-8 rounded shadow text-center">
      <h1 className="text-3xl font-bold text-red-700 mb-4">Payment Cancelled</h1>
      <p className="text-lg text-gray-700 mb-2">Your payment was not completed.</p>
      <p className="text-gray-500 mb-6">You can try again or contact support if you need help.</p>
      <a href="/marketplace" className="inline-block mt-4 px-6 py-2 bg-[var(--color-atoll)] text-white rounded hover:bg-[var(--color-atoll)]/90 font-semibold">Back to Marketplace</a>
    </div>
  </div>
);

export default CheckoutCancel; 