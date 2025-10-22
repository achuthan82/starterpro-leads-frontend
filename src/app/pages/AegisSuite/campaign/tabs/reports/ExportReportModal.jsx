import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import {
  DocumentIcon,
  ClipboardDocumentListIcon,
  ClipboardIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

export default function ExportReportModal({ isOpen, close }) {
  const [format, setFormat] = useState("pdf");
  const [include, setInclude] = useState({
    summary: true,
    details: true,
    charts: false,
  });

  const toggleInclude = (key) =>
    setInclude({ ...include, [key]: !include[key] });

  const handleExport = (e) => {
    e.preventDefault();
    console.log("Export as:", format, "Include:", include);
    close();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
        onClose={close}
      >        {/* dark backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        {/* modal panel */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl px-6 py-8 text-left transition-all">
             <DialogTitle as="h3" className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                Export Report
                <button className="text-gray-400 hover:text-gray-600 p-2 ml-2" onClick={close}>
                <XMarkIcon className="w-6 h-6"/>
                </button>
            </DialogTitle>

            {/* Export Format */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Export Format</p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className={`flex items-center gap-3 px-4 py-3 border rounded-lg font-medium transition ${
                    format === "pdf"
                      ? "border-[#0a2463] bg-[#0a2463]/10"
                      : "border-gray-300 bg-white"
                  }`}
                  onClick={() => setFormat("pdf")}
                >
                  <DocumentIcon className="w-6 h-6 text-red-500" />
                  PDF Report
                </button>

                <button
                  type="button"
                  className={`flex items-center gap-3 px-4 py-3 border rounded-lg font-medium transition ${
                    format === "excel"
                      ? "border-[#0a2463] bg-[#0a2463]/10"
                      : "border-gray-300 bg-white"
                  }`}
                  onClick={() => setFormat("excel")}
                >
                  <ClipboardDocumentListIcon className="w-6 h-6 text-green-500" />
                  Excel Spreadsheet
                </button>

                <button
                  type="button"
                  className={`flex items-center gap-3 px-4 py-3 border rounded-lg font-medium transition ${
                    format === "csv"
                      ? "border-[#0a2463] bg-[#0a2463]/10"
                      : "border-gray-300 bg-white"
                  }`}
                  onClick={() => setFormat("csv")}
                >
                  <ClipboardIcon className="w-6 h-6 text-blue-500" />
                  CSV File
                </button>
              </div>
            </div>

            {/* Include Data */}
            <div className="mb-8">
              <p className="text-sm font-medium mb-2">Include Data</p>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={include.summary}
                  onChange={() => toggleInclude("summary")}
                  className="w-4 h-4 rounded accent-[#0a2463]"
                />
                <span className="text-gray-700 text-sm">
                  Summary Statistics
                </span>
              </label>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={include.details}
                  onChange={() => toggleInclude("details")}
                  className="w-4 h-4 rounded accent-[#0a2463]"
                />
                <span className="text-gray-700 text-sm">Campaign Details</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={include.charts}
                  onChange={() => toggleInclude("charts")}
                  className="w-4 h-4 rounded accent-[#0a2463]"
                />
                <span className="text-gray-700 text-sm">Charts & Graphs</span>
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
                onClick={handleExport}
                className="bg-[#0a2463] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1e40af]"
              >
                Export
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
