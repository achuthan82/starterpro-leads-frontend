import { useMemo, useState} from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import moment from "moment/moment";
// import { useDisclosure } from "hooks";
import DailyAppointmentModal from "./DailyAppointmentModal";

const MonthlyCalendar = ({
  selectedDate,
  setSelectedDate,
  appointments,
  setStartDate,
  setEndDate,
  loadAppointments,
  setSelectedAppointment,
  detailOpen,
  isOpen,
  open,
  close
}) => {
  // const [isOpen, { open, close }] = useDisclosure(false);
  const [appointmentsOverflow, setAppointmentsOverflow] = useState([])
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
    const prevMonthDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() - 1,
    );
    const firstDay = moment(prevMonthDate)
      .startOf("month")
      .format("MM-DD-YYYY HH:mm:ss");
    const lastDay = moment(prevMonthDate).endOf("month").format("MM-DD-YYYY HH:mm:ss");
    setStartDate(firstDay);
    setEndDate(lastDay);
    loadAppointments(firstDay, lastDay);
  };

  const handleNextMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1),
    );
    const nextMonthDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
    );
    const firstDay = moment(nextMonthDate)
      .startOf("month")
      .format("MM-DD-YYYY HH:mm:ss");
    const lastDay = moment()
      .add(1, "month")
      .endOf("month")
      .format("MM-DD-YYYY HH:mm:ss");
    setStartDate(firstDay);
    setEndDate(lastDay);
    loadAppointments(firstDay, lastDay);
  };
 
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

              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAppointment(apt);
                      detailOpen()
                      // setShowDetailModal(true);
                    }}
                    className={`cursor-pointer truncate rounded px-2 py-1 text-xs text-white transition-opacity hover:opacity-90 ${apt.color}`}
                    // style={{ backgroundColor: apt.color }}
                    title={`${apt.time} - ${apt.title}`}
                  >
                    <span className="font-medium">{apt.time}</span> {apt.title}
                  </div>
                ))}
                {dayAppointments.length > 3 && (

                <div className="px-2 text-xs text-gray-500 dark:text-gray-400" onClick={() => {setAppointmentsOverflow(dayAppointments); open()}}> 
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <DailyAppointmentModal isOpen={isOpen} close={close} appointmentList={appointmentsOverflow} detailOpen={detailOpen} setSelectedAppointment={setSelectedAppointment}/>
    </div>
  );
};

export default MonthlyCalendar;
