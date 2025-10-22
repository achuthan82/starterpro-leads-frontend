import { Outlet } from "react-router";

// Standalone layout for AegisSuite - removes all framework components
export default function AegisSuiteLayout() {
  return (
    <div className="min-h-screen w-full overflow-hidden">
      <Outlet />
    </div>
  );
}
