import { useState, useEffect } from 'react';
import { DatePicker } from 'components/shared/form/Datepicker';
import { format } from 'date-fns';
import reportService from 'utils/reportService';
import subscriptionService from 'utils/subscriptionService';
import SummaryCards from './SummaryCards';
import LeadPerformanceFunnel from './LeadPerformanceFunnel';
import TerritoryPerformanceAnalytics from './TerritoryPerformanceAnalytics';
import AppointmentStatsCard from './AppointmentStatsCard';
// import Skeleton from './Skeleton';
// import ErrorMsg from './ErrorMsg';

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState([
    format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'MM-dd-yyyy'),
    format(new Date(), 'MM-dd-yyyy')
  ]);
  const [summary, setSummary] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [territory, setTerritory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stateMap, setStateMap] = useState({});
  const [appointmentStats, setAppointmentStats] = useState({})
  // Fetch state code-to-name mapping
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const statesResponse = await subscriptionService.getUsaStates();
        console.log('statesResponse', statesResponse);
        const statesMap = {};
        if (statesResponse?.data?.data) {
          Object.keys(statesResponse.data.data).forEach(function(key) {
            statesMap[statesResponse.data.data[key]] = key;
          });
        }
        setStateMap(statesMap);
      } catch (e) {
        console.log('error', e);
        setStateMap({});
      }
    };
    fetchStates();
  }, []);

  const fetchAll = async (start, end) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, funnelRes, territoryRes, appointmentRes] = await Promise.all([
        reportService.getLeadsAndSoldCount({ start_date: start, end_date: end }),
        reportService.getStatusBasedCount({ start_date: start, end_date: end }),
        reportService.getStateWiseSoldAndCallsCount({ start_date: start, end_date: end }),
        reportService.getAppointmentStats({start_date:start, end_date:end})
      ]);
      setAppointmentStats(appointmentRes.data)
      setSummary(summaryRes.data);
      setFunnel(funnelRes.data);
      setTerritory(territoryRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      fetchAll(dateRange[0], dateRange[1]);
    }
  }, [dateRange]);

  console.log('summary', summary);
  console.log('funnel', funnel);
  console.log('territory', territory);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>
        <DatePicker
          className='bg-white dark:bg-gray-800'
          options={{
            mode: 'range',
            dateFormat: 'm-d-Y',
            defaultDate: dateRange,
            onChange: (dates) => {
              if (dates.length === 2) {
                setDateRange([
                  format(new Date(dates[0]), 'MM-dd-yyyy'),
                  format(new Date(dates[1]), 'MM-dd-yyyy')
                ]);
              }
            }
          }}
          placeholder="Date Range"
        />
      </div>
       <SummaryCards summary={summary} loading={loading} error={error} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LeadPerformanceFunnel funnel={funnel} loading={loading} error={error} />
        <TerritoryPerformanceAnalytics territory={territory} loading={loading} error={error} stateMap={stateMap} />
         <AppointmentStatsCard stats={appointmentStats} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 