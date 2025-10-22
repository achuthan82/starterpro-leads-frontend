// Local Imports
import AegisSuiteLoader from "app/pages/AegisSuite/components/AegisSuiteLoader";

// ----------------------------------------------------------------------

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-[var(--color-ecru-white)] flex items-center justify-center">
      <AegisSuiteLoader size="xl" text="Loading Starterpro Leads..." />
    </div>
  );
}
