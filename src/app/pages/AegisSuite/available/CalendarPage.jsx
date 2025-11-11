import { useState, useEffect } from 'react';
import { toast } from "sonner";
import availableService from '../../../../utils/availableService';
import MonthlyCalendar from './MonthlyCalendar';
import AvailabilityModal from './AvailabilityModal';
import CalendarSkeleton from './CalendarSkeleton';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availability, setAvailability] = useState([]);
  const [appointments] = useState([]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(30);
  const [saving, setSaving] = useState(false);

  // Fetch appointment settings from API
  const fetchAppointmentSettings = async () => {
    setLoading(true);
    try {
      const response = await availableService.getAppointmentSettings();
      
      if (response.data) {
        // If settings exist, populate the form
        setAvailability(response.data.availability || []);
        setDuration(response.data.duration_minutes || 30);
      } else {
        // If no settings exist, initialize with defaults
        setAvailability([{ start: '09:00', end: '17:00' }]);
        setDuration(30);
      }
    } catch (err) {
      console.error('Error fetching appointment settings:', err);
      
      // If settings don't exist (404) or other error, initialize with defaults
      setAvailability([{ start: '09:00', end: '17:00' }]);
      setDuration(30);
      
      if (err.response?.status !== 404) {
        toast.error('Failed to load appointment settings');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentSettings();
  }, []);

  const handleManageAvailability = () => {
    setShowAvailabilityModal(true);
  };

  const handleSaveAvailability = async (settingsData) => {
    setSaving(true);
    try {
      // Always use POST API for both create and update
      const response = await availableService.saveAppointmentSettings(settingsData);
      
      // If POST is successful (201 status), fetch updated data and close modal
      if (response.status === 201) {
        await fetchAppointmentSettings(); // Refresh data from GET API
        toast.success('Availability saved successfully');
        setShowAvailabilityModal(false);
      }
    } catch (err) {
      console.error('Error saving availability:', err);
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  // Show skeleton loader while loading
  if (loading) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MonthlyCalendar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        appointments={appointments}
        availability={availability}
        onManageAvailability={handleManageAvailability}
        loading={loading}
      />

      {/* Availability Modal */}
      <AvailabilityModal
        isOpen={showAvailabilityModal}
        onClose={() => setShowAvailabilityModal(false)}
        onSave={handleSaveAvailability}
        availability={availability}
        duration={duration}
        saving={saving}
      />
    </div>
  );
};

export default CalendarPage;