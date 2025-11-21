// import React from 'react';
import { useCart } from 'app/contexts/cart/CartContext';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { verifyStock, reserveLeads, createStripeSession } from 'utils/cartService';
import { STRIPE_KEY } from 'configs/auth.config';
import { convertDays } from 'utils/utlis';

const CartSidebar = ({ open, onClose }) => {
  const { cart, loading, error, updateCartItem, removeFromCart, refreshCart } = useCart();
  const [pendingQuantities, setPendingQuantities] = useState({});
  const [stock, setStock] = useState({});
  const [stockError, setStockError] = useState({});
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // Sync local state with cart when cart changes
  useEffect(() => {
    const initial = {};
    cart.forEach(item => {
      initial[item.id] = item.quantity;
    });
    setPendingQuantities(initial);
    // Fetch stock for all cart items
    if (cart.length > 0) {
      verifyStockApi(cart.map(item => ({
        category_id: item.category || 1, // fallback to 1 if not present
        pricing_id: item.pricing_id,
        id: item.id,
        source: item.source,
        quantiy: item.quantity, // API typo: quantiy
        state: item.state || item.state_code,
        completed: item.completed,
        start_day:item.start_day,
        end_day:item.end_day
      })));
    } else {
      setStock({});
    }
  }, [cart]);

  // Stock verifier API
  const verifyStockApi = async (payloadArr) => {
    try {
      const data = await verifyStock(payloadArr);
      setStock(data?.data);
    } catch (err) {
      console.log(err);
      setStock({});
    }
  };

  // Handle quantity input change
  const handleInputChange = (id, value) => {
    setPendingQuantities(q => ({ ...q, [id]: value }));
    setStockError(e => ({ ...e, [id]: null }));
  };

  // Handle update with stock check
  const handleUpdate = async (id) => {
    const item = cart.find(i => i.id === id);
    const newQty = Number(pendingQuantities[id]);
    if (!item || isNaN(newQty) || newQty < 1 || newQty === item.quantity) return;
    // Check stock for this item
    if (stock && stock[id] && typeof stock[id].stock === 'number') {
      if (newQty > stock[id].stock) {
        setStockError(e => ({ ...e, [id]: `Only ${stock[id].stock} available.` }));
        return;
      }
    }
    setStockError(e => ({ ...e, [id]: null }));
    await updateCartItem(id, newQty);
    // Refresh stock after update
    await refreshCart();
  };

  const toFloatWithoutRounding = (num, decimalPlaces) => {
    const numStr = String(num);
    const dotIndex = numStr.indexOf('.');
  
    if (dotIndex === -1) {
      return parseFloat(numStr); // No decimal part, return as is
    }
  
    const desiredLength = dotIndex + 1 + decimalPlaces;
    const truncatedStr = numStr.substring(0, desiredLength);
    return parseFloat(truncatedStr);
  }

  // Grand total calculation
  const grandTotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  console.log("grandTotal", grandTotal)
  // console.log("rounding", toFloatWithoutRounding(1.00, 2))
  // const tst = 0.115
  // console.log("rounding 22", tst.toFixed(2))
  const commission = toFloatWithoutRounding((grandTotal * 0.03 * 100 / 100), 2); // Math.round(grandTotal * 0.03 * 100) / 100;
  // const totalWithCommission = Math.round((grandTotal + commission) * 100) / 100;
  const roundedTotalWithCommission = toFloatWithoutRounding(grandTotal + commission, 2); // Math.round(grandTotal + commission);
  // const roundedTotalWithCommission = (grandTotal + commission).toFixed(2);

  const roundedGrandTotal = grandTotal; //Math.round(grandTotal);
  // console.log(roundedGrandTotal)
  // Checkout logic
  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      // 1. Reserve leads
      const reserveData = await reserveLeads(cart.map(item => item.id));
      if (reserveData && reserveData.data && !Array.isArray(reserveData.data)) {
        setStock(reserveData.data);
        const newStockError = {};
        cart.forEach(item => {
          if (
            reserveData.data[item.id] &&
            typeof reserveData.data[item.id].stock === 'number' &&
            item.quantity > reserveData.data[item.id].stock
          ) {
            newStockError[item.id] = `Only ${reserveData.data[item.id].stock} available.`;
          }
        });
        setStockError(newStockError);
        setCheckoutError(reserveData.message || 'Checkout failed');
        setCheckoutLoading(false);
        return;
      }
      // 2. Stripe session API
      const items = {};
      if (reserveData.data && Array.isArray(reserveData.data)) {
        reserveData.data.forEach(item => {
          if (item?.id) {
            items[item.id] = {
              shopping_cart_temp_id: item.shopping_cart_temp_id,
              pricing_id: item.pricing_id,
            };
          } else {
            console.log(item);
            setCheckoutError('Checkout failed, Item not found');
            setCheckoutLoading(false);
            return;
          }
        });
      }
      const grandTotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
      const commission = toFloatWithoutRounding((grandTotal * 0.03 * 100 / 100), 3); // Math.round(grandTotal * 0.03 * 100) / 100;
      const roundedTotalWithCommission = toFloatWithoutRounding(grandTotal + commission, 2); // Math.round(grandTotal + commission)
      // const roundedGrandTotal = Math.round(grandTotal);
      const stripePayload = {
        success_url: window.location.origin + '/marketplace/checkout-success',
        cancel_url: window.location.origin + '/marketplace/checkout-cancel',
        items,
        stripe_promotion_id: '',
        total_amount: roundedTotalWithCommission,
        amount_subtotal: grandTotal,
      };
      const stripeData = await createStripeSession(stripePayload);
      if (!stripeData.data?.session_id) {
        setCheckoutError(stripeData.message || 'Stripe session failed');
        setCheckoutLoading(false);
        return;
      }
      sessionStorage.setItem('stripe_session_id', stripeData.data.session_id);
      sessionStorage.setItem('marketplace_invoice_id', stripeData.data.invoice_number);
      const stripe = await loadStripe(STRIPE_KEY);
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: stripeData.data.session_id });
      } else {
        window.location.href = stripeData.data.url;
      }
    } catch (err) {
      setCheckoutError(err.message || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  console.log(stock)

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 max-w-full bg-white dark:bg-gray-800 shadow-2xl z-[200] transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ boxShadow: open ? 'rgba(0,0,0,0.2) -4px 0px 24px' : 'none' }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-[#0a2463] dark:text-blue-400">Your Cart</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-2xl">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-900 dark:text-gray-100">Loading...</div>
          ) : error ? (
            <div className="text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-4 rounded-md">{error}</div>
          ) : cart.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">Your cart is empty.</div>
          ) : (
            <ul className="space-y-4">
              {cart.map(item => (
                <li key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col gap-2 bg-gray-50 dark:bg-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-100">{item.state || item.state_code}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Month: {convertDays(item.start_day)} | {item.completed ? 'Completed' : 'Incomplete'}</div>
                    </div>
                    <button
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-lg"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Qty:</span>
                    <input
                      type="number"
                      min={1}
                      value={pendingQuantities[item.id] ?? item.quantity}
                      onChange={e => handleInputChange(item.id, e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-16 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-center bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      disabled={loading}
                    />
                    <button
                      className={`ml-2 px-3 py-1 rounded bg-[#0a2463] dark:bg-blue-600 text-white text-xs font-semibold ${pendingQuantities[item.id] === item.quantity || !pendingQuantities[item.id] || isNaN(pendingQuantities[item.id]) || Number(pendingQuantities[item.id]) < 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0a1a4a] dark:hover:bg-blue-700'}`}
                      disabled={pendingQuantities[item.id] === item.quantity || !pendingQuantities[item.id] || isNaN(pendingQuantities[item.id]) || Number(pendingQuantities[item.id]) < 1 || loading}
                      onClick={() => handleUpdate(item.id)}
                    >
                      Update
                    </button>
                    <span className="ml-auto font-semibold text-[#0a2463] dark:text-blue-400">${item.unit_price} each</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="text-gray-500 dark:text-gray-400">Available stock:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{stock[item.id]?.stock ?? '...'}</span>
                    {stockError[item.id] && <span className="text-red-500 dark:text-red-400 ml-2">{stockError[item.id]}</span>}
                  </div>
                  <div className="flex justify-end text-sm text-gray-600 dark:text-gray-300">
                    Total: <span className="ml-2 font-bold text-gray-800 dark:text-gray-100">${(item.unit_price * item.quantity).toFixed(2)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex flex-col gap-1 mb-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-base text-gray-900 dark:text-gray-100">Subtotal:</span>
              <span className="text-base font-bold text-gray-700 dark:text-gray-200">${roundedGrandTotal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-base text-gray-900 dark:text-gray-100">Processing Fee (3%):</span>
              <span className="text-base font-bold text-gray-700 dark:text-gray-200">${commission}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">Total:</span>
              <span className="text-xl font-bold text-[#0a2463] dark:text-blue-400">${roundedTotalWithCommission}</span>
            </div>
          </div>
          {checkoutError && <div className="text-red-500 dark:text-red-400 text-sm mb-2">{checkoutError}</div>}
          <button
            className="w-full bg-[#0a2463] dark:bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-[#0a1a4a] dark:hover:bg-blue-700 transition-colors text-lg disabled:opacity-50"
            disabled={cart.length === 0 || loading || checkoutLoading}
            onClick={handleCheckout}
          >
            {checkoutLoading ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar; 