import { useState } from "react";
import SharedSidebar from "../components/SharedSidebar";
import { Cog6ToothIcon, EyeIcon } from "@heroicons/react/24/outline";
const Suppression = () => {
  const leads = [
    {
      address: "5213 Ortega St",
      agent_id: 1002,
      appointment_notification_mail_enabled: true,
      appointment_notification_sms_enabled: true,
      assignee_id: 2424,
      call_in_date_time: "05-25-2025 07:09:28",
      campaign_name: "Test",
      city: "Sacramento",
      completed: true,
      first_name: "Marc",
      full_name: "Marc Wheeler",
      ivr_logs: [],
      ivr_response: {
        ani: "+919207243299",
        mortgage_id: "71000016",
        sid: "CAccc389d640a5795d66c9f49133830058",
        status: "incomplete",
        timestamp: "06-18-2025 16:02:15",
      },
      last_name: "Wheeler",
      lead_status: 3,
      lender_name: "CORNERSTONE FUNDING INC",
      loan_amount: 417793,
      loan_date: "06-09-2025",
      mortgage_id: "2005000",
      notes: null,
      show_up: false,
      sms_automation_enabled: true,
      source_id: 1,
      state: "CA",
      suppression_rejection_msg: null,
      zip: "95820-5835",
    },
    {
      address: "2688 Clay St",
      agent_id: 1002,
      appointment_notification_mail_enabled: true,
      appointment_notification_sms_enabled: true,
      assignee_id: 2423,
      call_in_date_time: "05-25-2025 07:09:28",
      campaign_name: "Test",
      city: "Sacramento",
      completed: true,
      first_name: "Gregory",
      full_name: "Gregory Davis",
      ivr_logs: [],
      ivr_response: {
        ani: "+919746405636",
        mortgage_id: "71000016",
        sid: "CAccc389d640a5795d66c9f49133830058",
        status: "incomplete",
        timestamp: "06-18-2025 16:02:15",
      },
      last_name: "Davis",
      lead_status: 7,
      lender_name: "SUCCESS LENDING LLC",
      loan_amount: 415000,
      loan_date: "06-09-2025",
      mortgage_id: "2004998",
      notes: null,
      show_up: false,
      sms_automation_enabled: false,
      source_id: 1,
      state: "CA",
      suppression_rejection_msg: null,
      zip: "95815-2314",
    },
    {
      address: "8625 Vizela Way",
      agent_id: 1002,
      appointment_notification_mail_enabled: true,
      appointment_notification_sms_enabled: true,
      assignee_id: 2422,
      call_in_date_time: "05-25-2025 07:09:28",
      campaign_name: "Test",
      city: "Elk Grove",
      completed: true,
      first_name: "Norman",
      full_name: "Norman Sun",
      ivr_logs: [],
      ivr_response: {
        ani: "+18663301591",
        mortgage_id: "71000016",
        sid: "CAccc389d640a5795d66c9f49133830058",
        status: "incomplete",
        timestamp: "06-18-2025 16:02:15",
      },
      last_name: "Sun",
      lead_status: 7,
      lender_name: "LOANDEPOT.COM LLC",
      loan_amount: 705500,
      loan_date: "06-05-2025",
      mortgage_id: "2004996",
      notes: null,
      show_up: false,
      sms_automation_enabled: true,
      source_id: 1,
      state: "CA",
      suppression_rejection_msg: null,
      zip: "95757-6319",
    },
    {
      address: "4006 Carriebee Ct",
      agent_id: 1002,
      appointment_notification_mail_enabled: true,
      appointment_notification_sms_enabled: true,
      assignee_id: 2421,
      call_in_date_time: "05-25-2025 07:09:28",
      campaign_name: "Test",
      city: "North Highlands",
      completed: true,
      first_name: "Jerod",
      full_name: "Jerod Horch",
      ivr_logs: [],
      ivr_response: {
        ani: "+18663301591",
        mortgage_id: "71000016",
        sid: "CAccc389d640a5795d66c9f49133830058",
        status: "incomplete",
        timestamp: "06-18-2025 16:02:15",
      },
      last_name: "Horch",
      lead_status: 7,
      lender_name: "UNITED WHOLESALE MORTGAGE",
      loan_amount: 505642,
      loan_date: "06-05-2025",
      mortgage_id: "2004994",
      notes: null,
      show_up: false,
      sms_automation_enabled: false,
      source_id: 1,
      state: "CA",
      suppression_rejection_msg: null,
      zip: "95660-5301",
    },
    {
      address: "5430 Whitney Ct",
      agent_id: 1002,
      appointment_notification_mail_enabled: true,
      appointment_notification_sms_enabled: true,
      assignee_id: 2420,
      call_in_date_time: "05-25-2025 07:09:28",
      campaign_name: "Test",
      city: "Garden Valley",
      completed: true,
      first_name: "Michael",
      full_name: "Michael Hurd",
      ivr_logs: [],
      ivr_response: {
        ani: "+18663301591",
        mortgage_id: "71000016",
        sid: "CAccc389d640a5795d66c9f49133830058",
        status: "incomplete",
        timestamp: "06-18-2025 16:02:15",
      },
      last_name: "Hurd",
      lead_status: 1,
      lender_name: "MORE THAN MORTGAGE INC",
      loan_amount: 613000,
      loan_date: "06-09-2025",
      mortgage_id: "2004992",
      notes: null,
      show_up: false,
      sms_automation_enabled: false,
      source_id: 1,
      state: "CA",
      suppression_rejection_msg: null,
      zip: "95633-9532",
    },
    {
      address: "5216 San Tropez Dr",
      agent_id: 1002,
      appointment_notification_mail_enabled: true,
      appointment_notification_sms_enabled: true,
      assignee_id: 2419,
      call_in_date_time: "05-25-2025 07:09:28",
      campaign_name: "Test",
      city: "Salida",
      completed: true,
      first_name: "Taylin",
      full_name: "Taylin Frost",
      ivr_logs: [],
      ivr_response: {
        ani: "+18663301591",
        mortgage_id: "71000016",
        sid: "CAccc389d640a5795d66c9f49133830058",
        status: "incomplete",
        timestamp: "06-18-2025 16:02:15",
      },
      last_name: "Frost",
      lead_status: 14,
      lender_name: "ASSET FINANCIAL CENTER INC",
      loan_amount: 538000,
      loan_date: "06-09-2025",
      mortgage_id: "2004990",
      notes: null,
      show_up: true,
      sms_automation_enabled: true,
      source_id: 1,
      state: "CA",
      suppression_rejection_msg: null,
      zip: "95368-9611",
    },
    {
      address: "1172 Cobblestone St",
      agent_id: 1002,
      appointment_notification_mail_enabled: true,
      appointment_notification_sms_enabled: true,
      assignee_id: 2340,
      call_in_date_time: "05-25-2025 07:09:28",
      campaign_name: "Test",
      city: "Salinas",
      completed: true,
      first_name: "Jerome",
      full_name: "Jerome Simon",
      ivr_logs: [],
      ivr_response: {
        ani: "+18663301591",
        mortgage_id: "71000016",
        sid: "CAccc389d640a5795d66c9f49133830058",
        status: "incomplete",
        timestamp: "06-18-2025 16:02:15",
      },
      last_name: "Simon",
      lead_status: 1,
      lender_name: "UNITED WHOLESALE MORTGAGE",
      loan_amount: 467500,
      loan_date: "06-06-2025",
      mortgage_id: "2004986",
      notes: null,
      show_up: false,
      sms_automation_enabled: true,
      source_id: 1,
      state: "CA",
      suppression_rejection_msg: null,
      zip: "93905-4811",
    },
    {
      address: "31852 Middlebrook Ln",
      agent_id: 1002,
      appointment_notification_mail_enabled: true,
      appointment_notification_sms_enabled: true,
      assignee_id: 2473,
      call_in_date_time: "05-25-2025 07:09:28",
      campaign_name: "Test",
      city: "Menifee",
      completed: true,
      first_name: "Heather",
      full_name: "Heather Souza",
      ivr_logs: [],
      ivr_response: {
        ani: "+18663301591",
        mortgage_id: "71000016",
        sid: "CAccc389d640a5795d66c9f49133830058",
        status: "incomplete",
        timestamp: "06-18-2025 16:02:15",
      },
      last_name: "Souza",
      lead_status: 3,
      lender_name: "SAXTON MORTGAGE LLC",
      loan_amount: 585000,
      loan_date: "06-02-2025",
      mortgage_id: "2004968",
      notes: null,
      show_up: false,
      sms_automation_enabled: true,
      source_id: 1,
      state: "CA",
      suppression_rejection_msg: null,
      zip: "92584-7481",
    },
    {
      address: "6979 Palm Ct Apt 329",
      agent_id: 1002,
      appointment_notification_mail_enabled: true,
      appointment_notification_sms_enabled: true,
      assignee_id: 2411,
      call_in_date_time: "05-25-2025 07:09:28",
      campaign_name: "Test",
      city: "Riverside",
      completed: true,
      first_name: "Donald",
      full_name: "Donald Zarate Jr",
      ivr_logs: [],
      ivr_response: {
        ani: "+18663301591",
        mortgage_id: "71000016",
        sid: "CAccc389d640a5795d66c9f49133830058",
        status: "incomplete",
        timestamp: "06-18-2025 16:02:15",
      },
      last_name: "Zarate",
      lead_status: 1,
      lender_name: "BARRETT FINANCIAL GROUP LLC",
      loan_amount: 316665,
      loan_date: "06-06-2025",
      mortgage_id: "2004960",
      notes: null,
      show_up: false,
      sms_automation_enabled: true,
      source_id: 1,
      state: "CA",
      suppression_rejection_msg: null,
      zip: "92506-2823",
    },
    {
      address: "859 60th St",
      agent_id: 1002,
      appointment_notification_mail_enabled: true,
      appointment_notification_sms_enabled: true,
      assignee_id: 2381,
      call_in_date_time: "05-25-2025 07:09:28",
      campaign_name: "Test",
      city: "San Diego",
      completed: true,
      first_name: "Jeffrey",
      full_name: "Jeffrey Baker",
      ivr_logs: [],
      ivr_response: {
        ani: "+18663301591",
        mortgage_id: "71000016",
        sid: "CAccc389d640a5795d66c9f49133830058",
        status: "incomplete",
        timestamp: "06-18-2025 16:02:15",
      },
      last_name: "Baker",
      lead_status: 1,
      lender_name: "MORTGAGE RESEARCH CENTER LLC",
      loan_amount: 689512,
      loan_date: "06-06-2025",
      mortgage_id: "2004952",
      notes: null,
      show_up: false,
      sms_automation_enabled: true,
      source_id: 1,
      state: "CA",
      suppression_rejection_msg: null,
      zip: "92114-2408",
    },
  ];
  const [selectedLeads, setSelectedLeads] = useState([]);

  const handleLeadSelection = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
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
  return (
    <div className="flex min-h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      <SharedSidebar currentPath="/lead-management" />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0a2463] dark:text-blue-400">
                Lead Management
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
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedLeads.length === leads.length &&
                          leads.length > 0
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </div>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase">
                      Full Name
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase">
                      Campaign
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase">
                      Registered Date
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase">
                      State
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase">
                      Zip
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase">
                      Automation
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y dark:divide-gray-700">
                  {leads.map((lead) => (
                    <tr
                      key={lead.assignee_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.assignee_id)}
                          onChange={() => handleLeadSelection(lead.assignee_id)}
                          className="h-4 w-4 rounded"
                        />
                      </td>

                      {/* Name */}
                      <td className="px-3 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {lead.full_name}
                        </div>
                      </td>

                      {/* Campaign */}
                      <td className="px-3 py-4">{lead.campaign_name}</td>

                      {/* Date */}
                      <td className="px-3 py-4">{lead.call_in_date_time}</td>

                      {/* State */}
                      <td className="px-3 py-4">{lead.state}</td>

                      {/* Zip */}
                      <td className="px-3 py-4">{lead.zip}</td>

                      {/* Automation */}
                      <td className="px-3 py-4">
                        <Cog6ToothIcon
                          className="h-5 w-5 cursor-pointer"
                          title="View Automation Settings"
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-4">
                        <EyeIcon className="h-4 w-4 cursor-pointer text-[#0a2463]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Suppression;
