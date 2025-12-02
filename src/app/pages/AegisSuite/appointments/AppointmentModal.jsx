import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  CalendarDaysIcon,
  ClockIcon,
  PhoneIcon,
  XMarkIcon,
  UserIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { LEAD_STATUS } from "constants/app.constant";
import leadsService from "utils/leadsService";
import { toast } from "sonner";

const AppointmentModal = ({
  isOpen,
  close,
  appointment,
  setDeleteModal,
  open,
  setSelectedAppointment,
  loadAppointments,
  startDate,
  endDate
}) => {
  const [showUpLoading, setShowUpLoading] = useState(false);
  const getStatusBadgeClass = (statusId) => {
    if (!statusId) return "";
    return `shieldnest-badge-${statusId === 14 ? 13 : statusId}`;
  };
  const handleShowUpToggle = async (item) => {
    setShowUpLoading(true);
    try {
      const payload = {
        agent_id: item.agent_id,
        mortgage_id: item.mortgage_id,
        show_up: !item.show_up,
      };

      const result = await leadsService.updateShowUpStatus(payload);
      // Adjust this based on what your API returns
      if (result.status === 200) {
        setSelectedAppointment((prev) => ({...prev, show_up:!item.show_up}))
        loadAppointments(startDate, endDate)
        toast.success("Show up status updated");
      } else {
        toast.error("Failed to update");
      }
    } catch (error) {
      toast.error("Error updating show-up status");
      console.error(error);
    } finally {
      setShowUpLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
        onClose={close}
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
          <DialogPanel className="dark:bg-dark-700 relative w-full max-w-2xl rounded-2xl bg-white px-6 py-8 text-gray-900 shadow-xl transition-all sm:px-8 dark:text-gray-100">
            {appointment && (
              <div>
                {/* Header */}
                <div className="mb-6 flex items-center justify-between ">
                  <h2 className="text-2xl font-bold">
                    {appointment?.title || "Appointment Details"}
                  </h2>

                  <button
                    onClick={close}
                    className="dark:hover:bg-dark-600 rounded-lg p-2 transition-colors hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="mb-6 flex justify-between items-start">
                  {appointment.status && (
                    <span
                      className={`status-badge rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}
                    >
                      {LEAD_STATUS[appointment.status]
                        ? LEAD_STATUS[appointment.status]
                        : LEAD_STATUS[1]}
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Show Up
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Toggle to mark lead as show up
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleShowUpToggle(appointment)}
                      disabled={showUpLoading}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-[var(--color-atoll)] focus:ring-offset-2 focus:outline-none ${
                        appointment.show_up
                          ? "bg-green-600 dark:bg-green-500"
                          : "bg-gray-200 dark:bg-gray-600"
                      } ${showUpLoading ? "cursor-not-allowed opacity-50" : ""}`}
                      role="switch"
                      aria-checked={appointment.show_up}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          appointment.show_up
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Client Information */}
                <div className="dark:bg-dark-600 mb-6 rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
                    Client Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Name
                        </p>
                        <p className="font-medium">{appointment.client}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Phone
                        </p>
                        <p className="font-medium">{appointment.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Schedule */}
                <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
                    Appointment Schedule
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <CalendarDaysIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Date
                        </p>
                        <p className="font-medium">
                          {new Date(appointment.date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ClockIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Time
                        </p>
                        <p className="font-medium">
                          {appointment.time}
                          {appointment.endTime
                            ? ` - ${appointment.endTime}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {appointment.notes && (
                  <div className="mb-6 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                      Notes
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {appointment.notes}
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      open();
                      close();
                    }}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      setDeleteModal(true);
                      close();
                    }}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </button>

                  <button
                    onClick={close}
                    className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default AppointmentModal;
