import { useState, useEffect, useCallback , useRef} from "react";

import { CalendarIcon } from "@heroicons/react/24/outline";
import { appointmentPublicService,} from "utils/apiService";
import { toast } from "sonner";
import Logo from "assets/app-logo/logo-text.svg"; // image import
import { useParams } from "react-router";

const PublicAppointment = () => {
  const appointmentFormRef = useRef()
  const {token} = useParams()
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [timeSlots, setTimeSlots] = useState({
    morning: [],
    afternoon: [],
    evening: [],
  });
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
    const today = new Date().toISOString().split("T")[0];
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // 3 months ahead
    const maxDateStr = maxDate.toISOString().split("T")[0];
  
    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    };
  
    const formatTime = (date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");
      return `${displayHours}:${displayMinutes} ${ampm}`;
    };
  
    const generateTimeSlots = useCallback((settings) => {
      if (!settings.availability || !settings.duration_minutes) return;
  
      const slots = [];
      const duration = settings.duration_minutes;
  
      settings.availability.forEach((range) => {
        const start = parseTime(range.start);
        const end = parseTime(range.end);
  
        let current = new Date(start);
        const endTime = new Date(end);
  
        while (current < endTime) {
          const timeStr = formatTime(current);
          slots.push({
            time: timeStr,
            datetime: new Date(current),
            available: true,
          });
          current.setMinutes(current.getMinutes() + duration);
        }
      });
  
      // Categorize into Morning, Afternoon, Evening
      const morning = [];
      const afternoon = [];
      const evening = [];
  
      slots.forEach((slot) => {
        const hour = slot.datetime.getHours();
        if (hour < 12) {
          morning.push(slot);
        } else if (hour < 17) {
          afternoon.push(slot);
        } else {
          evening.push(slot);
        }
      });
  
      setTimeSlots({ morning, afternoon, evening });
    }, []);
  
    const fetchAppointmentSettings = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await appointmentPublicService.getAppointmentSettings(token);
        if (response.data) {
          setAvailability(response.data);
          generateTimeSlots(response.data);
        }
      } catch (err) {
        console.error("Error fetching appointment settings:", err);
        setError(err.message || "Failed to load availability settings");
        toast.error(err.message || "Failed to load availability settings");
      } finally {
        setLoading(false);
      }
    }, [generateTimeSlots]);
  
    const parseAppointmentTime = useCallback((timeStr) => {
      // Parse MM-DD-YYYY HH:MM:SS format
      const [datePart, timePart] = timeStr.split(" ");
      const [month, day, year] = datePart.split("-").map(Number);
      const [hours, minutes, seconds] = timePart.split(":").map(Number);
      return new Date(year, month - 1, day, hours, minutes, seconds);
    }, []);
  
    const updateTimeSlotsWithBookings = useCallback(
      (appointments) => {
        setTimeSlots((prev) => {
          const updateCategory = (category) => {
            return category.map((slot) => {
              const slotDateTime = new Date(slot.datetime);
              const isBooked = appointments.some((apt) => {
                const aptStart = parseAppointmentTime(apt.meeting_datetime);
                const aptEnd = parseAppointmentTime(apt.meeting_end_datetime);
                return slotDateTime >= aptStart && slotDateTime < aptEnd;
              });
              return { ...slot, available: !isBooked };
            });
          };
  
          return {
            morning: updateCategory(prev.morning),
            afternoon: updateCategory(prev.afternoon),
            evening: updateCategory(prev.evening),
          };
        });
      },
      [parseAppointmentTime],
    );
  
    const fetchBookedAppointments = useCallback(async () => {
      if (!selectedDate || !availability) return;
  
      setLoadingSlots(true);
      try {
        const timezone = availability?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        // Format dates for API: MM-DD-YYYY HH:MM:SS
        const [year, month, day] = selectedDate.split("-");
        const startDate = `${month}-${day}-${year} 00:00:00`;
        const endDate = `${month}-${day}-${year} 23:59:59`;
  
        const response = await appointmentPublicService.getAppointmentList({
          start_date: startDate,
          end_date: endDate,
          timezone: timezone,
          token:token
        });
  
        const appointments = response.data || [];
  
        // Update time slots with booked status
        updateTimeSlotsWithBookings(appointments);
      } catch (err) {
        console.error("Error fetching booked appointments:", err);
        toast.error(err.message || "Failed to load booked appointments");
      } finally {
        setLoadingSlots(false);
      }
    }, [availability, selectedDate, updateTimeSlotsWithBookings]);
    
    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedTime(null);
        setShowAppointmentForm(false);
        // setTitle("");
        setNotes("");
        setClientName("");
        setPhoneNumber("");
      };
    
      const handleTimeSelect = (slot) => {
        if (slot.available) {
          setSelectedTime(slot);
          setShowAppointmentForm(true);
          setTimeout(() => {
         window.scrollTo({
           top: window.scrollY + 400,
          behavior: "smooth"
       });
    }, 100);
          // Prefill fields from selected lead
          
        }
      };
    
      const getMeetingDateTime = () => {
        if (!selectedDate || !selectedTime) return "";
        const appointmentDateTime = new Date(selectedTime.datetime);
        appointmentDateTime.setFullYear(
          parseInt(selectedDate.split("-")[0]),
          parseInt(selectedDate.split("-")[1]) - 1,
          parseInt(selectedDate.split("-")[2]),
        );
        const [year, month, day] = selectedDate.split("-");
        const hours = appointmentDateTime.getHours().toString().padStart(2, "0");
        const minutes = appointmentDateTime
          .getMinutes()
          .toString()
          .padStart(2, "0");
        const seconds = appointmentDateTime
          .getSeconds()
          .toString()
          .padStart(2, "0");
        return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
      };
    
      const handleSchedule = async () => {
        if (!selectedDate || !selectedTime) {
          toast.error("Please select a date and time");
          return;
        }
    
        if (!title || title.trim() === "") {
          toast.error("Please enter a title for the appointment");
          return;
        }
    
        if (!clientName || clientName.trim() === "") {
          toast.error("Please enter client name");
          return;
        }
    
        if (!phoneNumber || phoneNumber.trim() === "") {
          toast.error("Please enter phone number");
          return;
        }
    
        setLoading(true);
        try {
          const timezone =
            availability?.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone;
          const duration = availability?.duration_minutes || 30;
          const meetingDateTime = getMeetingDateTime();
    
          const appointmentData = {
            time_zone: timezone,
            duration: duration,
            client_name: clientName.trim(),
            phone_number: phoneNumber.trim(),
            meeting_datetime: meetingDateTime,
            title: title.trim(),
            notes: notes.trim() || "",
          };
    
           const response = await appointmentPublicService.createAppointment(appointmentData, token);
          
    
          if (response.status === 201 || response.status === 200 || response.success) {
            toast.success(
              response.message || "Appointment scheduled successfully!",
            );
    
            // Reset form but keep modal open to allow scheduling another appointment
            setSelectedTime(null);
            setTitle("");
            setNotes("");
            setClientName("");
            setPhoneNumber("");
            setShowAppointmentForm(false);
            // Refresh booked appointments to update availability
            if (selectedDate && availability) {
              fetchBookedAppointments();
            }
          } else {
            toast.error(response.message || "Failed to schedule appointment");
          }
        } catch (err) {
          console.error("Error scheduling appointment:", err);
          toast.error(err.message || "Failed to schedule appointment");
        } finally {
          setLoading(false);
        }
      };
    
      const formatDateDisplay = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr + "T00:00:00");
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        return date.toLocaleDateString("en-US", options);
      };
    
      const renderTimeCategory = (category, title) => {
        if (!category || category.length === 0) return null;
    
        return (
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {title}
            </h4>
            <div className="flex flex-wrap gap-2">
              {category.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeSelect(slot)}
                  disabled={!slot.available || loadingSlots}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedTime?.time === slot.time
                      ? "border-[#0a2463] bg-[#0a2463] text-white dark:border-blue-500 dark:bg-blue-500"
                      : slot.available
                        ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        );
      };
      const getInvitationDetails = () => {
          appointmentPublicService.getAppointmentDetails(token).then((response) => {
            console.log(response.data)
            if (response.status === 200) {
                console.log('enteres')
                setTitle(response.data.title)
            }
          })
      }
    useEffect(() => {
       if (selectedDate && availability) {
         fetchBookedAppointments();
       }
     }, [selectedDate]);
     useEffect(() => {
      fetchAppointmentSettings();
  }, [ fetchAppointmentSettings]);
  useEffect(() => {
    getInvitationDetails()
  },[])
  return (
  <div className="flex min-h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
     <div className="flex flex-1 flex-col">
         <header className="border-b border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">
                Public Booking
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
               Book Your Slot
              </p>
            </div>
          </div>
        </header>
        <main className="mt-1 flex-1 overflow-auto p-8">
              <div className="max-w-5xl mx-auto mb-6 text-center">
                        <img
                          src={Logo}
                          alt="Company Logo"
                          className="h-30 w-auto mx-auto mb-3 drop-shadow-sm"
                        />
                        <p className="text-gray-600 dark:text-gray-300 text-sm max-w-2xl mx-auto">
                          Welcome to our Appointment Portal. 
                        </p>
                      </div>
                                <div className="max-w-5xl mx-auto">
            <div ref={appointmentFormRef}>
                {loading && !availability && (
                    <div className="py-8 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[#0a2463] dark:border-blue-400"></div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Loading availability...
                        </p>
                    </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                        <p className="text-sm text-red-700 dark:text-red-400">
                        {error}
                        </p>
                    </div>
                    )}

                    {/* Date Selection */}
                    {availability && (
                    <>
                        <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Select Date
                        </label>
                        <input
                            type="date"
                            min={today}
                            max={maxDateStr}
                            value={selectedDate || ""}
                            onChange={(e) => handleDateSelect(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
                        />
                        </div>

                        {/* Time Slots */}
                        {selectedDate && (
                        <div className="mb-6">
                            <div className="mb-4 flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {formatDateDisplay(selectedDate)}
                            </h3>
                            {loadingSlots && (
                                <div className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-[#0a2463] dark:border-blue-400"></div>
                            )}
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                            {renderTimeCategory(timeSlots.morning, "Morning")}
                            {renderTimeCategory(timeSlots.afternoon, "Afternoon")}
                            {renderTimeCategory(timeSlots.evening, "Evening")}
                            </div>

                            {timeSlots.morning.length === 0 &&
                            timeSlots.afternoon.length === 0 &&
                            timeSlots.evening.length === 0 &&
                            !loadingSlots && (
                                <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                No available time slots for this date
                                </p>
                            )}
                        </div>
                        )}

                        {/* Appointment Form */}
                        {showAppointmentForm && selectedTime && (
                        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
                            <h4 className="mb-4 text-sm font-semibold text-gray-800 dark:text-white">
                            Appointment Details
                            </h4>
                        
                            <>
                                {/* Client Name */}
                                <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Client Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
                                    placeholder="Enter client name"
                                    required
                                />
                                </div>
                            </>
                            
                            {/* Phone Number */}
                            <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
                                placeholder="Enter phone number"
                                required
                            />
                            </div>
                            {/* Meeting DateTime */}
                            <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Meeting Date & Time
                            </label>
                            <input
                                type="text"
                                value={getMeetingDateTime()}
                                readOnly
                                className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                            />
                            </div>

                            {/* Title */}
                            <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
                                placeholder="Enter appointment title"
                                required
                            />
                            </div>

                            {/* Notes */}
                            <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
                                placeholder="Add any notes about this appointment..."
                            />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-600">
                            <button
                                onClick={() => {
                                setShowAppointmentForm(false);
                                setSelectedTime(null);
                                setTitle("");
                                setNotes("");
                                setClientName("");
                                setPhoneNumber("");
                                }}
                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSchedule}
                                disabled={
                                !title ||
                                title.trim() === "" ||
                                !clientName ||
                                clientName.trim() === "" ||
                                !phoneNumber ||
                                phoneNumber.trim() === "" ||
                                loading
                                }
                                className={`rounded-md px-4 py-2 text-sm transition-colors ${
                                title &&
                                title.trim() !== "" &&
                                clientName &&
                                clientName.trim() !== "" &&
                                phoneNumber &&
                                phoneNumber.trim() !== "" &&
                                !loading
                                    ? "bg-[#0a2463] text-white hover:bg-[#0a2463]/90 dark:bg-blue-500 dark:hover:bg-blue-600"
                                    : "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                                }`}
                            >
                                {loading ? "Scheduling..." : "Schedule Appointment"}
                            </button>
                            </div>
                        </div>
                        )}

                    </>
                    )}
            </div>
            </div>
        </main>
    </div>
</div>
  )
}

export default PublicAppointment
