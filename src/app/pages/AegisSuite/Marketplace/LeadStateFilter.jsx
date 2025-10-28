import { useEffect, useState } from 'react';
import Select from 'react-select';
import { Card, Spinner } from 'components/ui';
import { subscriptionService, apiUtils } from 'utils/apiService';

const LeadStateFilter = ({ selected, onChange }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoading(true);
        const res = await subscriptionService.getUsaStates();
        // const opts = res.data.map(s => ({ value: s.code, label: s.name }));
        const arr = []
        Object.keys(res.data.data).map(function(key) {
          arr.push({value: res.data.data[key], label: key});
        })
        setOptions([{ value: 'all', label: 'All' }, ...arr]);
      } catch (err) {
        setError(apiUtils.formatError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchStates();
  }, []);

  return (
    <Card className="mb-8 bg-white dark:bg-gray-800">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-[#0a2463] mb-4 dark:text-gray-100">Find Your Perfect Leads</h2>
        {loading ? <Spinner /> : (
          <Select
            isMulti
            options={options}
            value={selected}
            onChange={onChange}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select states..."
          />
        )}
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </Card>
  );
};

export default LeadStateFilter; 