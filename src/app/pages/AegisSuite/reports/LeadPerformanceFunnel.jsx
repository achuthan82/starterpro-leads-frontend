import { Card } from 'components/ui';
import Skeleton from './Skeleton';
import ErrorMsg from './ErrorMsg';
import { LEAD_STATUS } from 'constants/app.constant';

// const STATUS_COLORS = {
//   generated: 'bg-blue-500',
//   contacted: 'bg-green-500',
//   qualified: 'bg-yellow-400',
//   proposals: 'bg-orange-500',
//   closed: 'bg-purple-500',
// };
// const STATUS_LABELS = {
//   generated: 'Leads Generated',
//   contacted: 'Leads Contacted',
//   qualified: 'Qualified Leads',
//   proposals: 'Proposals Sent',
//   closed: 'Closed Won',
// };

const LeadPerformanceFunnel = ({ funnel, loading, error }) => {
  /*let funnelData = [
    { key: 'generated', count: 0 },
    { key: 'contacted', count: 0 },
    { key: 'qualified', count: 0 },
    { key: 'proposals', count: 0 },
    { key: 'closed', count: 0 },
  ];
  if (funnel && Array.isArray(funnel)) {
    funnel.forEach(item => {
      if (item.status === 'generated') funnelData[0].count = item.count;
      if (item.status === 'contacted') funnelData[1].count = item.count;
      if (item.status === 'qualified') funnelData[2].count = item.count;
      if (item.status === 'proposals') funnelData[3].count = item.count;
      if (item.status === 'closed') funnelData[4].count = item.count;
    });
  }*/
 
  const funnelTotal = funnel?.length > 0 ? funnel[0].count : 0;

  return (
   <Card className="p-6 bg-white dark:bg-gray-800 dark:border dark:border-gray-700 shieldnest-shadow transition-colors duration-300">
  <div className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">
    Lead Performance
  </div>

  {loading ? (
    <Skeleton className="h-40 w-full bg-gray-700" />
  ) : error ? (
    <ErrorMsg msg={error} />
  ) : (
    <div className="space-y-4">
      {funnel && funnel.length > 0 ? (
        funnel.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center">
              <span
                className={`inline-block w-3 h-3 rounded-full mr-2 shieldnest-badge-${item.lead_status}`}
              ></span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {LEAD_STATUS[item.lead_status]}
              </span>
            </div>

            <div className="flex flex-col items-end space-x-2">
              <div className="flex items-center mb-1">
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {item.count}
                </span>
              </div>

              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded ml-2">
                <div
                  className={`shieldnest-badge-${item.lead_status} h-2 rounded`}
                  style={{
                    width: `${Math.min((item.count / funnelTotal) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-600 dark:text-gray-400">
          No Performance Data Available
        </div>
      )}
    </div>
  )}
</Card>

  );
};

export default LeadPerformanceFunnel; 