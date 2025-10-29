import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import axios from "axios";
import { JWT_HOST_API } from "configs/auth.config";
import { Spinner, Button } from "components/ui";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

const CheckoutSuccess = () => {
  // const user = getUserData()
  const token = localStorage.getItem("authToken");
  const subscriptionAmount = sessionStorage.getItem("subscription_amount");
  const navigate = useNavigate();
  const device = localStorage.getItem("device_type");
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  // const location = useLocation();

  const getOrderDetails = async (sessionId) => {
    setLoading(true);
    const config = {
      method: "get",
      url: `${JWT_HOST_API}/stripe/session/${sessionId}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "x-platform": device,
      },
    };
    axios(config)
      .then(async (response) => {
        setLoading(false);
        if (response.data.status === 200) {
          setOrderDetails(response.data.data);
        } else if (response.data.status === 401) {
          toast.error(response.data.message);
        } else if (response.data.status === 204) {
          return null;
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        setLoading(false);
        if (error && error.message) {
          toast.error(error.message);
        } else {
          toast.error(
            "This Service is not available at the moment..please try again later",
          );
        }
      });
  };

  useEffect(() => {
    const sessionId = sessionStorage.getItem("session_id");
    if (sessionId) {
      getOrderDetails(sessionId);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 transition-colors duration-300 dark:bg-gray-900">
      <div className="w-full max-w-[750px] rounded-lg border border-gray-200 bg-white p-8 text-center shadow-md transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
        <CheckCircleIcon className="mx-auto mb-6 h-24 w-24 text-green-500 dark:text-green-400" />

        <h2 className="mb-2 text-2xl font-semibold text-green-700 dark:text-green-300">
          Subscription Successful!
        </h2>

        <p className="mb-4 text-gray-600 dark:text-gray-300">
          {orderDetails?.payment_status === "no_payment_required"
            ? "Thank you for your purchase. Your subscription has been received and is being processed."
            : "Thank you for your purchase. Your order has been received and is being processed."}
        </p>

        {loading && <Spinner />}

        {orderDetails && (
          <div className="mt-4 text-left">
            <h5 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-200">
              Order Details
            </h5>
            <p className="text-gray-700 dark:text-gray-300">
              Order ID:{" "}
              {orderDetails?.invoice_id || orderDetails?.subscription_id}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Amount: ${subscriptionAmount || orderDetails?.amount_total}
            </p>
            <p
              className="text-gray-700 dark:text-gray-300"
              style={{ textTransform: "capitalize" }}
            >
              Payment Status:{" "}
              {orderDetails?.payment_status === "no_payment_required"
                ? "In Progress"
                : orderDetails?.payment_status}
            </p>
          </div>
        )}

        <div className="mt-6">
          <Button
            onClick={() => navigate("/subscriptions")}
            className="inline-block rounded-md bg-green-600 px-5 py-2 font-semibold text-white transition-colors duration-200 hover:bg-green-700 dark:text-gray-100 dark:bg-blue-400 dark:hover:bg-blue-500"
          >
            Return to Subscriptions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
