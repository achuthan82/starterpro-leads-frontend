import axiosInstance from './axios';
import { API_ENDPOINTS, JWT_HOST_API } from 'configs/auth.config';
import { getToken } from './jwt';

/**
 * Get authorization header
 * @returns {Object} Authorization headers
 */
const getAuthHeaders = () => {
  const token = getToken() || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Get agent ID from current user context
 * @returns {string|null} Agent ID
 */
const getAgentId = () => {
  try {
    // First priority: Check for stored agent ID from login response
    const storedAgentId = localStorage.getItem('agentId');
    if (storedAgentId) {
      console.log('Using stored agent ID:', storedAgentId);
      return parseInt(storedAgentId);
    }

    // Second priority: Try to get agent ID from user data in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Check if user has agents array (from login response)
      if (user.agents && user.agents.length > 0) {
        const agentId = user.agents[0].id;
        console.log('Agent ID extracted from stored user data:', agentId);
        return agentId;
      }
      // Fallback to user ID fields
      return user.agent_id || user.id;
    }

    // Last resort: try to decode from token
    const token = getToken() || localStorage.getItem('authToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.agent_id || payload.user_id || payload.id;
    }

    console.warn('No agent ID found in any storage location');
    return null;
  } catch (error) {
    console.error('Error getting agent ID:', error);
    return null;
  }
};

/**
 * Build payload for lead type
 * @param {string} leadType - Type of leads (mailed, partial, gold)
 * @param {Object} additionalFilters - Additional filters
 * @returns {Object} Payload object
 */
const getUserId = () => {
   const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user.id;
    }
}
const buildLeadPayload = (leadType, additionalFilters = {}, marketPlace, userId, agent_id) => {

  const agentId = agent_id ? parseInt(agent_id) : getAgentId();
  const role = localStorage.getItem('userRole')
  console.log('user-id', getUserId())
  const basePayload = {
    ...additionalFilters,
  };
  if (marketPlace) {
     basePayload['purchased_user_id'] = userId ? userId : getUserId()
  }
  if (role === 'admin' && userId && userId !== getUserId()) {
    basePayload['agent_id'] = agentId
  }

  console.log(leadType)
  switch (leadType.toLowerCase()) {
    case 'mailed':
      return {
        ...basePayload,
        is_mailed: true
      };
    case 'partial':
      return {
        ...basePayload,
        completed: false
      };
    case 'gold':
    case 'rich': // Support both names for backward compatibility
      return {
        ...basePayload,
        completed: true
      };
    default:
      return basePayload;
  }
};

/**
 * Leads Service
 * Handles all lead management related API calls
 */
class LeadsService {

  /**
   * Get All Leads
   * @param {Object} params - Query parameters (page, limit, search, status, source, etc.)
   * @returns {Promise} Response with paginated leads list
   */
  async getLeads(params = {}) {
    const response = await axiosInstance.get(API_ENDPOINTS.LEADS.BASE, { params });
    return response.data;
  }

