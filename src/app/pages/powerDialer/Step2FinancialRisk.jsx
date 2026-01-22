import { Controller } from "react-hook-form";
import { Button, Input } from "components/ui";

const Step2FinancialRisk = ({ control, handleSubmit, onStepSubmit, closeModal, goToStep }) => {
  return (
    <form onSubmit={handleSubmit(onStepSubmit)}>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto text-left">
        <h4 className="text-lg font-semibold border-b pb-2">Step 2: Financial Risk</h4>

        {/* PAYOFF + EQUITY */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="font-semibold mb-4">Payoff & Equity</h5>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm">Payoff Amount</label>
              <Controller
                name="payoff"
                control={control}
                render={({ field }) => <Input {...field} type="number" data-testid="input-payoff"/>}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm">Equity Amount</label>
              <Controller
                name="equity"
                control={control}
                render={({ field }) => <Input {...field} type="number" data-testid="input-equity"/>}
              />
            </div>
          </div>
        </div>

        {/* FALL BACK ASSETS */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="font-semibold mb-4">Fall Back Assets</h5>

          <div className="grid grid-cols-2 gap-4">
            {[
              ["checking", "Checking"],
              ["savings", "Savings"],
              ["retirement401k", "401K"],
              ["ira", "IRA"],
              ["annuities", "Annuities"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="mb-1 block text-sm">{label}</label>
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => <Input {...field} type="number" data-testid={`input-${name}`}/>}
                />
              </div>
            ))}
          </div>
        </div>

        {/* MAJOR MONTHLY EXPENSES */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="font-semibold mb-4">Major Monthly Bills</h5>

          <div className="grid grid-cols-2 gap-4">
            {[
              ["mortgagePropertyTax", "Mortgage & Property Taxes"],
              ["carPayments", "Car Payments"],
              ["electricGas", "Electric / Gas"],
              ["water", "Water"],
              ["cableInternet", "Cable Internet"],
              ["cellPhone", "Cell Phone"],
              ["carInsurance", "Car Insurance"],
              ["gasForCar", "Gas for Car"],
              ["food", "Food"],
              ["otherLoans", "Other Loans"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="mb-1 block text-sm">{label}</label>
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => <Input {...field} type="number" data-testid={`input-${name}`} />}
                />
              </div>
            ))}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-between pt-4">
          <Button type="button" onClick={() => goToStep(1)}>Back</Button>

          <div className="flex gap-3">
            <Button type="button" onClick={closeModal} data-testid="btn-cancel-mortgage-protection-assessment-modal">Cancel</Button>
            <Button type="submit" className="bg-green-600 text-white hover:bg-green-500 text-white" data-testid="btn-complete-mortgage-protection-assessment-modal">Complete Assessment</Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Step2FinancialRisk;
