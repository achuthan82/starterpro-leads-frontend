import { Fragment, } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { CalendarDaysIcon, ClockIcon, PhoneIcon, XMarkIcon, UserIcon} from "@heroicons/react/24/outline";

const AppointmentModal = ({ isOpen, close, appointment }) => {
  console.log('appointment', appointment)
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
      <DialogPanel className="dark:bg-dark-700 relative w-full max-w-2xl rounded-2xl bg-white px-6 py-8 text-gray-900 shadow-xl transition-all sm:px-8">
        {appointment && (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Appointment Details</h2>
              <button
                onClick={close}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
              {appointment.status && (
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${
                    {
                      confirmed:
                        "bg-green-100 text-green-800 border-green-300",
                      waiting: "bg-yellow-100 text-yellow-800 border-yellow-300",
                      cancelled: "bg-red-100 text-red-800 border-red-300",
                      completed: "bg-blue-100 text-blue-800 border-blue-300",
                    }[appointment.status]
                  }`}
                >
                  {appointment.status.charAt(0).toUpperCase() +
                    appointment.status.slice(1)}
                </span>
              )}
            </div>

            {/* Patient Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{appointment.client}</p>
                  </div>
                </div>
             
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{appointment.phone}</p>
                  </div>
                </div>
             
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Appointment Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">
                      {new Date(appointment.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium">
                      {appointment.time}
                      {appointment.endTime ? ` - ${appointment.endTime}` : ""}
                    </p>
                  </div>
                </div>
                {/* <div className="flex items-center gap-3">
                  <UserCircleIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Provider</p>
                    <p className="font-medium">{appointment.doctor}</p>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Notes */}
            {appointment.notes && (
              <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-gray-700">{appointment.notes}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              
              <button
                onClick={close}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
