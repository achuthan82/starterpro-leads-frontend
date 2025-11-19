import { useState, useEffect } from 'react';
import { UserIcon, CpuChipIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import SharedSidebar from '../AegisSuite/components/SharedSidebar';
import LeadList from './LeadList';
import LeadInfo from './LeadInfo';
import CallControls from './CallControls';
import ScriptTranscript from './ScriptTranscript';
import OutboundNumberModal from './OutboundNumberModal';
import ScheduleAppointmentModal from './ScheduleAppointmentModal';
import { STATUS_NAME_TO_ID } from 'constants/app.constant';
import { useCallContext } from 'app/contexts/call/context';

const PowerDialer = () => {
  // Get call state and functions from context
  const {
    callStatus,
    isCallActive,
    isDialing,
    isCallEnded,
    callDuration,
    selectedLead: contextSelectedLead,
    selectedOutboundNumber: contextSelectedOutboundNumber,
    transcript,
    callHistory,
    callLogs,
    callLogsLoading,
    setSelectedLead,
    setSelectedOutboundNumber,
    makeCall,
    hangupCall,
    setCallMute,
    getCurrentCall,
    showScheduleModal,
    setShowScheduleModal,
    licenseDetails,
    licenseError,
    licenseLoading
  } = useCallContext();

  // Local state for PowerDialer-specific UI
  const [searchTerm, setSearchTerm] = useState('');
  const [callingMode, setCallingMode] = useState('Human Agent');
  const [selectedScript, setSelectedScript] = useState('Opening');
  const [activeTabs, setActiveTabs] = useState(['script']);
  const [showOutboundModal, setShowOutboundModal] = useState(false);
  const [outboundModalShown, setOutboundModalShown] = useState(false);
  const [previousCallEnded, setPreviousCallEnded] = useState(false);

  // Use context selectedLead as local selectedLead
  const selectedLead = contextSelectedLead;
  const selectedOutboundNumber = contextSelectedOutboundNumber;

  const handleTabToggle = (tab) => {
    // Set the active tab directly (single tab selection)
    setActiveTabs([tab]);
  };

  // Auto-switch to transcript tab when call logs are loaded after call ends
  useEffect(() => {
    // Track when call ends
    if (isCallEnded && !previousCallEnded) {
      setPreviousCallEnded(true);
    }

    // When call has ended and call logs are loaded (not loading and has data)
    if (isCallEnded && previousCallEnded && !callLogsLoading && callLogs.length > 0) {
      // Switch to transcript tab
      if (activeTabs[0] !== 'transcript') {
        setActiveTabs(['transcript']);
      }
      setPreviousCallEnded(false); // Reset for next call
    }

    // Reset when call starts again
    if (isCallActive || isDialing) {
      setPreviousCallEnded(false);
    }
  }, [isCallEnded, callLogsLoading, callLogs, isCallActive, isDialing, previousCallEnded, activeTabs]);

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    // Remove +1 and format
    const cleaned = phone.replace(/^\+1/, '').replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Handle making call with modal check
  const handleMakeCall = async () => {
    // Verify outbound number is selected and has a valid phone number
    if (!selectedOutboundNumber || !selectedOutboundNumber.phone || !selectedOutboundNumber.phone.trim()) {
      setShowOutboundModal(true);
      return;
    }
    await makeCall();
  };

  const updateLeadStatus = (leadId, newStatus) => {
    // Status update is now handled directly in LeadInfo component via API
    // This function is kept for compatibility but status updates are done in LeadInfo
    // If needed, we can refresh the selected lead here
    if (selectedLead && selectedLead.id === leadId) {
      // Update the selected lead's status locally
      setSelectedLead({
        ...selectedLead,
        status: newStatus,
        originalData: {
          ...selectedLead.originalData,
          lead_status: typeof newStatus === 'number' ? newStatus : STATUS_NAME_TO_ID[newStatus?.toUpperCase()] || selectedLead.originalData?.lead_status
        }
      });
    }
  };

  // Handle outbound number selection
  const handleSelectOutboundNumber = (number) => {
    setSelectedOutboundNumber(number);
    setShowOutboundModal(false);
  };

  // Update context when local lead selection changes
  const handleSelectLead = (lead) => {
    console.log('lead', lead)
    setSelectedLead(lead);
  };

  // Show outbound number modal once on page load if no number is selected
  useEffect(() => {
    if (!selectedOutboundNumber && !outboundModalShown) {
      setShowOutboundModal(true);
      setOutboundModalShown(true);
    }
  }, [selectedOutboundNumber, outboundModalShown]);

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      <SharedSidebar currentPath="/power-dialer" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">Power Dialer</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Advanced calling system with AI assistance</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Calling Mode:</span>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setCallingMode('Human Agent')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${
                    callingMode === 'Human Agent'
                      ? 'bg-white dark:bg-gray-600 text-[var(--color-atoll)] dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <UserIcon className="w-4 h-4 mr-1"/> Human Agent
                </button>
                <button
                  onClick={() => setCallingMode('AI Agent')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${
                    callingMode === 'AI Agent'
                      ? 'bg-white dark:bg-gray-600 text-[var(--color-atoll)] dark:text-gray-100 shadow-sm '
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <CpuChipIcon className="w-4 h-4 mr-1"/> AI Agent
                </button>
              </div>
            </div>
          </div>
          
          {/* Calling from Number Section */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Calling from:</span>
              {selectedOutboundNumber ? (
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-gray-900 dark:text-white">
                    {formatPhoneNumber(selectedOutboundNumber.phone)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">→</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedOutboundNumber.friendly_name || 'Outbound Number'}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-400 dark:text-gray-500 italic">No number selected</span>
              )}
            </div>
            <button
              onClick={() => setShowOutboundModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Change Number
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left Column - Leads List */}
            <div className="col-span-4">
              <LeadList
                selectedLead={selectedLead}
                onSelectLead={handleSelectLead}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>

            {/* Middle Column - Call Controls and Lead Info */}
            <div className="col-span-4 flex flex-col space-y-6">
              {/* Call Controls */}
              <CallControls
                isCallActive={isCallActive}
                isDialing={isDialing}
                isCallEnded={isCallEnded}
                onMakeCall={handleMakeCall}
                onHangupCall={hangupCall}
                selectedLead={selectedLead}
                callDuration={callDuration}
                onMuteToggle={setCallMute}
                currentCall={getCurrentCall()}
                selectedOutboundNumber={selectedOutboundNumber}
                onScheduleAppointment={() => setShowScheduleModal(true)}
                licenseDetails={licenseDetails}
                licenseError={licenseError}
                licenseLoading={licenseLoading}
              />

              {/* Lead Information */}
              <LeadInfo
                lead={selectedLead}
                onUpdateStatus={updateLeadStatus}
                callStatus={callStatus}
                isDialing={isDialing}
                isCallActive={isCallActive}
                callDuration={callDuration}
                callHistory={callHistory}
                callLogs={callLogs}
                callLogsLoading={callLogsLoading}
              />
            </div>

            {/* Right Column - Script and Transcript */}
            <div className="col-span-4">
              <ScriptTranscript
                activeTabs={activeTabs}
                onTabToggle={handleTabToggle}
                selectedScript={selectedScript}
                onScriptChange={setSelectedScript}
                lead={selectedLead}
                transcript={transcript}
                isCallActive={isCallActive}
                callLogs={callLogs}
                callLogsLoading={callLogsLoading}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Outbound Number Selection Modal */}
      <OutboundNumberModal
        isOpen={showOutboundModal}
        onClose={() => setShowOutboundModal(false)}
        selectedLead={selectedLead}
        onSelectNumber={handleSelectOutboundNumber}
      />

      {/* Schedule Appointment Modal */}
      <ScheduleAppointmentModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        selectedLead={selectedLead}
      />
    </div>
  );
};

export default PowerDialer;