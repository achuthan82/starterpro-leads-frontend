import axiosInstance from './axios';
import { JWT_HOST_API } from 'configs/auth.config';

class ReportService {
  // Helper method to convert JSON data to CSV format
  convertToCSV(jsonData) {
    try {
      const { headings, data } = jsonData;
      
      if (!headings || !data || !Array.isArray(data)) {
        throw new Error('Invalid data format: missing headings or data array');
      }

      if (!Array.isArray(headings)) {
        throw new Error('Invalid data format: headings must be an array');
      }

      let csvContent = '';

      // Add headers row
      csvContent += headings.map(heading => `"${String(heading).replace(/"/g, '""')}"`).join(',') + '\n';

      // Add data rows
      data.forEach((row, index) => {
        if (!row || typeof row !== 'object') {
          console.warn(`Skipping invalid row at index ${index}:`, row);
          return;
        }

        const rowValues = headings.map(heading => {
          // Map heading to corresponding data field
          let value = '';
          
          // Map common field names
          switch (heading) {
            case 'Identifier':
              value = row.mortgage_id || '';
              break;
            case 'Lead Full Name':
              value = row.full_name || '';
              break;
            case 'Client Address':
              value = row.address || '';
              break;
            case 'City':
              value = row.city || '';
              break;
            case 'State':
              value = row.state || '';
              break;
            case 'Zip':
              value = row.zip || '';
              break;
            case 'Lender':
              value = row.lender_name || '';
              break;
            case 'Loan Amount':
              value = row.loan_amount || '';
              break;
            case 'Loan Date':
              value = row.loan_date || '';
              break;
            case ' Agent ID':
              value = row.agent_id || '';
              break;
            case 'First Name':
              value = row.first_name || '';
              break;
            case 'Last Name':
              value = row.last_name || '';
              break;
            case 'Call In Date':
            case 'Lead Phone Number':
            case 'Borrower Age':
            case 'Borrower Medical Issues':
            case 'Borrower Tobacco Use,Co-Borrower?':
            case 'Borrower Phone':
            case 'Lead Status':
              // These fields are not in the current data, so leave empty
              value = '';
              break;
            default:
              // Try to find exact match in row data
              value = row[heading.toLowerCase().replace(/\s+/g, '_')] || '';
              break;
          }
          
          // Escape quotes and wrap in quotes
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        
        csvContent += rowValues.join(',') + '\n';
      });

      return csvContent;
    } catch (error) {
      console.error('Error converting to CSV:', error);
      throw new Error(`Failed to convert data to CSV: ${error.message}`);
    }
  }

  async getLeadsAndSoldCount(params) {
    try {
      const response = await axiosInstance.get(`${JWT_HOST_API}/report/leads-and-sold-count`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching leads and sold count:', error);
      throw error;
    }
  }

  async getStatusBasedCount(params) {
    try {
      const response = await axiosInstance.get(`${JWT_HOST_API}/report/status-based-count`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching status based count:', error);
      throw error;
    }
  }
    async getAppointmentStats(params) {
    try {
      const response = await axiosInstance.get(`${JWT_HOST_API}/report/appointments-sold-show-up-count`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching status based count:', error);
      throw error;
    }
  }
  async getStateWiseSoldAndCallsCount(params) {
    try {
      const response = await axiosInstance.get(`${JWT_HOST_API}/report/state-wise-sold-and-calls-count`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching state wise sold and calls count:', error);
      throw error;
    }
  }

  async getCampaigns({ categoryId, search = '', token }) {
    try {
      const response = await axiosInstance.get(`${JWT_HOST_API}/files/${categoryId}/paginated`, {
        params: { page: 1, per_page: 10, search },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }

  async downloadCampaignFile({ campaignId, campaignName, token }) {
    try {
      const response = await axiosInstance.get(
        `${JWT_HOST_API}/files/download/uploaded_mailer/${campaignId}`,
        {
          params: { campaign: campaignName },
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error downloading campaign file:', error);
      throw error;
    }
  }
}

export default new ReportService(); 