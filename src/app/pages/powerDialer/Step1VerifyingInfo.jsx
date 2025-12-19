import { Controller } from "react-hook-form";
import { Button, Input } from "components/ui";

const Step1VerifyingInfo = ({ control, errors, handleSubmit, onStepSubmit, closeModal }) => {
  return (
    <form onSubmit={handleSubmit(onStepSubmit)}>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto text-left">
        <h4 className="text-lg font-semibold border-b pb-2">Step 1: Verifying Information</h4>

        {/* HEALTH SECTION */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="font-semibold mb-4">Health Information</h5>

          {/* AGE HEIGHT WEIGHT */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="mb-1 block text-sm">Age <span className="text-red-500">*</span></label>
              <Controller
                name="age"
                control={control}
                rules={{ required: "Age is required" }}
                render={({ field }) => <Input {...field} type="number" />}
              />
              {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm">Height (inches)</label>
              <Controller
                name="height"
                control={control}
                render={({ field }) => <Input {...field} type="number" />}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm">Weight (lbs)</label>
              <Controller
                name="weight"
                control={control}
                render={({ field }) => <Input {...field} type="number" />}
              />
            </div>
          </div>

          {/* HEALTH QUESTIONS */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "heartAttack", text: "Heart Attack or Any Heart Problems Ever?" },
              { name: "stroke", text: "Stroke?" },
              { name: "cancer", text: "Cancer?" },
              { name: "stents", text: "Stents?" },
              { name: "diabetes", text: "Diabetes (Pills or Insulin)?" },
              { name: "diabetesComplications", text: "Complications with Diabetes?" },
              { name: "highBloodPressure", text: "High Blood Pressure?" },
              { name: "highCholesterol", text: "High Cholesterol?" },
              { name: "kidneyLiverDisease", text: "Kidney or Liver Disease?" },
              { name: "anxietyDepression", text: "Anxiety / Depression?" },
              { name: "thyroid", text: "Thyroid?" },
              { name: "asthmaCOPD", text: "Asthma / COPD?" },
              { name: "lupusRA", text: "Lupus or RA?" },
            ].map((q) => (
              <div key={q.name}>
                <label className="mb-1 block text-sm">{q.text}</label>
                <Controller
                  name={q.name}
                  control={control}
                  render={({ field }) => (
                    <select {...field} className="w-full border rounded p-2">
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  )}
                />
              </div>
            ))}
          </div>

          {/* PRESCRIPTION MEDICATIONS */}
          <div className="mt-4">
            <label className="mb-1 block text-sm">Prescription Medications:</label>
            <Controller
              name="prescriptionMeds"
              control={control}
              render={({ field }) => (
                <textarea {...field} rows={3} className="w-full border rounded p-2" />
              )}
            />
          </div>
        </div>

        {/* LIFESTYLE */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="font-semibold mb-4">Lifestyle</h5>

          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "licenseSuspensions", text: "License Suspensions?" },
              { name: "speedingTickets", text: "Speeding Tickets?" },
              { name: "duiDwi", text: "DUI or DWI (Last 10 years)?" },
              { name: "felonyProbationParole", text: "Felony / Probation / Parole?" },
            ].map((q) => (
              <div key={q.name}>
                <label className="mb-1 block text-sm">{q.text}</label>
                <Controller
                  name={q.name}
                  control={control}
                  render={({ field }) => (
                    <select {...field} className="w-full border rounded p-2">
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        {/* OCCUPATION */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="font-semibold mb-4">Occupation</h5>

          <div className="flex gap-6">
            {["retired", "working"].map((v) => (
              <label key={v} className="flex items-center gap-2">
                <Controller
                  name="occupation"
                  control={control}
                  render={({ field }) => (
                    <input type="radio" value={v} checked={field.value === v} onChange={field.onChange} />
                  )}
                />
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 pt-4">
            <Button
            type="button"
            className="rounded border border-gray-400 px-6 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            onClick={closeModal}
            >
            Cancel
            </Button>
            <Button
            type="submit"
            className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            style={{ backgroundColor: '#155dfc'}}
            >
            Next: Financial Risk
            </Button>
        </div>
      </div>
    </form>
  );
};

export default Step1VerifyingInfo;
