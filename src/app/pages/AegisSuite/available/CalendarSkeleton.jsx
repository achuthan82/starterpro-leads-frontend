// import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

const CalendarSkeleton = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Generate skeleton days (42 cells for 6 weeks)
  const skeletonDays = Array.from({ length: 42 }, (_, i) => i);

  return (
    <div className="rounded-lg bg-white p-4 shadow-md md:p-6 dark:bg-gray-800 dark:shadow-gray-900">
      {/* Calendar Header Skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-7 w-40 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Manage Availability Button Skeleton */}
          <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>
          
          <div className="flex gap-2">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>
            <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-600"></div>
          </div>
        </div>
      </div>

      {/* Days Header */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {days.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-semibold text-gray-600 dark:text-gray-300"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid Skeleton */}
      <div className="grid grid-cols-7 gap-1">
        {skeletonDays.map((index) => (
          <div
            key={index}
            className="min-h-[100px] animate-pulse rounded-lg border border-gray-200 p-2 md:min-h-[120px] dark:border-gray-700"
          >
            {/* Day number skeleton */}
            <div className="mb-1 h-5 w-6 rounded bg-gray-300 dark:bg-gray-600"></div>
            
            {/* Availability slot skeleton */}
            <div className="mb-2 h-6 rounded bg-gray-200 dark:bg-gray-700"></div>
            
            {/* Appointment slots skeleton */}
            <div className="space-y-1">
              <div className="h-5 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-5 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarSkeleton;