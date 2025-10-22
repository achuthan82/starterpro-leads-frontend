import { useState, useRef, Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import ReactSimpleWysiwyg from "react-simple-wysiwyg";

const templateTypeOptions = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" }
];
const categoryOptions = [
  { value: "welcome", label: "Welcome" },
  { value: "followup", label: "Follow-up" },
  { value: "promotional", label: "Promotional" },
  { value: "reminder", label: "Reminder" },
];
const variableList = [
  "{FirstName}",
  "{LastName}",
  "{Email}",
  "{Phone}",
  "{Company}",
  "{Territory}",
];

const CreateMessageTemplateModal = ({ isOpen, close }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState(templateTypeOptions[0]);
  const [category, setCategory] = useState(categoryOptions[0]);
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const wysiwygRef = useRef();

  // Insert variable at cursor in html
  const insertVariable = variable => {
    const textarea = wysiwygRef.current?.textarea;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = messageContent.substring(0, start);
      const after = messageContent.substring(end);
      setMessageContent(before + variable + after);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + variable.length;
      }, 0);
    }
  };

  const handlePreview = e => {
    e.preventDefault();
    if (!name.trim() || !stripHtml(messageContent).trim()) {
      window.alert("Please fill in template name and content");
      return;
    }
    setShowPreview(true);
  };

  const handleSave = e => {
    e.preventDefault();
    if (!name.trim() || !stripHtml(messageContent).trim()) {
      window.alert("Please fill in template name and content");
      return;
    }
    // Save action...
    close();
  };

  // Removes html tags for char count
  function stripHtml(html = "") {
    return html.replace(/<[^>]+>/g, "");
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" onClose={close}>
          {/* Overlay */}
          <TransitionChild as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-black/40" />
          </TransitionChild>
          {/* Modal */}
          <TransitionChild as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100" leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-3xl rounded-2xl bg-white shadow-xl px-8 py-6 z-50 relative">
              <DialogTitle className="text-2xl font-bold text-gray-800 mb-7 flex justify-between">
                Create Message Template
                <button onClick={close} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
              </DialogTitle>
              <form onSubmit={handleSave} className="flex gap-6">
                {/* Left Side */}
                <div className="flex-1 min-w-[250px]">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Template Name</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g., Welcome Email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Template Type</label>
                    <select
                      value={type.value}
                      onChange={e => setType(templateTypeOptions.find(t => t.value === e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {templateTypeOptions.map(opt => (
                        <option value={opt.value} key={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={category.value}
                      onChange={e => setCategory(categoryOptions.find(t => t.value === e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {categoryOptions.map(opt => (
                        <option value={opt.value} key={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Subject Line</label>
                    <input
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Enter email subject"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Preview Text</label>
                    <input
                      value={previewText}
                      onChange={e => setPreviewText(e.target.value)}
                      placeholder="Preview text shown in inbox"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <span className="block text-sm font-medium mb-1">Available Variables</span>
                    <div className="flex flex-wrap gap-2">
                      {variableList.map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => insertVariable(v)}
                          className="bg-[#e7f0f6] text-[#0a2463] px-3 py-1 rounded-full text-sm font-semibold hover:bg-[#d8e6f0]"
                          style={{ cursor: "pointer" }}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Right Side: React Simple WYSIWYG */}
                <div className="flex-1 flex flex-col gap-2">
                  <label className="block text-sm font-medium mb-1">Message Content</label>
                  <div className="bg-white border border-gray-300 rounded-xl mb-2 overflow-hidden">
                    <ReactSimpleWysiwyg
                      ref={wysiwygRef}
                      value={messageContent}
                      onChange={setMessageContent}
                      placeholder="Write your message here..."
                      style={{
                        minHeight: 180,
                        fontFamily: "inherit",
                        fontSize: 16,
                        border: "none",
                        borderRadius: "0 0 0.75rem 0.75rem",
                        boxShadow: "none",
                        background: "white"
                      }}
                      toolbar={[
                        'bold', 'italic', 'underline', 'link', 'image',
                        'ul', 'ol', 'left', 'center', 'right'
                      ]}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      Character Count<br />
                      <span className="font-bold text-gray-700">{stripHtml(messageContent).length} characters</span>
                    </span>
                  </div>
                </div>
              </form>
              {/* Bottom actions */}
              <div className="flex justify-between items-center mt-7">
                <button
                  type="button"
                  className="inline-flex items-center bg-[#0a2463] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1e40af]"
                  onClick={handlePreview}
                >
                  <svg viewBox="0 0 20 20" className="w-5 h-5 mr-2"><circle cx="10" cy="10" r="7" stroke="#fff" strokeWidth="2" fill="none"/><path d="M12 10l-3 2V8l3 2z" fill="#fff" /></svg>
                  Preview
                </button>
                <div className="flex gap-2">
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
                    onClick={handleSave}
                  >
                    Save Template
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
      {/* Preview Modal */}
      <Transition appear show={showPreview} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-[101] flex items-center justify-center px-4 py-10" onClose={() => setShowPreview(false)}>
          <TransitionChild as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="absolute inset-0 bg-black/40"/>
          </TransitionChild>
          <TransitionChild as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100" leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <DialogPanel className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8 relative">
              <DialogTitle className="text-xl font-bold mb-5 flex justify-between">
                Email Preview
                <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6"/></button>
              </DialogTitle>
              <div className="mb-2"><span className="font-semibold">Template Name:</span> {name}</div>
              <div className="mb-2"><span className="font-semibold">Subject:</span> {subject}</div>
              <div className="mb-3"><span className="font-semibold">Preview Text:</span> {previewText}</div>
              <div className="border p-4 bg-gray-50 rounded">
                <div className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: messageContent }}></div>
              </div>
              <div className="text-right mt-6">
                <button
                  className="bg-[#0a2463] text-white px-4 py-2 rounded hover:bg-[#1e40af]"
                  onClick={() => setShowPreview(false)}
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
};

export default CreateMessageTemplateModal;
