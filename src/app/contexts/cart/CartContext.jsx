import React, { createContext, useContext, useState, useCallback } from 'react';
import { addToCart as apiAddToCart, getCart as apiGetCart, removeFromCart as apiRemoveFromCart, updateCartItem as apiUpdateCartItem } from 'utils/cartService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart data from backend
  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetCart();
      setCart(data?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add item to cart
  const addToCart = useCallback(async ({ pricing_id, quantity, state }) => {
    setLoading(true);
    setError(null);
    try {
      await apiAddToCart({ pricing_id, quantity, state });
      await refreshCart();
    } catch (err) {
      setError(err.message || 'Failed to add to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (cart_id) => {
    setLoading(true);
    setError(null);
    try {
      await apiRemoveFromCart(cart_id);
      await refreshCart();
    } catch (err) {
      setError(err.message || 'Failed to remove item');
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  // Update cart item quantity
  const updateCartItem = useCallback(async (cart_id, quantity) => {
    setLoading(true);
    setError(null);
    try {
      await apiUpdateCartItem(cart_id, quantity);
      await refreshCart();
    } catch (err) {
      setError(err.message || 'Failed to update quantity');
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  // Initial fetch
  React.useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cart, loading, error, refreshCart, addToCart, removeFromCart, updateCartItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    console.warn('useCart is being used outside of CartProvider. Providing fallback values.');
    // Provide fallback values to prevent crashes
    return {
      cart: [],
      loading: false,
      error: null,
      refreshCart: async () => {
        console.warn('refreshCart called outside of CartProvider');
      },
      addToCart: async () => {
        console.warn('addToCart called outside of CartProvider');
      },
      removeFromCart: async () => {
        console.warn('removeFromCart called outside of CartProvider');
      },
      updateCartItem: async () => {
        console.warn('updateCartItem called outside of CartProvider');
      }
    };
  }
  return context;
}; 