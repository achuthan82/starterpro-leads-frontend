import { useEffect, useState } from 'react';
import LeadStateCard from './LeadStateCard';
import { Card, Spinner, Button } from 'components/ui';
import { apiUtils } from 'utils/apiService';
import axios from 'utils/axios';

const PER_PAGE_OPTIONS = [6, 9, 12, 18];

const LeadStateList = ({ selectedStates = [], onViewLeads, pricingData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(9);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { page, per_page: perPage };
        // Only pass states if any are selected and not "all"
        const filtered = selectedStates.filter(s => s.value !== 'all');
        if (filtered.length > 0) {
          params.states = filtered.map(s => s.value).join(',');
        }
        const token = window.localStorage.getItem('authToken');
        const res = await axios.get(
          '/marketplace/completed-incomplete-for-sale-total-count/paginated',
          {
            params,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        setData(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
      } catch (err) {
        setError(apiUtils.formatError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedStates, page, perPage]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-gray-700 font-medium">Showing page {page} of {totalPages || 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Per page:</span>
          <select
            className="border rounded px-2 py-1"
            value={perPage}
            onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
          >
            {PER_PAGE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.length === 0 ? (
            <Card className="col-span-full text-center py-12">No leads found.</Card>
          ) : (
            data.map((item) => {
              // Find pricing info for this state
              let statePricing = null;
              if (pricingData && Array.isArray(pricingData)) {
                statePricing = pricingData.find(p => p.state_code === item.state || p.state === item.state);
              }
              return (
                <LeadStateCard
                  key={item.state}
                  stateName={item.state}
                  stateCode={item.state}
                  completed={item.completed ? item.completed : 0}
                  incomplete={item.incomplete ? item.incomplete : 0}
                  pricing={statePricing}
                  onViewLeads={() => onViewLeads(item.state)}
                />
              );
            })
          )}
        </div>
      )}
      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        <span>Page {page} of {totalPages || 1}</span>
        <Button
          variant="outline"
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default LeadStateList; 