import { Card } from 'components/ui';
import Skeleton from './Skeleton';
import ErrorMsg from './ErrorMsg';

const STATE_COLORS = [
  'bg-green-500',
  'bg-green-400',
  'bg-yellow-400',
  'bg-yellow-500',
  'bg-red-500',
];

const TerritoryPerformanceAnalytics = ({ territory, loading, error, stateMap = {} }) => {
  let topStates = [];
  if (territory && Array.isArray(territory)) {
    topStates = territory.slice(0, 5).map((item, idx) => ({
      ...item,
      percent:
        item.sold_count && territory[0].sold_count
          ? Math.round((item.sold_count / territory[0].sold_count) * 100)
          : 0,
      color: STATE_COLORS[idx] || 'bg-gray-400 dark:bg-gray-600',
    }));
  }

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 dark:border dark:border-gray-700 shieldnest-shadow transition-colors duration-300">
      <div className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">
        Territory Performance
      </div>

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <ErrorMsg msg={error} />
      ) : (
        <>
          {/* Summary section */}
          <div className="flex space-x-4 mb-6">
            <div className="flex-1 bg-blue-50 dark:bg-blue-900/40 rounded p-4 text-center transition-colors duration-300">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {territory?.length || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                Total Territories
              </div>
            </div>
          </div>

          {/* Performance bars */}
          <div>
            {topStates.map((state, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between mb-2"
              >
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {stateMap[state.state] || state.state}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded">
                    <div
                      className={`${state.color} h-2 rounded`}
                      style={{
                        width: `${Math.min(state.percent, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-2">
                    {state.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default TerritoryPerformanceAnalytics;
