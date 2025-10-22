// Base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://shieldnest-backend-staging-437a38552d5f.herokuapp.com';

/**
 * Get Authentication Headers
 * @returns {Object} Headers with authentication token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'X-Requested-With': 'XMLHttpRequest'
  };
};

/**
 * Orders Service
 * Handles all order and subscription related API calls
 */
class OrdersService {
  
  /**
   * Get Paginated Orders for User
   * @param {string} userId - User ID to fetch orders for
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 10)
   * @param {string} timeZone - Time zone (default: 'Asia/Calcutta')
   * @param {number} isFreshLeads - Fresh leads flag (default: 1)
   * @returns {Promise} Response with paginated orders
   */
  async getUserOrders(status, userId, page = 1, perPage = 10,  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone, isFreshLeads = 1) {
    try {
      const url = `${API_BASE_URL}/marketplace/orders/${userId}/paginated`;
      const params = new URLSearchParams({
        // user_id: userId,
        // payment_status:status !== 'all' ? status : '',
        page: page.toString(),
        per_page: perPage.toString(),
        timezone: timeZone === 'Asia/Calcutta' ? 'Asia/Kolkata' : timeZone,
        is_fresh_leads: isFreshLeads.toString()
      });

      if (status !== 'all') params['payment_status'] = status
  
      console.log('status', params)

      console.log(`Fetching orders for user ${userId}:`, url + '?' + params.toString());

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        mode: 'cors',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Orders API response:', result);
      return result;
    } catch (error) {
      console.error(`Error fetching orders for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get Paginated Subscriptions for User
   * @param {string} userId - User ID to fetch subscriptions for
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 10)
   * @returns {Promise} Response with paginated subscriptions
   */
  async getUserSubscriptions(userId, page = 1, perPage = 10) {
    try {
      const url = `${API_BASE_URL}/stripe-subscriptions/paginated/${userId}`;
      const params = new URLSearchParams({
        time_zone:Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Calcutta' ? 'Asia/Kolkata' : Intl.DateTimeFormat().resolvedOptions().timeZone,
        page: page.toString(),
        per_page: perPage.toString()
      });

      console.log(`Fetching subscriptions for user ${userId}:`, url + '?' + params.toString());

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        mode: 'cors',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Subscriptions API response:', result);
      return result;
    } catch (error) {
      console.error(`Error fetching subscriptions for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Search Orders for User
   * @param {string} userId - User ID to search orders for
   * @param {string} searchTerm - Search term
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 10)
   * @returns {Promise} Response with search results
   */
  async searchUserOrders(userId, searchTerm, page = 1, perPage = 10) {
    try {
      // For search, we'll use the same orders endpoint but with search parameters
      const orders = await this.getUserOrders(userId, page, perPage);
      
      // Client-side filtering for search since API might not support search directly
      if (orders.data && Array.isArray(orders.data)) {
        const filteredOrders = orders.data.filter(order => 
          order.id?.toString().includes(searchTerm) ||
          order.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return {
          ...orders,
          data: filteredOrders,
          total: filteredOrders.length
        };
      }
      
      return orders;
    } catch (error) {
      console.error(`Error searching orders for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Search Subscriptions for User
   * @param {string} userId - User ID to search subscriptions for
   * @param {string} searchTerm - Search term
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 10)
   * @returns {Promise} Response with search results
   */
  async searchUserSubscriptions(userId, searchTerm, page = 1, perPage = 10) {
    try {
      // For search, we'll use the same subscriptions endpoint but with search parameters
      const subscriptions = await this.getUserSubscriptions(userId, page, perPage);
      
      // Client-side filtering for search since API might not support search directly
      if (subscriptions.data && Array.isArray(subscriptions.data)) {
        const filteredSubscriptions = subscriptions.data.filter(subscription => 
          subscription.id?.toString().includes(searchTerm) ||
          subscription.plan_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subscription.plan_description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return {
          ...subscriptions,
          data: filteredSubscriptions,
          total: filteredSubscriptions.length
        };
      }
      
      return subscriptions;
    } catch (error) {
      console.error(`Error searching subscriptions for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get Subscription Purchase History
   * @param {number} page - Page number (default: 1)
   * @param {number} perPage - Items per page (default: 10)
   * @param {string} timeZone - Time zone (default: local timezone)
   * @param {number} isFreshLeads - Fresh leads flag (default: 1)
   * @param {string} startDate - Start date filter (optional)
   * @param {string} endDate - End date filter (optional)
   * @param {string} paymentStatus - Payment status filter (optional)
   * @returns {Promise} Response with paginated purchase history
   */
  async getPurchaseHistory(page = 1, perPage = 10, timeZone = null, isFreshLeads = 1, startDate = null, endDate = null, paymentStatus = null, name = null, isMarketPlace) {
    try {
      console.log(isFreshLeads)
      console.log(isMarketPlace)
      // Get local timezone if not provided
      const localTimeZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const url = `${API_BASE_URL}/orders/admin/summary`; // /stripe-subscriptions/admin/order-summary
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        time_zone: localTimeZone === 'Asia/Calcutta' ? 'Asia/Kolkata' : localTimeZone,
        // is_fresh_leads: isFreshLeads.toString(),
        // name: name,
        is_marketplace: isMarketPlace ? 1 : 0
      });

      // Add date filters if provided
      if (startDate) {
        params.append('start_date', startDate);
      }
      if (endDate) {
        params.append('end_date', endDate);
      }
      if (name) {
        params.append('name', name);
      }
      if (paymentStatus) {
        params.append('payment_status', paymentStatus);
      }

      console.log('Fetching purchase history:', url + '?' + params.toString());

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        mode: 'cors',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Purchase history API response:', result);
      return result;
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      throw error;
    }
  }

  /**
   * Download Purchase History
   * @param {string} startDate - Start date filter in MM-DD-YYYY format (required)
   * @param {string} endDate - End date filter in MM-DD-YYYY format (required)
   * @param {string} paymentStatus - Payment status filter (optional)
   * @param {number} isFreshLeads - Fresh leads flag (default: 1)
   * @returns {Promise} Response with download data
   */
  async downloadPurchaseHistory(startDate, endDate, paymentStatus = null, isFreshLeads = 1, name = null, isMarketPlace) {  // 
    try {
      // Validate required parameters
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required for download');
      }

      const url = `${API_BASE_URL}/orders/download/admin/summary`;  // /order/download/for_mailer   /stripe-subscriptions/download/admin/order-summary
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        is_fresh_leads: isFreshLeads.toString(),
        is_marketplace: isMarketPlace ? 1 : 0
      });

      // Add optional filters
      if (paymentStatus) {
        params.append('payment_status', paymentStatus);
      }
      if (name) {
        params.append('name', name)
      }
      console.log('Downloading purchase history:', url + '?' + params.toString());

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        mode: 'cors',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        // Handle different error status codes
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized access. Please log in again.');
          case 403:
            throw new Error('Access forbidden. You do not have permission to download purchase history.');
          case 404:
            throw new Error('Download service not found.');
          case 500:
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        console.log('Downloading purchase history:', response);
        const result = await response.json();

        console.log('Downloading purchase history:', result); 
        console.log('Is marketplace data:', isMarketPlace);
        console.log('Result type:', typeof result);
        console.log('Is array:', Array.isArray(result));
        if (result.data) {
          console.log('Result data:', result.data);
          console.log('Result data orders:', result.data.orders);
        }
        
        // Check if it's an error response
        if (result.error) {
          throw new Error(result.message || result.error || 'Download failed');
        }
        
        // Convert JSON to CSV and download
        if (Array.isArray(result)) {
          // Use marketplace-specific conversion if this is marketplace data
          if (isMarketPlace) {
            return this.convertMarketplaceDataToCsvAndDownload(result, 'marketplace_purchase_history_'+startDate+'_to_'+endDate+'.csv');
          } else {
            return this.convertJsonToCsvAndDownload(result, 'purchase_history_'+startDate+'_to_'+endDate+'.csv');
          }
        } else if (result.data && Array.isArray(result.data?.orders)) {
          // Use marketplace-specific conversion if this is marketplace data
          if (isMarketPlace) {
            return this.convertMarketplaceDataToCsvAndDownload(result.data.orders, result.data.new_file_name || 'marketplace_purchase_history.csv');
          } else {
            return this.convertJsonToCsvAndDownload(result.data.orders, result.data.new_file_name);
          }
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        // Handle direct file download
        const blob = await response.blob();
        const filename = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'purchase_history.csv';
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return { success: true, message: 'Download completed successfully' };
      }
    } catch (error) {
      console.error('Error downloading purchase history:', error);
      throw error;
    }
  }

  /**
   * Convert JSON data to CSV and trigger download
   * @param {Array} jsonData - Array of JSON objects
   * @param {string} filename - Name of the CSV file
   * @returns {Object} Success response
   */
  convertJsonToCsvAndDownload(jsonData, filename) {
    try {
      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error('No data to convert to CSV');
      }

      // Get all unique keys from all objects
      const allKeys = new Set();
      jsonData.forEach(obj => {
        Object.keys(obj).forEach(key => allKeys.add(key));
      });

      // Convert Set to Array, filter out user_id, and sort for consistent column order
      const headers = Array.from(allKeys)
        .filter(key => key !== 'user_id') // Hide user_id column
        .sort();

      // Create CSV header row with custom header mapping
      let csvContent = headers.map(header => {
        // Change 'id' header to 'Order ID'
        const displayHeader = header === 'id' ? 'Order ID' : header;
        return this.escapeCsvValue(displayHeader);
      }).join(',') + '\n';

      // Create CSV data rows
      jsonData.forEach(obj => {
        const row = headers.map(header => {
          const value = obj[header];
          if (Array.isArray(value)) {
            // Handle arrays (like states_chosen) - join with semicolon
            return this.escapeCsvValue(value.join('; '));
          } else if (value === null || value === undefined) {
            return this.escapeCsvValue('');
          } else {
            return this.escapeCsvValue(String(value));
          }
        });
        csvContent += row.join(',') + '\n';
      });

      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'CSV download completed successfully' };
    } catch (error) {
      console.error('Error converting JSON to CSV:', error);
      throw new Error(`Failed to convert data to CSV: ${error.message}`);
    }
  }

  /**
   * Convert marketplace purchase data to CSV format with flattened structure
   * @param {Array} marketplaceData - Array of marketplace purchase objects
   * @param {string} filename - Name for the downloaded file
   * @returns {Object} Success response
   */
  convertMarketplaceDataToCsvAndDownload(marketplaceData, filename) {
    try {
      console.log('convertMarketplaceDataToCsvAndDownload called with:', marketplaceData);
      console.log('Data type:', typeof marketplaceData);
      console.log('Is array:', Array.isArray(marketplaceData));
      console.log('Data length:', marketplaceData?.length);
      
      if (!Array.isArray(marketplaceData) || marketplaceData.length === 0) {
        console.error('Invalid marketplace data:', marketplaceData);
        throw new Error('No marketplace data to convert to CSV');
      }

      // Define headers for marketplace CSV (excluding user_id)
      const headers = [
        'id',
        'name',
        'amount_received',
        'payment_status',
        'created_at',
        // user_id removed from headers
        // Invoice data fields
        'invoice_number',
        'purchase_date',
        'subtotal',
        'total_amount',
        'commission',
        // Bill to fields
        'bill_to_name',
        'bill_to_email',
        'bill_to_phone',
        'bill_to_agency_name',
        // From fields
        'from_name',
        'from_email',
        'from_phone',
        'from_address',
        // Items summary
        'items_count',
        'items_summary',
        'items_total_value'
      ];

      // Create CSV header row with custom header mapping
      let csvContent = headers.map(header => {
        // Change 'id' header to 'Order ID'
        const displayHeader = header === 'id' ? 'Order ID' : header;
        return this.escapeCsvValue(displayHeader);
      }).join(',') + '\n';

      // Process each marketplace purchase
      marketplaceData.forEach(purchase => {
        // Debug: Log the purchase structure to understand the data format
        console.log('Processing marketplace purchase:', purchase);
        
        const invoiceData = purchase.invoice_data || {};
        const billTo = invoiceData.bill_to || {};
        const from = invoiceData.from || {};
        const items = invoiceData.items || [];

        // Calculate items summary
        const itemsCount = items.length;
        const itemsSummary = items.map(item => 
          `${item.title || 'N/A'} (Qty: ${item.quantity || 0}, State: ${item.state || 'N/A'}, Price: $${item.unit_price || 0})`
        ).join('; ');
        const itemsTotalValue = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

        // Create row data with fallback values (excluding user_id)
        const rowData = [
          purchase.id || 'NO_ID',
          purchase.name || 'NO_NAME',
          purchase.amount_received || 'NO_AMOUNT',
          purchase.payment_status || 'NO_STATUS',
          purchase.created_at || 'NO_DATE',
          // user_id removed from row data
          // Invoice data
          invoiceData.invoice_number || 'NO_INVOICE',
          invoiceData.purchase_date || 'NO_PURCHASE_DATE',
          invoiceData.subtotal || 'NO_SUBTOTAL',
          invoiceData.total_amount || 'NO_TOTAL',
          invoiceData.commission || 'NO_COMMISSION',
          // Bill to
          billTo.name || 'NO_BILL_NAME',
          billTo.email || 'NO_BILL_EMAIL',
          billTo.phone || 'NO_BILL_PHONE',
          billTo.agency_name || 'NO_AGENCY',
          // From
          from.name || 'NO_FROM_NAME',
          from.email || 'NO_FROM_EMAIL',
          from.phone || 'NO_FROM_PHONE',
          from.address || 'NO_FROM_ADDRESS',
          // Items
          itemsCount,
          itemsSummary || 'NO_ITEMS',
          itemsTotalValue
        ];

        // Debug: Log the row data to see what's being processed
        console.log('Row data for purchase:', purchase.id, rowData);

        // Escape and join row data
        const row = rowData.map(value => this.escapeCsvValue(value));
        csvContent += row.join(',') + '\n';
      });

      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Marketplace CSV download completed successfully' };
    } catch (error) {
      console.error('Error converting marketplace data to CSV:', error);
      throw new Error(`Failed to convert marketplace data to CSV: ${error.message}`);
    }
  }

  /**
   * Escape CSV value to handle commas, quotes, and newlines
   * @param {string} value - Value to escape
   * @returns {string} Escaped CSV value
   */
  escapeCsvValue(value) {
    if (value === null || value === undefined) {
      return '""';
    }
    
    const stringValue = String(value);
    
    // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
      return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    
    return stringValue;
  }
}

// Create and export service instance
const ordersService = new OrdersService();
export default ordersService; 