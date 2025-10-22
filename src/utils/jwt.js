import { jwtDecode } from "jwt-decode";
import axios from "./axios";

/**
 * Checks if the provided JWT token is valid (not expired).
 *
 * @param {string} authToken - The JWT token to validate.
 * @returns {boolean} - Returns `true` if the token is valid, otherwise `false`.
 */
const isTokenValid = (authToken) => {
  if (typeof authToken !== "string") {
    console.error("Invalid token format.");
    return false;
  }

  try {
    const decoded = jwtDecode(authToken);
    const currentTime = Date.now() / 1000; // Current time in seconds since epoch

    return decoded.exp > currentTime;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return false;
  }
};

/**
 * Sets or removes the authentication token in local storage and axios headers.
 *
 * @param {string} [authToken] - The JWT token to set. If `undefined` or `null`, the session will be cleared.
 */
const setSession = (authToken) => {
  if (typeof authToken === "string" && authToken.trim() !== "") {
    // Store token in local storage and set authorization header for axios
    localStorage.setItem("authToken", authToken);
    axios.defaults.headers.common.Authorization = `Bearer ${authToken}`;
  } else {
    // Remove token from local storage and delete authorization header from axios
    localStorage.removeItem("authToken");
    delete axios.defaults.headers.common.Authorization;
  }
};

/**
 * Gets the authentication token from local storage.
 *
 * @returns {string|null} - The JWT token or null if not found.
 */
const getToken = () => {
  return localStorage.getItem("authToken");
};

/**
 * Sets the authentication token in local storage.
 *
 * @param {string} token - The JWT token to set.
 */
const setToken = (token) => {
  setSession(token);
};

/**
 * Removes the authentication token from local storage.
 */
const removeToken = () => {
  setSession(null);
};

export { isTokenValid, setSession, getToken, setToken, removeToken };
