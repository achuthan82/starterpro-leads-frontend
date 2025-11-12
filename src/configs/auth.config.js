/**
 * AegisSuite Backend API Configuration
 * Uses environment variables for better security and configuration management
**/

// Environment variable validation
const validateEnvironment = () => {
  const requiredVars = ['VITE_API_BASE_URL'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}. Using default values.`);
  }
};

// Validate environment on module load
validateEnvironment();

// Get API base URL from environment variables with fallback
export const JWT_HOST_API = import.meta.env.VITE_API_BASE_URL || "https://shieldnest-backend-staging-437a38552d5f.herokuapp.com";
export const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RMgcoHFuUbT6ZjVZJuppTRS3g9wRJTYq4qo7PBfiAdf9RkUvVR4OHkHhf3NOsfLFzcrkcFcfnY3EvZhF0EQzpd200v3DQayCX';
// API Endpoints Configuration
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout", 
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot_password",
    RESET_PASSWORD: "/auth/reset_password",
    VERIFY_EMAIL: "/auth/verify-email",
    CHANGE_PASSWORD: "/auth/change-password",
    REGISTER_FROM_INVITATION: "/user/register_from_invitation"
  },
  USER: {
    PROFILE: "/user/me",
    UPDATE_PROFILE: "/user/me",
    DELETE_ACCOUNT: "/user/account",
    USERS: "/users",
    USER_BY_ID: "/user",
    ACTIVE_INACTIVE: "user/active-inactive/count",
    INVITE_AGAIN:'/user/resend_invitation_email',
    ORDERS: "/marketplace/orders",
    SUBSCRIPTIONS: "/stripe-subscriptions"
  },
  AGENTS: {
    BASE: "/agents",
    DASHBOARD: "/agents/dashboard",
    LISTINGS: "/agents/listings",
    CLIENTS: "/agents/clients",
    STATS: "/agents/stats"
  },
  LEADS: {
    BASE: "/leads",
    CREATE: "/leads",
    ASSIGN: "/leads/assign",
    UPDATE_STATUS: "/leads/status",
    MARKETPLACE: "/leads/marketplace"
  },
  PROPERTIES: {
    BASE: "/properties",
    SEARCH: "/properties/search",
    FEATURED: "/properties/featured",
    CATEGORIES: "/properties/categories"
  },
  NOTIFICATIONS: {
    BASE: "/notifications",
    MARK_READ: "/notifications/read",
    SETTINGS: "/notifications/settings"
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    USER_PAGINATED_LIST: "/user/paginated_list",
    USER_INVITE: "/user",
    USER_STATUS_UPDATE: "/user/status_update",
    USER_EDIT: "/user/edit_info",
    USER_ACTIVE_INACTIVE: "/user/make_user_active_inactive",
    AGENTS: "/admin/agents",
    AGENTS_FILTER: "/agents/filter",
    AGENT_LEADS: "/admin/agents/:agentId/leads",
    AGENT_ORDERS: "/admin/agents/:agentId/orders",
    AGENT_SUBSCRIPTIONS: "/admin/agents/:agentId/subscriptions",
    PROPERTIES: "/admin/properties",
    REPORTS: "/admin/reports",
    AGENT_COUNT:'/agents/active-inactive-count',
    AGENT_SALES_COUNT:'/agents/total-leads-and-sold'
  },
  PROMO_CODES: {
    BASE: "/promotion_code",
    LIST: "/promotion_code/paginated",
    CREATE: "/promotion_code"
  },
  VERIFICATION: {
    VERIFY_TOKEN: "/user/verify-registration-short-link"
  },
  DIALER: {
    PAGINATED_LEADS: "/dialer/leads/complete-incomplete/paginated",
    OUTBOUND_NUMBERS: "/dialer/outbound-numbers-from-db",
    TOKEN: "/dialer/token",
    CALL_LOGS: "/dialer/call-logs",
    DATA_ENTRY: "/dialer/data-entry"
  },
  CARRIERS: {
    LOGO_COLLAGE: "/carriers/logos/collage"
  },
  APPOINTMENT: {
    SETTINGS: "/appointment/settings/details",
    LIST: "/appointment/list",
    CREATE: "/appointment"
  },
  AVAILABILITY: {
    SETTINGS_CREATE: '/appointment/settings', 
    SETTINGS_DETAILS: '/appointment/settings/details', 
  },
};

// Request Configuration
export const REQUEST_CONFIG = {
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Role Mapping Configuration
export const ROLE_MAPPING = {
  1: 'admin',
  2: 'agent'
};

// Utility function to map role ID to role name
export const mapRoleIdToName = (roleId) => {
  return ROLE_MAPPING[roleId] || roleId || 'agent';
};

// Utility function to get role from user data (handles both role and role_id fields)
export const getUserRole = (userData) => {
  const roleId = userData?.role_id || userData?.role;
  return mapRoleIdToName(roleId);
};

// Utility function to get environment information (for debugging)
export const getEnvironmentInfo = () => {
  return {
    apiBaseUrl: JWT_HOST_API,
    nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
    apiTimeout: REQUEST_CONFIG.timeout,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD
  };
};
