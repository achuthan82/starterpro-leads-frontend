// Import Dependencies
import { Outlet, ScrollRestoration } from "react-router";
import { lazy } from "react";

// Local Imports
import { Progress } from "components/template/Progress";
import { Loadable } from "components/shared/Loadable";

const Toaster = Loadable(lazy(() => import("components/template/Toaster")));
const Tooltip = Loadable(lazy(() => import("components/template/Tooltip")));
const StickyCallBar = Loadable(lazy(() => import("components/shared/StickyCallBar")));

// ----------------------------------------------------------------------

function Root() {
  return (
    <>
      <Progress />
      <ScrollRestoration />
      <Outlet />
      <Tooltip />
      <Toaster />
      <StickyCallBar />
    </>
  );
}

export default Root;