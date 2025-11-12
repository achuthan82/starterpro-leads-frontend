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
import { dialerService } from "utils/apiService";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const MortgageProtectionModal = ({
  isOpen,
  close,
  onFormSubmit,
}) => {
  const { licenseDetails, currentCallLogId } = useCallContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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

  const closeModal = (forceClose = false) => {
    // Check if there's unsaved data
    const hasUnsavedData = Object.keys(formData).length > 0 || submittedData !== null;
    
    if (!forceClose && hasUnsavedData && !showCloseWarning) {
      setShowCloseWarning(true);
      return;
    }
    
    reset();
    setFormData({});
    setSubmittedData(null);
    setCurrentStep(1);
    setIsPreview(false);
    setShowCloseWarning(false);
    close();
  };

  const handleConfirmClose = () => {
    closeModal(true);
  };

  const handleCancelClose = () => {
    setShowCloseWarning(false);
  };

  const onStepSubmit = async (data) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    // Save data to API after each step if call_log_id exists
    if (currentCallLogId) {
      setIsSaving(true);
      try {
        await dialerService.saveDataEntry(currentCallLogId, updatedData);
        if (currentStep < 2) {
          toast.success('Step 1 data saved successfully');
        } else {
          toast.success('Mortgage Protection Assessment data saved successfully');
        }
      } catch (error) {
        console.error('Error saving assessment data:', error);
        toast.error(error?.response?.data?.message || 'Failed to save assessment data');
      } finally {
        setIsSaving(false);
      }
    }

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

  // Alternative: Use html2canvas for better external image support
  const handleDownloadWithDomToImage = async () => {
    if (isGeneratingPDF) return;
    
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF("landscape", "pt", "a4");
      
      // Get the slider container
      const sliderContainer = document.querySelector('.slick-slider');
      if (!sliderContainer) {
        throw new Error('Slider not found');
      }
      
      // Get the slider track which contains all slides
      const sliderTrack = sliderContainer.querySelector('.slick-track');
      if (!sliderTrack) {
        throw new Error('Slider track not found');
      }
      
      // Expected number of slides (we know there are 6)
      const expectedSlides = 6;
      
      // Try to get slider instance for navigation
      let sliderInstance = null;
      try {
        if (window.jQuery && window.jQuery(sliderContainer).data('slick')) {
          sliderInstance = window.jQuery(sliderContainer).data('slick');
        } else if (sliderContainer.slick) {
          sliderInstance = sliderContainer.slick;
        }
      } catch (e) {
        console.warn('Could not access slider instance:', e);
      }
      
      // Process each slide by navigating to it first
      for (let i = 0; i < expectedSlides; i++) {
        try {
          // Navigate to this slide to ensure it's rendered
          if (sliderInstance && typeof sliderInstance.slickGoTo === 'function') {
            sliderInstance.slickGoTo(i, true);
          } else if (window.jQuery) {
            window.jQuery(sliderContainer).slick('slickGoTo', i, true);
          }
          
          // Wait for slide to be visible and images to load
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Get the currently visible slide
          const visibleSlide = sliderTrack.querySelector(`.slick-slide[data-index="${i}"]:not(.slick-cloned)`);
          if (!visibleSlide) {
            console.warn(`Slide ${i} not found, skipping`);
            continue;
          }
          
          // Get the slide content element
          const slideElement = visibleSlide.querySelector('div') || visibleSlide;
          
          // Ensure all images in the slide are loaded
          const images = slideElement.querySelectorAll('img');
          await Promise.all(Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve; // Continue even if image fails
              // Timeout after 2 seconds
              setTimeout(resolve, 2000);
            });
          }));
          
          // Create a temporary container for capture
          const tempContainer = document.createElement('div');
          tempContainer.style.cssText = `
            position: fixed;
            left: 0;
            top: 0;
            width: 1000px;
            height: 700px;
            background: white;
            z-index: 99999;
            overflow: hidden;
          `;
          
          // Clone the slide content with all styles preserved
          const slideClone = slideElement.cloneNode(true);
          
          // Preserve important styles but fix positioning
          const preserveStyles = (el) => {
            // Get computed styles to preserve layout
            const computedStyle = window.getComputedStyle(el);
            
            // Preserve important layout properties
            if (computedStyle.position === 'absolute' || computedStyle.position === 'relative') {
              el.style.position = computedStyle.position;
            }
            
            // Preserve dimensions
            if (computedStyle.width && computedStyle.width !== 'auto') {
              el.style.width = computedStyle.width;
            }
            if (computedStyle.height && computedStyle.height !== 'auto') {
              el.style.height = computedStyle.height;
            }
            
            // Remove transforms that cause positioning issues
            if (el.style.transform && el.style.transform.includes('translate3d')) {
              el.style.transform = 'none';
            }
            
            // Fix oklch colors
            if (el.style.background?.includes('oklch') || el.style.backgroundColor?.includes('oklch')) {
              const bgColor = computedStyle.backgroundColor;
              if (bgColor && !bgColor.includes('oklch')) {
                el.style.backgroundColor = bgColor;
              } else {
                el.style.backgroundColor = '#ffffff';
              }
            }
            
            // Ensure images are visible and loaded
            if (el.tagName === 'IMG') {
              el.style.display = 'block';
              el.style.maxWidth = '100%';
              el.style.height = 'auto';
            }
            
            // Recursively process children
            Array.from(el.children || []).forEach(preserveStyles);
          };
          
          preserveStyles(slideClone);
          
          // Set container dimensions - preserve aspect ratio
          slideClone.style.cssText += `
            width: 1000px !important;
            height: 700px !important;
            margin: 0 !important;
            padding: 0 !important;
            position: relative !important;
            display: block !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          `;
          
          tempContainer.appendChild(slideClone);
          document.body.appendChild(tempContainer);
          
          // Wait for DOM to update and images to render
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Capture using html2canvas (better for external images)
          const canvas = await html2canvas(tempContainer, {
            width: 1000,
            height: 700,
            scale: 2, // Higher quality
            useCORS: true, // Allow cross-origin images
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            removeContainer: true,
            imageTimeout: 15000, // Wait up to 15 seconds for images
            onclone: (clonedDoc) => {
              // Ensure all images in cloned document are visible
              const clonedImages = clonedDoc.querySelectorAll('img');
              clonedImages.forEach(img => {
                img.style.display = 'block';
                img.style.visibility = 'visible';
                img.style.opacity = '1';
              });
            }
          });
          
          const dataUrl = canvas.toDataURL('image/png', 1.0);
          
          // Remove temp container
          if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
          }
          
          // Add page (except for first slide)
          if (i > 0) {
            pdf.addPage();
          }
          
          // Calculate dimensions to fill page
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          // Add image to fill entire page
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
          
          console.log(`Processed slide ${i + 1}/${expectedSlides}`);
          
        } catch (slideError) {
          console.error(`Error with slide ${i + 1}:`, slideError);
          // Continue with next slide even if one fails
          continue;
        }
        
        // Small delay between slides
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Reset slider to first slide
      if (sliderInstance && typeof sliderInstance.slickGoTo === 'function') {
        sliderInstance.slickGoTo(0, true);
      } else if (window.jQuery) {
        try {
          window.jQuery(sliderContainer).slick('slickGoTo', 0, true);
        } catch (e) {
          console.warn('Could not reset slider:', e);
        }
      }
      
      pdf.save("Mortgage_Protection_Presentation.pdf");
      
    } catch (error) {
      console.error("PDF generation failed:", error);
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
    <>
      {/* Close Warning Dialog */}
      <Transition show={showCloseWarning} as={Fragment}>
        <Dialog onClose={handleCancelClose} className="relative z-[110]">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </TransitionChild>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Unsaved Changes
                </DialogTitle>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  You have unsaved changes. Are you sure you want to close without saving?
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    onClick={handleCancelClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                    onClick={handleConfirmClose}
                  >
                    Close Without Saving
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
                  {isSaving && (
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      Saving...
                    </div>
                  )}
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
    </>
  );
};

export default MortgageProtectionModal;