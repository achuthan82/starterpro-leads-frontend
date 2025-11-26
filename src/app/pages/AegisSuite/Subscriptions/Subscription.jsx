// import { Card } from "components/ui";
// import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Logo from "assets/app-logo/logo-text.svg?.react";
import { useEffect, useState } from "react";
import { useDisclosure } from "hooks";
import CommitmentAgreementModal from "./AgreementModal";
import { useNavigate, useParams } from "react-router";
import axios from "utils/axios";
import { toast } from "sonner";
export default function SubscriptionPlan() {
  // const FeatureItem = ({ text, active = true }) => {
  //   const activeIconColor = "text-[#0a2463]";
  //   const inactiveIconColor = "text-gray-400";
  //   const textColor = "text-gray-500";

  //   return (
  //     <li className="flex items-center gap-2">
  //       <CheckCircleIcon
  //         className={`h-5 w-5 ${active ? activeIconColor : inactiveIconColor}`}
  //       />
  //       <span className={`text-base font-medium ${textColor}`}>{text}</span>
  //     </li>
  //   );
  // };

  // const PricingCard = ({
  //   title,
  //   features,
  //   price,
  //   period,
  //   subText,
  //   buttonText,
  //   isLeftCard,
  // }) => {
  //   const cardBorderClasses = isLeftCard
  //     ? "border-t-[4px] border-t-[#0a2463] border-gray-100 shadow-lg"
  //     : "border-t-[4px] border-t-[#ffd700] border-gray-100 shadow-md";

  //   const buttonStyle = {
  //     background: "linear-gradient(to right, #b8860b, #d4af37, #ffd700)",
  //   };

  //   return (
  //     <Card
  //       className={`max-w-lg min-w-[300px] flex-1 transition-all duration-300 ${cardBorderClasses} p-6`}
  //     >
  //       <div className={`mb-1 flex justify-start`}>
  //         <div className="flex flex-col">
  //           <div className="flex items-center">
  //             {isLeftCard && (
  //               <CheckCircleIcon className="mr-2 h-10 w-10 text-[#0a2463]" />
  //             )}
  //             <h3
  //               className={`text-2xl font-bold ${isLeftCard ? "text-[#0a2463]" : "text-gray-700"}`}
  //             >
  //               {title}
  //             </h3>
  //           </div>
  //         </div>
  //       </div>

  //       {isLeftCard ? (
  //         <ul className="ml-2 space-y-4 pt-4 text-left text-[#0a2463]">
  //           {features.map((feature, index) => (
  //             <FeatureItem key={index} text={feature} active={true} />
  //           ))}
  //         </ul>
  //       ) : (
  //         <div className="mt-5 text-left">
  //           <p className="my-2 text-4xl font-extrabold text-[#0a2463]">
  //             {price} <span className="text-xl font-semibold">{period}</span>
  //           </p>
  //           <p className="mb-6 text-sm text-gray-500">{subText} &nbsp;</p>

  //           <button
  //             onClick={open}
  //             className="w-full rounded-md py-3 text-lg font-semibold text-gray-900 shadow-md transition-all duration-300 hover:opacity-90"
  //             style={buttonStyle}
  //           >
  //             {buttonText}
  //           </button>
  //         </div>
  //       )}
  //     </Card>
  //   );
  // };

  const goProFeatures = [
    "Unlimited Lead Tracking",
    "Advanced Analytics Dashboard",
    "Priority Support (24/7)",
    "Cloud Sync & Security",
  ];

  // NEW: Billing toggle state
  // const [billingType, setBillingType] = useState("yearly");
  const [loading, setLoading] = useState(false);
  // const yearlyPrice = "$49.99";
  // const monthlyPrice = "$69.99";
  const [isOpen, { open, close }] = useDisclosure(false);
  const [plans, setPlans] = useState(null);
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
  return (
    <main className="flex min-h-screen flex-col items-center bg-white px-4 py-8">
      <div className="mb-4 flex flex-col items-center">
        <img
          src={Logo}
          alt="Starter Pro Leads Logo"
          className="h-30 w-auto object-contain"
        />
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

          <div className="mx-auto mt-10 w-full max-w-6xl">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* LEFT FEATURES CARD (spans 1 column on desktop) */}
              <div className="lg:col-span-1">
                <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                  <h2 className="mb-4 text-2xl font-bold text-[#0a2463]">
                    Plan Features
                  </h2>

                  <ul className="mt-4 space-y-3 text-gray-700">
                    {goProFeatures.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 text-[#0a2463]">✔</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-6 text-sm text-gray-500">
                    Choose a plan to activate your account.
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE PLANS (2 columns on large screens) */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-2">
                {plans?.map((planItem, index) => (
                  <div
                    key={index}
                    className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-md transition-all hover:shadow-lg"
                  >
                    <h3 className="text-xl font-bold text-[#0a2463]">
                      {planItem.title}
                    </h3>

                    <div className="mt-4 text-4xl font-extrabold text-[#0a2463]">
                      ${planItem.unit_price}
                      <span className="text-base font-medium text-gray-500">
                        {" "}
                        /month
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-500">Billed Monthly</p>

                    <div className="mt-6">
                      <button
                        onClick={() => {
                          setSelectedPlan(planItem);
                          open();
                        }}
                        className="w-full rounded-lg bg-[#0a2463] py-3 font-semibold text-white transition-all hover:bg-[#081b4d]"
                      >
                        Activate Account
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 w-full pt-4 text-center text-xs text-gray-500">
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
