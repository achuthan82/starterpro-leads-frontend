import { useEffect, useState } from "react";
import SharedSidebar from "../components/SharedSidebar";
import { DocumentIcon } from "@heroicons/react/24/outline";
import { suppressionService } from "utils/apiService";
import { toast } from "sonner";
const Suppression = () => {
  const [loading, setLoading] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  const handleLeadSelection = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const getLeads = (page, per_page) => {
    setLoading(true);
    suppressionService
      .getPendingRequest(page, per_page)
      .then((response) => {
        if (response.data.status === 200) {
          setLeads(response.data.data);
          if (response.data.pagination) {
            setTotalLeads(response.data.pagination.total);
            var totalPagesCount = 1;
            totalPagesCount = Math.ceil(
              response.data.pagination.total /
                response.data.pagination.per_page,
            );
          } else {
            totalPagesCount = response.totalPages || response.total_pages || 1;
          }
          setTotalPages(totalPagesCount);
        } else if (response.data.status === 204) {
          setLeads([]);
        } else {
          toast.error(response?.data?.message || "Failed to load requests");
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to load requests");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((l) => l.assignee_id));
    }
  };

  const handleApprove = () => {
    console.log("Approved leads:", selectedLeads);
  };

  const handleReject = () => {
    console.log("Rejected leads:", selectedLeads);
  };
  useEffect(() => {
    getLeads(currentPage, 10);
  }, [currentPage]);
  return (
    <div className="flex min-h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      <SharedSidebar currentPath="/suppression" />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0a2463] dark:text-blue-400">
                Suppression Requests
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Manage and track your leads across different categories
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* <button
                onClick={() => alert('Add New Lead form would open here')}
                className="bg-[#f4d03f] text-white px-4 py-2 rounded-lg hover:bg-[#e6c035] transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Lead</span>
              </button> */}

              {/* Bulk Actions Button */}
            </div>
          </div>
        </header>
        <main className="flex min-h-0 flex-1 flex-col p-6">
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Header */}

            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                Suppression Requests
              </h1>

              <div className="flex gap-3">
                <button
                  disabled={selectedLeads.length === 0}
                  onClick={handleApprove}
                  className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  disabled={selectedLeads.length === 0}
                  onClick={handleReject}
                  className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full min-w-max">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {/* Select */}
                    <th className="min-w-[60px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={
                          selectedLeads.length === leads.length &&
                          leads.length > 0
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-[#0a2463] focus:ring-[#0a2463] dark:text-blue-400"
                        title="Select All"
                      />
                    </th>

                    {/* Full Name */}
                    <th className="min-w-[160px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Full Name
                    </th>

                    {/* Campaign */}
                    <th className="min-w-[180px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Campaign
                    </th>

                    {/* Registered Date */}
                    <th className="min-w-[140px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Registered Date
                    </th>

                    {/* State */}
                    <th className="min-w-[80px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      State
                    </th>

                    {/* Zip */}
                    <th className="min-w-[80px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Zip
                    </th>

                    {/* Automation */}
                    <th className="min-w-[80px] px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Documents
                    </th>
                  </tr>
                </thead>
                {loading ? (
                  <div className="w-300 p-8 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[#0a2463] dark:border-blue-400"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      Loading leads...
                    </p>
                  </div>
                ) : (
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {leads.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          No leads found.
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead, index) => (
                        <tr
                          key={lead.assignee_id || index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {/* Select */}
                          <td className="px-3 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedLeads.includes(lead.assignee_id)}
                              onChange={() =>
                                handleLeadSelection(lead.assignee_id)
                              }
                              className="h-4 w-4 rounded border-gray-300 text-[#0a2463] focus:ring-[#0a2463] dark:text-blue-400"
                            />
                          </td>

                          {/* Full Name */}
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {/* <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                          {lead.identifier || lead.mortgage_id || lead.assignee_id || ''}
                                                        </div> */}
                              {(() => {
                                const avatarColors = [
                                  "#0a2463",
                                  "#5ab453",
                                  "#92c933",
                                  "#FF2ECF",
                                  "#E000AD",
                                  "#FFA71A",
                                  "#FF4F1A",
                                  "#384766",
                                  "#506877",
                                  "#3D4E70",
                                  "#4A4A4F",
                                  "#6D7EA1",
                                  "#70838F",
                                  "#B8008C",
                                  "#FF75DF",
                                ];
                                const color =
                                  avatarColors[
                                    leads.indexOf(lead) % avatarColors.length
                                  ];
                                return (
                                  <div
                                    className="flex h-10 w-10 items-center justify-center rounded-full"
                                    style={{ backgroundColor: color }}
                                  >
                                    <span className="text-sm font-medium text-white">
                                      {lead.full_name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase() || "U"}
                                    </span>
                                  </div>
                                );
                              })()}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {lead.full_name}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Campaign */}
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div
                              className="max-w-[180px] truncate text-sm font-medium text-gray-900 dark:text-white"
                              title={lead.campaign_name}
                            >
                              {lead.campaign_name || "-"}
                            </div>
                          </td>

                          {/* Registered Date */}
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {lead.call_in_date_time || "-"}
                            </div>
                          </td>

                          {/* State */}
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {lead.state || "-"}
                            </div>
                          </td>

                          {/* Zip */}
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {lead.zip || "-"}
                            </div>
                          </td>

                          {/* Automation */}
                          <td className="px-3 py-4 whitespace-nowrap">
                            <DocumentIcon
                              // onClick={() => {
                              //   docOpen();
                              //   setStatusLead(lead);
                              // }}
                              className="ml-2 size-5"
                              title="View Uploaded File"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                )}
              </table>
              {totalPages > 1 && (
                <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-700">
                        Showing {(currentPage - 1) * 10 + 1} to{" "}
                        {Math.min(currentPage * 10, totalLeads)} of {totalLeads}{" "}
                        coupons
                      </div>
                      <div className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        First
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="flex space-x-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`rounded px-3 py-1 text-sm ${
                                  currentPage === pageNum
                                    ? "bg-[var(--color-atoll)] text-white"
                                    : "border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          },
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Last
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Suppression;
