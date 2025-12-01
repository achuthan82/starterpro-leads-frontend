import { useDisclosure } from "hooks";
import ScriptModal from "./ScriptModal";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useEffect, useState, useRef } from "react";
import profileService from "utils/profileService";
import { toast } from "sonner";
import {Pagination, PaginationItems, PaginationNext, PaginationPrevious} from 'components/ui'
const Script = () => {
  const fetchOnce = useRef(false);
  const [isOpen, { open, close }] = useDisclosure(false);
  const [activeTab, setActiveTab] = useState(1);
  const [script, setScript] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editData, setEditData] = useState(null)
 
  const getScriptData = (page, per_page, type) => {
    setLoading(true);
    const params = { page: page, per_page: per_page, type_: type };
    profileService
      .getScript(params)
      .then((response) => {
        if (response.data.status === 200) {
          setScript(response.data.data);
          setPagination(response.data.pagination);
        } else if (response.data.status === 204) {
          setScript([]);
        } else {
          toast.error(response?.data?.message || "Failed to fetch scripts");
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to fetch scripts");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handlePage = (val) => {
    setCurrentPage(val);
    getScriptData(val, 5, activeTab);
  };
  console.log("script", script);
  useEffect(() => {
    if (!fetchOnce.current) {
      fetchOnce.current = true;
      getScriptData(1, 5, 1);
    }
  }, []);
  return (
    <div>
      <>
        <nav className="border-b border-gray-200 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex space-x-2 overflow-x-auto">
            {[
              { id: 1, label: "Scripts" },
              { id: 2, label: "Objection" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1)
                  getScriptData(1, 5, tab.id);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-[#0a2463] text-white shadow-sm dark:bg-[#f4d03f] dark:text-gray-900"
                    : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                } `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
        <div className="mt-2 mb-2 flex justify-end">
          <button
            onClick={open}
            className="flex items-center space-x-2 rounded-lg bg-[#f4d03f] px-4 py-2 text-white transition-colors hover:bg-[#e6c035]"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Script</span>
          </button>
        </div>
        <div className="py-6">
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                Loading...
              </span>
            </div>
          ) : (
            <>
              <div className="mt-4 space-y-4">
                {script.length === 0 ? (
                  <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                    No scripts found
                  </div>
                ) : (
                  script.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                      {/* Title + Type */}
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {item.title}
                        </h2>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                          {item.type_ === 1 ? "Script" : "Objection"}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {item.description
                          .split(/({{.*?}})/g)
                          .map((part, index) =>
                            part.startsWith("{{") ? (
                              <span
                                key={index}
                                className="rounded-md bg-yellow-200 px-1 py-0.5 font-mono text-sm text-yellow-900"
                              >
                                {part}
                              </span>
                            ) : (
                              part
                            ),
                          )}
                      </p>

                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        <button className="rounded-md bg-[#0a2463] px-3 py-1.5 text-sm text-white hover:bg-[#082050]" onClick={() => {setEditData(item); open()}}>
                          Edit
                        </button>
                        {/* <button className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700">
                          Delete
                        </button> */}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {pagination && (
                <div className=" mt-4 flex justify-center">
                  <Pagination
                    total={Math.ceil(pagination.total / 5)}
                    value={currentPage}
                    onChange={(val) => handlePage(val)}
                  >
                    <PaginationPrevious />
                    <PaginationItems />
                    <PaginationNext />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </>
      <ScriptModal isOpen={isOpen} close={close} editData={editData} setEditData={setEditData} setCurrentPage={setCurrentPage} activeTab={activeTab} getScriptData={getScriptData}/>
    </div>
  );
};

export default Script;
