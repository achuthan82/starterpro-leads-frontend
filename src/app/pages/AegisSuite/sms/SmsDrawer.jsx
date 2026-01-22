import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const SmsDrawer = ({ isOpen, onClose, mortgageId, leadMemberId, children }) => {
  // ESC key closes drawer
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Background overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="SMS conversation drawer"
        className={`
          absolute bottom-0 right-0 h-full max-h-screen bg-white dark:bg-gray-800 shadow-xl
          w-full sm:w-[90%] md:w-[75%] lg:w-[60%] xl:w-[55%]
          rounded-tl-xl rounded-bl-xl transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">SMS Conversation</h2>
            {/* Small subtitle showing which lead is open (prevents unused prop lint error) */}
            {(mortgageId || leadMemberId) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {mortgageId ? `Mortgage: ${mortgageId}` : ""}{" "}
                {leadMemberId ? `• Lead: ${leadMemberId}` : ""}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close SMS drawer"
            data-testid="btn-x-close-panel"
            className="p-1.5 sm:p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition flex-shrink-0 ml-2"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100" />
          </button>
        </div>

        {/* Actual content injected from parent */}
        <div className="h-[calc(100%-64px)] sm:h-[calc(100%-76px)] overflow-y-auto">
          {children}
        </div>
      </aside>
    </div>
  );
};

export default SmsDrawer;
