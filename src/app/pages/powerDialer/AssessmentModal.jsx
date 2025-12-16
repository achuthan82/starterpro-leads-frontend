import { XMarkIcon } from "@heroicons/react/24/outline";

export default function AssessmentModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const Row = ({ label, value }) => (
    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700 text-sm">
      <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <span className="text-gray-900 dark:text-gray-200">
        {value?.toString() || "-"}
      </span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      onClick={onClose}  // close on outside click
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl w-[650px] max-h-[85vh] shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >

        {/* ✅ Sticky Header */}
        <div className="flex items-center rounded-xl justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-20">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Mortgage Protection Assessment
          </h2>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* ✅ Scrollable Content */}
        <div className="overflow-y-auto p-10 space-y-4">

          {/* STEP 1 - Verifying Information */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-1">
            Step 1 – Verifying Information
          </h3>

          {/* Health Section */}
          <h4 className="font-semibold text-blue-700 dark:text-gray-300 mt-3">Health</h4>
          <div className="space-y-1">
            <Row label="Age" value={data.age} />
            <Row label="Height" value={data.height} />
            <Row label="Weight" value={data.weight} />
            <Row label="Heart Attack" value={data.heartAttack} />
            <Row label="Stroke" value={data.stroke} />
            <Row label="Cancer" value={data.cancer} />
            <Row label="Stents" value={data.stents} />
            <Row label="Diabetes" value={data.diabetes} />
            <Row label="Diabetes Complications" value={data.diabetesComplications} />
            <Row label="High Blood Pressure" value={data.highBloodPressure} />
            <Row label="High Cholesterol" value={data.highCholesterol} />
            <Row label="Kidney / Liver Disease" value={data.kidneyLiverDisease} />
            <Row label="Anxiety / Depression" value={data.anxietyDepression} />
            <Row label="Thyroid" value={data.thyroid} />
            <Row label="Asthma / COPD" value={data.asthmaCOPD} />
            <Row label="Lupus / RA" value={data.lupusRA} />
            <Row label="Prescription Medications" value={data.prescriptionMeds} />
          </div>

          {/* Lifestyle */}
          <h4 className="font-semibold mt-4 mb-1 text-blue-700 dark:text-gray-300">
            Lifestyle
          </h4>
          <div className="space-y-1">
            <Row label="License Suspensions" value={data.licenseSuspensions} />
            <Row label="Speeding Tickets" value={data.speedingTickets} />
            <Row label="DUI / DWI" value={data.duiDwi} />
            <Row label="Felony / Probation / Parole" value={data.felonyProbationParole} />
          </div>

          {/* Occupation */}
          <h4 className="font-semibold mt-4 mb-1 text-blue-700 dark:text-gray-300">
            Occupation
          </h4>
          <div className="space-y-1">
            <Row label="Occupation" value={data.occupation} />
          </div>

          {/* STEP 2 */}
          <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-900 dark:text-gray-100 border-b pb-1">
            Step 2 – Financial Risk
          </h3>

          {/* Payoff + Equity */}
          <h4 className="font-semibold text-blue-700 dark:text-gray-300">Payoff & Equity</h4>
          <div className="space-y-1">
            <Row label="Payoff Amount" value={data.payoff} />
            <Row label="Equity Amount" value={data.equity} />
          </div>

          {/* Assets */}
          <h4 className="font-semibold mt-4 mb-1 text-blue-700 dark:text-gray-300">
            Fall Back Assets
          </h4>
          <div className="space-y-1">
            <Row label="Checking" value={data.checking} />
            <Row label="Savings" value={data.savings} />
            <Row label="Retirement 401k" value={data.retirement401k} />
            <Row label="IRA" value={data.ira} />
            <Row label="Annuities" value={data.annuities} />
          </div>

          {/* Monthly Bills */}
          <h4 className="font-semibold mt-4 mb-1 text-blue-700 dark:text-gray-300">
            Major Monthly Bills
          </h4>
          <div className="space-y-1">
            <Row label="Mortgage + Property Tax" value={data.mortgagePropertyTax} />
            <Row label="Car Payments" value={data.carPayments} />
            <Row label="Electric / Gas" value={data.electricGas} />
            <Row label="Water" value={data.water} />
            <Row label="Cable Internet" value={data.cableInternet} />
            <Row label="Cell Phone" value={data.cellPhone} />
            <Row label="Car Insurance" value={data.carInsurance} />
            <Row label="Gas for Car" value={data.gasForCar} />
            <Row label="Food" value={data.food} />
            <Row label="Other Loans" value={data.otherLoans} />
          </div>

        </div>
      </div>
    </div>
  );
}
