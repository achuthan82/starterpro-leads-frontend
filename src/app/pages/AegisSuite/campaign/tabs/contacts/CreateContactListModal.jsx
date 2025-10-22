import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle
} from "@headlessui/react";
import Select from "react-select";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/solid";

const listTypeOptions = [
  { value: "static", label: "Static List (Manual)" },
  { value: "dynamic", label: "Dynamic List (Auto-update based on criteria)" }
];

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    borderRadius: "0.5rem",
    borderColor: "#d1d5db",
    minHeight: "2.5rem",
    boxShadow: "none"
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "0.5rem"
  }),
};

const CreateContactListModal = ({ isOpen, close }) => {
  const [listName, setListName] = useState("");
  const [description, setDescription] = useState("");
  const [listType, setListType] = useState(listTypeOptions[0]);
  const [tags, setTags] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [contactNumbers, setContactNumbers] = useState([]);

  const handleAddContact = () => {
    const phone = contactInput.trim();
    if (phone && !contactNumbers.includes(phone)) {
      setContactNumbers([...contactNumbers, phone]);
      setContactInput("");
    }
  };

  const handleRemoveContact = (num) => {
    setContactNumbers(contactNumbers.filter(n => n !== num));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    close();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" onClose={close}>
        <TransitionChild as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>
        <TransitionChild as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95">
          <DialogPanel className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl px-6 py-8 text-left">
            <DialogTitle as="h3" className="text-2xl font-bold text-gray-800 mb-5 flex justify-between items-center">
              Create Contact List
              <button onClick={close} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6"/>
              </button>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                {/* List Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">List Name</label>
                  <input
                    type="text"
                    value={listName}
                    onChange={e => setListName(e.target.value)}
                    placeholder="e.g., California Leads"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe this contact list..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    rows={2}
                  />
                </div>
                {/* List Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">List Type</label>
                  <Select
                    options={listTypeOptions}
                    value={listType}
                    onChange={setListType}
                    styles={customSelectStyles}
                    className="w-full"
                    menuPosition="fixed"
                  />
                </div>
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="e.g., California, Active, Premium"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              {/* Initial Contacts */}
              <div>
                <label className="block text-sm font-medium mb-1">Initial Contacts</label>
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={contactInput}
                    onChange={e => setContactInput(e.target.value)}
                    placeholder="Enter phone number"
                    className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-[15px]"
                    onKeyDown={e => { if(e.key === 'Enter'){ e.preventDefault(); handleAddContact(); } }}
                    style={{ minWidth: '0', borderRight: '0' }}
                  />
                  <button
                    type="button"
                    className="inline-flex items-center justify-center bg-[#0a2463] text-white px-4 py-2 rounded-r-lg hover:bg-[#1e40af] font-semibold text-[15px] transition"
                    style={{ height: '42px', minWidth: '140px' }}
                    onClick={handleAddContact}
                  >
                    <PlusIcon className="w-5 h-5 mr-1" />
                    Add Contacts
                  </button>
                </div>
                <div className="text-sm text-gray-500 mb-2">{contactNumbers.length} contacts selected</div>
                <div className="flex flex-wrap gap-2">
                  {contactNumbers.map(num => (
                    <span key={num} className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                      {num}
                      <button
                        type="button"
                        className="ml-2 text-gray-400 hover:text-red-500"
                        onClick={() => handleRemoveContact(num)}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              </div>
              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-8">
                <button
                  type="button"
                  className="border border-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-100"
                  onClick={close}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0a2463] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1e40af]"
                >
                  Create List
                </button>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default CreateContactListModal;
