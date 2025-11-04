import { useMemo } from "react";
import { ChevronRightIcon, ChevronLeftIcon, CalendarIcon } from "@heroicons/react/24/outline";
const DailyCalendar = ({ selectedDate, setSelectedDate, appointments }) => {
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
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];
  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
  const dayAppointments = appointmentsByDate[dateStr] || [];
  console.log("day-appointments", dayAppointments);
  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };
   return (
  <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-gray-800">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            {/* <button
              onClick={() => setSelectedDate(new Date())} // September 27, 2025
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Today
            </button> */}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </div>
        </div>

        {/* Day Schedule */}
        <div className="space-y-2">
          {dayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="size-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No appointments scheduled for this day</p>
              <button
                // onClick={() => setShowAddModal(true)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Schedule Appointment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {timeSlots.map(time => {
                const slotAppointments = dayAppointments.filter(apt => apt.time === time);
                console.log('slot-appointments', slotAppointments)
                if (slotAppointments.length === 0) {
                  return (
                    <div key={time} className="grid grid-cols-12 gap-4 py-2 border-b border-gray-100">
                      <div className="col-span-2 text-sm text-gray-500">{time}</div>
                      <div className="col-span-10 min-h-[60px] border-l border-gray-200 pl-4">
                        {/* Empty slot */}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={time} className="grid grid-cols-12 gap-4 py-2 border-b border-gray-100">
                    <div className="col-span-2 text-sm text-gray-500">{time}</div>
                    <div className="col-span-10 border-l border-gray-200 pl-4 space-y-2">
                      {slotAppointments.map(apt => (
                        <div
                          key={apt.id}
                          onClick={() => {
                            // setSelectedAppointment(apt);
                            // setShowDetailModal(true);
                          }}
                          className="p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all"
                          style={{ 
                            borderLeftColor: apt.color,
                            backgroundColor: apt.color + '10'
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-gray-900">{apt.patientName}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                  apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {apt.status}
                                </span>
                                {apt.consultationType === 'video' && (
                                  <span className="flex items-center gap-1 text-blue-600">
                                    {/* <Video className="w-4 h-4" /> */}
                                    <span className="text-xs">Video</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">{apt.time} - {apt.endTime}</span> • {apt.type}
                              </div>
                              {apt.notes && (
                                <div className="mt-2 text-sm text-gray-700">{apt.notes}</div>
                              )}
                            </div>
                            {/* <div className="ml-4 flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAppointment(apt);
                                }}
                                className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div> */}
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
   )
};

export default DailyCalendar;
