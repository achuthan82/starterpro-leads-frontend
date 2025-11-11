import { useState, useEffect, useCallback, Fragment } from 'react';
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle
} from "@headlessui/react";
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { appointmentService } from 'utils/apiService';
import { toast } from 'sonner';

const ScheduleAppointmentModal = ({ isOpen, onClose, selectedLead }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [timeSlots, setTimeSlots] = useState({ morning: [], afternoon: [], evening: [] });
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  const [title, setTitle] = useState('');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [clientName, setClientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Get today's date and format for date input
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3); // 3 months ahead
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const generateTimeSlots = useCallback((settings) => {
    if (!settings.availability || !settings.duration_minutes) return;
    
    const slots = [];
    const duration = settings.duration_minutes;
    
    settings.availability.forEach(range => {
      const start = parseTime(range.start);
      const end = parseTime(range.end);
      
      let current = new Date(start);
      const endTime = new Date(end);
      
      while (current < endTime) {
        const timeStr = formatTime(current);
        slots.push({
          time: timeStr,
          datetime: new Date(current),
          available: true
        });
        current.setMinutes(current.getMinutes() + duration);
      }
    });
    
    // Categorize into Morning, Afternoon, Evening
    const morning = [];
    const afternoon = [];
    const evening = [];
    
    slots.forEach(slot => {
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
      const response = await appointmentService.getAppointmentSettings();
      if (response.data) {
        setAvailability(response.data);
        generateTimeSlots(response.data);
      }
    } catch (err) {
      console.error('Error fetching appointment settings:', err);
      setError(err.message || 'Failed to load availability settings');
      toast.error(err.message || 'Failed to load availability settings');
    } finally {
      setLoading(false);
    }
  }, [generateTimeSlots]);

  const parseAppointmentTime = useCallback((timeStr) => {
    // Parse MM-DD-YYYY HH:MM:SS format
    const [datePart, timePart] = timeStr.split(' ');
    const [month, day, year] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }, []);

  const updateTimeSlotsWithBookings = useCallback((appointments) => {
    setTimeSlots(prev => {
      const updateCategory = (category) => {
        return category.map(slot => {
          const slotDateTime = new Date(slot.datetime);
          const isBooked = appointments.some(apt => {
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
        evening: updateCategory(prev.evening)
      };
    });
  }, [parseAppointmentTime]);

  const fetchBookedAppointments = useCallback(async () => {
    if (!selectedDate || !availability) return;
    
    setLoadingSlots(true);
    try {
      const timezone = availability.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Format dates for API: MM-DD-YYYY HH:MM:SS
      const [year, month, day] = selectedDate.split('-');
      const startDate = `${month}-${day}-${year} 00:00:00`;
      const endDate = `${month}-${day}-${year} 23:59:59`;
      
      const response = await appointmentService.getAppointmentList({
        start_date: startDate,
        end_date: endDate,
        timezone: timezone
      });
      
      const appointments = response.data || [];
      
      // Update time slots with booked status
      updateTimeSlotsWithBookings(appointments);
    } catch (err) {
      console.error('Error fetching booked appointments:', err);
      toast.error(err.message || 'Failed to load booked appointments');
    } finally {
      setLoadingSlots(false);
    }
  }, [availability, selectedDate, updateTimeSlotsWithBookings]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null);
      setSelectedTime(null);
      setShowAppointmentForm(false);
      setTitle('');
      setNotes('');
      setClientName('');
      setPhoneNumber('');
    }
  }, [isOpen]);

  // Fetch appointment settings
  useEffect(() => {
    if (isOpen) {
      fetchAppointmentSettings();
    }
  }, [isOpen, fetchAppointmentSettings]);

  // Fetch booked appointments when date is selected
  useEffect(() => {
    if (selectedDate && availability) {
      fetchBookedAppointments();
    }
    // Only trigger when selectedDate changes to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setShowAppointmentForm(false);
    setTitle('');
    setNotes('');
    setClientName('');
    setPhoneNumber('');
  };

  const handleTimeSelect = (slot) => {
    if (slot.available) {
      setSelectedTime(slot);
      setShowAppointmentForm(true);
      // Prefill fields from selected lead
      if (selectedLead) {
        setClientName(selectedLead.name || '');
        setPhoneNumber(selectedLead.phone || '');
        if (!title) {
          setTitle(`Appointment with ${selectedLead.name}`);
        }
      }
    }
  };

  const getMeetingDateTime = () => {
    if (!selectedDate || !selectedTime) return '';
    const appointmentDateTime = new Date(selectedTime.datetime);
    appointmentDateTime.setFullYear(
      parseInt(selectedDate.split('-')[0]),
      parseInt(selectedDate.split('-')[1]) - 1,
      parseInt(selectedDate.split('-')[2])
    );
    const [year, month, day] = selectedDate.split('-');
    const hours = appointmentDateTime.getHours().toString().padStart(2, '0');
    const minutes = appointmentDateTime.getMinutes().toString().padStart(2, '0');
    const seconds = appointmentDateTime.getSeconds().toString().padStart(2, '0');
    return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }
    
    if (!title || title.trim() === '') {
      toast.error('Please enter a title for the appointment');
      return;
    }
    
    if (!clientName || clientName.trim() === '') {
      toast.error('Please enter client name');
      return;
    }
    
    if (!phoneNumber || phoneNumber.trim() === '') {
      toast.error('Please enter phone number');
      return;
    }
    
    setLoading(true);
    try {
      // Use local timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const duration = availability?.duration_minutes || 30;
      const meetingDateTime = getMeetingDateTime();
      
      const appointmentData = {
        time_zone: timezone,
        duration: duration,
        client_name: clientName.trim(),
        phone_number: phoneNumber.trim(),
        meeting_datetime: meetingDateTime,
        title: title.trim(),
        notes: notes.trim() || ''
      };
      
      const response = await appointmentService.createAppointment(appointmentData);
      
      if (response.status === 201 || response.success) {
        toast.success(response.message || 'Appointment scheduled successfully!');
        // Reset form but keep modal open to allow scheduling another appointment
        setSelectedTime(null);
        setTitle('');
        setNotes('');
        setClientName('');
        setPhoneNumber('');
        setShowAppointmentForm(false);
        // Refresh booked appointments to update availability
        if (selectedDate && availability) {
          fetchBookedAppointments();
        }
      } else {
        toast.error(response.message || 'Failed to schedule appointment');
      }
    } catch (err) {
      console.error('Error scheduling appointment:', err);
      toast.error(err.message || 'Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const renderTimeCategory = (category, title) => {
    if (!category || category.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {category.map((slot, index) => (
            <button
              key={index}
              onClick={() => handleTimeSelect(slot)}
              disabled={!slot.available || loadingSlots}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                selectedTime?.time === slot.time
                  ? 'bg-[#0a2463] dark:bg-blue-500 text-white border-[#0a2463] dark:border-blue-500'
                  : slot.available
                  ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              {slot.time}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
        onClose={onClose}
      >
        {/* Overlay */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        {/* Modal Content */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-800 shadow-xl px-6 py-8 transition-all sm:px-8 max-h-[90vh] overflow-y-auto">
            {/* Close Icon */}
            <div className="absolute right-4 top-4">
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Heading */}
            <DialogTitle
              as="h3"
              className="text-2xl font-semibold text-gray-800 dark:text-white mb-2"
            >
              Schedule Appointment
            </DialogTitle>

            {selectedLead && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Scheduling appointment for <span className="font-medium">{selectedLead.name}</span>
              </p>
            )}

            {/* Loading State */}
            {loading && !availability && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a2463] dark:border-blue-400"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading availability...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Date Selection */}
            {availability && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    max={maxDateStr}
                    value={selectedDate || ''}
                    onChange={(e) => handleDateSelect(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2463] dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {formatDateDisplay(selectedDate)}
                      </h3>
                      {loadingSlots && (
                        <div className="ml-2 inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-[#0a2463] dark:border-blue-400"></div>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {renderTimeCategory(timeSlots.morning, 'Morning')}
                      {renderTimeCategory(timeSlots.afternoon, 'Afternoon')}
                      {renderTimeCategory(timeSlots.evening, 'Evening')}
                    </div>

                    {timeSlots.morning.length === 0 && timeSlots.afternoon.length === 0 && timeSlots.evening.length === 0 && !loadingSlots && (
                      <p className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                        No available time slots for this date
                      </p>
                    )}
                  </div>
                )}

                {/* Appointment Form */}
                {showAppointmentForm && selectedTime && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Appointment Details</h4>
                    
                    {/* Client Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Client Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2463] dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter client name"
                        required
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2463] dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>

                    {/* Meeting DateTime */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Meeting Date & Time
                      </label>
                      <input
                        type="text"
                        value={getMeetingDateTime()}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                      />
                    </div>

                    {/* Title */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2463] dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter appointment title"
                        required
                      />
                    </div>

                    {/* Notes */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2463] dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Add any notes about this appointment..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-600 space-x-3">
                      <button
                        onClick={() => {
                          setShowAppointmentForm(false);
                          setSelectedTime(null);
                          setTitle('');
                          setNotes('');
                          setClientName('');
                          setPhoneNumber('');
                        }}
                        className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSchedule}
                        disabled={!title || title.trim() === '' || !clientName || clientName.trim() === '' || !phoneNumber || phoneNumber.trim() === '' || loading}
                        className={`px-4 py-2 text-sm rounded-md transition-colors ${
                          title && title.trim() !== '' && clientName && clientName.trim() !== '' && phoneNumber && phoneNumber.trim() !== '' && !loading
                            ? 'bg-[#0a2463] dark:bg-blue-500 text-white hover:bg-[#0a2463]/90 dark:hover:bg-blue-600'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {loading ? 'Scheduling...' : 'Schedule Appointment'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons - Only show if no form is displayed */}
                {!showAppointmentForm && (
                  <div className="flex items-center justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 space-x-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default ScheduleAppointmentModal;

