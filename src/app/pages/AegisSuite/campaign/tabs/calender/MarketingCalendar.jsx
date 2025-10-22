import { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import MarketingEventModal from "./MarketingEventModal";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";

const MarketingCalendar = () => {
  const calendarRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState("September 2025"); // default

  const updateMonthTitle = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      const date = api.getDate();
      const formatter = new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      });
      setCurrentMonth(formatter.format(date));
    }
  };

  const handleDateNav = (direction) => {
    const api = calendarRef.current?.getApi();
    if (!api) return;

    if (direction === "prev") {
      api.prev();
    } else {
      api.next();
    }
    updateMonthTitle();
  };

  const events = [
    { title: "Email Newsletter", date: "2025-09-03", color: "#3b82f6" },
    { title: "SMS Reminders", date: "2025-09-09", color: "#22c55e" },
    { title: "Event Webinar", date: "2025-09-12", color: "#a855f7" },
    { title: "Email Promo", date: "2025-09-16", color: "#3b82f6" },
    { title: "SMS Follow-up", date: "2025-09-18", color: "#22c55e" },
    { title: "Event Open House", date: "2025-09-24", color: "#a855f7" },
  ];

  return (
    <div className="p-6">
      {/* Top Header with Month + Legend + Buttons */}
      <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-800">
          Campaign Reports & Analytics
        </h1>
        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDateNav("prev")}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDateNav("next")}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
          <button
            className="bg-[#0a2463] px-4 py-2 rounded-lg text-white hover:bg-[#1e40af] font-medium flex items-center space-x-1"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>
     <div className="flex items-center justify-between mb-4">
      {/* Month Title */}
        <h2 className="text-md font-bold text-gray-700">{currentMonth}</h2>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span>Email Campaign</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span>SMS Campaign</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
            <span>Marketing Event</span>
          </div>
        </div>
        </div>

      {/* FullCalendar */}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        events={events}
        height="auto"
        datesSet={updateMonthTitle} // update title when navigating
      />

      {/* Modal */}
      <MarketingEventModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default MarketingCalendar;
