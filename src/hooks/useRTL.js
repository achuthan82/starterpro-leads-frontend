import { useState, useEffect } from "react";

export const useRTL = () => {
  const [isRtl, setIsRtl] = useState(false);

  // Function to set RTL mode
  const setRTL = (value) => {
    setIsRtl(value);
    
    // Also update localStorage if you want to persist the setting
    localStorage.setItem('isRTL', value.toString());
  };

  useEffect(() => {
    // Check if RTL is set in localStorage or detect from browser/system
    const savedRTL = localStorage.getItem('isRTL');
    const browserLang = navigator.language;
    
    // Auto-detect RTL languages (Arabic, Hebrew, Persian, Urdu, etc.)
    const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'ps', 'ku'];
    const isBrowserRTL = rtlLanguages.some(lang => browserLang.startsWith(lang));
    
    // Use saved preference or auto-detect
    const shouldBeRTL = savedRTL ? savedRTL === 'true' : isBrowserRTL;
    
    setIsRtl(shouldBeRTL);
  }, []);

  useEffect(() => {
    // ** Get HTML Tag
    const element = document.getElementsByTagName("html")[0];

    // ** If isRTL then add attr dir='rtl' with HTML else attr dir='ltr'
    if (isRtl) {
      element.setAttribute("dir", "rtl");
    } else {
      element.setAttribute("dir", "ltr");
    }
  }, [isRtl]);

  // Return both the value and setter function
  return [isRtl, setRTL];
};

export default useRTL;