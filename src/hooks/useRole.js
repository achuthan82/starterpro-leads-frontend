import { useAuthContext } from 'app/contexts/auth/context';

/**
 * Custom hook for role-based access control
 * @returns {Object} Role utilities and checks
 */
export const useRole = () => {
  const { user, isAuthenticated } = useAuthContext();

  /**
   * Check if user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has the role
   */
  const hasRole = (role) => {
    return isAuthenticated && user?.role === role;
  };

  /**
   * Check if user has any of the specified roles
   * @param {string[]} roles - Array of roles to check
   * @returns {boolean} True if user has any of the roles
   */
  const hasAnyRole = (roles) => {
    return isAuthenticated && user?.role && roles.includes(user.role);
  };

  /**
   * Check if user is admin
   * @returns {boolean} True if user is admin
   */
  const isAdmin = () => {
    return hasRole('admin');
  };

  /**
   * Check if user is agent
   * @returns {boolean} True if user is agent
   */
  const isAgent = () => {
    return hasRole('agent');
  };

  /**
   * Get current user role
   * @returns {string|null} Current user role or null
   */
  const getCurrentRole = () => {
    return user?.role || null;
  };

  /**
   * Check if user can access admin features
   * @returns {boolean} True if user can access admin features
   */
  const canAccessAdmin = () => {
    return isAdmin();
  };

  /**
   * Check if user can access agent features
   * @returns {boolean} True if user can access agent features
   */
  const canAccessAgent = () => {
    return isAgent() || isAdmin(); // Admins can also access agent features
  };

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isAgent,
    getCurrentRole,
    canAccessAdmin,
    canAccessAgent,
    userRole: user?.role,
    isAuthenticated
  };
}; 