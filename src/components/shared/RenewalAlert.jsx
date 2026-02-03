// Import Dependencies
import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

// Local Imports
import { useAuthContext } from "app/contexts/auth/context";
import { Button } from "components/ui";

// ----------------------------------------------------------------------

export default function RenewalAlert() {
  const { user, isAuthenticated } = useAuthContext();
  const [isVisible, setIsVisible] = useState(false);
  const [renewalData, setRenewalData] = useState(null);
  const [renewalLink, setRenewalLink] = useState(null);

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

      // Check if user has renewal_data
      if (userData?.renewal_data) {
        setRenewalData(userData.renewal_data);
        setRenewalLink(userData.renewal_link || null);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } else {
      setIsVisible(false);
    }
  }, [user, isAuthenticated]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !renewalData) {
    return null;
  }

  return (
    <div
      role="alert"
      className="fixed top-0 left-0 right-0 z-50 flex items-center space-x-3 bg-yellow-500 px-4 py-4 text-white shadow-lg sm:px-5"
    >
      <ExclamationTriangleIcon className="size-6 shrink-0" />
      <div className="flex-1 flex items-center flex-wrap gap-2">
        <span>{renewalData}</span>
        {renewalLink && (
          <a
            href={renewalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-300 rounded px-1"
          >
            click here
          </a>
        )}
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
