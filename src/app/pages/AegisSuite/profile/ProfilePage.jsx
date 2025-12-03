// import React from 'react'

import profileService from "utils/profileService";
import SharedSidebar from "../components/SharedSidebar";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDisclosure } from "hooks";
import { PlusIcon } from "@heroicons/react/24/outline";
import AddLiscence from "./AddLiscence";
import CalendarPage from "../available/CalendarPage";
import Script from "./Script";
import { useAuthContext } from "app/contexts/auth/context";
const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [liscence, setLiscence] = useState([]);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    agency: "",
    npn: "",
  });
  const userData = useAuthContext()
  console.log('user-data', useAuthContext())
  const [isOpen, { open, close }] = useDisclosure(false);
  const tabs = [
    { id: "basic", label: "Basic Details", agent_view:true },
    { id: "license", label: "Licence Details" , agent_view:true },
    { id: "settings", label: "Calendar Settings", agent_view:true  },
    { id: "script", label: "Script", agent_view:false},
  ];

  const filteredTabs = useMemo(() => {
     if (userData.user.role_id === 1) {
      return tabs
     } else {
      return tabs.filter((item) => item.agent_view)
     }
  }, [userData.user.role_id])
  // const licenseDetails = [
  //   {
  //     state: "California",
  //     licenseNumber: "CA-12345-6789",
  //     image: "https://via.placeholder.com/200x120?text=California+License",
  //   },
  //   {
  //     state: "Texas",
  //     licenseNumber: "TX-98765-4321",
  //     image: "https://via.placeholder.com/200x120?text=Texas+License",
  //   },
  // ];

  const getBasics = () => {
    setLoading(true);
    profileService
      .getBasicDetails()
      .then((response) => {
        if (response.data.status === 200) {
          const temp = response.data.data;
          setUser({
            name: temp.name,
            email: temp.email,
            agency: temp?.agency?.name || "",
            role: temp.role_id === 1 ? "Admin" : "Agent",
            npn: temp.npn,
            phone: temp.phone,
          });
        } else {
          setUser({
            name: "",
            email: "",
            role: "",
            phone: "",
            agency: "",
            npn: "",
          });
          toast.error(response?.data?.message || "Please try again later");
        }
      })
      .catch((error) => {
        setUser({
          name: "",
          email: "",
          role: "",
          phone: "",
          agency: "",
          npn: "",
        });
        toast.error(error?.message || "Please try again later");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const getLiscense = () => {
    setLoading(true);
    profileService
      .getLicenseDetails()
      .then((response) => {
        if (response.data.status === 200) {
          setLiscence(response.data.data);
        } else if (response.data.status === 204) {
          setLiscence([]);
        } else {
          toast.error(response?.data?.message || "Please try again later");
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Please try again later");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const getStates = () => {
    profileService
      .getUsaStates()
      .then((response) => {
        console.log("response", response);
        if (response.data.status === 200) {
          const dt = response.data.data;
          const arr = [];
          Object.keys(dt).map(function (key) {
            arr.push({ value: dt[key], label: key });
          });
          setStates(arr);
        } else {
          setStates([]);
        }
      })
      .catch(() => {
        setStates([]);
      });
  };
  useEffect(() => {
    if (activeTab === "basic") {
      getBasics();
    } else {
      getStates();
      getLiscense();
    }
  }, [activeTab]);
  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      {/* Sidebar */}
      <SharedSidebar currentPath="" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">
                Profile
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Manage your Prospect
              </p>
            </div>
          </div>
        </header>

        <main className="mt-1 flex-1 overflow-auto p-6">
          <div className="min-h-screen w-full bg-white dark:bg-gray-900">
            {/* Tabs */}
            <nav className="border-b border-gray-200 bg-gray-50 px-8 dark:border-gray-700 dark:bg-gray-800">
              <div className="-mb-px flex space-x-8 overflow-x-auto">
                {filteredTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "border-[#0a2463] text-[#0a2463] dark:border-[#f4d03f] dark:text-[#f4d03f]"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>

            {/* Content */}
            <div className="px-8 py-6">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                    Loading...
                  </span>
                </div>
              ) : (
                <>
                  {activeTab === "basic" && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(user).map(([key, value]) => {
                        const icons = {
                          name: "👤",
                          email: "📧",
                          role: "💼",
                          phone: "📞",
                          agency: "🏛️",
                          npn: "🧩",
                        };

                        return (
                          <div
                            key={key}
                            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:from-gray-800 dark:to-gray-900"
                          >
                            <div className="absolute inset-0 bg-[#f4d03f]/10 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-[#0a2463]/20"></div>

                            <div className="relative z-10 flex items-start space-x-3">
                              <div className="text-2xl">{icons[key]}</div>
                              <div>
                                <p className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                  {key}
                                </p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                  {value}
                                </p>
                              </div>
                            </div>

                            {/* Edit button */}
                            {/* <button
                              onClick={() => console.log(`Edit ${key}`)}
                              className="absolute top-3 right-3 rounded-lg bg-[#0a2463] px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-[#f4d03f] dark:text-black"
                            >
                              Edit
                            </button> */}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {activeTab === "license" && (
                    <>
                      <div className="mt-2 mb-2 flex justify-end">
                        <button
                          onClick={open}
                          className="flex items-center space-x-2 rounded-lg bg-[#f4d03f] px-4 py-2 text-white transition-colors hover:bg-[#e6c035]"
                        >
                          <PlusIcon className="h-4 w-4" />
                          <span>Add Licence</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
                        {liscence.map((l, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                          >
                            <img
                              src={l.certificate}
                              alt={`${l.state} License`}
                              className="mb-4 h-40 w-full rounded-md border border-gray-300 object-contain dark:border-gray-600"
                            />
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                              {states.length > 0
                                ? states.find((item) => item.value === l.state)
                                    ?.label || l.state
                                : l.state}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              License No:{" "}
                              <span className="font-medium text-[rgb(90,180,83)]">
                                {l.license_number}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {activeTab === "settings" && <CalendarPage />}
                  {activeTab === "script" && <Script />}
                </>
              )}
            </div>
          </div>
          <AddLiscence
            isOpen={isOpen}
            close={close}
            getLiscense={getLiscense}
          />
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
