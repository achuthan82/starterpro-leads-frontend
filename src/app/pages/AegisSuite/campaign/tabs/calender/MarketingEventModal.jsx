import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle
} from "@headlessui/react";
import { XMarkIcon } from '@heroicons/react/24/solid';

const MarketingEventModal = ({ isOpen, close }) => {
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("Webinar");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [sendInvites, setSendInvites] = useState("none");
  const [sendReminder, setSendReminder] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call API to save event
    close();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
        onClose={close}
      >
        <TransitionChild as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        <TransitionChild as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100" leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
        >
          <DialogPanel
            className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl 
                      text-left flex flex-col max-h-[90vh]"
          >
          <DialogTitle
            as="h3"
            className="text-2xl font-bold text-gray-800 px-6 py-4 border-b mt-3 
                      flex items-center justify-between sticky top-0 bg-white z-10"
          >
            Add Marketing Event
            <button
              className="text-gray-400 hover:text-gray-600 p-2 ml-2"
              onClick={close}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </DialogTitle>

          {/* Scrollable Body */}
          <div className="px-6 py-4 overflow-y-auto flex-1 mb-3 rounded-2xl" >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Event Name</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Insurance Benefits Webinar"
                  required
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium mb-1">Event Type</label>
                <select
                  value={eventType}
                  onChange={e => setEventType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option>Webinar</option>
                  <option>Workshop</option>
                  <option>Conference</option>
                  <option>Meeting</option>
                </select>
              </div>

              {/* Start / End Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-1">Location/Platform</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Zoom, Office Address, etc."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Event details..."
                />
              </div>

              {/* Send Invitations */}
              <div>
                <label className="block text-sm font-medium mb-1">Send Invitations To</label>
                <select
                  value={sendInvites}
                  onChange={e => setSendInvites(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="none">Dont send invitations</option>
                  <option value="all">All Contacts</option>
                  <option value="custom">Custom List</option>
                </select>
              </div>

              {/* Reminder Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={sendReminder}
                  onChange={() => setSendReminder(!sendReminder)}
                  className="mr-2"
                />
                <span className="text-sm">Send reminder 24 hours before event</span>
              </div>

              {/* Buttons */}
               <div className="px-6 py-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  className="border border-gray-400 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100"
                  onClick={close}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="eventForm"
                  className="bg-[var(--color-atoll)] text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default MarketingEventModal;
