import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { suppressionService } from "utils/apiService";

export default function LeadFileModal({
  isOpen,
  onClose,
  statusLead,
  setStatusLead,
}) {
  const [uploadFiles, setUploadFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const getUploadedDocs = () => {
    console.log(uploadFiles);
    setLoading(true);
    suppressionService
      .getDocs(statusLead.agent_id, statusLead.mortgage_id)
      .then((response) => {
        if (response.data.status === 200) {
          setUploadFiles(response.data.data);
        } else if (response.data.status === 204) {
          setUploadFiles([]);
        } else {
          setUploadFiles([]);
          toast.error(response?.data?.message || "Failed to upload documents");
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to upload documents");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const close = () => {
    onClose();
    setStatusLead(null);
  };

  useEffect(() => {
    if (isOpen && statusLead) {
      getUploadedDocs();
    }
  }, [isOpen, statusLead]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/65 dark:bg-gray-900/75">
      <div className="relative w-11/12 max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-[var(--color-atoll)] dark:text-blue-400">
            Uploaded Files
          </h3>
          <button
            onClick={close}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {loading && (
          <div className="mt-6 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
            <span className="ml-2 text-gray-900 dark:text-gray-100">
              Loading...
            </span>
          </div>
        )}
        {!loading && uploadFiles.length === 0 && (
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No documents uploaded
          </p>
        )}

        {!loading && uploadFiles.length > 0 && (
          <ul className="mt-6 space-y-3">
            {uploadFiles.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-600"
              >
                <div className="flex items-center gap-3">
                  📄
                  <div>
                    <p className="max-w-[260px] truncate text-sm font-medium text-gray-900 dark:text-gray-200">
                      {file.name}
                    </p>
                  </div>
                </div>

                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--color-atoll)] hover:underline"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <button
            onClick={close}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
