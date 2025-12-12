import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDownIcon, WalletIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import SharedSidebar from '../AegisSuite/components/SharedSidebar';
import LeadList from './LeadList';
import LeadInfo from './LeadInfo';
import CallControls from './CallControls';
import ScriptTranscript from './ScriptTranscript';
import OutboundNumberModal from './OutboundNumberModal';
import ScheduleAppointmentModal from './ScheduleAppointmentModal';
import RechargeModal from './RechargeModal';
import PurchaseNumberModal from './PurchaseNumberModal';
import { STATUS_NAME_TO_ID } from 'constants/app.constant';
import { useCallContext } from 'app/contexts/call/context';
import dialerService from 'utils/dialerService';
import { toast } from 'sonner';
import SmsDrawer from "../AegisSuite/sms/SmsDrawer"; 
import SmsConversationContent from "../AegisSuite/sms/SmsConversation";

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
  // const [callingMode, setCallingMode] = useState('Human Agent');
  const [selectedScript, setSelectedScript] = useState('Opening');
  const [activeTabs, setActiveTabs] = useState(['script']);
  const [showOutboundModal, setShowOutboundModal] = useState(false);
  const [outboundModalShown, setOutboundModalShown] = useState(false);
  const [previousCallEnded, setPreviousCallEnded] = useState(false);
  const [hasSwitchedToTranscript, setHasSwitchedToTranscript] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSmsDrawer, setShowSmsDrawer] = useState(false);
  const [drawerLead, setDrawerLead] = useState(null);

  // Wallet balance state
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const pollingIntervalRef = useRef(null);

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
      setHasSwitchedToTranscript(false); // Reset flag when new call ends
    }

    // Reset when call starts again
    if (isCallActive || isDialing) {
      setPreviousCallEnded(false);
      setHasSwitchedToTranscript(false);
      return;
    }

    // When call has ended and call logs are loaded (not loading and has data)
    // Only switch once per call end
    // Check if call ended, logs finished loading, and we have logs
    if (isCallEnded && !callLogsLoading && callLogs.length > 0 && !hasSwitchedToTranscript) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        setActiveTabs(['transcript']);
        setHasSwitchedToTranscript(true);
        console.log('Auto-switched to transcript tab after call ended');
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isCallEnded, callLogsLoading, callLogs.length, isCallActive, isDialing, previousCallEnded, hasSwitchedToTranscript]);

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
  const handleMakeCall = async (phoneNumber = null) => {
    // Verify outbound number is selected and has a valid phone number
    if (!selectedOutboundNumber || !selectedOutboundNumber.phone || !selectedOutboundNumber.phone.trim()) {
      setShowOutboundModal(true);
      return;
    }
    // Pass the phone number parameter to makeCall
    await makeCall(phoneNumber);
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
    // If we're selecting a lead that's already selected and has been updated,
    // merge the updated status from context
    if (contextSelectedLead && lead) {
      const leadMortgageId = lead.originalData?.mortgage_id || lead.mortgage_id;
      const contextMortgageId = contextSelectedLead.originalData?.mortgage_id || contextSelectedLead.mortgage_id;
      
      if (leadMortgageId === contextMortgageId) {
        // Same lead - use the updated version from context
        setSelectedLead(contextSelectedLead);
        return;
      }
    }
    setSelectedLead(lead);
  };

  // Show outbound number modal once on page load if no number is selected
  useEffect(() => {
    if (!selectedOutboundNumber && !outboundModalShown) {
      setShowOutboundModal(true);
      setOutboundModalShown(true);
    }
  }, [selectedOutboundNumber, outboundModalShown]);

  // Fetch wallet balance
  const fetchWalletBalance = useCallback(async (showToast = false) => {
    try {
      setWalletLoading(true);
      const response = await dialerService.getWalletBalance();
      // API response structure: { data: { wallet_amount: 104.0 }, message: "success", status: 200 }
      const balance = response?.data?.wallet_amount || 0;
      setWalletBalance(balance);
      if (showToast) {
        toast.success('Wallet balance updated');
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      if (showToast) {
        toast.error('Failed to fetch wallet balance');
      }
    } finally {
      setWalletLoading(false);
    }
  }, []);

  // Initial fetch and setup polling for wallet balance
  useEffect(() => {
    // Fetch immediately on mount
    fetchWalletBalance();

    // Set up polling every 10 minutes (600000 milliseconds)
    pollingIntervalRef.current = setInterval(() => {
      fetchWalletBalance();
    }, 600000); // 10 minutes

    // Cleanup interval on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchWalletBalance]);

  // Handle manual refresh
  const handleRefreshBalance = () => {
    fetchWalletBalance(true);
  };

  // Handle recharge - open modal
  const handleRecharge = () => {
    setShowRechargeModal(true);
  };

  // Handle purchase number success - refresh outbound numbers
  const handlePurchaseSuccess = () => {
    // Refresh outbound numbers by closing and reopening the modal if it's open
    // Or trigger a refresh in the context if available
    setShowPurchaseModal(false);
    // Optionally refresh the selected outbound number
    if (showOutboundModal) {
      setShowOutboundModal(false);
      setTimeout(() => setShowOutboundModal(true), 100);
    }
  };

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
              {/* Wallet Balance Section */}
              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-600">
                <WalletIcon className="w-5 h-5 text-[var(--color-atoll)] dark:text-blue-400" />
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Balance:</span>
                  {walletLoading ? (
                    <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                  ) : (
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      ${walletBalance !== null ? parseFloat(walletBalance).toFixed(2) : '0.00'}
                    </span>
                  )}
                  <div className="relative group">
                    <InformationCircleIcon 
                      className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-help transition-colors" 
                      title="It may take 2 to 3 minutes to update the balance after recharge or call ends"
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
                      It may take 2 to 3 minutes to update the balance after recharge or call ends
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleRefreshBalance}
                  disabled={walletLoading}
                  className="ml-2 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh balance"
                >
                  <ArrowPathIcon className={`w-4 h-4 text-gray-600 dark:text-gray-300 ${walletLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleRecharge}
                  className="ml-2 px-3 py-1.5 text-xs font-medium bg-[var(--color-atoll)] text-white rounded-md hover:bg-[var(--color-atoll)]/90 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                >
                  Recharge
                </button>
              </div>

              {/* <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Calling Mode:</span>
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
              </div> */}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOutboundModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Change Number
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[var(--color-atoll)] dark:bg-blue-600 text-white rounded-md hover:bg-[var(--color-atoll)]/90 dark:hover:bg-blue-700 transition-colors"
              >
                Purchase Number
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto  p-6">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left Column - Leads List */}
    
            <div className="col-span-4">
              <LeadList
                selectedLead={selectedLead}
                onSelectLead={handleSelectLead}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onOpenSmsDrawer={(lead) => {
                  setDrawerLead({
                    mortgageId: lead.originalData?.mortgage_id,
                    leadMemberId: lead.originalData?.lead_member_id,
                    leadData: lead,
                  });
                  setShowSmsDrawer(true);
                }}
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
                walletBalance={walletBalance}
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
            <div className="fixed right-10 top-48.5 w-1/4 h-screen  overflow-auto  h-[calc(100vh-12rem)]">
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
        onPurchaseNumber={() => setShowPurchaseModal(true)}
      />

      {/* Schedule Appointment Modal */}
      <ScheduleAppointmentModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        selectedLead={selectedLead}
      />

      {/* Recharge Modal */}
      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
      />

      {/* Purchase Number Modal */}
      <PurchaseNumberModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchaseSuccess={handlePurchaseSuccess}
        walletBalance={walletBalance}
        onRecharge={handleRecharge}
      />

      <SmsDrawer
        isOpen={showSmsDrawer}
        onClose={() => setShowSmsDrawer(false)}
        mortgageId={drawerLead?.mortgageId}
        leadMemberId={drawerLead?.leadMemberId}
      >
        {drawerLead && (
          <SmsConversationContent 
            mortgage_id={drawerLead.mortgageId}
            lead_member_id={drawerLead.leadMemberId}
            lead={drawerLead.leadData}
          />
        )}
      </SmsDrawer>
    </div>
  );
};

export default PowerDialer;