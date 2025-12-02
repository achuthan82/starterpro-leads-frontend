import { useEffect, useState } from "react";
import SharedSidebar from "../components/SharedSidebar";
import { Switch } from "@headlessui/react";
import automationService from "utils/automationService";
import { useAuthContext } from "app/contexts/auth/context";
import { toast } from "sonner";
// import EmailText from './EmailText';
const Index = () => {
  const { user } = useAuthContext();
  const [leadAutomation, setLeadAutomation] = useState(false);
  const [appointmentAutomation, setAppointmentAutomation] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  //  const [loading] = useState(false)
  //  const [activeTab, setActiveTab] = useState('email-sms')
  const getDetails = () => {
    setLeadLoading(true)
    automationService
      .getAutomationDetails(user.agency.id)
      .then((response) => {
        if (response.data.status === 200) {
          setLeadAutomation(response.data.data.sms_automation_enabled);
          setAppointmentAutomation(response.data.data.appointment_notification_sms_enabled)
        } else {
          toast.error(
            response?.data?.message || "Failed to fetch automation settings",
          );
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to Update");
      }).finally(() => {
        setLeadLoading(false)
      })
  };
  const handleLeadAutomation = (status) => {
    setLeadLoading(true);
    const payload = { sms_automation_enabled: status };
    automationService
      .toggleLeadAutomation(user.agency.id, payload)
      .then((response) => {
        console.log(response);
        if (response.data.status === 200) {
          setLeadAutomation(status);
          toast.success("Success");
        } else {
          toast.error(response?.data?.message || "Failed to Update");
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to Update");
      })
      .finally(() => {
        setLeadLoading(false);
      });
  };
   const handleAppointmentAutomation = (status) => {
    setLeadLoading(true);
    const payload = { appointment_notification_sms_enabled: status };
    automationService
      .toggleLeadAutomation(user.agency.id, payload)
      .then((response) => {
        if (response.data.status === 200) {
          setAppointmentAutomation(status);
          toast.success("Success");
        } else {
          toast.error(response?.data?.message || "Failed to Update");
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to Update");
      })
      .finally(() => {
        setLeadLoading(false);
      });
  };
  useEffect(() => {
    getDetails();
  }, []);
  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      {/* Sidebar */}
      <SharedSidebar currentPath="/workflow" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">
                Workflows
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Manage your workflow
              </p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {leadLoading && (
            <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-md">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-[#0a2463]"></div>
            </div>
          )}
          <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 text-xl font-semibold text-[#0a2463] dark:text-[#f4d03f]">
              Automation Settings
            </h2>

            <div className="space-y-8">
              {/* Lead Automation Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-5 dark:border-gray-700">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Lead Automation
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically handle incoming leads using your configured
                    workflows.
                  </p>
                </div>

                <Switch
                  checked={leadAutomation}
                  onChange={() => handleLeadAutomation(!leadAutomation)}
                  className={`${
                    leadAutomation ? "bg-[#0a2463]" : "bg-gray-300"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    leadLoading && "cursor-not-allowed opacity-70"
                  }`}
                >
                  <span
                    className={`${
                      leadAutomation ? "translate-x-6" : "translate-x-1"
                    } flex inline-block h-4 w-4 transform items-center justify-center rounded-full bg-white transition`}
                  ></span>
                </Switch>
              </div>

              {/* Appointment Automation Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-5 dark:border-gray-700">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Appointment Automation
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Auto-manage appointment confirmations and reminders.
                  </p>
                </div>

                <Switch
                  checked={appointmentAutomation}
                  onChange={() => handleAppointmentAutomation(!appointmentAutomation)}
                  className={`${
                    appointmentAutomation ? "bg-[#f4d03f]" : "bg-gray-300"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                >
                  <span
                    className={`${
                      appointmentAutomation ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
            </div>
          </div>
        </main>

        {/* <main className="mt-1 flex-1 overflow-auto p-6">
          <div className="min-h-screen w-full bg-white dark:bg-gray-900"> */}
        {/* Tabs */}
        {/* <nav className="border-b border-gray-200 bg-gray-50 px-8 dark:border-gray-700 dark:bg-gray-800">
                  <div className="-mb-px flex space-x-8 overflow-x-auto">
                    {[
                      { id: "email-sms", label: "Email/SMS" },
                      { id: "appointment", label: "Appointments" },
                    ].map((tab) => (
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
                </nav> */}
        {/* Content */}
        {/* <div className="px-8 py-6">
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
                      <span className="ml-2 text-gray-900 dark:text-gray-100">
                        Loading...
                      </span>
                    </div>
                  ) : (
                    <>
                      {
                        activeTab === 'email-sms' ? <EmailText/> : <EmailText/>
                      }
                    </>
                  )}
                </div> */}
        {/* </div>
        </main> */}
      </div>
    </div>
  );
};

export default Index;
