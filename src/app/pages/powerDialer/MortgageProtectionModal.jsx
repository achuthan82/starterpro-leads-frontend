import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input } from "components/ui";
import { XMarkIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import PreviewComponent from "./PreviewComponent";
import { useCallContext } from "app/contexts/call/context";
// import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const MortgageProtectionModal = ({
  isOpen,
  close,
  onFormSubmit,
}) => {
  const { licenseDetails } = useCallContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      // Health Information
      age: '',
      height: '',
      weight: '',
      heartAttack: '',
      stroke: '',
      cancer: '',
      stents: '',
      diabetes: '',
      diabetesComplications: '',
      highBloodPressure: '',
      highCholesterol: '',
      kidneyLiverDisease: '',
      anxietyDepression: '',
      thyroid: '',
      asthmaCOPD: '',
      lupusRA: '',
      prescriptionMeds: '',
      
      // Lifestyle
      licenseSuspensions: '',
      speedingTickets: '',
      duiDwi: '',
      felonyProbationParole: '',
      
      // Occupation
      occupation: '',
      
      // Financial Risk
      payoff: '',
      equity: '',
      checking: '',
      savings: '',
      retirement401k: '',
      ira: '',
      annuities: '',
      mortgagePropertyTax: '',
      carPayments: '',
      electricGas: '',
      water: '',
      cableInternet: '',
      cellPhone: '',
      carInsurance: '',
      gasForCar: '',
      food: '',
      otherLoans: ''
    }
  });

  const closeModal = () => {
    reset();
    setFormData({});
    setSubmittedData(null);
    setCurrentStep(1);
    setIsPreview(false);
    close();
  };

  const onStepSubmit = (data) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      setSubmittedData(updatedData);
      setIsPreview(true);
      onFormSubmit(updatedData);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const handleBackToForm = () => {
    setIsPreview(false);
    setCurrentStep(2);
  };

//   const handleDownloadSlides = async () => {
//     if (isGeneratingPDF) return;
    
//     setIsGeneratingPDF(true);
//     try {
//       const pdf = new jsPDF("landscape", "pt", "a4");
      
//       // Get all slides excluding cloned ones
//       const slides = document.querySelectorAll('.slick-slide:not(.slick-cloned)');
//       console.log(`Found ${slides.length} slides to convert`);

//       // Create a temporary container for PDF generation
//       const tempContainer = document.createElement('div');
//       tempContainer.style.cssText = `
//         position: fixed;
//         left: -9999px;
//         top: 0;
//         width: 100vw;
//         height: 100vh;
//         background: white;
//         z-index: -9999;
//         opacity: 0;
//       `;
//       document.body.appendChild(tempContainer);

//       for (let i = 0; i < slides.length; i++) {
//         const slide = slides[i];
        
//         // Create a clean clone without any problematic styles
//         const clone = slide.cloneNode(true);
        
//         // Remove all classes and inline styles that might contain OKLCH
//         clone.removeAttribute('class');
//         clone.removeAttribute('style');
        
//         // Apply safe styles
//         clone.style.cssText = `
//           width: 1000px !important;
//           height: 700px !important;
//           background: white !important;
//           position: relative !important;
//           display: flex !important;
//           align-items: center !important;
//           justify-content: center !important;
//           padding: 20px !important;
//           box-sizing: border-box !important;
//         `;

//         // Clean up all child elements
//         const cleanElement = (element) => {
//           // Remove classes and styles
//           element.removeAttribute('class');
//           const style = element.getAttribute('style');
//           if (style && style.includes('oklch')) {
//             element.removeAttribute('style');
//           }
          
//           // Remove dark mode attributes
//           element.removeAttribute('data-dark');
          
//           // Apply safe background and text colors
//           element.style.backgroundColor = '#ffffff';
//           element.style.color = '#000000';
//           element.style.borderColor = '#cccccc';
          
//           // Clean children recursively
//           Array.from(element.children).forEach(cleanElement);
//         };

//         // Clean the entire clone
//         cleanElement(clone);

//         tempContainer.innerHTML = '';
//         tempContainer.appendChild(clone);

//         // Wait for the DOM to update
//         await new Promise(resolve => setTimeout(resolve, 100));

//         try {
//           const canvas = await html2canvas(clone, {
//             scale: 1.5,
//             useCORS: true,
//             backgroundColor: '#ffffff',
//             logging: false,
//             allowTaint: true,
//             removeContainer: true,
//             width: 1000,
//             height: 700,
//             ignoreElements: (element) => {
//                 console.log(element)
//               // Ignore elements that might cause issues
//               return false;
//             }
//           });

