import { Fragment, useState, useEffect } from 'react';
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import { Button } from "components/ui";
import { toast } from "sonner";

const AvailabilityModal = ({ isOpen, onClose, onSave, availability, duration, saving = false }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [currentDuration, setCurrentDuration] = useState(30);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (availability && availability.length > 0) {
      setTimeSlots([...availability]);
    } else {
      setTimeSlots([{ start: '09:00', end: '17:00' }]);
    }
    setCurrentDuration(duration || 30);
  }, [availability, duration, isOpen]);

  // Get system timezone function
  const getSystemTimezone = () => {
    const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return systemTimezone === 'Asia/Calcutta' ? 'Asia/Kolkata' : systemTimezone;
  };

  // Generate time options from 00:00 to 23:45 in 15-minute intervals
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  // Convert time string to minutes for comparison
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check if time slot duration is valid based on appointment duration
  const isValidSlotDuration = (startTime, endTime) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const slotDuration = endMinutes - startMinutes;
    
    // Check if slot duration is multiple of appointment duration
    return slotDuration % currentDuration === 0;
  };

  // Check for time slot conflicts and duration validation
  const hasTimeConflict = (index, startTime, endTime) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Validate start time is before end time
    if (startMinutes >= endMinutes) {
      return 'End time must be after start time';
    }

    // Validate slot duration is multiple of appointment duration
    if (!isValidSlotDuration(startTime, endTime)) {
      return `Time slot duration must be a multiple of ${currentDuration} minutes`;
    }

    // Check for conflicts with other time slots
    for (let i = 0; i < timeSlots.length; i++) {
      if (i === index) continue;

      const otherStart = timeToMinutes(timeSlots[i].start);
      const otherEnd = timeToMinutes(timeSlots[i].end);

      if (
        (startMinutes >= otherStart && startMinutes < otherEnd) ||
        (endMinutes > otherStart && endMinutes <= otherEnd) ||
        (startMinutes <= otherStart && endMinutes >= otherEnd)
      ) {
        return `Conflicts with existing slot: ${timeSlots[i].start} - ${timeSlots[i].end}`;
      }
    }

    return null;
  };

  const addTimeSlot = () => {
    // Find a safe default time slot (after existing slots)
    let defaultStart = '09:00';
    let defaultEnd = '17:00';

    if (timeSlots.length > 0) {
      const lastSlot = timeSlots[timeSlots.length - 1];
      const lastEnd = timeToMinutes(lastSlot.end);
      
      // Start new slot after last slot ends (using current duration)
      const newStartMinutes = lastEnd + currentDuration;
      if (newStartMinutes < 1380) { // 23:00 in minutes
        const newStartHour = Math.floor(newStartMinutes / 60);
        const newStartMinute = newStartMinutes % 60;
        defaultStart = `${newStartHour.toString().padStart(2, '0')}:${newStartMinute.toString().padStart(2, '0')}`;
        
        // Set end time based on a reasonable duration (8 hours max)
        const newEndMinutes = newStartMinutes + Math.min(480, 1440 - newStartMinutes);
        if (newEndMinutes <= 1440) {
          const newEndHour = Math.floor(newEndMinutes / 60);
          const newEndMinute = newEndMinutes % 60;
          defaultEnd = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`;
        }
      }
    }

    setTimeSlots([...timeSlots, { start: defaultStart, end: defaultEnd }]);
  };

  const removeTimeSlot = (index) => {
    const newSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(newSlots);
    const newErrors = { ...errors };
    delete newErrors[`slot-${index}`];
    setErrors(newErrors);
  };

  const updateTimeSlot = (index, field, value) => {
    const newSlots = timeSlots.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    );
    setTimeSlots(newSlots);

    const updatedSlot = newSlots[index];
    const conflictError = hasTimeConflict(index, updatedSlot.start, updatedSlot.end);
    
    const newErrors = { ...errors };
    if (conflictError) {
      newErrors[`slot-${index}`] = conflictError;
    } else {
      delete newErrors[`slot-${index}`];
    }
    setErrors(newErrors);
  };

  const validateAllSlots = () => {
    const newErrors = {};
    let isValid = true;

    timeSlots.forEach((slot, index) => {
      const error = hasTimeConflict(index, slot.start, slot.end);
      if (error) {
        newErrors[`slot-${index}`] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateAllSlots()) {
      toast.error('Please fix time slot conflicts before saving');
      return;
    }

    const settingsData = {
      availability: timeSlots,
      duration_minutes: currentDuration,
      timezone: getSystemTimezone() // Automatically use system timezone in payload
    };

    onSave(settingsData);
  };

  const getAvailableStartTimes = (index) => {
    return timeOptions.filter(time => {
      if (timeSlots.length === 0) return true;
      
      const timeMinutes = timeToMinutes(time);
      
      for (let i = 0; i < timeSlots.length; i++) {
        if (i === index) continue;
        
        const otherStart = timeToMinutes(timeSlots[i].start);
        const otherEnd = timeToMinutes(timeSlots[i].end);
        
        if (timeMinutes >= otherStart && timeMinutes < otherEnd) {
          return false;
        }
      }
      
      return true;
    });
  };

  const getAvailableEndTimes = (index, startTime) => {
    if (!startTime) return timeOptions;
    
    const startMinutes = timeToMinutes(startTime);
    
    return timeOptions.filter(time => {
      const endMinutes = timeToMinutes(time);
      
      // End time must be after start time
      if (endMinutes <= startMinutes) return false;
      
      // Check if duration is valid multiple of current duration
      const slotDuration = endMinutes - startMinutes;
      if (slotDuration % currentDuration !== 0) {
        return false;
      }
      
      // Check if this end time would conflict with other slots
      for (let i = 0; i < timeSlots.length; i++) {
        if (i === index) continue;
        
        const otherStart = timeToMinutes(timeSlots[i].start);
        const otherEnd = timeToMinutes(timeSlots[i].end);
        
        if (endMinutes > otherStart && endMinutes <= otherEnd) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Update time slots when duration changes to ensure they remain valid
  useEffect(() => {
    const newErrors = {};
    let hasChanges = false;
    
    const updatedSlots = timeSlots.map((slot, index) => {
      const error = hasTimeConflict(index, slot.start, slot.end);
      if (error) {
        newErrors[`slot-${index}`] = error;
      }
      
      // If slot is invalid with new duration, adjust end time to nearest valid time
      if (!isValidSlotDuration(slot.start, slot.end)) {
        hasChanges = true;
        const startMinutes = timeToMinutes(slot.start);
        const endMinutes = timeToMinutes(slot.end);
        const slotDuration = endMinutes - startMinutes;
        
        // Calculate nearest valid end time
        const validDuration = Math.floor(slotDuration / currentDuration) * currentDuration;
        const newEndMinutes = startMinutes + Math.max(currentDuration, validDuration);
        
        if (newEndMinutes <= 1440) { // 24:00 in minutes
          const newEndHour = Math.floor(newEndMinutes / 60);
          const newEndMinute = newEndMinutes % 60;
          const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`;
          
          return { ...slot, end: newEndTime };
        }
      }
      
      return slot;
    });
    
    if (hasChanges) {
      setTimeSlots(updatedSlots);
    }
    
    setErrors(newErrors);
  }, [currentDuration]);

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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
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
          <DialogPanel className="dark:bg-dark-700 relative w-full max-w-2xl rounded-2xl bg-white px-6 py-8 text-left shadow-xl transition-all sm:px-8">
            <DialogTitle
              as="h3"
              className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center mb-6"
            >
              Manage Availability
            </DialogTitle>
            
            <div className="max-h-[70vh] overflow-y-auto px-2">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  {/* Duration */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Appointment Duration (minutes)
                    </label>
                    <select
                      value={currentDuration}
                      onChange={(e) => setCurrentDuration(parseInt(e.target.value))}
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Available Time Slots
                      </label>
                      <Button
                        type="button"
                        onClick={addTimeSlot}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm rounded"
                      >
                        Add Slot
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {timeSlots.map((slot, index) => (
                        <div key={index} className="border rounded-lg p-4 dark:border-gray-600">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Start Time
                              </label>
                              <select
                                value={slot.start}
                                onChange={(e) => updateTimeSlot(index, 'start', e.target.value)}
                                disabled={saving}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              >
                                {getAvailableStartTimes(index).map((time) => (
                                  <option key={`start-${index}-${time}`} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <span className="text-gray-500 dark:text-gray-400 mt-6">to</span>

                            <div className="flex-1">
                              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                End Time
                              </label>
                              <select
                                value={slot.end}
                                onChange={(e) => updateTimeSlot(index, 'end', e.target.value)}
                                disabled={saving}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              >
                                {getAvailableEndTimes(index, slot.start).map((time) => (
                                  <option key={`end-${index}-${time}`} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {timeSlots.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeTimeSlot(index)}
                                disabled={saving}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 mt-6"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          
                          {errors[`slot-${index}`] && (
                            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                              {errors[`slot-${index}`]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <Button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 px-6 py-2 rounded"
                  >
                    Cancel
                  </Button>
                  <Button
                    style={{ backgroundColor: '#155dfc'}}
                    type="submit"
                    disabled={Object.keys(errors).length > 0 || saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Availability'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default AvailabilityModal;