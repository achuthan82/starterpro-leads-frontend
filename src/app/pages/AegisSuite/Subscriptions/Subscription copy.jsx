import Logo from "assets/app-logo/logo-text.svg?.react";
import { Card } from "components/ui";
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function SubscriptionPlan() {
  
  const FeatureItem = ({ text, active }) => {
    const activeColor = 'text-[#ffd700]'; 
    const inactiveColor = 'text-gray-400'; 
    const textColor = active ? 'text-[#0a2463]' : 'text-gray-500';

    return (
      <li className="flex items-center gap-2">
        {active ? (
          <CheckCircleIcon className={`h-5 w-5 ${activeColor}`} />
        ) : (
          <CheckCircleIcon className={`h-5 w-5 ${inactiveColor}`} />
        )}
        <span className={`text-base ${textColor}`}>
          {text}
        </span>
      </li>
    );
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-[#f2f2f2] px-4 py-6">

      <div className="mb-3 flex flex-col items-center">
        <img
          src={Logo}
          alt="Logo"
          className="h-35 w-auto object-contain"
        />
      </div>

      <Card className="w-full max-w-[320px] bg-white shadow-2xl shadow-gray-300 p-8 text-center" style={{borderRadius: '10%'}}>
        <h2 className="text-2xl font-bold text-[#0a2463] mb-2">
          Basic
        </h2>

        <div className="relative pb-4 mb-4">
          <p className="text-6xl font-extrabold text-[#ffd700]">
            $49.99
          </p>
          <div 
            className="absolute left-1/2 bottom-0 w-20 h-1 transform -translate-x-1/2" 
            style={{ 
              background: 'linear-gradient(to right, transparent, #ffd700 50%, transparent)',
              filter: 'blur(1px) opacity(0.9)', // Add a slight blur and reduce opacity for a softer look
              width: '100px', // Explicit width, could also use Tailwind's w-20
              height: '3px' // Height of the visual line
            }}
          ></div>
        </div>
        
        <ul className="text-[#0a2463] text-left mt-6 space-y-4">
          <FeatureItem text="Lorem ipsum dolor" active={true} />
          <FeatureItem text="Lorem ipsum dolor" active={false} />
          <FeatureItem text="Lorem ipsum dolor" active={true} />
          <FeatureItem text="Lorem ipsum dolor" active={false} />
        </ul>

        <button
          className="mt-8 w-full py-3 rounded-xl font-semibold text-gray-900 text-lg transition-all duration-300 hover:opacity-90"
          style={{
            background:
              "linear-gradient(to right, #b8860b, #d4af37, #ffd700)",
          }}
        >
          Subscription
        </button>
      </Card>
    </main>
  );
}