import { Card } from 'components/ui';
import Skeleton from './Skeleton';
import ErrorMsg from './ErrorMsg';

const AppointmentStatsCard = ({ stats, loading, error }) => {
  const {
    total_lead_count = 0,
    total_show_up_count = 0,
    show_up_sold_count = 0,
  } = stats || {};

  // --- Show-Up Percentage ---
  const showUpPercentRaw =
    total_lead_count > 0
      ? (total_show_up_count / total_lead_count) * 100
      : 0;

  const showUpPercent =
    showUpPercentRaw > 0 && showUpPercentRaw < 1
      ? 1 // minimum visibility
      : Math.round(showUpPercentRaw);

  // --- Sold Percentage ---
  const soldPercentRaw =
    total_show_up_count > 0
      ? (show_up_sold_count / total_show_up_count) * 100
      : 0;

  const soldPercent =
    soldPercentRaw > 0 && soldPercentRaw < 1
      ? 1 // minimum visibility
      : Math.round(soldPercentRaw);

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 dark:border dark:border-gray-700 shieldnest-shadow transition-colors duration-300">
      <div className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">
        Appointment Stats
      </div>

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <ErrorMsg msg={error} />
      ) : (
        <div className="space-y-6">

          {/* TOTAL LEADS */}
          <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/40 rounded transition-colors duration-300">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {total_lead_count}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Total Leads
            </div>
          </div>

          {/* SHOW-UP RATE */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                Show-Ups
              </span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {total_show_up_count} ({Math.round(showUpPercentRaw)}%)
              </span>
            </div>

            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded">
              <div
                className="bg-green-500 h-2 rounded"
                style={{
                  width: `${showUpPercent}%`,
                }}
              ></div>
            </div>
          </div>

          {/* SOLD FROM SHOW-UP */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                Show-Up Sold
              </span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {show_up_sold_count} ({Math.round(soldPercentRaw)}%)
              </span>
            </div>

            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded">
              <div
                className="bg-blue-500 h-2 rounded"
                style={{
                  width: `${soldPercent}%`,
                }}
              ></div>
            </div>
          </div>

        </div>
      )}
    </Card>
  );
};

export default AppointmentStatsCard;
