import { useState, useEffect, useRef } from 'react';
import { Device } from '@twilio/voice-sdk';
import { UserIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import SharedSidebar from '../AegisSuite/components/SharedSidebar';
import LeadList from './LeadList';
import LeadInfo from './LeadInfo';
import CallControls from './CallControls';
import ScriptTranscript from './ScriptTranscript';

const PowerDialer = () => {
  // State for leads and selection
  const [leads, setLeads] = useState([
    {
      id: 1,
      name: 'Michael Johnson',
      phone: '+91 9567614372',
      territory: 'FL-33101',
      status: 'First Call',
      lastContact: '2025-10-29',
      age: 45,
      homeValue: 450000,
      mortgage: 320000,
      notes: 'Interested in mortgage protection',
      initials: 'MJ'
    },
    {
      id: 2,
      name: 'Sarah Davis',
      phone: '(555) 234-5678',
      territory: 'CA-90210',
      status: 'Second Call',
      lastContact: '2024-01-15',
      age: 38,
      homeValue: 750000,
      mortgage: 520000,
      notes: 'Follow up on insurance options',
      initials: 'SD'
    },
    {
      id: 3,
      name: 'Robert Chen',
      phone: '(555) 345-6789',
      territory: 'TX-75201',
      status: 'Qualified',
      lastContact: '2024-01-14',
      age: 52,
      homeValue: 320000,
      mortgage: 180000,
      notes: 'Ready for closing',
      initials: 'RC'
    }
  ]);

  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [callStatus, setCallStatus] = useState('Ready to Make Calls');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isDialing, setIsDialing] = useState(false);
  const [callingFrom, setCallingFrom] = useState('(305) 123-4567');
  const [callingMode, setCallingMode] = useState('Human Agent');
  const [selectedScript, setSelectedScript] = useState('Opening');
  const [transcript, setTranscript] = useState('Call transcription will appear here when connected');
  const [activeTabs, setActiveTabs] = useState(['script']);
  const [callDuration, setCallDuration] = useState(0);
  const [callHistory, setCallHistory] = useState([
    { date: '2024-01-15', time: '8:42', status: 'interested', duration: '2:30' },
    { date: '2024-01-10', time: '14:15', status: 'callback', duration: '1:45' },
    { date: '2024-01-08', time: '11:20', status: 'not interested', duration: '0:45' }
  ]);

  const handleTabToggle = (tab) => {
  setActiveTabs((prev) =>
    prev.includes(tab)
      ? prev.filter((t) => t !== tab) // turn off if already active
      : [...prev, tab] // turn on if not active
  );
};

  // Refs
  const deviceRef = useRef(null);
  const callRef = useRef(null);
  const callTimerRef = useRef(null);

  // Filter leads based on search
  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm) ||
    lead.territory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initialize Twilio Device
  useEffect(() => {
    initializeTwilio();
    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy();
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  // Auto-call when lead is selected (if you want automatic calling)
  useEffect(() => {
    if (selectedLead && !isCallActive && !isDialing) {
      // Uncomment the line below if you want automatic calling when lead is selected
      // makeCall();
    }
  }, [selectedLead]);

  const initializeTwilio = async () => {
    try {
      setCallStatus('Initializing calling system...');
      
      const response = await fetch('https://call.abacies.com/react/token', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.token) {
        throw new Error('No token in response');
      }
      
      deviceRef.current = new Device(data.token, {
        codecPreferences: ['opus', 'pcmu'],
        debug: true,
      });

      deviceRef.current.on('registered', () => {
        setCallStatus('Ready to Make Calls');
      });

      deviceRef.current.on('error', (error) => {
        console.error('Device error:', error);
        setCallStatus(`Device error: ${error.message}`);
      });

      deviceRef.current.register();

    } catch (error) {
      console.error('Initialization failed:', error);
      setCallStatus(`Initialization failed: ${error.message}`);
    }
  };

  const startCallTimer = () => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const makeCall = async () => {
    if (!deviceRef.current || !selectedLead) {
      setCallStatus('Please select a lead first');
      return;
    }
    
    try {
      setCallStatus('Dialing...');
      setIsDialing(true);
      
      callRef.current = await deviceRef.current.connect({ 
        params: { To: selectedLead.phone.replace(/\D/g, '') } 
      });

      callRef.current.on('accept', () => {
        setCallStatus('Connected');
        setIsCallActive(true);
        setIsDialing(false);
        startCallTimer();
        setTranscript('Call in progress... Live transcription will appear here.');
        
        // Add to call history
        const now = new Date();
        const newCall = {
          date: now.toISOString().split('T')[0],
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          status: 'connected',
          duration: '0:00'
        };
        setCallHistory(prev => [newCall, ...prev]);
      });

      callRef.current.on('disconnect', () => {
        const duration = formatCallDuration(callDuration);
        setCallStatus('Call ended');
        setIsCallActive(false);
        setIsDialing(false);
        stopCallTimer();
        setCallDuration(0);
        setTranscript('Call ended. Transcription will be saved.');
        
        // Update call history with duration
        if (callDuration > 0) {
          setCallHistory(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[0] = { ...updated[0], duration, status: 'completed' };
            }
            return updated;
          });
        }
        
        callRef.current = null;
      });

      callRef.current.on('error', (error) => {
        setCallStatus(`Call error: ${error.message}`);
        setIsCallActive(false);
        setIsDialing(false);
        stopCallTimer();
        callRef.current = null;
      });

    } catch (error) {
      console.error('Call failed:', error);
      setCallStatus(`Call failed: ${error.message}`);
      setIsDialing(false);
    }
  };

  const hangupCall = () => {
    if (callRef.current) {
      callRef.current.disconnect();
    }
    setIsCallActive(false);
    setIsDialing(false);
    stopCallTimer();
    setCallStatus('Call ended');
  };

  const updateLeadStatus = (leadId, newStatus) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));
  };

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      <SharedSidebar currentPath="/power-dialer" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
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
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-12 gap-6 h-full">
            <div className="col-span-4">
              <LeadList
                leads={filteredLeads}
                selectedLead={selectedLead}
                onSelectLead={setSelectedLead}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>

            <div className="col-span-4 flex flex-col space-y-6">
               <CallControls
                callingFrom={callingFrom}
                onCallingFromChange={setCallingFrom}
                isCallActive={isCallActive}
                isDialing={isDialing}
                onMakeCall={makeCall}
                onHangupCall={hangupCall}
                selectedLead={selectedLead}
                callDuration={callDuration}
              />

              <LeadInfo
                lead={selectedLead}
                onUpdateStatus={updateLeadStatus}
                callStatus={callStatus}
                isDialing={isDialing}
                isCallActive={isCallActive}
                callingFrom={callingFrom}
                callDuration={callDuration}
                callHistory={callHistory}
              />
            </div>

            <div className="col-span-4">
              <ScriptTranscript
               activeTabs={activeTabs}
              onTabToggle={handleTabToggle}
              selectedScript={selectedScript}
              onScriptChange={setSelectedScript}
              lead={selectedLead}
              transcript={transcript}
              isCallActive={isCallActive}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PowerDialer;