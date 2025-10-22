import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle
} from "@headlessui/react";
import {
 EnvelopeIcon,
 ChatBubbleBottomCenterTextIcon,
 XMarkIcon
} from '@heroicons/react/24/solid';
import Select from "react-select";

const contactLists = [
  { value: 'fl-leads', label: 'Active Leads - Florida (486 contacts)' },
  { value: 'ny-leads', label: 'Active Leads - New York (350 contacts)' }
];
const templates = [
  { value: 'welcome', label: 'Welcome New Lead' },
  { value: 'promo', label: 'Promotional Offer' }
];

const CampaignModal = ({ isOpen, close }) => {
  const [campaignName, setCampaignName] = useState('');
  const [type, setType] = useState('email');
  const [contactList, setContactList] = useState(contactLists[0]);
  const [template, setTemplate] = useState(templates[0]);
  const [schedule, setSchedule] = useState('now');
  const [scheduledDate, setScheduledDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call API to create campaign; replace with real call.
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <TransitionChild as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100" leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
        >
          <DialogPanel className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl px-6 py-8 text-left transition-all">
            <DialogTitle as="h3" className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-between">
              Create New Campaign
              <button className="text-gray-400 hover:text-gray-600 p-2 ml-2" onClick={close}>
                <XMarkIcon className="w-6 h-6"/>
              </button>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Campaign Name */}
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="campaignName">
                    Campaign Name
                  </label>
                  <input
                    id="campaignName"
                    type="text"
                    value={campaignName}
                    onChange={e => setCampaignName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    required
                    placeholder="Enter campaign name"
                  />
                </div>
                {/* Campaign Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">Campaign Type</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className={`flex-1 py-4 border rounded-lg flex items-center justify-center gap-2
                          ${type === 'email' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
                      onClick={() => setType('email')}
                    >
                      <span><EnvelopeIcon className="w-5 h-5"/></span>
                      <span className="font-medium">Email Campaign</span>
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-4 border rounded-lg flex items-center justify-center gap-2
                          ${type === 'sms' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
                      onClick={() => setType('sms')}
                    >
                      <span><ChatBubbleBottomCenterTextIcon className="w-5 h-5"/></span>
                      <span className="font-medium">SMS Campaign</span>
                    </button>
                  </div>
                </div>
                {/* Contact List */}
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="contactList">
                    Select Contact List
                  </label>
                  <Select
                    id="contactList"
                    options={contactLists}
                    value={contactList}
                    onChange={setContactList}
                  />
                </div>
                {/* Template */}
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="template">
                    Select Template
                  </label>
                  <Select
                    id="template"
                    options={templates}
                    value={template}
                    onChange={setTemplate}
                  />
                </div>
                {/* Schedule */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Schedule
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className={`flex-1 py-3 border rounded-lg font-medium ${schedule === 'now' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
                      onClick={() => setSchedule('now')}
                    >
                      Send Now
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-3 border rounded-lg font-medium ${schedule === 'later' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
                      onClick={() => setSchedule('later')}
                    >
                      Schedule Later
                    </button>
                  </div>
                  {schedule === 'later' && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium mb-1" htmlFor="scheduleDate">
                        Select Date & Time
                      </label>
                      <input
                        id="scheduleDate"
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={e => setScheduledDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-8">
                <button
                  type="button"
                  className="border border-gray-400 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100"
                  onClick={close}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[var(--color-atoll)] text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default CampaignModal;
