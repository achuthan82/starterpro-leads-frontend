// Cart Service for ShieldNest Marketplace

import axiosInstance from './axios';
import { JWT_HOST_API } from 'configs/auth.config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export async function addToCart({ pricing_id, quantity, state }) {
  try {
    const response = await axiosInstance.post(
      `${JWT_HOST_API}/shopping_cart/add`,
      { pricing_id, quantity, state },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

export async function getCart() {
  try {
    const response = await axiosInstance.get(`${JWT_HOST_API}/shopping_cart`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
}

export async function removeFromCart(cart_id) {
  try {
    const response = await axiosInstance.delete(`${JWT_HOST_API}/shopping_cart/item/${cart_id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

export async function updateCartItem(cart_id, quantity) {
  try {
    const response = await axiosInstance.patch(
      `${JWT_HOST_API}/shopping_cart/update-quantity/${cart_id}`,
      { quantity },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
}

export async function verifyStock(payloadArr) {
  try {
    const response = await axiosInstance.post(
      `${JWT_HOST_API}/shopping_cart/stock/verifier`,
      payloadArr,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error verifying stock:', error);
    throw error;
  }
}

export async function reserveLeads(cart_ids) {
  try {
    const response = await axiosInstance.post(
      `${JWT_HOST_API}/shopping_cart/checkout/reserve_leads`,
      { cart_ids },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error reserving leads:', error);
    throw error;
  }
}

export async function createStripeSession(stripePayload) {
  try {
    const response = await axiosInstance.post(
      `${JWT_HOST_API}/stripe/marketplace-create-checkout-session`,
      stripePayload,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    throw error;
  }
}

export async function fetchStripeSession(sessionId) {
  try {
    const response = await axiosInstance.get(
      `${JWT_HOST_API}/stripe/marketplace-session/${sessionId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching Stripe session:', error);
    throw error;
  }
} 