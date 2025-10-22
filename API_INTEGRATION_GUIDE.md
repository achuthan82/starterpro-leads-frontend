# AegisSuite API Integration Guide

This document provides comprehensive information about the integrated AegisSuite API endpoints and how to use them in your React application.

## Table of Contents

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [Authentication](#authentication)
4. [API Services](#api-services)
5. [Custom Hooks](#custom-hooks)
6. [Usage Examples](#usage-examples)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

## Overview

The AegisSuite API integration includes comprehensive services for:

- **Authentication** - User login, registration, password management
- **User Management** - Profile management, preferences, activity logs
- **Agent Operations** - Agent dashboard, listings, clients, performance metrics
- **Lead Management** - Lead tracking, assignment, marketplace, conversion
- **Property Management** - Property listings, search, analytics, reviews
- **Notifications** - Real-time notifications, settings, push subscriptions
- **Admin Functions** - System management, reporting, user moderation

## Configuration

### API Base URL
The API base URL is now configured using environment variables for better security and flexibility:

```javascript
// src/configs/auth.config.js
export const JWT_HOST_API = import.meta.env.VITE_API_BASE_URL || "https://shieldnest-backend-staging-437a38552d5f.herokuapp.com";
```

### Environment Setup
1. **Create Environment File**: Copy `.env.example` to `.env` and configure your API endpoint:
```bash
# .env
VITE_API_BASE_URL=https://shieldnest-backend-staging-437a38552d5f.herokuapp.com
VITE_NODE_ENV=development
VITE_API_TIMEOUT=30000
```

2. **Available Environments**:
   - **Staging**: `https://shieldnest-backend-staging-437a38552d5f.herokuapp.com`
   - **Production**: `https://shieldnest-backend-production-cfedfcca08b0.herokuapp.com`

3. **Requirements**:
   - JWT token storage in localStorage
   - Axios for HTTP requests
   - React hooks for state management
   - Vite for environment variable processing

## Authentication

### Login
```javascript
import { authService } from 'utils/apiService';

const handleLogin = async (credentials) => {
  try {
    const response = await authService.login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    // Token is automatically stored
    console.log('Login successful:', response);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Registration
```javascript
const handleRegister = async (userData) => {
  try {
    const response = await authService.register({
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      role: 'user'
    });
    
    console.log('Registration successful:', response);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### Using Authentication Hook
```javascript
import { useAuth } from 'hooks/useApi';

function App() {
  const { isAuthenticated, user, loading, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>Welcome, {user?.email}</h1>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <LoginForm onLogin={login} />
      )}
    </div>
  );
}
```

## API Services

### User Service
```javascript
import { userService } from 'utils/apiService';

// Get user profile
const profile = await userService.getProfile();

// Update profile
const updated = await userService.updateProfile({
  firstName: 'Jane',
  lastName: 'Smith',
  phone: '+1987654321'
});

// Upload avatar
const formData = new FormData();
formData.append('avatar', file);
const avatar = await userService.uploadAvatar(formData);
```

### Agent Service
```javascript
import { agentService } from 'utils/apiService';

// Get agent dashboard
const dashboard = await agentService.getDashboard();

// Get agent listings
const listings = await agentService.getAgentListings({
  page: 1,
  limit: 10,
  status: 'active'
});

// Add new client
const client = await agentService.addClient({
  name: 'John Client',
  email: 'client@example.com',
  phone: '+1234567890',
  type: 'buyer'
});
```

### Leads Service
```javascript
import { leadsService } from 'utils/apiService';

// Get all leads
const leads = await leadsService.getLeads({
  page: 1,
  limit: 20,
  status: 'new',
  source: 'website'
});

// Create new lead
const newLead = await leadsService.createLead({
  name: 'Potential Client',
  email: 'potential@example.com',
  phone: '+1234567890',
  source: 'referral',
  budget: 500000,
  propertyType: 'house'
});

// Assign lead to agent
await leadsService.assignLead('lead-id', 'agent-id');

// Update lead status
await leadsService.updateLeadStatus('lead-id', 'contacted', 'Called client, interested in viewing properties');
```

### Properties Service
```javascript
import { propertiesService } from 'utils/apiService';

// Search properties
const properties = await propertiesService.searchProperties({
  location: 'New York',
  minPrice: 300000,
  maxPrice: 800000,
  type: 'apartment',
  bedrooms: 2
});

// Get featured properties
const featured = await propertiesService.getFeaturedProperties({ limit: 6 });

// Create new property
const property = await propertiesService.createProperty({
  title: 'Beautiful Apartment',
  description: 'Spacious 2-bedroom apartment in downtown',
  price: 450000,
  location: 'New York, NY',
  type: 'apartment',
  bedrooms: 2,
  bathrooms: 2,
  sqft: 1200
});

// Upload property images
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);
await propertiesService.uploadPropertyImages('property-id', formData);
```

### Notifications Service
```javascript
import { notificationsService } from 'utils/apiService';

// Get all notifications
const notifications = await notificationsService.getNotifications({
  page: 1,
  limit: 10,
  read: false
});

// Mark notification as read
await notificationsService.markAsRead('notification-id');

// Update notification settings
await notificationsService.updateNotificationSettings({
  email: true,
  push: true,
  sms: false,
  leadAssignment: true,
  propertyUpdates: true
});
```

### Admin Service
```javascript
import { adminService } from 'utils/apiService';

// Get admin dashboard
const dashboard = await adminService.getAdminDashboard();

// Get all users
const users = await adminService.getUsers({
  page: 1,
  limit: 50,
  role: 'user',
  status: 'active'
});

// Approve agent
await adminService.approveAgent('agent-id');

// Generate report
const report = await adminService.generateReport({
  type: 'sales',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  format: 'pdf'
});
```

## Custom Hooks

### useApi Hook
```javascript
import { useApi } from 'hooks/useApi';
import { propertiesService } from 'utils/apiService';

function PropertiesList() {
  const { 
    data: properties, 
    loading, 
    error, 
    refetch 
  } = useApi(propertiesService.getProperties, [], {
    immediate: true,
    onSuccess: (data) => console.log('Properties loaded:', data),
    onError: (error) => console.error('Failed to load properties:', error)
  });

  if (loading) return <div>Loading properties...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {properties?.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### usePagination Hook
```javascript
import { usePagination } from 'hooks/useApi';
import { leadsService } from 'utils/apiService';

function LeadsList() {
  const {
    data: leads,
    loading,
    error,
    currentPage,
    pageInfo,
    nextPage,
    previousPage,
    goToPage
  } = usePagination(leadsService.getLeads, {
    pageSize: 20,
    immediate: true
  });

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      
      <div className="leads-grid">
        {leads.map(lead => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
      
      <div className="pagination">
        <button 
          onClick={previousPage} 
          disabled={!pageInfo.hasPrevious}
        >
          Previous
        </button>
        
        <span>Page {currentPage} of {pageInfo.totalPages}</span>
        
        <button 
          onClick={nextPage} 
          disabled={!pageInfo.hasNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### useOptimisticUpdate Hook
```javascript
import { useOptimisticUpdate } from 'hooks/useApi';
import { leadsService } from 'utils/apiService';

function LeadStatusButton({ lead }) {
  const { execute, loading } = useOptimisticUpdate(
    leadsService.updateLeadStatus,
    {
      onSuccess: (result) => console.log('Status updated:', result),
      onError: (error) => console.error('Update failed:', error),
      rollback: true
    }
  );

  const handleStatusChange = async (newStatus) => {
    // Optimistic update - immediately show new status
    const optimisticLead = { ...lead, status: newStatus };
    
    try {
      await execute(optimisticLead, lead.id, newStatus, 'Status changed via UI');
    } catch (error) {
      // Error is handled by the hook, rollback is automatic
    }
  };

  return (
    <button 
      onClick={() => handleStatusChange('contacted')}
      disabled={loading}
    >
      {loading ? 'Updating...' : 'Mark as Contacted'}
    </button>
  );
}
```

## Error Handling

### Using apiUtils for Error Formatting
```javascript
import { apiUtils } from 'utils/apiService';

const handleApiCall = async () => {
  try {
    const result = await someApiCall();
    return result;
  } catch (error) {
    // Format error for user display
    const userMessage = apiUtils.formatError(error);
    
    // Check error type
    if (apiUtils.isNetworkError(error)) {
      showNetworkErrorMessage();
    } else if (apiUtils.isAuthError(error)) {
      redirectToLogin();
    } else if (apiUtils.isValidationError(error)) {
      const validationErrors = apiUtils.getValidationErrors(error);
      displayValidationErrors(validationErrors);
    }
    
    throw new Error(userMessage);
  }
};
```

### Global Error Handling
```javascript
// In your main App component or error boundary
import { apiUtils } from 'utils/apiService';

class ApiErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (apiUtils.isAuthError(error)) {
      // Redirect to login
      window.location.href = '/login';
    } else if (apiUtils.isNetworkError(error)) {
      // Show network error message
      this.setState({ 
        hasError: true, 
        error: 'Network connection error. Please check your internet connection.' 
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorMessage error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

## Best Practices

### 1. Use Environment Variables
```javascript
// Use different API URLs for different environments
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.shieldnest.com'
  : 'https://shieldnest-backend-staging-437a38552d5f.herokuapp.com';
```

### 2. Implement Request Caching
```javascript
// Simple cache implementation
const cache = new Map();

const cachedApiCall = async (key, apiFunction, ...args) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const result = await apiFunction(...args);
  cache.set(key, result);
  
  // Clear cache after 5 minutes
  setTimeout(() => cache.delete(key), 5 * 60 * 1000);
  
  return result;
};
```

### 3. Use Debouncing for Search
```javascript
import { useMemo, useState } from 'react';
import { debounce } from 'lodash';

function PropertySearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);

  const debouncedSearch = useMemo(
    () => debounce(async (query) => {
      if (query.length > 2) {
        const results = await propertiesService.searchProperties({ search: query });
        setResults(results);
      }
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  return (
    <input
      type="text"
      value={searchQuery}
      onChange={handleSearchChange}
      placeholder="Search properties..."
    />
  );
}
```

### 4. Implement Retry Logic
```javascript
const retryApiCall = async (apiFunction, retries = 3, delay = 1000) => {
  try {
    return await apiFunction();
  } catch (error) {
    if (retries > 0 && !apiUtils.isAuthError(error)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryApiCall(apiFunction, retries - 1, delay * 2);
    }
    throw error;
  }
};
```

### 5. Use Loading States Effectively
```javascript
function DataComponent() {
  const { data, loading, error, refetch } = useApi(someApiCall);

  return (
    <div>
      {loading && <SkeletonLoader />}
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={refetch}
        />
      )}
      {data && <DataDisplay data={data} />}
    </div>
  );
}
```

## Constants and Types

### API Status Constants
```javascript
import { 
  API_STATUS, 
  HTTP_STATUS, 
  USER_ROLES, 
  PROPERTY_STATUS, 
  LEAD_STATUS, 
  AGENT_STATUS 
} from 'utils/apiService';

// Usage examples
if (status === API_STATUS.LOADING) {
  // Show loading spinner
}

if (response.status === HTTP_STATUS.CREATED) {
  // Handle successful creation
}

if (user.role === USER_ROLES.ADMIN) {
  // Show admin features
}
```

## Health Check
```javascript
import { healthCheck } from 'utils/apiService';

const checkApiHealth = async () => {
  const isHealthy = await healthCheck();
  if (!isHealthy) {
    // Show maintenance message or fallback UI
  }
};
```

This comprehensive API integration provides a robust foundation for building a full-featured real estate application with ShieldNest. All services include proper error handling, loading states, and are designed to work seamlessly with React's ecosystem. 