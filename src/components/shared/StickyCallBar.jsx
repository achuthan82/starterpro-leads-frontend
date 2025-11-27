import { useState, useRef, useEffect, useCallback } from 'react';
import { useCallContext } from 'app/contexts/call/context';
import CallControls from 'app/pages/powerDialer/CallControls';
import ScheduleAppointmentModal from 'app/pages/powerDialer/ScheduleAppointmentModal';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import dialerService from 'utils/dialerService';

const StickyCallBar = () => {
  const {
    isCallActive,
    isDialing,
    isCallEnded,
    selectedLead,
    selectedOutboundNumber,
    makeCall,
    hangupCall,
    setCallMute,
    getCurrentCall,
    callDuration,
    showScheduleModal,
    setShowScheduleModal,
    licenseDetails,
    licenseError,
    licenseLoading
  } = useCallContext();

  const [position, setPosition] = useState(() => {
    // Initialize to top right corner (will be adjusted after first render)
    return { x: window.innerWidth - 400, y: 20 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const boxRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Fetch wallet balance
  const fetchWalletBalance = useCallback(async () => {
    try {
      const response = await dialerService.getWalletBalance();
      // API response structure: { data: { wallet_amount: 104.0 }, message: "success", status: 200 }
      const balance = response?.data?.wallet_amount || 0;
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWalletBalance(0);
    }
  }, []);

  // Fetch wallet balance on mount and set up polling
  useEffect(() => {
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

  // Initialize position to top right corner after first render
  useEffect(() => {
    if (boxRef.current && !isInitialized) {
      const rect = boxRef.current.getBoundingClientRect();
      setPosition({
        x: window.innerWidth - rect.width - 20,
        y: 20
      });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Handle mouse down for dragging (only on the drag handle)
  const handleMouseDown = (e) => {
    // Only allow dragging from the header bar
    if (!e.target.closest('.drag-handle')) {
      return;
    }
    
    if (boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
      e.preventDefault();
    }
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Constrain to viewport
        const maxX = window.innerWidth - (boxRef.current?.offsetWidth || 0);
        const maxY = window.innerHeight - (boxRef.current?.offsetHeight || 0);
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Only show when call is active or dialing
  if (!isCallActive && !isDialing) {
    return null;
  }

  return (
    <>
      <div
        ref={boxRef}
        className="fixed z-[9999]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'none',
          userSelect: isDragging ? 'none' : 'auto'
        }}
      >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Drag handle */}
        <div
          className="drag-handle flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-t-xl cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Active Call
          </span>
          <ArrowsPointingOutIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </div>
        
        {/* Call Controls */}
        <div className="p-4">
          <div className="w-auto">
            <CallControls
              isCallActive={isCallActive}
              isDialing={isDialing}
              isCallEnded={isCallEnded}
              onMakeCall={makeCall}
              onHangupCall={hangupCall}
              selectedLead={selectedLead}
              callDuration={callDuration}
              onMuteToggle={setCallMute}
              currentCall={getCurrentCall()}
              selectedOutboundNumber={selectedOutboundNumber}
              onScheduleAppointment={() => {
                setShowScheduleModal(true);
              }}
              licenseDetails={licenseDetails}
              licenseError={licenseError}
              licenseLoading={licenseLoading}
              walletBalance={walletBalance}
            />
          </div>
        </div>
      </div>
      </div>

      {/* Schedule Appointment Modal */}
      <ScheduleAppointmentModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        selectedLead={selectedLead}
      />
    </>
  );
};

export default StickyCallBar;

