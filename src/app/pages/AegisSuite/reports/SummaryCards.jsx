import { Card } from 'components/ui';
import { CheckCircleIcon, MinusCircleIcon, UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import Skeleton from './Skeleton';
import ErrorMsg from './ErrorMsg';

const SummaryCards = ({ summary, loading, error }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
    {/* Total Leads */}
    <Card className="p-6 flex items-center justify-between bg-white dark:bg-gray-800 dark:border-gray-700 shieldnest-shadow transition-colors duration-300">
      {loading ? (
        <Skeleton className="h-8 w-32 mb-2" />
      ) : error ? (
        <ErrorMsg msg={error} />
      ) : (
        <>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {(summary?.completed + summary?.incomplete)?.toLocaleString() || '0'}
            </div>
            <div className="text-gray-600 dark:text-gray-400 mt-1">Total Leads</div>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-full ml-4 shieldnest-bg1">
            <UserGroupIcon className="w-7 h-7 text-white" />
          </div>
        </>
      )}
    </Card>

    {/* Total Completed */}
    <Card className="p-6 flex items-center justify-between bg-white dark:bg-gray-800 dark:border-gray-700 shieldnest-shadow transition-colors duration-300">
      {loading ? (
        <Skeleton className="h-8 w-32 mb-2" />
      ) : error ? (
        <ErrorMsg msg={error} />
      ) : (
        <>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summary?.completed || 0}</div>
            <div className="text-gray-600 dark:text-gray-400 mt-1">Total Completed</div>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-full ml-4 shieldnest-bg2">
            <CheckCircleIcon className="w-7 h-7 text-white" />
          </div>
        </>
      )}
    </Card>

    {/* Total Incomplete */}
    <Card className="p-6 flex items-center justify-between bg-white dark:bg-gray-800 dark:border-gray-700 shieldnest-shadow transition-colors duration-300">
      {loading ? (
        <Skeleton className="h-8 w-32 mb-2" />
      ) : error ? (
        <ErrorMsg msg={error} />
      ) : (
        <>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summary?.incomplete || 0}</div>
            <div className="text-gray-600 dark:text-gray-400 mt-1">Total Incomplete</div>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-full ml-4 shieldnest-bg3">
            <MinusCircleIcon className="w-7 h-7 text-white" />
          </div>
        </>
      )}
    </Card>

    {/* Conversion Rate */}
    <Card className="p-6 flex items-center justify-between bg-white dark:bg-gray-800 dark:border-gray-700 shieldnest-shadow transition-colors duration-300">
      {loading ? (
        <Skeleton className="h-8 w-32 mb-2" />
      ) : error ? (
        <ErrorMsg msg={error} />
      ) : (
        <>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {(
                ((summary?.sold || 0) /
                  ((summary?.completed || 0) + (summary?.incomplete || 0))) *
                  100 || 0
              ).toFixed(2)}
              %
            </div>
            <div className="text-gray-600 dark:text-gray-400 mt-1">Lead Conversion Rate</div>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-full ml-4 bg-orange-700">
            <CurrencyDollarIcon className="w-7 h-7 text-white" />
          </div>
        </>
      )}
    </Card>
  </div>
);


export default SummaryCards; 