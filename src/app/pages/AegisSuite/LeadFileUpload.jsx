import { useDropzone } from "react-dropzone";
import { XMarkIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { useListState } from "hooks";
import { FileItem } from "components/shared/form/FileItem";
import { useState } from "react";
import { Button, GhostSpinner } from "components/ui";
import { toast } from "sonner";
import { suppressionService } from "utils/apiService";

export default function LeadFileUpload({
  isOpen,
  onClose,
  selectedLeads,
  type,
  statusLead,
  fetchLeads,
  currentPage,
  perPage,
  purchased,
  activeTab,
  filters
}) {
  const [files, { remove, append }] = useListState();
  const [uploadFiles, setUploadFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const onDrop = (acceptedFiles) => {
    append(...acceptedFiles);
    setUploadFiles([
      ...uploadFiles,
      ...acceptedFiles.map((file) => Object.assign(file)),
    ]);
  };
  const bulkUpload = () => {
    setLoading(true);
    const formData = new FormData();
    uploadFiles.map((fl, idx) => {
      formData.append(`file${idx + 1}`, fl);
    });
    console.log("selected-leads", selectedLeads);
    const uploadPromise = selectedLeads.map((item) => {
      return suppressionService.uploadDocs(
        item.agent_id,
        item.mortgage_id,
        formData,
      );
    });
    Promise.all(uploadPromise)
      .then(() => {
        files.map((item, id) => {
          console.log(item);
          remove(id);
        });
        onClose()
        fetchLeads(
            activeTab,
            filters,
            currentPage,
            perPage,
            false,
            purchased,
          );
        // handleBulkStatusChange();
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to upload documents");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const singleUpload = () => {
    setLoading(true);
    const formData = new FormData();
    uploadFiles.map((fl, idx) => {
      formData.append(`file${idx + 1}`, fl);
    });
    suppressionService
      .uploadDocs(statusLead.agent_id, statusLead.mortgage_id, formData)
      .then(() => {
        files.map((item, id) => {
          console.log(item);
          remove(id);
        });
        onClose()
        fetchLeads(
            activeTab,
            filters,
            currentPage,
            perPage,
            false,
            purchased,
          );
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to upload documents");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const upload = () => {
    if (type === "bulk") {
      bulkUpload();
    } else {
      singleUpload();
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [],
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/65 dark:bg-gray-900/75">
      <div className="relative w-11/12 max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-[var(--color-atoll)] dark:text-blue-400">
            Upload File
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            isDragActive
              ? "border-[var(--color-atoll)] bg-[var(--color-atoll)]/10"
              : "border-gray-300 hover:border-[var(--color-atoll)] dark:border-gray-600"
          }`}
        >
          <input {...getInputProps()} />
          <ArrowUpTrayIcon className="mb-3 h-10 w-10 text-gray-400" />
          {isDragActive ? (
            <p className="text-sm font-medium text-[var(--color-atoll)]">
              Drop the file here...
            </p>
          ) : (
            <p className="text-center text-sm text-gray-500 dark:text-gray-300">
              Drag & drop a file here, or{" "}
              <span className="font-medium">click to browse</span>
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Supported formats: PDF, Images
          </p>
        </div>

        <div className="mt-4 flex flex-col space-y-4">
          {files.map((file, index) => (
            <FileItem
              handleRemove={() => remove(index)}
              file={file}
              key={index}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <Button
            color="primary"
            disabled={loading}
            style={{ backgroundColor: "var(--atoll)" }}
            type="button"
            onClick={upload}
            className="mr-4 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading && <GhostSpinner className="mr-4 size-4 border-2" />}{" "}
            upload
          </Button>
        </div>
      </div>
    </div>
  );
}
