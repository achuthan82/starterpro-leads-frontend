import { useMemo } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

const WeeklyCalendar = ({ selectedDate, setSelectedDate, appointments }) => {
  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  // Time slots for day and week views
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];
  const weekDates = getWeekDates(selectedDate);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };
  return (
    <div className="rounded-lg bg-white p-4 shadow-md md:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-800">
            Week of{" "}
            {weekDates[0].toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {weekDates[6].toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </h3>
          {/* <button
              onClick={() => setSelectedDate(new Date())} // September 27, 2025
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              This Week
            </button> */}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevWeek}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <button
            onClick={handleNextWeek}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="mb-2 grid grid-cols-8 gap-2">
            <div className="py-2 text-sm font-semibold text-gray-600">Time</div>
            {weekDates.map((date, i) => {
              const currentDate = new Date(); // September 27, 2025
              const isToday =
                currentDate.toDateString() === date.toDateString();
              return (
                <div
                  key={i}
                  className={`rounded-lg py-2 text-center text-sm font-semibold ${isToday ? "bg-blue-50 text-blue-700" : "text-gray-600"}`}
                >
                  <div>{days[i]}</div>
                  <div className="text-lg">{date.getDate()}</div>
                </div>
              );
            })}
          </div>

          {/* Time Slots */}
          <div className="border-t border-gray-200">
            {timeSlots.map((time) => (
              <div
                key={time}
                className="grid grid-cols-8 gap-2 border-b border-gray-100"
              >
                <div className="px-2 py-3 text-sm text-gray-500">{time}</div>
                {weekDates.map((date, i) => {
                  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                  const slotAppointments = (
                    appointmentsByDate[dateStr] || []
                  ).filter((apt) => apt.time === time);

                  return (
                    <div
                      key={i}
                      className="min-h-[60px] cursor-pointer border-l border-gray-100 px-1 py-2 hover:bg-gray-50"
                    >
                      {slotAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          // onClick={() => {
                          //   setSelectedAppointment(apt);
                          //   setShowDetailModal(true);
                          // }}
                          className="cursor-pointer rounded p-2 text-xs text-white transition-opacity hover:opacity-90"
                          style={{ backgroundColor: apt.color }}
                        >
                          <div className="font-medium">{apt.patientName}</div>
                          <div>{apt.type}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;
