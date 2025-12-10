import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import PreviewComponent from "./PreviewComponent";

const MortgageProtectionPreview = () => {
  const { token, currentCallLogId } = useParams();
  const [previewData, setPreviewData] = useState(null);
  const [licenseDetails, setLicenseDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⭐ ADD THIS — REF TO CALL CHILD FUNCTION
  const previewRef = useRef(null);

  useEffect(() => {
    if (!token) {
      console.error("No token provided in URL");
      setLoading(false);
      return;
    }

    const decodedToken = decodeURIComponent(token);
    const storageKey = `mortgage_preview_${decodedToken}`;

    const retrieveData = (attempt = 1) => {
      let storedData = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);

      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          setPreviewData(parsed.submittedData);
          setLicenseDetails(parsed.licenseDetails);
          setLoading(false);
        } catch (error) {
          console.error("Error parsing preview data:", error);
          setLoading(false);
        }
      } else {
        if (attempt < 3) {
          setTimeout(() => retrieveData(attempt + 1), 200 * attempt);
        } else {
          console.error("Preview data not found after all attempts");
          setLoading(false);
        }
      }
    };

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


            <div>
               {/* <button
                onClick={() => previewRef.current.generateAndUploadPDF()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-3"
              >
                Download All Slides (PDF)
              </button> */}
               <button
                onClick={() => window.close()}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>

          {/* ⭐ PASS REF TO PreviewComponent */}
          <PreviewComponent
            ref={previewRef}
            submittedData={previewData}
            licenseDetails={licenseDetails}
            currentCallLogId={currentCallLogId}
          />

        </div>
      </div>
    </div>
  );
};

export default MortgageProtectionPreview;
