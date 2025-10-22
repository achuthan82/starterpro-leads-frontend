import { useState } from 'react';
import {
  PlusIcon,
  FolderArrowDownIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
  StarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/solid';
import ImportContactsModal from "./ImportContactsModal";
import CreateContactListModal from './CreateContactListModal';

const contactLists = [
  {
    id: 1,
    name: "Active Leads - Florida",
    description: "All active leads in Florida territory",
    total: 486,
    emailCount: 423,
    smsCount: 387,
    tags: ["Florida", "Active"],
    iconBg: "bg-blue-100",
    icon: (
      <UserGroupIcon className="w-6 h-6" color='blue'/>
    ),
  },
  {
    id: 2,
    name: "VIP Clients",
    description: "High value policy holders",
    total: 142,
    emailCount: 142,
    smsCount: 98,
    tags: ["VIP", "Premium"],
    iconBg: "bg-green-100",
    icon: (
        <StarIcon className="w-6 h-6"  color='green'/>
    ),
  },
  {
    id: 3,
    name: "Appointment Scheduled",
    description: "Leads with upcoming appointments",
    total: 67,
    emailCount: 67,
    smsCount: 65,
    tags: ["Appointments", "Follow-up"],
    iconBg: "bg-purple-100",
    icon: (
        <CalendarDaysIcon className="w-6 h-6"  color='purple'/>
    ),
  }
];

const ContactLists = () => {
  const [importModal, setImportModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);

  return (
    <div className="px-8 py-6">
      {/* Header and buttons */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[var(--color-atoll)]">Contact Lists</h3>
        <div className="flex gap-2">
          <button
            className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium flex items-center space-x-1"
            onClick={() => setImportModal(true)}
          > 
            <FolderArrowDownIcon className="w-5 h-5"/>
            <span>Import Contacts</span>
          </button>
          <button
            className="bg-[var(--color-atoll)] px-4 py-2 rounded-lg text-white hover:bg-[var(--color-atoll)]/90 font-medium flex items-center space-x-1"
            onClick={() => setCreateModal(true)}
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create List</span>
          </button>
        </div>
      </div>

      {/* Card grid: 3 columns and 1 create new card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactLists.map(list => (
          <div
            key={list.id}
            className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-3 border border-gray-100"
          >
            {/* Card header: icon + edit/delete */}
            <div className="flex items-center justify-between mb-2">
              <div className={`rounded-lg ${list.iconBg} p-2`}>
                {list.icon}
              </div>
              <div className="flex gap-2">
                <button className="text-gray-400 hover:text-blue-500" title="Edit">
                  <PencilSquareIcon className="w-5 h-5"/>
                </button>
                <button className="text-gray-400 hover:text-red-500" title="Delete">
                  <TrashIcon className="w-5 h-5"/>
                </button>
              </div>
            </div>
            {/* Card name and description */}
            <div className="mb-2">
              <div className="text-[17px] font-semibold text-gray-900">{list.name}</div>
              <div className="text-sm text-gray-500">{list.description}</div>
            </div>
            {/* Divider */}
            <div className="border-t border-gray-200"></div>
            {/* Stats */}
            <div className="flex items-center justify-between mt-4 mb-2">
              <div className="text-2xl font-bold text-[#0a2463]">{list.total}</div>
              <div className="text-sm text-gray-500 font-medium">Contacts</div>
            </div>
            <div className="flex flex-col gap-1 mb-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Email Subscribers</span>
                <span className="font-bold text-[#0a2463]">{list.emailCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">SMS Subscribers</span>
                <span className="font-bold text-[#0a2463]">{list.smsCount}</span>
              </div>
            </div>
            {/* Tags */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {list.tags.map(tag => (
                <span key={tag} className="bg-[#e9f1f6] text-[#0a2463] px-3 py-1 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* "Create New List" Card */}
        <button
          className="border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-6 gap-2 min-h-[300px] rounded-xl cursor-pointer"
          onClick={() => setCreateModal(true)}
        >
          <div className="rounded-full bg-gray-200 p-4 mb-1">
            <span className=""><PlusIcon className="w-6 h-6"/></span>
          </div>
          <span className="text-md font-semibold text-gray-900 mt-2">Create New List</span>
          <span className="text-sm text-gray-500">Organize your contacts</span>
        </button>
      </div>

      {/* Import Contacts Modal */}
      <ImportContactsModal
        isOpen={importModal}
        close={() => setImportModal(false)}
      />

      {/* Create List Modal */}
     <CreateContactListModal
        isOpen={createModal}
        close={() => setCreateModal(false)}
      />
    </div>
  );
};

export default ContactLists;
