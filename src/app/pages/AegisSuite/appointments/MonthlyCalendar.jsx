import { useMemo } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
const MonthlyCalendar = ({ selectedDate, setSelectedDate, appointments }) => {
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
  return (
    <div className="rounded-lg bg-white p-4 shadow-md md:p-6">
      {/* Calendar Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-800">
            {selectedDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {days.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-semibold text-gray-600"
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
          const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          const dayAppointments = appointmentsByDate[dateStr] || [];
          const currentDate = new Date(); // September 27, 2025
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
              className={`min-h-[100px] cursor-pointer rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50 md:min-h-[120px] ${
                isToday ? "border-blue-300 bg-blue-50" : ""
              }`}
              // onClick={() => {
              //   handleDayClick(day)
              // }}
            >
              <div
                className={`mb-1 text-sm font-medium ${isToday ? "text-blue-600" : "text-gray-700"}`}
              >
                {day}
              </div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((apt) => (
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
                {dayAppointments.length > 3 && (
                  <div className="px-2 text-xs text-gray-500">
                    +{dayAppointments.length - 3} more
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
