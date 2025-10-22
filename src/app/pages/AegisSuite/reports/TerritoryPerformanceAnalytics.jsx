import { Card } from 'components/ui';
import Skeleton from './Skeleton';
import ErrorMsg from './ErrorMsg';

const STATE_COLORS = [
  'bg-[#0a2463]',
  'bg-[#f4d03f]',
  'bg-[#0a2463]',
  'bg-[#f4d03f]',
  'bg-red-500',
];

const TerritoryPerformanceAnalytics = ({ territory, loading, error, stateMap = {} }) => {
  let topStates = [];
  if (territory && Array.isArray(territory)) {
    topStates = territory.slice(0, 5).map((item, idx) => ({
      ...item,
      percent: item.sold_count && territory[0].sold_count ? Math.round((item.sold_count / territory[0].sold_count) * 100) : 0,
      color: STATE_COLORS[idx] || 'bg-gray-300',
    }));
  }

  console.log('stateMap', stateMap);
  return (
    <Card className="p-6 bg-white shieldnest-shadow">
      <div className="font-semibold text-lg mb-4">Territory Performance</div>
      {loading ? <Skeleton className="h-40 w-full" /> : error ? <ErrorMsg msg={error} /> : (
        <>
          <div className="flex space-x-4 mb-6">
            <div className="flex-1 bg-blue-50 rounded p-4 text-center">
              <div className="text-3xl font-bold text-blue-500">{territory?.length || 0}</div>
              <div className="text-gray-600 text-sm mt-2">Total Territories</div>
            </div>
          </div>
          <div>
            {topStates.map((state, idx) => (
              <div key={idx} className="flex items-center justify-between mb-2">
                <span className='font-semibold'>{stateMap[state.state] || state.state}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 h-2 bg-gray-200 rounded">
                    <div className={`${state.color} h-2 rounded`} style={{ width: `${state.sold}%` }}></div>
                  </div>
                  <span className="text-xs font-bold ml-2">{state.sold}%</span>
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