import SharedSidebar from "../components/SharedSidebar";
import { useState, useEffect } from "react";
import MonthlyCalendar from "./MonthlyCalendar";
import WeeklyCalendar from "./WeeklyCalendar";
import DailyCalendar from "./DailyCalendar";
import { useDisclosure } from "hooks";
import AppointmentModal from "./AppointmentModal";
import moment from "moment/moment";
import calendarService from "utils/clendarService";
import ScheduleAppointmentModal from "app/pages/powerDialer/ScheduleAppointmentModal";
const Appointments = () => {
  const [viewType, setViewType] = useState("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [isOpen, { open, close }] = useDisclosure(false);
  const [isDetailsOpen, { open:detailOpen, close:detailClose }] = useDisclosure(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [endDate, setEndDate] = useState(
    moment().endOf("month").format("MM-DD-YYYY HH:mm:ss"),
  );
  const [startDate, setStartDate] = useState(
    moment().startOf("month").format("MM-DD-YYYY HH:mm:ss"),
  );
  console.log(startDate, endDate);
  const time_zone =
    Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Calcutta"
      ? "Asia/Kolkata"
      : Intl.DateTimeFormat().resolvedOptions().timeZone;

  // const appointments = [
  //   {
  //     id: "p001",
  //     doctor: "Dr. Emily Carter",
  //     patientName: "John Doe",
  //     phone: "+1-555-234-5678",
  //     email: "john.doe@example.com",
  //     time: "09:00",
  //     endTime: "09:30",
  //     type: "consultation",
  //     status: "confirmed",
  //     date: "2025-11-04",
  //     color: "#3B82F6",
  //   },
  //   {
  //     id: "p002",
  //     doctor: "Dr. Emily Carter",
  //     patientName: "Sarah Lin",
  //     phone: "+1-555-987-1234",
  //     email: "sarah.lin@example.com",
  //     time: "10:15",
  //     endTime: "10:45",
  //     type: "consultation",
  //     status: "pending",
  //     date: "2025-11-04",
  //     color: "#10B981",
  //   },
  //   {
  //     id: "p003",
  //     doctor: "Dr. Alex Morgan",
  //     patientName: "David Patel",
  //     phone: "+1-555-222-8899",
  //     email: "david.patel@example.com",
  //     time: "11:00",
  //     endTime: "11:30",
  //     type: "consultation",
  //     status: "cancelled",
  //     date: "2025-11-05",
  //     color: "#F59E0B",
  //   },
  //   {
  //     id: "p004",
  //     doctor: "Dr. Sophia Nguyen",
  //     patientName: "Liam Johnson",
  //     phone: "+1-555-555-6677",
  //     email: "liam.johnson@example.com",
  //     time: "13:00",
  //     endTime: "13:45",
  //     type: "consultation",
  //     status: "confirmed",
  //     date: "2025-11-05",
  //     color: "#8B5CF6",
  //   },
  //   {
  //     id: "p005",
  //     doctor: "Dr. Noah Kim",
  //     patientName: "Olivia Brown",
  //     phone: "+1-555-444-7788",
  //     email: "olivia.brown@example.com",
  //     time: "15:00",
  //     endTime: "15:30",
  //     type: "consultation",
  //     status: "confirmed",
  //     date: "2025-11-06",
  //     color: "#EC4899",
  //   },
  // ];
  const loadAppointments = (start_date, end_date) => {
    // setLoading(true);

    calendarService
      .getAppointments(start_date, end_date, time_zone)
      .then((response) => {
        console.log(response);
        if (response.data.status === 200) {
          setAppointments(
            response.data.data.map((item) => {
              return {
                id: item.id,
                client:item.client_name,
                phone:item.phone_number,
                time: moment(item.meeting_datetime).format("HH:mm") || "00:00",
                endTime:
                  moment(item.meeting_end_datetime).format("HH:mm") || "00:00",
                // type: "consultation",
                status: "confirmed",
                date: moment(
                  item.meeting_datetime,
                  "MM-DD-YYYY HH:mm:ss",
                ).format("YYYY-MM-DD"),
                color: "#3B82F6", // default color
                title: item.title || "Untitled Meeting", // keep the title
              };
            }),
          );
        }
        //   if (response.status === 200) {
        //     const formattedData = response.data.reduce((acc, item) => {
        //       const mappedEvents = item[key].map(event => ({
        //       id:event.patient_id || '',
        //       doctor:event?.user || '',
        //       patientName: event?.invitee_name || '',
        //       phone:event?.invitee_mobile || '',
        //       email:event?.invitee_email || '',
        //       time: moment(event.meeting_datetime).format("HH:mm"),
        //       type:'consultation',
        //       status: event?.custom_fields?.status || 'confirmed',
        //       endTime: moment(event.meeting_end_datetime).format("HH:mm"),
        //       date: key,
        //       color: event?.custom_fields?.color_theme || '#8B5CF6'
        // }));
        //  acc.push(...mappedEvents);
        // return acc;
        //     },[])
        //     setAppointments(formattedData)
        //   }
      })
      .catch(() => {})
      .finally(() => {
        // setLoading(false)
      });
  };
  useEffect(() => {
    let start_date;
    let end_date = moment(selectedDate).format("MM-DD-YYYY HH:mm:ss");
    if (viewType === "month") {
      setSelectedDate(new Date());
      end_date = moment(new Date())
        .endOf("month")
        .format("MM-DD-YYYY HH:mm:ss");
      start_date = moment(new Date())
        .startOf("month")
        .format("MM-DD-YYYY HH:mm:ss");
    } else if (viewType === "week") {
      setSelectedDate(new Date());
      end_date = moment(selectedDate)
        .endOf("week")
        .format("MM-DD-YYYY HH:mm:ss");
      start_date = moment(selectedDate)
        .startOf("week")
        .format("MM-DD-YYYY HH:mm:ss");
    } else if (viewType === "today") {
      console.log(selectedDate);
      start_date = moment(selectedDate).format("MM-DD-YYYY") + " 00:00:00";
    }
    setStartDate(start_date);
    setEndDate(end_date);
    loadAppointments(start_date, end_date);
  }, [viewType]);
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
              <div className="flex rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <button
                  className={`rounded-l-lg border-r border-gray-200 px-4 py-2 text-sm font-medium transition-colors dark:border-gray-700 ${
                    viewType === "today"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setViewType("today")}
                >
                  Today
                </button>

                <button
                  className={`border-r border-gray-200 px-4 py-2 text-sm font-medium transition-colors dark:border-gray-700 ${
                    viewType === "week"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setViewType("week")}
                >
                  Week
                </button>

                <button
                  className={`rounded-r-lg px-4 py-2 text-sm font-medium transition-colors ${
                    viewType === "month"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setViewType("month")}
                >
                  Month
                </button>
              </div>

              <button
                className="flex items-center space-x-2 rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-gray-900 shadow-lg transition-all hover:bg-yellow-600 dark:bg-yellow-400 dark:text-gray-900 dark:hover:bg-yellow-500"
                onClick={open}
              >
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
                    detailOpen={detailOpen}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    appointments={appointments}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    loadAppointments={loadAppointments}
                    setSelectedAppointment={setSelectedAppointment}
                  />
                )}
                {viewType === "week" && (
                  <WeeklyCalendar
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    appointments={appointments}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    loadAppointments={loadAppointments}
                  />
                )}
                {viewType === "today" && (
                  <DailyCalendar
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    appointments={appointments}
                    open={open}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    loadAppointments={loadAppointments}
                  />
                )}
              </div>
              <div className="lg:col-span-1">
                {/* Today's Appointments */}
                <div className="mb-6 rounded-lg bg-white shadow-lg dark:bg-gray-800">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Today‘s Appointments
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      11/4/2025
                    </p>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No appointments today
                    </p>
                  </div>
                </div>

                {/* This Month Summary */}
                <div className="rounded-lg bg-white shadow-lg dark:bg-gray-800">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      This Month
                    </h3>
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total Appointments
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        30
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Confirmed
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        15
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Scheduled
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        15
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        This Week
                      </span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        0
                      </span>
                    </div>

                    {/* Appointment Types */}
                    <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          APPOINTMENT TYPES
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-200">
                              Calls
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            12
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-200">
                              Meetings
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            11
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-200">
                              Presentations
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
          <ScheduleAppointmentModal isOpen={isOpen} onClose={close} loadAppintments={loadAppointments} startDate={startDate} endDate={endDate }/>
          <AppointmentModal isOpen={isDetailsOpen} close={detailClose} appointment={selectedAppointment}></AppointmentModal>
        </main>
      </div>
    </div>
  );
};

export default Appointments;
