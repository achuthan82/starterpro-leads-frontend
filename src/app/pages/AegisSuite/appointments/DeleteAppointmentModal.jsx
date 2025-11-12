import { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import appointmentService from "utils/appointmentService";
import { toast } from "sonner";

const DeleteAppointmentModal = ({ appointment, setDeleteModal, startDate,endDate, loadAppointments}) => {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const handleDelete = async () => {
    try {
      setDeleteLoading(true); 
      const response = await appointmentService.deleteAppointment(
        appointment.id,
      );
      console.log(response)
      if (response.status === 200) {
        setDeleteModal(false)
        loadAppointments(startDate, endDate)
        toast.success("Appointment deleted successfully");
      }
    } catch  {
      toast.error("Failed to delete appointment");
    } finally {
      setDeleteLoading(false); 
    }
  };
  return (
    <div>
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
          <div className="mb-4 flex items-center">
            <ExclamationTriangleIcon className="mr-3 h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Cancel Appointment
            </h3>
          </div>

          <p className="mb-6 text-gray-600">
            Are you sure you want to cancel the appointment? This action cannot
            be undone.
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setDeleteModal(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteLoading ? (
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAppointmentModal;