//           const imgData = canvas.toDataURL("image/png");
//           const pdfWidth = pdf.internal.pageSize.getWidth();
//           const pdfHeight = pdf.internal.pageSize.getHeight();

//           if (i > 0) {
//             pdf.addPage();
//           }
          
//           // Calculate dimensions to maintain aspect ratio
//           const imgWidth = canvas.width;
//           const imgHeight = canvas.height;
//           const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
//           const width = imgWidth * ratio;
//           const height = imgHeight * ratio;
//           const x = (pdfWidth - width) / 2;
//           const y = (pdfHeight - height) / 2;
          
//           pdf.addImage(imgData, "PNG", x, y, width, height);

//         } catch (slideError) {
//           console.error(`Error processing slide ${i + 1}:`, slideError);
//           // Continue with next slide even if one fails
//           continue;
//         }

//         // Small delay between slides
//         await new Promise(resolve => setTimeout(resolve, 300));
//       }

//       // Clean up
//       if (document.body.contains(tempContainer)) {
//         document.body.removeChild(tempContainer);
//       }

//       pdf.save("Mortgage_Protection_Presentation.pdf");
      
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       // Fallback: Create a simple text-based PDF
//       await createSimplePDF();
//     } finally {
//       setIsGeneratingPDF(false);
//     }
//   };

  // Fallback PDF creation without html2canvas
  const createSimplePDF = async () => {
    try {
      const pdf = new jsPDF("landscape", "pt", "a4");
      let yPosition = 50;
      
      // Title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 128);
      pdf.text("Mortgage Protection Assessment", 50, yPosition);
      yPosition += 40;

      // Date
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, yPosition);
      yPosition += 30;

      // Personal Information
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("Personal Information:", 50, yPosition);
      yPosition += 25;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text(`Age: ${submittedData?.age || '-'}`, 50, yPosition);
      yPosition += 15;
      pdf.text(`Height: ${submittedData?.height || '-'} inches`, 50, yPosition);
      yPosition += 15;
      pdf.text(`Weight: ${submittedData?.weight || '-'} lbs`, 50, yPosition);
      yPosition += 15;
      pdf.text(`Occupation: ${submittedData?.occupation || '-'}`, 50, yPosition);
      yPosition += 25;

      // Financial Summary
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("Financial Summary:", 50, yPosition);
      yPosition += 25;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text(`Payoff Amount: $${(submittedData?.payoff || 0).toLocaleString()}`, 50, yPosition);
      yPosition += 15;
      pdf.text(`Equity Amount: $${(submittedData?.equity || 0).toLocaleString()}`, 50, yPosition);
      yPosition += 15;
      pdf.text(`Total Assets: $${(
        (parseInt(submittedData?.checking) || 0) +
        (parseInt(submittedData?.savings) || 0) +
        (parseInt(submittedData?.retirement401k) || 0) +
        (parseInt(submittedData?.ira) || 0) +
        (parseInt(submittedData?.annuities) || 0)
      ).toLocaleString()}`, 50, yPosition);

      pdf.save("Mortgage_Protection_Summary.pdf");
      
    } catch (fallbackError) {
      console.error("Fallback PDF also failed:", fallbackError);
      alert("Unable to generate PDF. Please try again or contact support.");
    }
  };

  // Alternative: Use a different approach with dom-to-image
  const handleDownloadWithDomToImage = async () => {
    if (isGeneratingPDF) return;
    
    setIsGeneratingPDF(true);
    try {
      // Dynamically import dom-to-image
      const domToImage = await import('dom-to-image');
      const pdf = new jsPDF("landscape", "pt", "a4");
      
      const slides = document.querySelectorAll('.slick-slide:not(.slick-cloned)');
      
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        try {
          const dataUrl = await domToImage.toPng(slide, {
            width: slide.scrollWidth,
            height: slide.scrollHeight,
            style: {
              transform: 'scale(1)',
              transformOrigin: 'top left'
            },
            filter: (node) => {
              // Filter out problematic nodes
              if (node.style && (
                node.style.background?.includes('oklch') ||
                node.style.backgroundColor?.includes('oklch')
              )) {
                node.style.background = '#ffffff';
                node.style.backgroundColor = '#ffffff';
              }
              return true;
            }
          });

          if (i > 0) {
            pdf.addPage();
          }
          
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
          
        } catch (slideError) {
          console.error(`Error with slide ${i + 1}:`, slideError);
          continue;
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      pdf.save("Mortgage_Protection_Presentation.pdf");
      
    } catch (error) {
      console.error("dom-to-image failed:", error);
      // Fall back to simple PDF
      await createSimplePDF();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Progress Steps and other components remain the same...
  const ProgressSteps = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center">
        {[1, 2].map((step) => (
          <Fragment key={step}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep === step ? 'bg-blue-600 text-white' : 
              currentStep > step ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 2 && (
              <div className={`w-12 h-1 mx-2 ${
                currentStep > step ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );

  const StepLabels = () => (
    <div className="flex justify-center mb-4 text-sm">
      <div className="flex space-x-8">
        <span className={currentStep === 1 ? 'font-semibold text-blue-600' : 'text-gray-500'}>Verifying Information</span>
        <span className={currentStep === 2 ? 'font-semibold text-blue-600' : 'text-gray-500'}>Financial Risk</span>
      </div>
    </div>
  );

  // Step 1: Verifying Information
  const Step1VerifyingInfo = () => (
    <form onSubmit={handleSubmit(onStepSubmit)}>
      <div className="space-y-6 text-left max-h-[60vh] overflow-y-auto">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b pb-2">
          Step 1: Verifying Information
        </h4>
        
        {/* Health Section */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">Health Information</h5>
          
          {/* Basic Info */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Age <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="age"
                rules={{ required: "Age is required", min: 1, max: 100 }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="Age"
                    className="w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    invalid={errors.age}
                  />
                )}
              />
              {errors.age && (
                <span className="text-red-500 text-sm">{errors.age.message}</span>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Height (inches)</label>
              <Controller
                control={control}
                name="height"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="Height"
                    className="w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  />
                )}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Weight (lbs)</label>
              <Controller
                control={control}
                name="weight"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="Weight"
                    className="w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  />
                )}
              />
            </div>
          </div>

          {/* Health Conditions Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {name: 'heartAttack', question: 'Heart Attack or Any Heart Problems Ever?'},
              {name: 'stroke', question: 'Stroke?'},
              {name: 'cancer', question: 'Cancer?'},
              {name: 'stents', question: 'Stents?'},
              {name: 'diabetes', question: 'Diabetes (Pills or Insulin)?'},
              {name: 'diabetesComplications', question: 'Complications with Diabetes?'},
              {name: 'highBloodPressure', question: 'High Blood Pressure?'},
              {name: 'highCholesterol', question: 'High Cholesterol?'},
              {name: 'kidneyLiverDisease', question: 'Kidney or Liver Disease?'},
              {name: 'anxietyDepression', question: 'Anxiety/Depression?'},
              {name: 'thyroid', question: 'Thyroid?'},
              {name: 'asthmaCOPD', question: 'Asthma/COPD (Inhalers or Oxygen)?'},
              {name: 'lupusRA', question: 'Lupus or RA?'},
            ].map((condition) => (
              <div key={condition.name} className="mb-3">
                <label className="mb-1 block text-sm font-medium">{condition.question}</label>
                <Controller
                  control={control}
                  name={condition.name}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 p-2 text-sm"
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  )}
                />
              </div>
            ))}
          </div>

          {/* Prescription Medications */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium">
              Prescription Medications Prescribed:
            </label>
            <Controller
              control={control}
              name="prescriptionMeds"
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  placeholder="List any prescription medications"
                  className="w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 p-2 text-sm"
                />
              )}
            />
          </div>
        </div>

        {/* Lifestyle Section */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">Lifestyle</h5>
          <div className="grid grid-cols-2 gap-4">
            {[
              {name: 'licenseSuspensions', question: 'License Suspensions?'},
              {name: 'speedingTickets', question: 'Speeding Tickets?'},
              {name: 'duiDwi', question: 'DUI or DWI (Last 10 years)?'},
              {name: 'felonyProbationParole', question: 'Felony/Probation/Parole?'},
            ].map((item) => (
              <div key={item.name} className="mb-3">
                <label className="mb-1 block text-sm font-medium">{item.question}</label>
                <Controller
                  control={control}
                  name={item.name}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 p-2 text-sm"
                    >
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

        {/* Occupation Section */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">Occupation</h5>
          <div className="flex gap-6">
            <label className="flex items-center">
              <Controller
                control={control}
                name="occupation"
                render={({ field }) => (
                  <input
                    type="radio"
                    {...field}
                    value="retired"
                    checked={field.value === "retired"}
                    className="mr-2"
                  />
                )}
              />
              Retired?
            </label>
            <label className="flex items-center">
              <Controller
                control={control}
                name="occupation"
                render={({ field }) => (
                  <input
                    type="radio"
                    {...field}
                    value="working"
                    checked={field.value === "working"}
                    className="mr-2"
                  />
                )}
              />
              Working?
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
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

  // Step 2: Financial Risk
  const Step2FinancialRisk = () => (
    <form onSubmit={handleSubmit(onStepSubmit)}>
      <div className="space-y-6 text-left max-h-[60vh] overflow-y-auto">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b pb-2">
          Step 2: Financial Risk
        </h4>
        
        {/* Payoff & Equity Section */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">Payoff & Equity</h5>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Payoff Amount</label>
              <Controller
                control={control}
                name="payoff"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="$"
                    className="w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  />
                )}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Equity Amount</label>
              <Controller
                control={control}
                name="equity"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="$"
                    className="w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Fall Back Assets */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">Fall Back Assets</h5>
          <div className="grid grid-cols-2 gap-4">
            {[
              {name: 'checking', label: 'Checking'},
              {name: 'savings', label: 'Savings'},
              {name: 'retirement401k', label: '401K'},
              {name: 'ira', label: 'IRA'},
              {name: 'annuities', label: 'Annuities'}
            ].map((asset) => (
              <div key={asset.name} className="mb-3">
                <label className="mb-1 block text-sm font-medium">{asset.label}</label>
                <Controller
                  control={control}
                  name={asset.name}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="$"
                      className="w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    />
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Major Bills */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-4">Major Bills - Monthly Expenses</h5>
          <div className="grid grid-cols-2 gap-4">
            {[
              {name: 'mortgagePropertyTax', label: 'Monthly Mortgage & Property Taxes'},
              {name: 'carPayments', label: 'Car Payments'},
              {name: 'electricGas', label: 'Electric / Gas'},
              {name: 'water', label: 'Water'},
              {name: 'cableInternet', label: 'Cable Internet'},
              {name: 'cellPhone', label: 'Cell Phone'},
              {name: 'carInsurance', label: 'Car Insurance'},
              {name: 'gasForCar', label: 'Gas for Car'},
              {name: 'food', label: 'Food'},
              {name: 'otherLoans', label: 'Other Loans'}
            ].map((expense) => (
              <div key={expense.name} className="mb-3">
                <label className="mb-1 block text-sm font-medium">{expense.label}</label>
                <Controller
                  control={control}
                  name={expense.name}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="$"
                      className="w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    />
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-between gap-4">
          <Button
            type="button"
            className="rounded border border-gray-400 px-6 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            onClick={() => goToStep(1)}
          >
            Back
          </Button>
          <div className="flex gap-4">
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
              style={{ backgroundColor: '#00a63e'}}
            >
              Complete Assessment
            </Button>
          </div>
        </div>
      </div>
    </form>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex items-center justify-center px-2 py-2 sm:px-3"
        onClose={closeModal}
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
            {/* Header with Close Button */}
            <div className="flex items-center justify-between mb-0">
              <DialogTitle
                as="h3"
                className="text-2xl font-semibold text-gray-800 dark:text-gray-100"
              >
                Mortgage Protection Assessment
              </DialogTitle>
              <div className="flex items-center gap-2">
                {isPreview && (
                  <div className="flex gap-2">
                    {/* <button
                      onClick={handleDownloadSlides}
                      disabled={isGeneratingPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
                    </button> */}
                    <button
                      onClick={handleDownloadWithDomToImage}
                      disabled={isGeneratingPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
                    </button>
                  </div>
                )}
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Progress Steps - Only show when not in preview */}
            {!isPreview && (
              <>
                <ProgressSteps />
                <StepLabels />
              </>
            )}

            {!isPreview ? (
              <>
                {currentStep === 1 && <Step1VerifyingInfo />}
                {currentStep === 2 && <Step2FinancialRisk />}
              </>
            ) : (
              // Preview View
              <div className="text-left">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Assessment Preview
                  </h4>
                </div>
                
                <PreviewComponent 
                  submittedData={submittedData} 
                  licenseDetails={licenseDetails}
                />

                <div className="mt-6 flex justify-between gap-4">
                  <Button
                    type="button"
                    className="rounded border border-gray-400 px-6 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                    onClick={handleBackToForm}
                  >
                    Back to Edit
                  </Button>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      className="rounded border border-gray-400 px-6 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                      onClick={closeModal}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default MortgageProtectionModal;