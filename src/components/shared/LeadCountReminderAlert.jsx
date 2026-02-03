// Import Dependencies
import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

// Local Imports
import { useAuthContext } from "app/contexts/auth/context";
import { Button } from "components/ui";

// ----------------------------------------------------------------------

export default function LeadCountReminderAlert() {
  const { user, isAuthenticated } = useAuthContext();
  const [isVisible, setIsVisible] = useState(false);
  const [leadCountReminder, setLeadCountReminder] = useState(null);
  const [hasRenewalAlert, setHasRenewalAlert] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Check user from context first, then fallback to localStorage
      let userData = user;
      
      if (!userData) {
        const currentUser = window.localStorage.getItem("currentUser");
        if (currentUser) {
          try {
            userData = JSON.parse(currentUser);
          } catch (err) {
            console.error("Error parsing currentUser from localStorage:", err);
          }
        }
      }

      // Check if renewal alert should be visible
      const hasRenewal = !!(userData?.renewal_data);
      setHasRenewalAlert(hasRenewal);

      // Check if user has lead_count_reminder
      if (userData?.lead_count_reminder) {
        setLeadCountReminder(userData.lead_count_reminder);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } else {
      setIsVisible(false);
      setHasRenewalAlert(false);
    }
  }, [user, isAuthenticated]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !leadCountReminder) {
    return null;
  }

  return (
    <div
      role="alert"
      className={clsx(
        "fixed left-0 right-0 z-50 flex items-center space-x-3 bg-blue-500 px-4 py-4 text-white shadow-lg sm:px-5",
        hasRenewalAlert ? "top-16" : "top-0"
      )}
    >
      <InformationCircleIcon className="size-6 shrink-0" />
      <div className="flex-1">
        <span>{leadCountReminder}</span>
      </div>
      <Button
        onClick={handleClose}
        unstyled
        className="size-6 shrink-0 rounded-full p-0 text-white hover:bg-white/30 focus:bg-white/30"
        aria-label="Close alert"
      >
        <XMarkIcon className="size-5" />
      </Button>
    </div>
  );
}
