import SharedSidebar from "../components/SharedSidebar";
import { useState } from "react";
import MonthlyCalendar from "./MonthlyCalendar";
import WeeklyCalendar from "./WeeklyCalendar";
import DailyCalendar from "./DailyCalendar";
import { useDisclosure } from "hooks";
import AppointmentModal from "./AppointmentModal";

const Appointments = () => {
  const [viewType, setViewType] = useState("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, { open, close }] = useDisclosure(false);
  
  const appointments = [
    {
      id: "p001",
      doctor: "Dr. Emily Carter",
      patientName: "John Doe",
      phone: "+1-555-234-5678",
      email: "john.doe@example.com",
      time: "09:00",
      endTime: "09:30",
      type: "consultation",
      status: "confirmed",
      date: "2025-11-04",
      color: "#3B82F6",
    },
    {
      id: "p002",
      doctor: "Dr. Emily Carter",
      patientName: "Sarah Lin",
      phone: "+1-555-987-1234",
      email: "sarah.lin@example.com",
      time: "10:15",
      endTime: "10:45",
      type: "consultation",
      status: "pending",
      date: "2025-11-04",
      color: "#10B981",
    },
    {
      id: "p003",
      doctor: "Dr. Alex Morgan",
      patientName: "David Patel",
      phone: "+1-555-222-8899",
      email: "david.patel@example.com",
      time: "11:00",
      endTime: "11:30",
      type: "consultation",
      status: "cancelled",
      date: "2025-11-05",
      color: "#F59E0B",
    },
    {
      id: "p004",
      doctor: "Dr. Sophia Nguyen",
      patientName: "Liam Johnson",
      phone: "+1-555-555-6677",
      email: "liam.johnson@example.com",
      time: "13:00",
      endTime: "13:45",
      type: "consultation",
      status: "confirmed",
      date: "2025-11-05",
      color: "#8B5CF6",
    },
    {
      id: "p005",
      doctor: "Dr. Noah Kim",
      patientName: "Olivia Brown",
      phone: "+1-555-444-7788",
      email: "olivia.brown@example.com",
      time: "15:00",
      endTime: "15:30",
      type: "consultation",
      status: "confirmed",
      date: "2025-11-06",
      color: "#EC4899",
    },
  ];
  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      {/* Sidebar */}
      <SharedSidebar currentPath="/appointments" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">
                Calendar
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Manage your Appointments
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex rounded-lg border border-gray-200 bg-white shadow-sm">
                <button
                  className={`rounded-l-lg border-r border-gray-200 px-4 py-2 text-sm font-medium ${
                    viewType === "today"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setViewType("today")}
                >
                  Today
                </button>

                <button
                  className={`border-r border-gray-200 px-4 py-2 text-sm font-medium ${
                    viewType === "week"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setViewType("week")}
                >
                  Week
                </button>

                <button
                  className={`rounded-r-lg px-4 py-2 text-sm font-medium ${
                    viewType === "month"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setViewType("month")}
                >
                  Month
                </button>
              </div>

              <button className="flex items-center space-x-2 rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-gray-900 shadow-lg transition-all hover:bg-yellow-600" onClick={open}>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>Add Appointment</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mt-1 flex-1 overflow-auto p-6">
          <div className="min-h-screen w-full bg-transparent dark:bg-gray-900">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3">
                {viewType === "month" && (
                  <MonthlyCalendar
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    appointments={appointments}
                  />
                )}
                {viewType === "week" && (
                  <WeeklyCalendar
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    appointments={appointments}
                  />
                )}
                {viewType === "today" && (
                  <DailyCalendar
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    appointments={appointments}
                  />
                )}
              </div>
              <div className="lg:col-span-1">
                <div className="mb-6 rounded-lg bg-white shadow-lg">
                  <div className="border-b border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Today&lsquo;s Appointments
                    </h3>
                    <p className="text-sm text-gray-600">11/4/2025</p>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-500">
                      No appointments today
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-white shadow-lg">
                  <div className="border-b border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      This Month
                    </h3>
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Total Appointments
                      </span>
                      <span className="font-semibold text-gray-900">30</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Confirmed</span>
                      <span className="font-semibold text-green-600">15</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Scheduled</span>
                      <span className="font-semibold text-blue-600">15</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">This Week</span>
                      <span className="font-semibold text-purple-600">0</span>
                    </div>

                    <div className="mt-4 rounded-lg bg-gray-50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">
                          APPOINTMENT TYPES
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-700">Calls</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            12
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-700">
                              Meetings
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            11
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                            <span className="text-sm text-gray-700">
                              Presentations
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            7
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <AppointmentModal isOpen={isOpen} close={close}></AppointmentModal>
        </main>
      </div>
    </div>
  );
};

export default Appointments;
