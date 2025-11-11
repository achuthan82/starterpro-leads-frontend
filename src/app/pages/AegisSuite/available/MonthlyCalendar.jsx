import { useMemo, useState } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

const MonthlyCalendar = ({ 
  selectedDate, 
  setSelectedDate, 
  appointments = [], 
  availability = [],
  onManageAvailability,
  loading = false
}) => {
  const [expandedDates, setExpandedDates] = useState({});

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped = {};
    appointments.forEach((apt) => {
      if (!grouped[apt.date]) {
        grouped[apt.date] = [];
      }
      grouped[apt.date].push(apt);
    });
    return grouped;
  }, [appointments]);

  // Group availability by date (if your API provides date-specific availability)
  const availabilityByDate = useMemo(() => {
    const grouped = {};
    availability.forEach((avail) => {
      const dateKey = avail.date || 'default'; // Use 'default' if no specific date
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(avail);
    });
    return grouped;
  }, [availability]);

  const daysInMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0,
  ).getDate();
  
  const firstDayOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1,
  ).getDay();
  
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1),
    );
  };

  // Format availability for display
  const formatAvailability = (availabilities, dateStr) => {
    if (!availabilities || availabilities.length === 0) return null;
    
    const isExpanded = expandedDates[dateStr];
    const displaySlots = isExpanded ? availabilities : availabilities.slice(0, 1);
    
    return (
      <div className="text-xs">
        {displaySlots.map((avail, index) => (
          <div key={index} className="mb-1">
            {`${avail.start} - ${avail.end}`}
          </div>
        ))}
        {!isExpanded && availabilities.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedDates(prev => ({ ...prev, [dateStr]: true }));
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1"
          >
            +{availabilities.length - 1} more slots
          </button>
        )}
        {isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedDates(prev => ({ ...prev, [dateStr]: false }));
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1"
          >
            Show less
          </button>
        )}
      </div>
    );
  };

  // Get availability for a specific date
  const getAvailabilityForDate = (dateStr) => {
    // First check for date-specific availability
    if (availabilityByDate[dateStr]) {
      return availabilityByDate[dateStr];
    }
    
    // Fall back to default availability (your API response structure)
    if (availabilityByDate['default'] || availability.length > 0) {
      return availabilityByDate['default'] || availability;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="flex items-center justify-center">
          <div className="text-lg text-gray-600 dark:text-gray-300">Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow-md md:p-6 dark:bg-gray-800 dark:shadow-gray-900">
      {/* Calendar Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {selectedDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Manage Availability Button */}
          <button
            onClick={onManageAvailability}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Manage Availability
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeftIcon className="size-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRightIcon className="size-5 text-gray-600 dark:text-gray-300" />
            </button>
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

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="min-h-[100px] md:min-h-[120px]"
          ></div>
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${selectedDate.getFullYear()}-${String(
            selectedDate.getMonth() + 1,
          ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          const dayAppointments = appointmentsByDate[dateStr] || [];
          const dayAvailability = getAvailabilityForDate(dateStr);
          const currentDate = new Date();
          const isToday =
            currentDate.toDateString() ===
            new Date(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              day,
            ).toDateString();

          return (
            <div
              key={day}
              className={`min-h-[100px] cursor-pointer rounded-lg border p-2 transition-colors md:min-h-[120px] ${
                isToday
                  ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/40"
                  : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/60"
              }`}
            >
              <div
                className={`mb-1 text-sm font-medium ${
                  isToday
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-200"
                }`}
              >
                {day}
              </div>

              {/* Availability Display */}
              {dayAvailability && (
                <div className="mb-2">
                  <div className="rounded bg-green-50 px-2 py-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {formatAvailability(dayAvailability, dateStr)}
                  </div>
                </div>
              )}

              {/* Appointments Display */}
              <div className="space-y-1">
                {dayAppointments.slice(0, 2).map((apt) => (
                  <div
                    key={apt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      // setSelectedAppointment(apt);
                      // setShowDetailModal(true);
                    }}
                    className="cursor-pointer truncate rounded px-2 py-1 text-xs text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: apt.color }}
                    title={`${apt.time} - ${apt.patientName}`}
                  >
                    <span className="font-medium">{apt.time}</span>{" "}
                    {apt.patientName}
                  </div>
                ))}
                {dayAppointments.length > 2 && (
                  <div className="px-2 text-xs text-gray-500 dark:text-gray-400">
                    +{dayAppointments.length - 2} more appointments
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyCalendar;