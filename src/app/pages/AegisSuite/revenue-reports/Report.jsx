import {
  ArrowDownTrayIcon,
  ArrowUpIcon,
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  StarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import SharedSidebar from "../components/SharedSidebar";
import { Button, Card } from "components/ui";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import revenueService from "utils/revenueservice";
import moment from "moment";
const Report = () => {
  const dateError = null;
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
  const monthlyRevenue = [
    {
      month: "Jan 2025",
      new_mmr: "$12,323",
      churned_mmr: `-$14560`,
      net_mmr: "$23434",
      total_mmr: "$555",
      growth_rate: "+55%",
      trend: "up",
    },
    {
      month: "Feb 2025",
      new_mmr: "$12,323",
      churned_mmr: `-$14560`,
      net_mmr: "$23434",
      total_mmr: "$555",
      growth_rate: "+55%",
      trend: "up",
    },
    {
      month: "March 2025",
      new_mmr: "$12,323",
      churned_mmr: `-$14560`,
      net_mmr: "$23434",
      total_mmr: "$555",
      growth_rate: "+55%",
      trend: "up",
    },
    {
      month: "April 2025",
      new_mmr: "$12,323",
      churned_mmr: `-$14560`,
      net_mmr: "$23434",
      total_mmr: "$555",
      growth_rate: "+55%",
      trend: "up",
    },
  ];
  const loading = false;
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const [startDate, setStartDate] = useState(
    thirtyDaysAgo.toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);
  const [revenuePlans, setRevenuePlans] = useState([]);
  const colors = ["#5ab453", "#92c933", "#0a2463", "#506877"];

  useEffect(() => {
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be after the end date.");
    } else {
      const formattedStart = moment(startDate).format("MM-DD-YYYY");
      const formattedEnd = moment(endDate).format("MM-DD-YYYY");
      getRevenuePlans(formattedStart, formattedEnd);
    }
  }, [startDate, endDate]);
  const getRevenuePlans = (start, end) => {
    revenueService
      .getPlans(start, end)
      .then((resp) => {
        if (resp.data.status === 200) {
          setRevenuePlans(resp.data.data);
        } else {
          setRevenuePlans([]);
        }
      })
      .catch(() => {
        setRevenuePlans([]);
      });
  };
  return (
    <div>
      <div className="flex h-screen bg-[var(--color-ecru-white)]">
        {/* Sidebar */}
        <SharedSidebar currentPath="/revenue-report" />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-atoll)]">
                  Revenue Reports
                </h1>
                <p className="mt-1 text-gray-600">
                  Comprehensive financial analytics and insights
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Start Date */}
                <div>
                  {/* <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label> */}
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      max={endDate} // prevent selecting future dates beyond end date
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-[var(--color-atoll)]"
                    />
                    <CalendarIcon className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <span className="font-medium text-neutral-500">to</span>
                {/* End Date */}
                <div className="mr-2">
                  {/* <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label> */}
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`w-full rounded-lg border py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-[var(--color-atoll)] ${
                        dateError ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    <CalendarIcon className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                  </div>
                  {/* {dateError && (
                  <p className="mt-1 text-sm text-red-600">{dateError}</p>
                )} */}
                </div>
                <Button variant="outlined" color="primary">
                  {" "}
                  <DocumentArrowDownIcon className="mr-1 size-5" /> Generate
                  Report
                </Button>
                <Button variant="outlined" color="primary">
                  {" "}
                  <ArrowDownTrayIcon className="mr-1 size-5" /> Export All
                </Button>
              </div>
            </div>
          </header>
          <main className="mt-1 flex-1 overflow-auto p-6">
            <div className="grid w-full grid-cols-12 gap-3">
              <div className="col-span-12 md:col-span-3">
                <Card
                  className="shieldnest-white-column p-6"
                  style={{ borderLeft: `5px solid ${randomColors[0]}` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Monthly Recruiting Revenue
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        $47,250
                      </p>
                    </div>
                    <div className="shieldnest-bg1 flex h-12 w-12 items-center justify-center rounded-full">
                      <CurrencyDollarIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>
              </div>
              <div className="col-span-12 md:col-span-3">
                <Card
                  className="shieldnest-white-column p-6"
                  style={{ borderLeft: `5px solid rgb(6 127 173)` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Annual Recuring Revenue
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        $567,000
                      </p>
                    </div>
                    <div className=" flex h-12 w-12 items-center justify-center rounded-full" style={{backgroundColor:'rgb(6 127 173)'}}>
                      <ChartBarIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>
              </div>
              <div className="col-span-12 md:col-span-3">
                <Card
                  className="shieldnest-white-column p-6"
                  style={{ borderLeft: `5px solid ${randomColors[1]}` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Average Revenue Per User
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        $1
                      </p>
                    </div>
                    <div className="shieldnest-bg2 flex h-12 w-12 items-center justify-center rounded-full">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>
              </div>
              <div className="col-span-12 md:col-span-3">
                <Card
                  className="shieldnest-white-column p-6"
                  style={{ borderLeft: `5px solid ${randomColors[2]}` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Customer Life Time Value
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        $1
                      </p>
                    </div>
                    <div className="shieldnest-bg3 flex h-12 w-12 items-center justify-center rounded-full">
                      <StarIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            <div className="mt-4">
              <div className="grid w-full grid-cols-12 gap-3">
                <div className="col-span-12 w-full md:col-span-6">
                  <Card className="p-6">
                    <div className="mt-1 border-b border-neutral-300 pb-5">
                      <h4 className="text-primary text-xl font-semibold">
                        Revenue By Plan
                      </h4>
                    </div>
                    {revenuePlans && revenuePlans.length > 0 ? (
                      revenuePlans.map((item, index) => {
                        return (
                          <div
                            className="border-b border-neutral-300 py-4"
                            key={index}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{
                                    backgroundColor: `${colors[index] || "#5ab453"}`,
                                  }}
                                ></div>
                                <div>
                                  <p className="text-lg font-semibold">
                                    {item?.plan}
                                  </p>
                                  <span className="font-neutral text-xs text-neutral-500">
                                    {item?.orders_count} Subscribers
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="text-lg font-semibold">
                                  ${item?.total_revenue}
                                </p>
                                <span className="font-neutral text-xs text-neutral-500">
                                  30%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-lg font-neutral">
                        <span>No Plans Found</span>
                      </div>
                    )}

                    {/* <div className="border-b border-neutral-300 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "#92c933" }}
                          ></div>
                          <div>
                            <p className="text-lg font-semibold">Gold Mailer</p>
                            <span className="font-neutral text-xs text-neutral-500">
                              485 Subscribers
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">$23.56</p>
                          <span className="font-neutral text-xs text-neutral-500">
                            30%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border-b border-neutral-300 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "#0a2463" }}
                          ></div>
                          <div>
                            <p className="text-lg font-semibold">
                              Bronze Mailer
                            </p>
                            <span className="font-neutral text-xs text-neutral-500">
                              485 Subscribers
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">$23.56</p>
                          <span className="font-neutral text-xs text-neutral-500">
                            30%
                          </span>
                        </div>
                      </div>
                    </div> */}
                    {/* <div className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "#506877" }}
                          ></div>
                          <div>
                            <p className="text-lg font-semibold">
                              Platinum Mailer
                            </p>
                            <span className="font-neutral text-xs text-neutral-500">
                              485 Subscribers
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">$23.56</p>
                          <span className="font-neutral text-xs text-neutral-500">
                            30%
                          </span>
                        </div>
                      </div>
                    </div> */}
                  </Card>
                </div>
                <div className="col-span-12 w-full md:col-span-6">
                  <Card className="p-6">
                    <div className="mt-1 border-b border-neutral-300 pb-5">
                      <h4 className="text-primary text-xl font-semibold">
                        Add on Revenue
                      </h4>
                    </div>
                    <div className="border-b border-neutral-300 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "#5ab453" }}
                          ></div>
                          <div>
                            <p className="text-lg font-semibold">
                              Dialer Add On
                            </p>
                            <span className="font-neutral text-xs text-neutral-500">
                              485 Subscribers
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">$23.56</p>
                          <span className="font-neutral text-xs text-neutral-500">
                            30%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border-b border-neutral-300 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "#92c933" }}
                          ></div>
                          <div>
                            <p className="text-lg font-semibold">
                              Team Management
                            </p>
                            <span className="font-neutral text-xs text-neutral-500">
                              485 Subscribers
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">$23.56</p>
                          <span className="font-neutral text-xs text-neutral-500">
                            30%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border-b border-neutral-300 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "#0a2463" }}
                          ></div>
                          <div>
                            <p className="text-lg font-semibold">
                              Lead Marketplace
                            </p>
                            <span className="font-neutral text-xs text-neutral-500">
                              485 Subscribers
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">$23.56</p>
                          <span className="font-neutral text-xs text-neutral-500">
                            30%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "#506877" }}
                          ></div>
                          <div>
                            <p className="text-lg font-semibold">Setup Fees</p>
                            <span className="font-neutral text-xs text-neutral-500">
                              485 Subscribers
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-semibold">$23.56</p>
                          <span className="font-neutral text-xs text-neutral-500">
                            30%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
            <Card className="mt-5 p-6">
              <div className="overflow-x-auto">
                <div className="mb-3">
                  <h4 className="text-left text-xl font-semibold">
                    Monthly Revenue
                  </h4>
                </div>
                <table className="w-full">
                  <thead className="bg-primary-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        New MMR
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Churned MMR
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Net MMR
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Total MMR
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Growth Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
                            <span className="ml-2 text-gray-900 dark:text-gray-100">Loading data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : monthlyRevenue.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No Data Found
                        </td>
                      </tr>
                    ) : (
                      monthlyRevenue.map((revenue) => (
                        <tr key={revenue.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-lg font-normal">
                              {revenue.month}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-success text-lg font-normal">
                              {revenue.new_mmr}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-error text-lg font-normal">
                              {revenue.churned_mmr}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-success text-lg font-semibold">
                              {revenue.net_mmr}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-success text-lg font-semibold">
                              {revenue.total_mmr}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-success text-lg font-normal">
                              {revenue.growth_rate}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button color="success" isIcon className="size-7">
                              <ArrowUpIcon className="size-5 stroke-2" />
                              {/* <span>Accept</span> */}
                            </Button>{" "}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Report;
