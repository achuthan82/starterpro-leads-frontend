// import React from 'react';

const CartSidebar = ({ open, onClose, cartData }) => {
  console.log('cart-data', cartData)
  // Sync local state with cart when cart changes

  // Stock verifier API

  // Handle quantity input change

  // Handle update with stock check
  const removeFromCart = () => {

  }
  return (
    <div
      className={`fixed top-0 right-0 z-[200] h-full w-96 max-w-full transform bg-white shadow-2xl transition-transform duration-300 dark:bg-gray-800 ${open ? "translate-x-0" : "translate-x-full"}`}
      style={{ boxShadow: open ? "rgba(0,0,0,0.2) -4px 0px 24px" : "none" }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-xl font-bold text-[#0a2463] dark:text-blue-400">
            Your Cart
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {cartData.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              Your cart is empty.
            </div>
          ) : (
            <ul className="space-y-4">
              {cartData.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-100">
                        {item.state || item.state_code}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Month: {item.month} |{" "}
                        {item.completed ? "Completed" : "Incomplete"}
                      </div>
                    </div>
                    <button
                      className="text-lg text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Qty:
                    </span>
                    <p>{item.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
