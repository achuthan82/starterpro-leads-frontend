import { useNavigate } from "react-router";
import { Button } from "components/ui";
import { XCircleIcon } from "@heroicons/react/24/outline";
const CheckoutCancel = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 transition-colors duration-300 dark:bg-gray-900">
      <div className="w-full max-w-[750px] rounded-lg border border-gray-200 bg-white p-8 text-center shadow-md transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
        <XCircleIcon className="mx-auto mb-6 h-24 w-24 text-red-500 dark:text-red-400" />

        <h2 className="mb-2 text-2xl font-semibold text-[#75150b] dark:text-[#ff9770]">
          Subscription Cancelled
        </h2>

        <p className="mb-4 text-gray-600 dark:text-gray-300">
          Your subscription was cancelled. No charges were made to your account.
        </p>

        <div className="mt-6">
          <Button
            onClick={() => navigate("/subscriptions")}
            className="inline-block rounded-md bg-red-600 px-5 py-2 font-semibold text-white transition-colors duration-200 hover:bg-red-700 dark:bg-red-400 dark:hover:bg-red-500"
          >
            Back to Subscriptions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancel;
