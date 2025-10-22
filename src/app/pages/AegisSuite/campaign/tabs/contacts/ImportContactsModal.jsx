import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle
} from "@headlessui/react";
import { 
  DocumentIcon,
  ClipboardDocumentListIcon,
  ClipboardIcon, 
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Select from "react-select";

// Sample list options
const listOptions = [
  { value: 'create', label: 'Create New List' },
  { value: 'fl-leads', label: 'Active Leads - Florida' },
  { value: 'ny-leads', label: 'Active Leads - New York' },
];

const modalStyles = "fixed inset-0 z-50 flex items-center justify-center px-4 py-6";
const panelStyles = "relative w-full max-w-xl rounded-2xl bg-white shadow-xl px-6 py-8 text-left";

const ImportContactsModal = ({ isOpen, close }) => {
  const [method, setMethod] = useState('csv');
  const [selectedList, setSelectedList] = useState(listOptions[0]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [optIn, setOptIn] = useState(true);
  const [file, setFile] = useState(null);
  const [pastedContacts, setPastedContacts] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handlePasteChange = (e) => {
    setPastedContacts(e.target.value);
  };

  const handleImport = (e) => {
    e.preventDefault();
    // ...implement validation and API call
    close();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className={modalStyles} onClose={close}>
        <TransitionChild as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>
        </TransitionChild>
        <TransitionChild as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100" leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
          <DialogPanel className={panelStyles}>
            <DialogTitle as="h3" className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-between">
              Import Contacts
              <button className="text-gray-400 hover:text-gray-600 p-2 ml-2" onClick={close}>
                <XMarkIcon className="w-6 h-6"/>
              </button>
            </DialogTitle>
            
            {/* Import Method Tabs */}
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                className={`flex-1 px-4 py-3 border rounded-lg flex flex-col items-center gap-2 font-medium transition
                  ${method === 'csv' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
                onClick={() => setMethod('csv')}
              >
                <DocumentIcon className="w-7 h-7 text-blue-400" />
                <span>CSV File</span>
              </button>
              <button
                type="button"
                className={`flex-1 px-4 py-3 border rounded-lg flex flex-col items-center gap-2 font-medium transition
                  ${method === 'excel' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
                onClick={() => setMethod('excel')}
              >
                <ClipboardDocumentListIcon className="w-7 h-7 text-gray-500" />
                <span>Excel File</span>
              </button>
              <button
                type="button"
                className={`flex-1 px-4 py-3 border rounded-lg flex flex-col items-center gap-2 font-medium transition
                  ${method === 'paste' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
                onClick={() => setMethod('paste')}
              >
                <ClipboardIcon className="w-7 h-7 text-gray-500" />
                <span>Copy/Paste</span>
              </button>
            </div>

            {/* Upload/Paste Area */}
            <form onSubmit={handleImport}>
              {method === 'csv' || method === 'excel' ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Upload File</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg py-8 px-3 flex flex-col items-center justify-center bg-gray-50">
                    <input
                      type="file"
                      accept={method === 'csv' ? ".csv" : ".xls,.xlsx"}
                      className="hidden"
                      id="contacts-file-input"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="contacts-file-input" className="cursor-pointer flex flex-col items-center w-full h-full">
                      <DocumentIcon className="w-12 h-12 text-gray-300 mb-2" />
                      <span className="text-gray-500 text-base mb-2">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-gray-400">CSV or Excel files (max 10MB)</span>
                      {file && <span className="mt-3 text-gray-700 font-medium">{file.name}</span>}
                    </label>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Paste Contact Data</label>
                  <textarea
                    rows={5}
                    value={pastedContacts}
                    onChange={handlePasteChange}
                    placeholder="Paste your contact data here (Name, Email, Phone - one per line)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              )}

              {/* Add to List */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Add to List</label>
                <Select
                  options={listOptions}
                  value={selectedList}
                  onChange={setSelectedList}
                  className="w-full"
                />
              </div>

              {/* Checkboxes */}
              <div className="mb-8">
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={() => setSkipDuplicates(!skipDuplicates)}
                    className="w-4 h-4 rounded accent-blue-500"
                  />
                  <span className="text-gray-700 text-sm">Skip duplicate contacts</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={optIn}
                    onChange={() => setOptIn(!optIn)}
                    className="w-4 h-4 rounded accent-blue-500"
                  />
                  <span className="text-gray-700 text-sm">All contacts have opted in for marketing</span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="border border-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-100"
                  onClick={close}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[var(--color-atoll)] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  Import Contacts
                </button>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default ImportContactsModal;
