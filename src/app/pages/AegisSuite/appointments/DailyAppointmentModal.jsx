import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const DailyAppointmentModal = ({
  isOpen,
  close,
  appointmentList = [],
  detailOpen,
  setSelectedAppointment
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        data-testid="close-appointments-modal"
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

        {/* Modal */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel className="relative w-full max-w-3xl rounded-2xl bg-white px-6 py-8 text-gray-900 shadow-xl transition-all dark:bg-dark-700 dark:text-gray-100 sm:px-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Appointments</h2>

              <button
                onClick={close}
                data-testid="btn-x-close-appointments-modal"
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-dark-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Appointment List */}
            <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
              {appointmentList.length > 0 &&
                appointmentList.map((apt) => (
                  <div
                    key={apt.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm transition dark:border-gray-700 dark:bg-dark-600"
                  >
                    <div className="flex justify-between items-center">
                      {/* Title */}
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: apt.color }}
                        />
                        {apt.title}
                      </h3>

                      {/* Time */}
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <ClockIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        {apt.slot_time}
                        {apt.endTime &&`- ${apt.endTime}`}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mt-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          {
                            confirmed:
                              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                            waiting:
                              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
                            cancelled:
                              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                            completed:
                              "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                          }[apt.status]
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    {/* View Details Button */}
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => { setSelectedAppointment(apt); detailOpen()}}
                        data-testid="btn-view-details"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={close}
                data-testid="btn-close-appointments-modal"
                className="rounded-lg bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default DailyAppointmentModal;
