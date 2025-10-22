import { Card } from 'components/ui';
import { CheckCircleIcon, MinusCircleIcon, UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import Skeleton from './Skeleton';
import ErrorMsg from './ErrorMsg';

const SummaryCards = ({ summary, loading, error }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
    <Card className="p-6 flex items-center justify-between bg-white shieldnest-shadow">
      {loading ? <Skeleton className="h-8 w-32 mb-2" /> : error ? <ErrorMsg msg={error} /> : (
        <>
        <div>
          <div className="text-2xl font-bold">{(summary?.completed + summary?.incomplete)?.toLocaleString() || '0'}</div>
          <div className="text-gray-600 mt-1">Total Leads</div>
        </div>
          {/* <div className="text-green-600 text-sm mt-1">+15.2% vs last month</div> */}
          <div className={`flex items-center justify-center w-12 h-12 rounded-full ml-4 shieldnest-bg1`}>
            <UserGroupIcon className="w-7 h-7 text-white" />
          </div>
        </>
      )}
    </Card>
    <Card className="p-6 flex items-center justify-between bg-white shieldnest-shadow">
      {loading ? <Skeleton className="h-8 w-32 mb-2" /> : error ? <ErrorMsg msg={error} /> : (
        <>
        <div>
          <div className="text-2xl font-bold">{summary?.completed || 0}</div>
          <div className="text-gray-600 mt-1">Total Completed</div>
        </div>
          {/* <div className="text-green-600 text-sm mt-1">+8.5% vs last month</div> */}
          <div className={`flex items-center justify-center w-12 h-12 rounded-full ml-4 shieldnest-bg2`}>
            <CheckCircleIcon className="w-7 h-7 text-white" />
          </div>
          {/* <div className="flex justify-end mt-2"><CheckCircleIcon className="w-8 h-8 shieldnest-bg2" /></div> */}
        </>
      )}
    </Card>
    <Card className="p-6 flex items-center justify-between bg-white shieldnest-shadow">
      {loading ? <Skeleton className="h-8 w-32 mb-2" /> : error ? <ErrorMsg msg={error} /> : (
        <>
        <div>
          <div className="text-2xl font-bold">{summary?.incomplete || 0}</div>
          <div className="text-gray-600 mt-1">Total Incomplete</div>
        </div>
          {/* <div className="text-green-600 text-sm mt-1">+8.5% vs last month</div> */}
          <div className={`flex items-center justify-center w-12 h-12 rounded-full ml-4 shieldnest-bg3`}>
            <MinusCircleIcon className="w-7 h-7 text-white" />
          </div>
          {/* <div className="flex justify-end mt-2"><CheckCircleIcon className="w-8 h-8 text-green-200" /></div> */}
        </>
      )}
    </Card>
    <Card className="p-6 flex items-center justify-between bg-white shieldnest-shadow">
      {loading ? <Skeleton className="h-8 w-32 mb-2" /> : error ? <ErrorMsg msg={error} /> : (
        <>
        <div>
          <div className="text-2xl font-bold">{(((summary?.sold || 0) / ((summary?.completed || 0) + (summary?.incomplete || 0)) * 100)?.toFixed(2) || 0)}%</div>
          <div className="text-gray-600 mt-1">Lead Conversion Rate</div>
        </div>
          {/* <div className="text-red-600 text-sm mt-1">-2.1% vs last month</div> */}
          <div className={`flex items-center justify-center w-12 h-12 rounded-full ml-4 bg-orange-700`}>
            <CurrencyDollarIcon className="w-7 h-7 text-white" />
          </div>
          {/* <div className="flex justify-end mt-2"><CurrencyDollarIcon className="w-8 h-8 text-blue-200" /></div> */}
        </>
      )}
    </Card>
  </div>
);

export default SummaryCards; 