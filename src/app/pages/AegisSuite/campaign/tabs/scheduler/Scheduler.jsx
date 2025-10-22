import { FunnelIcon } from "@heroicons/react/20/solid";
import {
  ArrowPathIcon,
  CalendarDateRangeIcon,
  ChatBubbleLeftIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { Button, Card, Switch } from "components/ui";
import { useDisclosure } from 'hooks';
import SchedulerModal from "./SchedulerModal";

const Scheduler = () => {
    const [isOpen, {open, close}] = useDisclosure(false);
  
  return (
    <div className="px-8 py-6">
      <div className="mb-6 flex justify-between">
        <h3 className="text-2xl font-semibold text-[var(--color-atoll)]">
          Campaign Scheduler
        </h3>
        <div className="flex space-x-3">
          <Button variant="outlined" className="space-x-2">
            <FunnelIcon className="size-5" />
            <span>Filter</span>
          </Button>
          <button className="flex items-center space-x-2 rounded-lg bg-[var(--color-atoll)] px-4 py-2 font-medium text-white hover:bg-[var(--color-atoll)]/90" onClick={open}>
            {" "}
            <CalendarDateRangeIcon className="size-5" />
            <span>Schedule Campaigns</span>
          </button>
        </div>
      </div>
      <div>
        <Card className="mb-6 bg-white p-3">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Upcoming Scheduled Campaign
            </h3>
          </div>
          <div className="mb-4 border-l-4 border-[var(--color-atoll)] pl-4">
            <div>
              <h4 className="mb-3 font-medium text-gray-900">
                Today - September 15, 2025
              </h4>
            </div>
            <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 p-3">
              <div className="flex items-center space-x-6">
                <span className="font-medium text-blue-600">10:00 AM</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200">
                  <ChatBubbleLeftIcon className="size-3" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Appointment Reminders
                  </p>
                  <p className="text-sm text-gray-500">SMS to 45 contacts</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center rounded-full bg-[#cddf8f] p-2">
                  <span className="text-xs font-normal text-[var(--color-atoll)]">
                    Scheduled
                  </span>
                </div>
                <span>
                  <EllipsisVerticalIcon className="size-6" />
                </span>
              </div>
            </div>
            <div className="mb-4 flex items-center justify-between rounded-lg bg-yellow-50 p-3">
              <div className="flex items-center space-x-6">
                <span className="font-medium text-yellow-600">6:00 PM</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200">
                  <EnvelopeIcon className="size-3" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Follow-up Email Sequence
                  </p>
                  <p className="text-sm text-gray-500">Email to 128 leads</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center rounded-full bg-[#cddf8f] p-2">
                  <span className="text-xs font-normal text-[var(--color-atoll)]">
                    Scheduled
                  </span>
                </div>
                <span>
                  <EllipsisVerticalIcon className="size-6" />
                </span>
              </div>
            </div>
          </div>
          <div className="mb-4 border-l-4 border-gray-300 pl-4">
            <div>
              <h4 className="mb-3 font-medium text-gray-900">
                Tomorrow - September 16, 2025
              </h4>
            </div>
            <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div className="flex items-center space-x-6">
                <span className="font-medium text-blue-600">10:00 AM</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200">
                  <ChatBubbleLeftIcon className="size-3" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Appointment Reminders
                  </p>
                  <p className="text-sm text-gray-500">SMS to 45 contacts</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center rounded-full bg-[#cddf8f] p-2">
                  <span className="text-xs font-normal text-[var(--color-atoll)]">
                    Scheduled
                  </span>
                </div>
                <span>
                  <EllipsisVerticalIcon className="size-6" />
                </span>
              </div>
            </div>
            <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div className="flex items-center space-x-6">
                <span className="font-medium text-yellow-600">6:00 PM</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200">
                  <EnvelopeIcon className="size-3" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Follow-up Email Sequence
                  </p>
                  <p className="text-sm text-gray-500">Email to 128 leads</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center rounded-full bg-[#cddf8f] p-2">
                  <span className="text-xs font-normal text-[var(--color-atoll)]">
                    Scheduled
                  </span>
                </div>
                <span>
                  <EllipsisVerticalIcon className="size-6" />
                </span>
              </div>
            </div>
          </div>
        </Card>
        <Card className="mb-6 bg-white p-3">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Recurring Campaign
            </h3>
          </div>
          <div className="grid grid-cols-12 w-full gap-2">
            <div className="col-span-6 rounded-lg border-1 border-gray-200 p-2">
              <div className="flex justify-between mb-5">
                <div className="flex items-center space-x-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <ArrowPathIcon className="size-5" />
                  </div>
                  <div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700">
                      Daily Appointment Reminders
                      </h4>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Every Day at 10 AM
                      </p>
                    </div>
                  </div>
                </div>
                <span>
                  <Switch color="success" defaultChecked label="" />
                </span>
              </div>
              <div className="mb-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Next run: Today at 10:00 AM
                  </p>
                  <p className="text-sm text-gray-600">
                    Recipients: Dynamic list based on appointments
                  </p>
                </div>
              </div>
            </div>
             <div className="col-span-6 rounded-lg border-1 border-gray-200 p-2">
              <div className="flex justify-between mb-5">
                <div className="flex items-center space-x-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <ArrowPathIcon className="size-5" />
                  </div>
                  <div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-700">
                       Weekly News Letter
                      </h4>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Every Monday at 9:00 AM
                      </p>
                    </div>
                  </div>
                </div>
                <span>
                  <Switch color="success" defaultChecked label="" />
                </span>
              </div>
              <div className="mb-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                   Next run: Monday, Sep 22 at 9:00 AM
                  </p>
                  <p className="text-sm text-gray-600">
                    Recipients: All email subscribers (3,200)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
       <SchedulerModal isOpen={isOpen} close={close}></SchedulerModal>
    </div>
  );
};

export default Scheduler;
