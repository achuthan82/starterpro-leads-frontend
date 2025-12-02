import { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import profileService from "utils/profileService";
import { toast } from "sonner";
const DeleteScript = ({ script, setDeleteModal, getScriptData, setCurrentPage, activeTab}) => {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const handleDelete =  () => {
    setDeleteLoading(true)
      profileService.deleteScript(script.id).then((response) => {
        if ( response.data.status === 200) {
          toast.success(response?.data?.message || "Success!");
          setDeleteModal(false)
          setCurrentPage(0)
          getScriptData(1, 5, activeTab)
        } else {
          toast.error(response?.data?.message);
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Please try again later");
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };
  return (
    <div>
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
          <div className="mb-4 flex items-center">
            <ExclamationTriangleIcon className="mr-3 h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Script
            </h3>
          </div>

          <p className="mb-6 text-gray-600">
            Are you sure you want to delete? This action cannot
            be undone.
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setDeleteModal(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteLoading ? (
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteScript;
