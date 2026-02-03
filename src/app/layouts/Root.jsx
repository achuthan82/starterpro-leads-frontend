// Import Dependencies
import { Outlet, ScrollRestoration } from "react-router";
import { lazy } from "react";

// Local Imports
import { Progress } from "components/template/Progress";
import { Loadable } from "components/shared/Loadable";

const Toaster = Loadable(lazy(() => import("components/template/Toaster")));
const Tooltip = Loadable(lazy(() => import("components/template/Tooltip")));
const StickyCallBar = Loadable(lazy(() => import("components/shared/StickyCallBar")));
const RenewalAlert = Loadable(lazy(() => import("components/shared/RenewalAlert")));
const LeadCountReminderAlert = Loadable(lazy(() => import("components/shared/LeadCountReminderAlert")));

// ----------------------------------------------------------------------

function Root() {
  return (
    <>
      <Progress />
      <ScrollRestoration />
      <RenewalAlert />
      <LeadCountReminderAlert />
      <Outlet />
      <Tooltip />
      <Toaster />
      <StickyCallBar />
    </>
  );
}

export default Root;