import Logo from "assets/app-logo/logo-text.svg?.react";
import { useEffect, useState } from "react";
import { useDisclosure } from "hooks";
import CommitmentAgreementModal from "./AgreementModal";
import { Link, useNavigate, useParams } from "react-router";
import axios from "utils/axios";
import { toast } from "sonner";
export default function SubscriptionPlan() {
  const buttonStyle = {
    background: "linear-gradient(to right, #b8860b, #d4af37, #ffd700)",
  };

  const goProFeatures = [
    "Unlimited Lead Tracking",
    "Advanced Analytics Dashboard",
    "Priority Support (24/7)",
    "Cloud Sync & Security",
  ];

  // const [billingType, setBillingType] = useState("yearly");
  const [loading, setLoading] = useState(false);
  const [isOpen, { open, close }] = useDisclosure(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const params = useParams();
  const navigate = useNavigate();
  const validateToken = () => {
    setLoading(true);
    axios
      .get(`/pricing/my-details-for-platform-subscription`, {
        headers: params.token
          ? { Authorization: `Bearer ${params.token}` }
          : {},
      })
      .then((response) => {
        console.log("response", response);
        if (response.data.status !== 200) {
          navigate(-1);
          toast.error(response?.data?.message || "Validation Failed!");
        } else {
          fetchDetails();
        }
      })
      .catch((error) => {
        navigate(-1);
        toast.error(error?.message || "validation failed");
      });
  };
  const fetchDetails = () => {
    axios
      .get(`/pricing/platform-subscription-plans-for-subscribing`, {
        headers: params.token
          ? { Authorization: `Bearer ${params.token}` }
          : {},
      })
      .then((response) => {
        if (response.data.status === 200) {
          setPlans(response.data.data);
        } else {
          toast.error(response.data.message || "Failed to fetch Plans");
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to fetch plans");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    validateToken();
  }, []);
  useEffect(() => {
    if (plans && plans.length > 0) {
      const middle = document.body.scrollHeight / 2;
      window.scrollTo({
        top: middle,
        behavior: "smooth",
      });
    }
  }, [plans]);
  return (
    <main className="flex min-h-screen flex-col items-center bg-white px-4 py-8">
      <div className="mb-4 flex flex-col items-center">
        <img
          src={Logo}
          alt="Starter Pro Leads Logo"
          className="h-30 w-auto object-contain"
        />
        <Link
          className="mt-3 font-semibold text-[#0a2463] transition-colors hover:text-[#081b4d] hover:underline"
          to="/login"
        >
          {" "}
          ← Back to Login
        </Link>
      </div>

      <div className="mb-10 max-w-2xl text-center">
        <h1 className="mb-2 text-3xl font-extrabold text-[#0a2463]">
          Unlock Your Lead Management Platform
        </h1>
        <p className="text-base text-gray-600">
          Activate your account to start transforming business
        </p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
          <span className="ml-2 text-gray-900 dark:text-gray-100">
            Loading...
          </span>
        </div>
      ) : (
        <>
          {/* Billing Switch */}
          {/* <div className="mb-8 flex items-center gap-4">
            <span
              className={`text-sm font-semibold ${billingType === "monthly" ? "text-[#0a2463]" : "text-gray-400"}`}
            >
              For 1 Month of Access
            </span>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={billingType === "yearly"}
                onChange={() =>
                  setBillingType(
                    billingType === "yearly" ? "monthly" : "yearly",
                  )
                }
              />
              <div className="peer h-6 w-12 rounded-full bg-gray-300 transition-all peer-checked:bg-[#0a2463] peer-focus:outline-none"></div>
              <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-md transition-all peer-checked:translate-x-6"></div>
            </label>

            <span
              className={`text-sm font-semibold ${billingType === "yearly" ? "text-[#0a2463]" : "text-gray-400"}`}
            >
              For 1 Year of Access
            </span>
          </div> */}

          <div className="mx-auto mt-3 w-full max-w-5xl">
            {/* FEATURES – COMPACT */}
            {/* FEATURES – SINGLE LINE ON DESKTOP */}
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
              <h2 className="mb-4 text-center text-xl font-bold text-[#0a2463]">
                What&apos;s Included
              </h2>

              <ul className="grid grid-cols-1 gap-3 text-gray-700 sm:grid-cols-2 lg:grid-cols-3">
                {goProFeatures.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 text-[#0a2463]">✔</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-center text-xs text-gray-500">
                These features apply to all plans.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-6">
              {plans?.map((planItem, index) => (
                <div
                  key={index}
                  className="/* slightly bigger cards */ /* more padding but not too much */ w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-md transition-all hover:shadow-lg"
                >
                  <h3 className="text-xl font-bold text-[#0a2463]">
                    {planItem.title}
                  </h3>

                  <div className="mt-3 text-4xl font-extrabold text-[#0a2463]">
                    ${planItem.unit_price}
                    <span className="text-base font-medium text-gray-500">
                      {" "}
                      /month
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">Billed Monthly</p>

                  <button
                    style={buttonStyle}
                    onClick={() => {
                      setSelectedPlan(planItem);
                      open();
                    }}
                    className="mt-6 w-full rounded-md py-3 text-lg font-semibold text-gray-900 shadow-md transition-all hover:opacity-90"
                  >
                    Activate Account
                  </button>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="mt-6 w-full pt-3 text-center text-[11px] text-gray-500">
              Your subscription will automatically renew unless you cancel.
            </div>
          </div>

          <div className="mt-8 w-full pt-4 text-center text-xs text-gray-500">
            <p>
              Your subscription will automatically renew unless you cancel
              through the Privacy Policy and Terms of Service.
            </p>
          </div>
        </>
      )}

      <CommitmentAgreementModal
        isOpen={isOpen}
        onClose={close}
        selectedPlan={selectedPlan}
        // billingType={billingType}
      />
    </main>
  );
}
