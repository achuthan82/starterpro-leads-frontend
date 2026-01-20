import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "components/ui";
import { useNavigate } from "react-router";

const CheckoutSuccessNew = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 transition-colors duration-300 dark:bg-gray-900">
      <div className="w-full max-w-[650px] rounded-lg border border-gray-200 bg-white p-10 text-center shadow-md transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">

        {/* Success Icon */}
        <CheckCircleIcon className="mx-auto mb-6 h-24 w-24 text-green-500 dark:text-green-400" />

        {/* Title */}
        <h2 className="mb-3 text-3xl font-bold text-green-700 dark:text-green-300">
          Payment Successful!
        </h2>

        {/* Short Message */}
        <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
          Thank you! Your subscription is now active and ready to use.
        </p>

        {/* Optional Subtext */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You can now access all premium features inside your account.
        </p>

        {/* Button */}
        <div className="mt-8">
          <Button
            onClick={() => navigate("/login")}
            className="inline-block rounded-md bg-green-600 px-6 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-green-700 dark:bg-blue-400 dark:hover:bg-blue-500"
          >
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessNew;
