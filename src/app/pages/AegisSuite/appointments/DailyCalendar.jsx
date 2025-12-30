import { useMemo } from "react";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import moment from "moment/moment";
import { LEAD_STATUS } from "utils/apiService";

const DailyCalendar = ({
  selectedDate,
  setSelectedDate,
  appointments,
  open,
  setStartDate,
  setEndDate,
  loadAppointments,
  setSelectedAppointment,
  detailOpen,
}) => {
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
  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];
  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
  const dayAppointments = appointmentsByDate[dateStr] || [];
  console.log("day-appointments", dayAppointments);
  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    let end_date = moment(newDate).format("MM-DD-YYYY") + " 23:59:59";
    let start_date = moment(newDate).format("MM-DD-YYYY") + " 00:00:00";
    setStartDate(start_date);
    setEndDate(end_date);
    loadAppointments(start_date, end_date);
    setStartDate(start_date);
    setEndDate(end_date);
    loadAppointments(start_date, end_date);
  };
  const getStatusBadgeClass = (statusId) => {
    if (!statusId) return "";
    return `shieldnest-badge-${statusId}`;
  };
  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    let end_date = moment(newDate).format("MM-DD-YYYY") + " 23:59:59";
    let start_date = moment(newDate).format("MM-DD-YYYY") + " 00:00:00";
    setStartDate(start_date);
    setEndDate(end_date);
    loadAppointments(start_date, end_date);
  };
  return (
    <div className="rounded-lg bg-white p-4 shadow-md md:p-6 dark:bg-gray-800 dark:shadow-gray-900">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          {/* 
      <button
        onClick={() => setSelectedDate(new Date())}
        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
      >
        Today
      </button> 
      */}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrevDay}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeftIcon className="size-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={handleNextDay}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRightIcon className="size-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Day Schedule */}
      <div className="space-y-2">
        {dayAppointments.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarIcon className="mx-auto mb-4 size-16 text-gray-300 dark:text-gray-600" />
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No appointments scheduled for this day
            </p>
            <button
              onClick={() => {
                setSelectedAppointment(null);
                open();
              }}
              className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Schedule Appointment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {timeSlots.map((time) => {
              const slotAppointments = dayAppointments.filter(
                (apt) => apt.time === time,
              );
              console.log(slotAppointments);
              if (slotAppointments.length === 0) {
                return (
                  <div
                    key={time}
                    className="grid grid-cols-12 gap-4 border-b border-gray-100 py-2 dark:border-gray-700"
                  >
                    <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                      {time}
                    </div>
                    <div className="col-span-10 min-h-[60px] border-l border-gray-200 pl-4 dark:border-gray-700"></div>
                  </div>
                );
              }

              return (
                <div
                  key={time}
                  className="grid grid-cols-12 gap-4 border-b border-gray-100 py-2 dark:border-gray-700"
                >
                  <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">
                    {time}
                  </div>
                  <div className="col-span-10 space-y-2 border-l border-gray-200 pl-4 dark:border-gray-700">
                    {slotAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        onClick={() => {
                          setSelectedAppointment(apt);
                          detailOpen();
                        }}
                        className={`cursor-pointer rounded-lg border-l-4 p-4 transition-all hover:shadow-md dark:shadow-gray-900 dark:hover:shadow-lg ${apt.color}`}
                        // style={{
                        //   borderLeftColor: apt.color,
                        //   backgroundColor: apt.color + "10",
                        // }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                {apt.title}
                              </h4>
                              <span
                                className={`status-badge rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(apt.status)}`}
                              >
                                {LEAD_STATUS[apt.status]
                                  ? LEAD_STATUS[apt.status]
                                  : LEAD_STATUS[1]}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">
                                {apt.time} - {apt.endTime}
                              </span>{" "}
                            </div>
                            {apt.notes && (
                              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                {apt.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyCalendar;
