import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { suppressionService } from "utils/apiService";

export default function SuppressionDecisionModal({
  isOpen,
  setType,
  setIsOpen,
  type = "approve", // "approve" | "reject"
  selectedLeads,
  setSelectedLeads,
  setCurrentPage,
  getLeads,
  currentPage
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const isReject = type === "reject";

  useEffect(() => {
    if (!isOpen) {
      setReason("");
    }
  }, [isOpen]);

  if (!isOpen) return null;
  const onClose = () => {
    setType("");
    setIsOpen(false);
  };
  const handleSubmit = () => {
    setLoading(true);
    const payload = {
      agent_mortgage_info: selectedLeads.map((item) => {
        return { id: item.assignee_id, agent_id: item.agent_id };
      }),
    };
    if (isReject) {
      if (!reason.trim()) return;
      payload["lead_status"] = 13;
      payload["suppression_rejection_msg"] = reason;
    } else {
      payload["lead_status"] = 7;
    }
    suppressionService
      .suppressionAction(payload)
      .then((response) => {
        console.log(response.data);
        if (response.data.status === 200) {
          onClose();
          if (currentPage !== 1) {
            setCurrentPage(1);
          } else {
            getLeads(1, 10);
          }
          setSelectedLeads([]);
          toast.success(response?.data?.message || "Success");
        } else {
          toast.error(response?.data?.message || "Failed");
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Failed !");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/65 dark:bg-gray-900/75">
      <div className="relative w-11/12 max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
          <h3
            className={`text-lg font-semibold ${
              isReject
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {isReject ? "Reject Suppression" : "Approve Suppression"}
          </h3>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4">
          {isReject ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Please provide a reason for rejecting this suppression request.
              </p>

              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>

                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Type rejection reason..."
                  className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 focus:ring-2 focus:ring-red-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Ready to approve this suppression
                  </p>
                  <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                    Approving will mark this suppression request as approved and
                    apply the necessary restrictions immediately.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || (isReject && !reason.trim())}
            className={`rounded-md px-5 py-2.5 text-sm font-semibold text-white shadow-sm ${
              isReject
                ? "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                : "bg-green-600 hover:bg-green-700 disabled:bg-green-400"
            }`}
          >
            {loading
              ? "Processing..."
              : isReject
                ? "Reject"
                : "Approve Suppression"}
          </button>
        </div>
      </div>
    </div>
  );
}
