import {
  CheckCircleIcon,
  // UserGroupIcon,
  // ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import SharedSidebar from "../components/SharedSidebar";
import { Button, Card } from "components/ui";
import { useDisclosure } from "hooks";
import RejectModal from "./RejectModal";
import ApproveModal from "./ApproveModal";
import { useEffect, useState } from "react";
import prospectService from "utils/prospectService";
const ProspectList = () => {
  const [isOpen, { open, close }] = useDisclosure(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [selected, setSelected] = useState([]);
  const [selectedId, setSelectedId] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const randomColors = [
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
  const getProspectList = (page) => {
    setLoading(true);
    prospectService
      .getUsers(page, 10)
      .then((resp) => {
        if (resp.data.status === 200) {
          setUsers(resp.data.data);
          let totalPagesCount = 1;

          if (resp.data.pagination) {
            setTotalUsers(resp.data.pagination.total);
            totalPagesCount = Math.ceil(
              resp.data.pagination.total / resp.data.pagination.per_page,
            );
          } else {
            totalPagesCount = resp.totalPages || resp.total_pages || 1;
          }
          setTotalPages(totalPagesCount);
        } else {
          setUsers([]);
        }
      })
      .catch(() => {
        setUsers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    getProspectList(currentPage);
  }, [currentPage]);
  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      {/* Sidebar */}
      <SharedSidebar currentPath="/prospect" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">
                Prospect
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">Manage your Prospect</p>
            </div>
          </div>
        </header>
        <main className="mt-1 flex-1 overflow-auto p-6">
          {/* <div className="grid w-full grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-4">
              <Card
                className="shieldnest-white-column p-6"
                style={{ borderLeft: `5px solid ${randomColors[0]}` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Total Users
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">5</p>
                  </div>
                  <div className="shieldnest-bg1 flex h-12 w-12 items-center justify-center rounded-full">
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>
            </div>
            <div className="col-span-12 md:col-span-4">
              <Card
                className="shieldnest-white-column p-6"
                style={{ borderLeft: `5px solid ${randomColors[1]}` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Active Users
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">12</p>
                  </div>
                  <div className="shieldnest-bg2 flex h-12 w-12 items-center justify-center rounded-full">
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>
            </div>
            <div className="col-span-12 md:col-span-4">
              <Card
                className="shieldnest-white-column p-6"
                style={{ borderLeft: `5px solid oklch(57.7% 0.245 27.325)` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Inactive Users
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">1</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600">
                    <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>
            </div>
          </div> */}
          {/* {selected.length > 0 && (
            <div className="mt-4 mb-4">
              <Card className="bg-white dark:bg-gray-800 p-6">
                <div className="flex w-full justify-end gap-3">
                  <Button color="success" onClick={() => setIsModalOpen(true)}>
                    <CheckCircleIcon className="mr-1 size-5 stroke-2" />
                    <span>Accept</span>
                  </Button>
                  <Button color="error" onClick={open}>
                    <XCircleIcon className="mr-1 size-5 stroke-2" />
                    <span>Reject</span>
                  </Button>
                </div>
              </Card>
            </div>
          )} */}

          <div className="mt-4 mb-4">
            <Card className="shieldnest-shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {/* <th className="min-w-[60px] px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                        <input
                          type="checkbox"
                          checked={selected.length === users.length}
                          onChange={(event) => handleSelectAll(event)}
                          className="h-4 w-4 rounded border-gray-300 text-[var(--color-atoll)] dark:text-blue-400 focus:ring-[var(--color-atoll)]"
                          title="Select All"
                        />
                      </th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                        Agency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
                            <span className="ml-2">Loading users...</span>
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:bg-gray-700">
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selected.some((u) => u.id === user.id)}
                              onChange={(event) => {
                                handleSelection(user, event);
                                //   handlePrintLead(event, lead);
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-[var(--color-atoll)] dark:text-blue-400 focus:ring-[var(--color-atoll)]"
                            />
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {(() => {
                                const color =
                                  randomColors[
                                    users.indexOf(user) % randomColors.length
                                  ];
                                return (
                                  <div
                                    className="flex h-10 w-10 items-center justify-center rounded-full"
                                    style={{ backgroundColor: color }}
                                  >
                                    <span className="text-sm font-medium text-white">
                                      {user.name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase() || "U"}
                                    </span>
                                  </div>
                                );
                              })()}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {user.name}
                                </div>
                                {/* <div className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id}</div> */}
                                <div className="text-sm text-gray-900 dark:text-gray-100">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.phone || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.agency_name || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="mt-4 mb-4">
                              <div className="flex w-full gap-3">
                                <Button
                                  color="success"
                                  onClick={() => {
                                    setIsModalOpen(true);
                                    setSelectedId(user.id);
                                  }}
                                  isIcon
                                  className="size-9"
                                >
                                  <CheckCircleIcon className="size-5 stroke-2" />
                                  {/* <span>Accept</span> */}
                                </Button>
                                <Button
                                  color="error"
                                  onClick={() => {
                                    open();
                                    setSelectedId(user.id);
                                  }}
                                  isIcon
                                  className="size-9"
                                >
                                  <XCircleIcon className="size-5 stroke-2" />
                                  {/* <span>Reject</span> */}
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-700">
                        Showing {(currentPage - 1) * 10 + 1} to{" "}
                        {Math.min(currentPage * 10, totalUsers)} of {totalUsers}{" "}
                        users
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 dark:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        First
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 dark:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                                    : "border border-gray-300 hover:bg-gray-50 dark:bg-gray-700"
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
                        className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 dark:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 dark:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Last
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* <div className="p-4">
              <CustomPagination />
            </div> */}
            </Card>
          </div>
        </main>
      </div>
      <RejectModal
        isOpen={isOpen}
        close={close}
        selectedId={selectedId}
        getProspectList={getProspectList}
        currentPage={currentPage}
      />
      <ApproveModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        selectedId={selectedId}
        getProspectList={getProspectList}
        currentPage={currentPage}
      />
    </div>
  );
};

export default ProspectList;
