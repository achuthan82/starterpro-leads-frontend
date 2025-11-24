import { useEffect, useState } from "react";
import { useParams } from "react-router";
import PreviewComponent from "./PreviewComponent";

const MortgageProtectionPreview = () => {
  const { token } = useParams();
  const [previewData, setPreviewData] = useState(null);
  const [licenseDetails, setLicenseDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      console.error("No token provided in URL");
      setLoading(false);
      return;
    }

    // Decode token in case it was URL encoded
    const decodedToken = decodeURIComponent(token);
    console.log("Token from URL (decoded):", decodedToken);
    
    // Get data from sessionStorage using the token
    const storageKey = `mortgage_preview_${decodedToken}`;
    console.log("Looking for data with key:", storageKey);
    
    // Try to get data with retries to handle timing issues
    // Try localStorage first (more reliable across windows), then sessionStorage
    const retrieveData = (attempt = 1) => {
      let storedData = localStorage.getItem(storageKey);
      let storageType = 'localStorage';
      
      if (!storedData) {
        storedData = sessionStorage.getItem(storageKey);
        storageType = 'sessionStorage';
      }
      
      console.log(`Attempt ${attempt}: Stored data found in ${storageType}:`, !!storedData);
      
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          console.log("Parsed data successfully:", {
            hasSubmittedData: !!parsed.submittedData,
            hasLicenseDetails: !!parsed.licenseDetails
          });
          setPreviewData(parsed.submittedData);
          setLicenseDetails(parsed.licenseDetails);
          setLoading(false);
        } catch (error) {
          console.error("Error parsing preview data:", error);
          setLoading(false);
        }
      } else {
        // List all storage keys that start with 'mortgage_preview_' for debugging
        const sessionKeys = Object.keys(sessionStorage);
        const localKeys = Object.keys(localStorage);
        const previewKeys = [...sessionKeys, ...localKeys].filter(key => key.startsWith('mortgage_preview_'));
        console.log("Available preview keys:", previewKeys);
        console.log("Expected key:", storageKey);
        
        // If this is the first attempt and we have other preview keys, try to find a match
        if (attempt === 1 && previewKeys.length > 0) {
          console.log("Trying to find matching key...");
          // Try without the prefix to see if there's a mismatch
          for (const key of previewKeys) {
            const keyToken = key.replace('mortgage_preview_', '');
            if (keyToken === decodedToken || keyToken === token) {
              console.log("Found matching key:", key);
              const foundData = localStorage.getItem(key) || sessionStorage.getItem(key);
              if (foundData) {
                try {
                  const parsed = JSON.parse(foundData);
                  setPreviewData(parsed.submittedData);
                  setLicenseDetails(parsed.licenseDetails);
                  setLoading(false);
                  return;
                } catch (error) {
                  console.error("Error parsing found data:", error);
                }
              }
            }
          }
        }
        
        if (attempt < 3) {
          // Retry after delay
          setTimeout(() => retrieveData(attempt + 1), 200 * attempt);
        } else {
          console.error("Preview data not found after all attempts");
          setLoading(false);
        }
      }
    };

    // Try immediately
    retrieveData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Preview Not Found</h2>
          <p className="text-gray-600 mb-4">The preview data could not be loaded.</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Mortgage Protection Assessment Preview
            </h1>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
          
          <PreviewComponent 
            submittedData={previewData} 
            licenseDetails={licenseDetails}
          />
        </div>
      </div>
    </div>
  );
};

export default MortgageProtectionPreview;

