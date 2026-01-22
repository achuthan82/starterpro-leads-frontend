import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import { Button } from "components/ui";
import { toast } from "sonner";
import automationService from "utils/automationService";
import { Switch } from "@headlessui/react";
const LeadAutomationSettings = ({
  isModalOpen,
  close,
  lead,
  setSettingsLead,
  fetchLeads,
  activeTab,
  filters,
  currentPage,
  perPage,
  purchased,
}) => {
  const [loading, setLoading] = useState(false);
  const handleLeadAutomation = (status) => {
    setLoading(true);
    const payload = { sms_automation_enabled: status };
    automationService
      .toggleLeadManagementAutomation(lead.assignee_id, payload)
      .then((response) => {
        console.log(response);
        if (response.data.status === 200) {
          setSettingsLead((prev) => ({
            ...prev,
            sms_automation_enabled: status,
          }));
          fetchLeads(
            activeTab,
            filters,
            currentPage,
            perPage,
            false,
            purchased,
          );
          toast.success("Success");
        } else {
          toast.error(response?.data?.message || "Failed to Update");
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to Update");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleAppointmentAutomation = (status, text) => {
    setLoading(true);
    const payload = {};
    if (text === "sms") {
      payload["appointment_notification_sms_enabled"] = status;
    } else {
      payload["appointment_notification_mail_enabled"] = status;
    }
    automationService
      .toggleLeadAppointmentAutomation(lead.assignee_id, payload)
      .then((response) => {
        console.log(response);
        if (response.data.status === 200) {
          if (text === "sms") {
            setSettingsLead((prev) => ({
              ...prev,
              appointment_notification_sms_enabled: status,
            }));
          } else {
            setSettingsLead((prev) => ({
              ...prev,
              appointment_notification_mail_enabled: status,
            }));
          }
          fetchLeads(
            activeTab,
            filters,
            currentPage,
            perPage,
            false,
            purchased,
          );
          toast.success("Success");
        } else {
          toast.error(response?.data?.message || "Failed to Update");
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to Update");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const closeModal = () => {
    close();
  };

  return (
    <Transition appear show={isModalOpen} as={Fragment}>
      <Dialog
        as="div"
        data-testid="modal-close-automation-settings"
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
        onClose={closeModal}
      >
        {/* Overlay */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        {/* Modal Content */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel className="dark:bg-dark-700 relative w-full max-w-[600px] rounded-2xl bg-white px-6 py-8 text-center shadow-xl transition-all sm:px-8">
            <DialogTitle
              as="h3"
              className="text-2xl font-semibold text-gray-800 dark:text-gray-100"
            >
              Automation Settings
            </DialogTitle>
            {loading && (
              <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-md">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-[#0a2463]"></div>
              </div>
            )}
            <div className="grid gap-y-4 pt-6">
              {/* Appointment SMS Automation */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-5 dark:border-gray-700">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Appointment SMS Automation
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Send instant text confirmations and timely reminders.
                  </p>
                </div>

                <Switch
                  checked={lead.appointment_notification_sms_enabled}
                  onChange={() =>
                    handleAppointmentAutomation(
                      !lead.appointment_notification_sms_enabled,
                      "sms",
                    )
                  }
                  data-testid="toggle-appointment-sms-automation"
                  className={`${
                    lead.appointment_notification_sms_enabled ? "bg-[#0a2463]" : "bg-gray-300"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                >
                  <span
                    className={`${
                      lead.appointment_notification_sms_enabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>

              {/* Lead SMS Automation */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-5 dark:border-gray-700">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Lead SMS Automation
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically send SMS updates and follow-ups to new leads.
                  </p>
                </div>

                <Switch
                  checked={lead?.sms_automation_enabled}
                  onChange={() =>
                    handleLeadAutomation(!lead?.sms_automation_enabled)
                  }
                  data-testid="toggle-lead-sms-automation"
                  className={`${
                    lead?.sms_automation_enabled
                      ? "bg-[#0a2463]"
                      : "bg-gray-300"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                >
                  <span
                    className={`${
                      lead?.sms_automation_enabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>

              {/* Appointment Email Automation */}
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-5 dark:border-gray-700">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Appointment Email Automation
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Deliver professional email confirmations and reminders.
                  </p>
                </div>

                <Switch
                  checked={lead.appointment_notification_mail_enabled}
                  onChange={() =>
                    handleAppointmentAutomation(
                      !lead.appointment_notification_mail_enabled,
                      "email",
                    )
                  }
                  data-testid="toggle-appointment-email-automation"
                  className={`${
                    lead.appointment_notification_mail_enabled ? "bg-[#0a2463]" : "bg-gray-300"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                >
                  <span
                    className={`${
                      lead.appointment_notification_mail_enabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>

              {/* Close Button */}
              <div className="mt-6 w-full pt-4 text-center">
                <Button
                  color="primary"
                  style={{ backgroundColor: "var(--atoll)" }}
                  type="button"
                  onClick={closeModal}
                  data-testid="btn-close-automation-settings"
                  className="mr-4 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default LeadAutomationSettings;
