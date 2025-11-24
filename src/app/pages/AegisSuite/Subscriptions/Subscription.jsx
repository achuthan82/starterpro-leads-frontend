import { Card } from "components/ui";
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Logo from "assets/app-logo/logo-text.svg?.react"; 
import { useState } from "react";
import { useDisclosure } from "hooks";
import CommitmentAgreementModal from "./AgreementModal";
export default function SubscriptionPlan() {

  const FeatureItem = ({ text, active = true }) => {
    const activeIconColor = 'text-[#0a2463]'; 
    const inactiveIconColor = 'text-gray-400'; 
    const textColor = 'text-gray-500'; 

    return (
      <li className="flex items-center gap-2">
        <CheckCircleIcon className={`h-5 w-5 ${active ? activeIconColor : inactiveIconColor}`} /> 
        <span className={`text-base font-medium ${textColor}`}>
          {text}
        </span>
      </li>
    );
  };

  const PricingCard = ({
    title,
    features,
    price,
    period,
    subText,
    buttonText,
    isLeftCard
  }) => {
    
    const cardBorderClasses = isLeftCard 
      ? "border-t-[4px] border-t-[#0a2463] border-gray-100 shadow-lg" 
      : "border-t-[4px] border-t-[#ffd700] border-gray-100 shadow-md";
    
    const buttonStyle = {
      background:"linear-gradient(to right, #b8860b, #d4af37, #ffd700)",
    };
      
    return (
      <Card className={`flex-1 min-w-[300px] max-w-lg transition-all duration-300 ${cardBorderClasses} p-6`}>
        
        <div className={`flex justify-start mb-1`}>
          <div className="flex flex-col">
            <div className="flex items-center">
              {isLeftCard && <CheckCircleIcon className="h-10 w-10 text-[#0a2463] mr-2" />} 
              <h3 className={`text-2xl font-bold ${isLeftCard ? 'text-[#0a2463]' : 'text-gray-700'}`}>
                {title}
              </h3>
            </div>
          </div>
        </div>

        {isLeftCard ? (
          <ul className="text-[#0a2463] text-left space-y-4 pt-4 ml-2">
            {features.map((feature, index) => (
              <FeatureItem key={index} text={feature} active={true} />
            ))}
          </ul>
        ) : (
          <div className="text-left mt-5">
            <p className="text-4xl font-extrabold text-[#0a2463] my-2">
              {price} <span className="text-xl font-semibold">{period}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {subText} &nbsp;
            </p>
            
            <button
              onClick={open}
              className="w-full py-3 rounded-md font-semibold text-gray-900 text-lg transition-all duration-300 hover:opacity-90 shadow-md"
              style={buttonStyle}
            >
              {buttonText}
            </button>
          </div>
        )}
      </Card>
    );
  };

  const goProFeatures = [
    "Unlimited Lead Tracking",
    "Advanced Analytics Dashboard",
    "Priority Support (24/7)",
    "Cloud Sync & Security",
  ];

  // NEW: Billing toggle state
  const [billingType, setBillingType] = useState("yearly");

  const yearlyPrice = "$49.99";
  const monthlyPrice = "$69.99";
   const [isOpen, { open, close }] = useDisclosure(false);

  return (
    <main className="min-h-screen flex flex-col items-center bg-white px-4 py-8">
      
      <div className="mb-4 flex flex-col items-center">
        <img
          src={Logo}
          alt="Starter Pro Leads Logo"
          className="h-30 w-auto object-contain"
        />
      </div>

      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-3xl font-extrabold text-[#0a2463] mb-2">
          Unlock Your Lead Management Platform
        </h1>
        <p className="text-base text-gray-600">
          Activate your account to start transforming business
        </p>
      </div>

      {/* Billing Switch */}
      <div className="flex items-center gap-4 mb-8">
        <span className={`text-sm font-semibold ${billingType === "monthly" ? "text-[#0a2463]" : "text-gray-400"}`}>
          For 1 Month of Access
        </span>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={billingType === "yearly"}
            onChange={() => setBillingType(billingType === "yearly" ? "monthly" : "yearly")}
          />
          <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-[#0a2463] transition-all"></div>
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-6"></div>
        </label>

        <span className={`text-sm font-semibold ${billingType === "yearly" ? "text-[#0a2463]" : "text-gray-400"}`}>
          For 1 Year of Access
        </span>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 max-w-4xl w-full justify-center">
        
        <PricingCard
          title="Plan Features"
          features={goProFeatures}
          isLeftCard={true}
        />

        <PricingCard
          title="Premium Access"
          price={billingType === "yearly" ? yearlyPrice : monthlyPrice}
          period={billingType === "yearly" ? "/MONTH" : ""}
          subText={billingType === "yearly" ? "Billed Monthly" : " "}
          buttonText={"Activate Account"}
          isLeftCard={false}
        />
      </div>

      <div className="mt-8 pt-4 w-full text-center text-xs text-gray-500">
        <p>Your subscription will automatically renew unless you cancel through the Privacy Policy and Terms of Service.</p>
      </div>
      <CommitmentAgreementModal isOpen={isOpen} onClose={close} billingType={billingType}/>

    </main>
  );
}
