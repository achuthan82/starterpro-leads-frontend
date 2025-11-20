// import React from 'react';
import { useCart } from 'app/contexts/cart/CartContext';

import { 
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

const CartButton = ({ onClick, cartData }) => {
  const { loading } = useCart();
  // Calculate total quantity in cart
  const totalCount = cartData.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-8 z-50 bg-[#0a2463] dark:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center w-16 h-16 hover:bg-[#0a1a4a] dark:hover:bg-blue-700 transition-colors"
      aria-label="View Cart"
    >
      {/* <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="21" r="1" fill="currentColor" />
        <circle cx="20" cy="21" r="1" fill="currentColor" />
      </svg> */}
      <ShoppingCartIcon className="w-8 h-8 text-white" />

      <span className="absolute top-2 right-2 bg-green-500 dark:bg-green-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
        {loading ? '...' : totalCount}
      </span>
    </button>
  );
};

export default CartButton; 