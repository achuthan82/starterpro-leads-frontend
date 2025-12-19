import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import { useForm } from "react-hook-form";
import { Button, Spinner } from "components/ui";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useCallContext } from "app/contexts/call/context";
import { dialerService } from "utils/apiService";
import { toast } from "sonner";

import Step1VerifyingInfo from "./Step1VerifyingInfo";
import Step2FinancialRisk from "./Step2FinancialRisk";

const MortgageProtectionModal = ({ isOpen, close, onFormSubmit }) => {
  const { licenseDetails, currentCallLogId } = useCallContext();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const [showCloseWarning, setShowCloseWarning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      age: "",
      height: "",
      weight: "",
      heartAttack: "",
      stroke: "",
      cancer: "",
      stents: "",
      diabetes: "",
      diabetesComplications: "",
      highBloodPressure: "",
      highCholesterol: "",
      kidneyLiverDisease: "",
      anxietyDepression: "",
      thyroid: "",
      asthmaCOPD: "",
      lupusRA: "",
      prescriptionMeds: "",
      licenseSuspensions: "",
      speedingTickets: "",
      duiDwi: "",
      felonyProbationParole: "",
      occupation: "",
      payoff: "",
      equity: "",
      checking: "",
      savings: "",
      retirement401k: "",
      ira: "",
      annuities: "",
      mortgagePropertyTax: "",
      carPayments: "",
      electricGas: "",
      water: "",
      cableInternet: "",
      cellPhone: "",
      carInsurance: "",
      gasForCar: "",
      food: "",
      otherLoans: "",
    },
  });

  const closeModal = (forceClose = false) => {
     const hasUnsavedData =
      Object.keys(formData).length > 0 || submittedData !== null;

    if (!forceClose && hasUnsavedData && !showCloseWarning) {
      setShowCloseWarning(true);
      return;
    }

    reset();
    setFormData({});
    setSubmittedData(null);
    setCurrentStep(1);
    setShowCloseWarning(false);
    close();
  };

  const handleConfirmClose = () => closeModal(true);
  const handleCancelClose = () => setShowCloseWarning(false);

  const onStepSubmit = async (data) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    if (currentCallLogId) {
      setIsSaving(true);
      try {
        await dialerService.saveDataEntry(currentCallLogId, updatedData);
        toast.success(
          currentStep < 2
            ? "Step 1 data saved successfully"
            : "Mortgage Protection Assessment data saved successfully"
        );
      } catch (error) {
        console.error("Error saving assessment data:", error);
      } finally {
        setIsSaving(false);
      }
    }

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setSubmittedData(updatedData);

    const token = `preview_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const storageKey = `mortgage_preview_${token}`;

    try {
      const dataToStore = {
        submittedData: updatedData,
        licenseDetails,
      };

      sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
      localStorage.setItem(storageKey, JSON.stringify(dataToStore));

      const previewUrl = `${window.location.origin}/mortgage-protection-preview/${encodeURIComponent(
        token
      )}/${currentCallLogId}`;

      setTimeout(() => {
        // const newWindow = 
        window.open(
          previewUrl,
          "_blank",
          "noopener,noreferrer"
        );
        // if (!newWindow) toast.error("Popup blocked. Please allow popups.");
      }, 100);

      onFormSubmit(updatedData);
      closeModal();
    } catch (err) {
      console.error("Error storing preview data:", err);
      toast.error("Failed to prepare preview.");
    }
  };

  const goToStep = (step) => {
    if (!isSaving) setCurrentStep(step);
  };

  const ProgressSteps = () => (
    <div className="flex justify-center mb-4">
      <div className="flex items-center">
        {[1, 2].map((step) => (
          <Fragment key={step}>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => goToStep(step)}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all
              ${
                currentStep === step
                  ? "bg-blue-600 text-white"
                  : currentStep > step
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-600"
              }
              ${isSaving ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              {step}
            </button>
            {step < 2 && (
              <div
                className={`w-12 h-1 mx-2 ${
                  currentStep > step ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );

  const StepLabels = () => (
    <div className="flex justify-center mb-4 text-sm">
      <div className="flex space-x-5">
        <span
          className={
            currentStep === 1 ? "font-semibold text-blue-600" : "text-gray-500"
          }
        >
          Verifying Information
        </span>
        <span
          className={
            currentStep === 2 ? "font-semibold text-blue-600" : "text-gray-500"
          }
        >
          Financial Risk
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Close Warning Dialog */}
      <Transition show={showCloseWarning} as={Fragment}>
        <Dialog onClose={() => {}} className="relative z-[110]">
          <TransitionChild as={Fragment}>
            <div className="fixed inset-0 bg-black/50" />
          </TransitionChild>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild as={Fragment}>
              <DialogPanel className="bg-white dark:bg-gray-800 max-w-md w-full p-6 rounded-lg shadow-xl">
                <DialogTitle className="text-lg font-semibold mb-4">
                  Unsaved Changes
                </DialogTitle>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  You have unsaved changes. If you are done, ignore this message
                  and close the modal.
                </p>

                <div className="flex justify-end gap-3">
                  <Button onClick={handleCancelClose}>Continue</Button>
                  <Button
                    className="bg-red-600 text-white hover:bg-red-400"
                    onClick={handleConfirmClose}
                  >
                    {/* Close Without Saving */}
                    Close
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isOpen} as={Fragment}>
           <Dialog
             as="div"
             className="fixed inset-0 z-[100] flex items-center justify-center px-2 py-2 sm:px-3"
               onClose={() => {}} // Prevent closing on outside click
               static
           >
             <TransitionChild
               as={Fragment}
               enter="ease-out duration-300"
               enterFrom="opacity-0"
               enterTo="opacity-100"
               leave="ease-in duration-200"
               leaveFrom="opacity-100"
               leaveTo="opacity-0"
             >
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
             </TransitionChild>
     
             <TransitionChild
               as={Fragment}
               enter="ease-out duration-300"
               enterFrom="opacity-0 scale-95"
               enterTo="opacity-100 scale-100"
               leave="ease-in duration-200"
               leaveFrom="opacity-100 scale-100"
               leaveTo="opacity-0 scale-95"
             >
               <DialogPanel className="dark:bg-dark-700 relative w-full max-w-4xl rounded-2xl bg-white px-3 py-4 text-center shadow-xl transition-all sm:px-8 max-h-[98vh] overflow-hidden">
              {isSaving && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
                  <div className="flex flex-col items-center gap-3">
                    <Spinner className="w-8 h-8 border-2" color="primary" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Saving...
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <DialogTitle className="text-2xl font-semibold">
                  Mortgage Protection Assessment
                </DialogTitle>

                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <ProgressSteps />
              <StepLabels />

              {currentStep === 1 && (
                <Step1VerifyingInfo
                  control={control}
                  handleSubmit={handleSubmit}
                  errors={errors}
                  onStepSubmit={onStepSubmit}
                  closeModal={closeModal}
                />
              )}

              {currentStep === 2 && (
                <Step2FinancialRisk
                  control={control}
                  handleSubmit={handleSubmit}
                  errors={errors}
                  onStepSubmit={onStepSubmit}
                  goToStep={goToStep}
                  closeModal={closeModal}
                />
              )}
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
};

export default MortgageProtectionModal;