  /**
   * Get Leads by Type (Mailed, Partial, Gold)
   * @param {string} leadType - Lead type (mailed, partial, gold)
   * @param {Object} filters - Filter parameters
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 10)
   * @returns {Promise} Response with categorized leads list
   */
  async getLeadsByCategory(leadType, filters = {}, page = 1, perPage = 10, marketPlace) {
    try {
      const combinedFilters = Object.entries(filters).reduce((acc, item) => {
        if (item[1] && item[1] !== 'all') {
          acc[item[0]] = item[1]
        }
        return acc
      }, {});
      // Always use category_id = 1
      const categoryId = 1;

      // Build URL with pagination
      const url = `${JWT_HOST_API}/leads/details/${categoryId}?page=${page}&per_page=${perPage}`;

      // Build payload with lead type filters
      const payload = buildLeadPayload(leadType, combinedFilters, marketPlace);

      console.log(`Fetching ${leadType} leads:`, { url, payload });

      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${leadType} leads:`, error);
      throw error;
    }
  }

  /**
   * Update Lead Status
   * @param {string} leadType - Lead type (mailed, partial, gold)
   * @param {string} leadId - Lead ID
   * @param {string} status - New status
   * @returns {Promise} Response with updated lead status
   */
  async updateLeadStatus(leadType, leadId, status) {
    try {
      // Always use category_id = 1
      const categoryId = 1;

      const response = await fetch(`${JWT_HOST_API}/leads/status/${categoryId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          lead_id: leadId,
          status: status
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating lead status:`, error);
      throw error;
    }
  }

  /**
   * Update Lead Status in Bulk
   * @param {Array} mortgageIds - Array of mortgage IDs
   * @param {number} leadStatusId - Lead status ID
   * @param {number} agentId - Agent ID
   * @returns {Promise} Response with updated lead statuses
   */
  async updateLeadStatusBulk(mortgageIds, leadStatusId, agentId) {
    try {
      // Always use category_id = 1
      const categoryId = 1;

      const payload = {
        mortgage_ids: mortgageIds,
        lead_status: leadStatusId,
        agent_id: agentId
      };

      console.log('Bulk status update payload:', payload);

      const response = await fetch(`${JWT_HOST_API}/leads/status/${categoryId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating lead status in bulk:`, error);
      throw error;
    }
  }

  /**
   * Add/Edit Note to a Lead
   * @param {number} mortgageId - Mortgage ID
   * @param {string} notes - Note
   * @param {number} agentId - Agent ID
   * @returns {Promise} Response with updated note
   */
  async updateLeadNote(mortgageId, notes, agentId) {
    try {
      // Always use category_id = 1
      const categoryId = 1;

      const payload = {
        mortgage_id: mortgageId,
        notes: notes,
        agent_id: agentId
      };

      console.log('Note update update payload:', payload);

      const response = await fetch(`${JWT_HOST_API}/leads/notes/${categoryId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating note:`, error);
      throw error;
    }
  }

  /**
   * Search Leads by Mortgage ID or Name
   * @param {string} leadType - Lead type (mailed, partial, gold)
   * @param {string} searchTerm - Search term (mortgage ID or name)
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 10)
   * @returns {Promise} Response with search results
   */
  async searchLeads(leadType, searchTerm, page = 1, perPage = 10) {
    try {
      // Always use category_id = 1
      const categoryId = 1;
      // Build search payload - simpler structure for search API
      const payload = {
        agent_id: getAgentId(),
        name: searchTerm.trim(),
        page: page,
        per_page: perPage
      };

      // Add lead type specific filters
      switch (leadType.toLowerCase()) {
        case 'mailed':
          payload.is_mailed = true;
          break;
        case 'partial':
          payload.completed = false;
          break;
        case 'gold':
        case 'rich':
          payload.completed = true;
          break;
      }

      console.log(`Searching ${leadType} leads:`, { searchTerm, payload });

      // Build URL with query parameters
      const url = `${JWT_HOST_API}/leads/search/mortgage_id_name/${categoryId}`;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString()
      });
      const fullUrl = `${url}?${queryParams}`;

      console.log('Making search request to:', fullUrl);
      console.log('Search payload:', payload);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
        mode: 'cors',
        credentials: 'same-origin'
      });

      console.log('Search response status:', response.status);
      console.log('Search response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Search API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Search API success response:', result);
      return result;
    } catch (error) {
      console.error(`Error searching leads:`, error);
      throw error;
    }
  }

  /**
   * Get all leads for a type (for pagination and counting)
   * @param {string} leadType - Lead type (mailed, partial, gold)
   * @param {number} maxPages - Maximum pages to fetch (default: 10)
   * @returns {Promise} Response with all leads data
   */
  async getAllLeadsByCategory(leadType, maxPages = 10) {
    try {
      let allLeads = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages && currentPage <= maxPages) {
        const response = await this.getLeadsByCategory(leadType, {}, currentPage, 100);

        if (response.data && response.data.length > 0) {
          allLeads = [...allLeads, ...response.data];
          currentPage++;

          // Check if we have more pages based on response
          // Adjust this logic based on your API's pagination response format
          hasMorePages = response.data.length === 100; // If we got full page, there might be more
        } else {
          hasMorePages = false;
        }
      }

      return { data: allLeads, total: allLeads.length };
    } catch (error) {
      console.error(`Error fetching all ${leadType} leads:`, error);
      throw error;
    }
  }

  /**
   * Get status history of a lead
   * @param {number} agentId - Agent Id
   * @param {number} assigneeId - Assignee Id
   * @returns {Promise} Response with status history data
   */
  async getLeadStatusHistory(agentId, assigneeId) {
    try {
      const url = `${JWT_HOST_API}/leads/single/status-log/${assigneeId}/${agentId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching marketplace pricing:', error);
      throw error;
    }
  }

  /**
   * Export Leads to CSV
   * @param {string} leadType - Lead type (mailed, partial, gold)
   * @param {Array} leadIds - Array of lead IDs to export (optional - if empty, exports all)
   * @returns {Promise} Response with CSV file download
   */
  async exportLeadsCSV(leadType, leadIds = []) {
    try {
      let leadsData;

      if (leadIds.length > 0) {
        // Export selected leads - fetch by IDs
        const filters = { lead_ids: leadIds };
        const response = await this.getLeadsByCategory(leadType, filters);
        leadsData = response.data || [];
      } else {
        // Export all leads - fetch all pages
        const response = await this.getAllLeadsByCategory(leadType);
        leadsData = response.data || [];
      }

      // Convert to CSV format
      if (leadsData.length > 0) {
        const csvContent = this.convertToCSV(leadsData);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${leadType}-leads-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return { success: true };
      }

      return { success: false, message: 'No data to export' };
    } catch (error) {
      console.error(`Error exporting leads:`, error);
      throw error;
    }
  }

  /**
   * Convert data to CSV format
   * @param {Array} data - Array of lead objects
   * @returns {string} CSV formatted string
   */
  convertToCSV(data) {
    if (!data || data.length === 0) return '';

    // Define structured headers for CSV export
    const csvHeaders = [
      'Identifier',
      'Campaign Name',
      'Full Name',
      'First Name',
      'Last Name',
      'Source',
      'Registered Date',
      'Lead Status',
      'Address',
      'City',
      'State',
      'Zip',
      'Loan Amount',
      'Loan Date',
      'Lender Name',
      'Agent Identifier',
      'Borrower Age',
      'Medical Issues',
      'Tobacco Use',
      'Co-Borrower',
      'Lead Phone',
      'Borrower Phone'
    ];

    // Helper function to get IVR value
    const getIvrValue = (lead, field, defaultValue = '') => {
      // First try ivr_logs
      if (lead.ivr_logs && Array.isArray(lead.ivr_logs) && lead.ivr_logs.length > 0) {
        const latestLog = lead.ivr_logs[lead.ivr_logs.length - 1];
        if (latestLog[field] !== undefined) {
          return latestLog[field];
        }
      }

      // Fallback to ivr_response
      if (lead.ivr_response && Array.isArray(lead.ivr_response) && lead.ivr_response.length > 0) {
        const latestResponse = lead.ivr_response[lead.ivr_response.length - 1];
        if (latestResponse[field] !== undefined) {
          return latestResponse[field];
        }
      }

      // Final fallback to direct lead properties
      if (lead[field] !== undefined) {
        return lead[field];
      }

      return defaultValue;
    };

    const csvRows = data.map(lead => {
      const row = [
        lead.identifier || lead.mortgage_id || lead.id || '',
        lead.campaign_name || '',
        lead.lead_full_name || (lead.first_name && lead.last_name ? `${lead.first_name} ${lead.last_name}` : '') || '',
        lead.first_name || '',
        lead.last_name || '',
        lead.source_name || lead.source || '',
        lead.call_in_date_time || '',
        lead.lead_status_name || lead.status_name || lead.lead_status || lead.status || '',
        lead.client_address || lead.address || '',
        lead.city || '',
        lead.state || '',
        lead.zip || lead.zipcode || '',
        lead.loan_amount || '',
        lead.loan_date || '',
        lead.lender_name || '',
        lead.agent_identifier || '',
        getIvrValue(lead, 'age'),
        (() => {
          const health = getIvrValue(lead, 'health');
          if (health === 1 || health === '1') return 'Yes';
          if (health === 0 || health === '0') return 'No';
          return '';
        })(),
        (() => {
          const tobacco = getIvrValue(lead, 'tobacco');
          if (tobacco === 1 || tobacco === '1') return 'Yes';
          if (tobacco === 0 || tobacco === '0') return 'No';
          return '';
        })(),
        (() => {
          const coborrower = getIvrValue(lead, 'coborrower');
          if (coborrower === 1 || coborrower === '1') return 'Yes';
          if (coborrower === 0 || coborrower === '0') return 'No';
          return '';
        })(),
        getIvrValue(lead, 'ani') || lead.lead_phone_number || lead.phone || '',
        getIvrValue(lead, 'number') || lead.borrower_phone || ''
      ];

      // Escape commas and quotes in CSV
      return row.map(value => {
        const stringValue = String(value || '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    });

    return [csvHeaders.join(','), ...csvRows].join('\n');
  }

  /**
   * Get Lead by ID
   * @param {string} leadId - Lead ID
   * @returns {Promise} Response with lead details
   */
  async getLeadById(leadId) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.LEADS.BASE}/${leadId}`);
    return response.data;
  }

  /**
   * Create New Lead
   * @param {Object} leadData - Lead information
   * @returns {Promise} Response with created lead data
   */
  async createLead(leadData) {
    const response = await axiosInstance.post(API_ENDPOINTS.LEADS.CREATE, leadData);
    return response.data;
  }

  /**
   * Update Lead Information
   * @param {string} leadId - Lead ID
   * @param {Object} leadData - Updated lead data
   * @returns {Promise} Response with updated lead data
   */
  async updateLead(leadId, leadData) {
    const response = await axiosInstance.put(`${API_ENDPOINTS.LEADS.BASE}/${leadId}`, leadData);
    return response.data;
  }

  /**
   * Delete Lead
   * @param {string} leadId - Lead ID
   * @returns {Promise} Response confirming deletion
   */
  async deleteLead(leadId) {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.LEADS.BASE}/${leadId}`);
    return response.data;
  }

  /**
   * Assign Lead to Agent
   * @param {string} leadId - Lead ID
   * @param {string} agentId - Agent ID
   * @returns {Promise} Response confirming assignment
   */
  async assignLead(leadId, agentId) {
    const response = await axiosInstance.post(API_ENDPOINTS.LEADS.ASSIGN, { leadId, agentId });
    return response.data;
  }

  /**
   * Get Lead Marketplace
   * @param {Object} params - Query parameters (location, budget, type, etc.)
   * @returns {Promise} Response with available leads for purchase
   */
  async getLeadMarketplace(params = {}) {
    const response = await axiosInstance.get(API_ENDPOINTS.LEADS.MARKETPLACE, { params });
    return response.data;
  }

  /**
   * Purchase Lead from Marketplace
   * @param {string} leadId - Lead ID to purchase
   * @returns {Promise} Response confirming lead purchase
   */
  async purchaseLead(leadId) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.LEADS.MARKETPLACE}/${leadId}/purchase`);
    return response.data;
  }

  /**
   * Get Lead Sources Statistics
   * @param {Object} params - Date range parameters
   * @returns {Promise} Response with lead sources analytics
   */
  async getLeadSources(params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.LEADS.BASE}/sources`, { params });
    return response.data;
  }

  /**
   * Get Lead Conversion Metrics
   * @param {Object} params - Date range and filter parameters
   * @returns {Promise} Response with conversion metrics
   */
  async getConversionMetrics(params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.LEADS.BASE}/conversion-metrics`, { params });
    return response.data;
  }

  /**
   * Add Lead Activity/Note
   * @param {string} leadId - Lead ID
   * @param {Object} activityData - Activity details (type, note, date)
   * @returns {Promise} Response with added activity
   */
  async addLeadActivity(leadId, activityData) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.LEADS.BASE}/${leadId}/activities`, activityData);
    return response.data;
  }

  /**
   * Get Lead Activities
   * @param {string} leadId - Lead ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with lead activities history
   */
  async getLeadActivities(leadId, params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.LEADS.BASE}/${leadId}/activities`, { params });
    return response.data;
  }

  /**
   * Schedule Lead Follow-up
   * @param {string} leadId - Lead ID
   * @param {Object} followUpData - Follow-up details (date, type, notes)
   * @returns {Promise} Response with scheduled follow-up
   */
  async scheduleFollowUp(leadId, followUpData) {
    const response = await axiosInstance.post(`${API_ENDPOINTS.LEADS.BASE}/${leadId}/follow-up`, followUpData);
    return response.data;
  }

  /**
   * Get Lead Follow-ups
   * @param {Object} params - Query parameters (date, agent, status)
   * @returns {Promise} Response with upcoming follow-ups
   */
  async getFollowUps(params = {}) {
    const response = await axiosInstance.get(`${API_ENDPOINTS.LEADS.BASE}/follow-ups`, { params });
    return response.data;
  }

  /**
   * Import Leads from CSV
   * @param {File} csvFile - CSV file with lead data
   * @returns {Promise} Response with import results
   */
  async importLeads(csvFile) {
    const formData = new FormData();
    formData.append('leads_csv', csvFile);

    const response = await axiosInstance.post(`${API_ENDPOINTS.LEADS.BASE}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Get Leads by Agent
   * @param {string} agentId - Agent ID to filter leads by
   * @param {string} leadType - Lead type (mailed, partial, gold) - defaults to 'gold' for rich leads
   * @param {Object} filters - Filter parameters
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 10)
   * @returns {Promise} Response with agent's leads list
   */
  async getLeadsByAgent(agentId, leadType = 'gold', filters = {}, page = 1, perPage = 10, marketPlace, userId) {
    console.log('data', agentId)
    try {
      // Always use category_id = 1
      const categoryId = 1;

      // Build URL with pagination
      const url = `${JWT_HOST_API}/leads/details/${categoryId}?page=${page}&per_page=${perPage}`;

      // Build payload with lead type filters and specific agent ID
      const payload = buildLeadPayload(leadType, {
        ...filters,
     // Override agent_id with the specific agent
      }, marketPlace, userId, agentId);

      console.log(`Fetching ${leadType} leads for agent ${agentId}:`, { url, payload });

      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching leads for agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Search Leads by Agent
   * @param {string} agentId - Agent ID to filter leads by
   * @param {string} leadType - Lead type (mailed, partial, gold) - defaults to 'gold' for rich leads
   * @param {string} searchTerm - Search term (mortgage ID or name)
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 10)
   * @returns {Promise} Response with search results for agent
   */
  async searchLeadsByAgent(agentId, leadType = 'gold', searchTerm, page = 1, perPage = 10) {
    try {
      // Always use category_id = 1
      const categoryId = 1;

      // Build search payload with specific agent ID
      const payload = {
        agent_id: parseInt(agentId),
        search_term: searchTerm.trim(),
        page: page,
        per_page: perPage
      };

      // Add lead type specific filters
      switch (leadType.toLowerCase()) {
        case 'mailed':
          payload.is_mailed = true;
          break;
        case 'partial':
          payload.completed = false;
          break;
        case 'gold':
        case 'rich':
          payload.completed = true;
          break;
      }

      console.log(`Searching ${leadType} leads for agent ${agentId}:`, { searchTerm, payload });

      // Build URL with query parameters
      const url = `${JWT_HOST_API}/leads/search/mortgage_id_name/${categoryId}`;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString()
      });
      const fullUrl = `${url}?${queryParams}`;

      console.log('Making agent search request to:', fullUrl);
      console.log('Agent search payload:', payload);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
        mode: 'cors',
        credentials: 'same-origin'
      });

      console.log('Agent search response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Agent search API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Agent search API success response:', result);
      return result;
    } catch (error) {
      console.error(`Error searching leads for agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch monthly marketplace pricing
   * @returns {Promise} Pricing data array
   */
  async getMarketplacePricing() {
    try {
      const response = await axiosInstance.get(`${JWT_HOST_API}/pricing/marketplace`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching marketplace pricing:', error);
      throw error;
    }
  }

  /**
   * Get Agent Leads Count
   * @param {number} agentId - Agent ID
   * @param {number} category - Category ID (default: 1)
   * @returns {Promise} Response with agent leads count data
   */
  async getAgentLeadsCount(agentId = null, category = 1, text, userId) {
    
    try {
      console.log('agentId', agentId)
      let params = {}
      if (text) {
        params['purchased_user_id'] = userId ? userId :  getUserId()
      }
      if (agentId) { params['agent_id'] = agentId  }
      const response = await axiosInstance.get(`${JWT_HOST_API}/lead-management/count/${category}`, { params });
      console.log('response', response)
      if (response.status !== 200) {
        const errorText = await response.text();
        console.error('Agent leads count API error response:', errorText);
        
        // Handle specific error codes
        if (response.status === 401) {
          throw new Error('Unauthorized: Please login again');
        } else if (response.status === 403) {
          throw new Error('Forbidden: You do not have permission to access this data');
        } else if (response.status === 404) {
          throw new Error('Agent not found or no data available');
        } else if (response.status === 500) {
          throw new Error('Server error: Please try again later');
        } else {
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
      }

      const result = response.data;
      console.log('Agent leads count API success response:', result);
      return result;
    } catch (error) {
      console.error(`Error fetching agent leads count for agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get Territories Count by Category
   * @param {number} category - Category ID (default: 1)
   * @returns {Promise} Response with territories data
   */
  async getTerritoriesCount(category = 1, tabId = 'active') {
    try {
      let states = []
      if (tabId === 'active') {
        states = await this.getActiveTerritories(category)
      } else {
        const allStates = await this.getAllTerritories(category)
        const activeStates = await this.getActiveTerritories(category)
        states = allStates.filter(state => !activeStates.includes(state))
      }
      // Build payload with tab filter
      const payload = { 
        states
      };
      
      const response = await fetch(`${JWT_HOST_API}/territory/total-and-sold-count/${category}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Territories count API error response:', errorText);
        
        // Handle specific error codes
        if (response.status === 401) {
          throw new Error('Unauthorized: Please login again');
        } else if (response.status === 403) {
          throw new Error('Forbidden: You do not have permission to access this data');
        } else if (response.status === 404) {
          throw new Error('Territories count not found or no data available');
        } else if (response.status === 500) {
          throw new Error('Server error: Please try again later');
        } else {
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('Territories count API success response:', result);
      return result;
    } catch (error) {
      console.error('Error fetching territories count:', error);
      throw error;
    }
  }

  /**
   * Get Territories Count by Category
   * @param {number} category - Category ID (default: 1)
   * @returns {Promise} Response with territories data
   */
  async getAllTerritories(category = 1) {
    try {
      const response = await axiosInstance.get(`${JWT_HOST_API}/territory/leads-states/list/${category}`);
      return response?.data?.data?.states || [];
    } catch (error) {
      console.error('Error fetching all territories:', error);
      throw error;
    }
  }

  /**
   * Get Territories Count by Category
   * @param {number} category - Category ID (default: 1)
   * @returns {Promise} Response with territories data
   */
  async getActiveTerritories(category = 1) {
    try {
      const response = await axiosInstance.get(`${JWT_HOST_API}/territory/active/${category}`);
      return response?.data?.data?.states || [];
    } catch (error) {
      console.error('Error fetching active territories:', error);
      throw error;
    }
  }

  /**
   * Get Territories Data by Category
   * @param {number} category - Category ID (default: 1)
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 10)
   * @param {string} tabId - Tab ID ('active' or 'inactive', default: 'active')
   * @returns {Promise} Response with territories data
   */
  async getTerritories(category = 1, page = 1, perPage = 10, tabId = 'active') {
    try {
      console.log(`Fetching territories for category ${category}, tab: ${tabId}, page: ${page}, perPage: ${perPage}`);
      let states = []
      if (tabId === 'active') {
        states = await this.getActiveTerritories(category)
      } else {
        const allStates = await this.getAllTerritories(category)
        const activeStates = await this.getActiveTerritories(category)
        states = allStates.filter(state => !activeStates.includes(state))
      }
      // Build payload with tab filter
      const payload = { 
        states
      };
      
      const response = await fetch(`${JWT_HOST_API}/territory/statewise/count/${category}?page=${page}&per_page=${perPage}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Territories API error response:', errorText);
        
        // Handle specific error codes
        if (response.status === 401) {
          throw new Error('Unauthorized: Please login again');
        } else if (response.status === 403) {
          throw new Error('Forbidden: You do not have permission to access this data');
        } else if (response.status === 404) {
          throw new Error('Territories not found or no data available');
        } else if (response.status === 500) {
          throw new Error('Server error: Please try again later');
        } else {
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('Territories API success response:', result);
      return result;
    } catch (error) {
      console.error('Error fetching territories:', error);
      throw error;
    }
  }
}

// Export singleton instance
const leadsService = new LeadsService();
leadsService.getMarketplacePricing = LeadsService.prototype.getMarketplacePricing;
export default leadsService; 