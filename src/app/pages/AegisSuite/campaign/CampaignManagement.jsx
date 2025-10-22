import { useState } from 'react';
import {
  PlusIcon,
  UserGroupIcon,
  DocumentDuplicateIcon,
  PaperAirplaneIcon,
  CalendarIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import SharedSidebar from '../components/SharedSidebar';
import Overview from './tabs/overview/Overview';
import CampaignModal from './tabs/campaign/CampaignModal';
import ContactLists from './tabs/contacts/ContactLists'; 
import Templates from './tabs/templates/Templates';
import Scheduler from './tabs/scheduler/Scheduler';
import Campaigns from './tabs/campaign/ActiveCampaigns';
import CampaignReports from './tabs/reports/CampaignReports';
import MarketingCalendar from './tabs/calender/MarketingCalendar'

const tabs = [
  { name: 'Overview', icon: ChartBarIcon },
  { name: 'Contact Lists', icon: UserGroupIcon },
  { name: 'Templates', icon: DocumentDuplicateIcon },
  { name: 'Campaigns', icon: PaperAirplaneIcon },
  { name: 'Scheduler', icon: ClipboardDocumentListIcon },
  { name: 'Reports', icon: ChartBarIcon },
  { name: 'Calendar', icon: CalendarIcon },
];

const CampaignManagement = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  const renderTab = () => {
    switch (activeTab) {
      case 'Overview':
        return <Overview />;
      case 'Contact Lists':
        return <ContactLists />;
      case 'Templates':
        return <Templates />;
      case 'Campaigns':
        return <Campaigns showCampaignModal={showCampaignModal} setShowCampaignModal={setShowCampaignModal}/>;
      case 'Scheduler':
        return <Scheduler/>;
      case 'Reports':
        return <CampaignReports/>;
      case 'Calendar':
        return <MarketingCalendar/>;
      default:
        return <div className="p-6">Coming soon...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)]">
      <SharedSidebar currentPath="/campaign" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-atoll)]">Campaign Management Center</h1>
              <p className="text-gray-600 mt-1">
                Create and manage SMS &amp; Email marketing campaigns
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCampaignModal(true)}
                className="bg-[#f4d03f] text-white px-4 py-2 rounded-lg hover:bg-[#e6c035] transition-colors flex items-center space-x-1"
              >
                <PlusIcon className="w-4 h-4" />
                <span>New Campaign</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6">
          <nav className="flex space-x-2 overflow-x-auto py-3">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors
                  ${
                    activeTab === tab.name
                      ? 'bg-[var(--color-atoll)] text-white border-[var(--color-atoll)]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{renderTab()}</main>
      </div>
      {/* Modal */}
      <CampaignModal
        isOpen={showCampaignModal}
        close={() => setShowCampaignModal(false)}
      />
    </div>
  );
};

export default CampaignManagement;
