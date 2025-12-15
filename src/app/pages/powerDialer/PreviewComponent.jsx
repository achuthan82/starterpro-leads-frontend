import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import axiosInstance from "utils/axios";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import Slider from "react-slick";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import profileService from "utils/profileService";
import { toast } from 'sonner';
// import { dialerService } from "utils/apiService";
// import { useCallContext } from "app/contexts/call/context";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import bg from "./images/mortgageProtection.jpg";
import smiley from "./images/smile-icon.svg";

const PreviewComponent = forwardRef(
  ({ submittedData, licenseDetails = null, currentCallLogId = null }, ref) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [carriersLogo, setCarriersLogo] = useState(null);
    const [carriersLoading, setCarriersLoading] = useState(false);

    // const { currentCallLogId } = useCallContext();
    // console.log(licenseDetails)

    const licenseImage =
      licenseDetails?.certificate || licenseDetails?.download_url || null;

    const carriersImage =
      carriersLogo?.url || 
      carriersLogo?.download_url ||
      carriersLogo?.logo_url ||
      carriersLogo ||
      null;

    const sliderRef = useRef(null);


    const downloadFromAPI = async (fileUrl, fileName = "download.png") => {
      try {
        const response = await axiosInstance.get("/carriers/aws-bas64", {
          params: { file_url: fileUrl },
        });

        const base64 = response?.data?.data?.image;
        if (!base64) {
          console.error("API did not return base64");
          return;
        }

        // Convert base64 → Blob
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length)
          .fill(0)
          .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], { type: "image/png" });
        const blobUrl = URL.createObjectURL(blob);

        // Trigger download
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        link.click();

        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Download API Error:", error);
      }
    };

    const downloadCurrentSlide = async () => {
      toast.success('📄 Downloading... slide');
      // Slide 2 → licenseImage
      if (currentSlide === 1 && licenseImage) {
        await downloadFromAPI(licenseImage, "license.png");
        return;
      }

      // Slide 3 → carriersImage
      if (currentSlide === 2 && carriersImage) {
        await downloadFromAPI(carriersImage, "carriers.png");
        return;
      }

      // Other slides → screenshot PNG
      const slide = document.querySelector(
        `.slick-slide[data-index="${currentSlide}"]:not(.slick-cloned)`
      );

      if (!slide) return;

      const node = slide.firstElementChild || slide;

      try {
        const dataUrl = await htmlToImage.toPng(node, {
          pixelRatio: 2,
          cacheBust: true,
          skipFonts: true,
        });

        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `slide-${currentSlide + 1}.png`;
        a.click();
      } catch (err) {
        console.error("Slide download failed:", err);
      }
    };


    useEffect(() => {
      const fetchLogo = async () => {
        setCarriersLoading(true);
        try {
          const res = await profileService.getCarriersLogo();
          if (res?.data?.status === 200) setCarriersLogo(res.data.data);
        } catch (e) {
          console.error("Carrier logo load failed:", e);
        } finally {
          setCarriersLoading(false);
        }
      };
      fetchLogo();

    }, []);

    const generateAndUploadPDF = useCallback(async () => { 
      console.log("📄 Generating PDF...");
      toast.success('📄 Downloading... Mortgage Protection Assessment');

      // Wait for slider to mount fully
      await new Promise((resolve) => setTimeout(resolve, 800));

      const pdf = new jsPDF("p", "mm", "a4");
      const totalSlides = 6;
      const slidesArr = [];

      // -----------------------------
      // 1️⃣ Capture All Slides
      // -----------------------------
      for (let i = 0; i < totalSlides; i++) {
        const slide = document.querySelector(
          `.slick-slide[data-index="${i}"]:not(.slick-cloned)`
        );

        if (!slide) continue;

        const node = slide.firstElementChild || slide;

        const imgData = await htmlToImage.toPng(node, {
          pixelRatio: 2,
          cacheBust: true,
          skipFonts: true,
        });

        slidesArr.push(imgData);
      }

      // -----------------------------
      // 2️⃣ Add Slides to PDF (CENTERED)
      // -----------------------------
      for (let i = 0; i < slidesArr.length; i++) {
        if (i !== 0) pdf.addPage();

        const src = slidesArr[i];

        const img = await new Promise((resolve) => {
          const image = new Image();
          image.src = src;
          image.onload = () => resolve(image);
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const renderWidth = pageWidth;
        const renderHeight = (img.height / img.width) * renderWidth;

        const x = (pageWidth - renderWidth) / 2;
        const y = (pageHeight - renderHeight) / 2;

        pdf.addImage(src, "PNG", x, y, renderWidth, renderHeight);
      }

      // -----------------------------
      // 3️⃣ Download PDF to User
      // -----------------------------
      pdf.save(`${currentCallLogId}.pdf`);
      console.log("📄 PDF downloaded!");

      // -----------------------------
      // 4️⃣ Convert PDF → Blob for API Upload
      // -----------------------------
      const pdfBlob = pdf.output("blob");

      if (!pdfBlob || pdfBlob.size === 0) {
        console.error("❌ PDF blob is empty — upload cancelled");
        return;
      }

      // -----------------------------
      // 5️⃣ Upload PDF to API
      // -----------------------------
      try {
        const formData = new FormData();
        // formData.append("call_log_id", currentCallLogId);
        formData.append("file", pdfBlob, "assessment.pdf");

        const res = await axiosInstance.post(
          `/dialer/upload/ppt/${currentCallLogId}`,
          // `https://c38ed10c5205.ngrok-free.app/dialer/upload/ppt/${currentCallLogId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        console.log("📤 PDF uploaded successfully:", res.data);
      } catch (err) {
        console.error("❌ PDF upload failed:", err);
      }
    }, [currentCallLogId]);

    useImperativeHandle(ref, () => ({
      generateAndUploadPDF,
    }));

    useEffect(() => {
      const timer = setTimeout(() => {
        generateAndUploadPDF();
      }, 1200);
      return () => clearTimeout(timer);
    }, [generateAndUploadPDF]);


    const formatYesNo = (value) => {
      if (value === "yes") return "Yes";
      if (value === "no") return "No";
      return "-";
    };

    const MortgageProtectionInfo = () => {
      return (
        <div
          className="flex-col items-center justify-center text-white text-lg font-normal px-12 py-2"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <h1 className="text-6xl font-medium leading-tight my-15">
            MORTGAGE <br /> PROTECTION
          </h1>

          <div className="space-y-2 font-light text-lg mb-12">
            <p>* Protect Your Most Valuable Asset</p>
            <p>* Your Home and or your Retirement Nest Egg</p>
          </div>

          <div className="flex justify-between w-full max-w-3xl font-light text-sm">
            <div className="space-y-1">
              <p>• {JSON.parse(localStorage.getItem("currentUser"))?.name}</p>
              <p>• Senior Field Underwriter</p>
            </div>

            <div className="space-y-1 text-left">
              <p>
                State License ID: {licenseDetails?.license_number || "N/A"}
              </p>
              <p>
                NPN: {JSON.parse(localStorage.getItem("currentUser"))?.npn ||
                  "N/A"}
              </p>
            </div>
          </div>
        </div>
      );
    };

    const CertificateInfo = () => {
      const licenseImage2 =
        licenseDetails?.image || licenseDetails?.certificate;

      return (
        <div className="flex-col bg-white border-t-[40px] border-b-[40px] border-[#3BA9F4] items-center justify-center text-white text-lg font-normal px-12 py-2">
          <div className="flex items-center justify-center h-full">
            {licenseImage2 ? (
              <img
                src={licenseImage2}
                alt="license certificate"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="text-xl font-medium">No licence found</p>
              </div>
            )}
          </div>
        </div>
      );
    };

    const CarrierInfo = () => {
      const carriersImage2 =
        carriersLogo?.image ||
        carriersLogo?.url ||
        carriersLogo?.logo_url ||
        carriersLogo;

      return (
        <div className="flex-col bg-white border-t-[40px] border-b-[40px] border-[#3BA9F4] items-center justify-center text-white text-lg font-normal px-12 py-2">
          <div className="flex items-center justify-center h-full">
            {carriersLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="text-xl font-medium">Loading carriers...</p>
              </div>
            ) : carriersImage2 ? (
              <img
                src={carriersImage2}
                alt="carriers"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="text-xl font-medium">No carriers found</p>
              </div>
            )}
          </div>
        </div>
      );
    };

    const KeyThingsToCover = () => {
      return (
        <div className="flex h-screen bg-white text-gray-800 font-sans">
          <div className="bg-[#3BA9F4] w-1/4 flex items-center justify-center">
            <MegaphoneIcon className="w-32 h-32 text-white" />
          </div>

          <div className="flex-col justify-center px-16 w-3/4">
            <h1 className="text-5xl font-extrabold leading-tight my-15">
              4 Key Things <br /> To Cover Today
            </h1>

            <p className="text-lg mb-6">
              My Role & Purpose:{" "}
              <span className="italic font-medium text-gray-600">
                (You Cannot Buy Insurance Today)
              </span>
            </p>

            <ol className="space-y-3 text-xl list-decimal list-inside">
              <li>Health Conditions &amp; Medications</li>
              <li>See How You Are Set Up In Your Home</li>
              <li>Review Most Affordable Solutions</li>
              <li>Help You Submit an Application Today</li>
            </ol>
          </div>
        </div>
      );
    };

    const SlidePersonalInfo = () => {
      if (!submittedData) return null;

      return (
        <div
          className="flex-col items-center justify-center text-white text-lg font-normal px-12 py-2"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            minHeight: "100vh",
          }}
        >
          <h1 className="text-3xl font-semibold text-left my-3">
            Verifying Information
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 w-full max-w-6xl">
            <div>
              <h2 className="text-md font-semibold mb-1">Health</h2>
              <ul className="space-y-2 list-disc list-inside text-xs">
                <li>Age: {submittedData.age || "-"}</li>
                <li>
                  Height/Weight:{" "}
                  {submittedData.height || "-"} / {submittedData.weight || "-"}
                </li>
                <li>Heart Attack: {formatYesNo(submittedData.heartAttack)}</li>
                <li>Stroke: {formatYesNo(submittedData.stroke)}</li>
                <li>Cancer: {formatYesNo(submittedData.cancer)}</li>
                <li>Stents: {formatYesNo(submittedData.stents)}</li>
                <li>Diabetes: {formatYesNo(submittedData.diabetes)}</li>
                <li>
                  Complications with Diabetes:{" "}
                  {formatYesNo(submittedData.diabetesComplications)}
                </li>
                <li>
                  High Blood Pressure:{" "}
                  {formatYesNo(submittedData.highBloodPressure)}
                </li>
                <li>
                  High Cholesterol:{" "}
                  {formatYesNo(submittedData.highCholesterol)}
                </li>
                <li>
                  Kidney or Liver Disease:{" "}
                  {formatYesNo(submittedData.kidneyLiverDisease)}
                </li>
                <li>
                  Anxiety/Depression:{" "}
                  {formatYesNo(submittedData.anxietyDepression)}
                </li>
                <li>Thyroid: {formatYesNo(submittedData.thyroid)}</li>
                <li>
                  Asthma/COPD: {formatYesNo(submittedData.asthmaCOPD)}
                </li>
                <li>Lupus or RA: {formatYesNo(submittedData.lupusRA)}</li>
              </ul>
            </div>

            <div>
              <h2 className="text-md font-semibold mb-1">Lifestyle</h2>
              <ul className="space-y-2 list-disc list-inside text-xs">
                <li>
                  License Suspensions:{" "}
                  {formatYesNo(submittedData.licenseSuspensions)}
                </li>
                <li>
                  Speeding Tickets:{" "}
                  {formatYesNo(submittedData.speedingTickets)}
                </li>
                <li>
                  DUI or DWI (Last 10 years):{" "}
                  {formatYesNo(submittedData.duiDwi)}
                </li>
                <li>
                  Felony/Probation/Parole:{" "}
                  {formatYesNo(submittedData.felonyProbationParole)}
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-md font-semibold mb-1">Occupation</h2>
              <ul className="space-y-2 list-disc list-inside text-xs">
                <li>
                  Retired: {submittedData.occupation === "retired" ? "Yes" : "No"}
                </li>
                <li>
                  Working: {submittedData.occupation === "working" ? "Yes" : "No"}
                </li>
              </ul>

              <p className="mt-20 underline text-xs">
                Prescription Medications Prescribed:
              </p>
              <p className="text-sm mt-2 text-xs">
                {submittedData.prescriptionMeds || "-"}
              </p>
            </div>
          </div>
        </div>
      );
    };

    const SlideFinancialOverview = () => {
      if (!submittedData) return null;

      const formatCurrency = (value) =>
        value ? `$${Number(value).toLocaleString()}` : "-";

      return (
        <div className="relative flex-col bg-white items-center justify-center text-gray-800 font-sans overflow-hidden">
          <h1 className="text-3xl font-bold my-4 text-left w-full px-6">
            Financial Risk
          </h1>

          <div className="absolute left-12 top-30 text-2xl space-y-4 font-medium">
            <p className="text-lg">
              Payoff: {formatCurrency(submittedData.payoff)}
            </p>
            <p className="text-lg">
              Equity: {formatCurrency(submittedData.equity)}
            </p>

            <div className="mt-8">
              <p className="font-bold text-xl">Fall Back:</p>
              <div className="space-y-2 text-lg mt-4">
                <p className="text-lg">
                  Checking: {formatCurrency(submittedData.checking)}
                </p>
                <p className="text-lg">
                  Savings: {formatCurrency(submittedData.savings)}
                </p>
                <p className="text-lg">
                  401K: {formatCurrency(submittedData.retirement401k)}
                </p>
                <p className="text-lg">
                  IRA: {formatCurrency(submittedData.ira)}
                </p>
                <p className="text-lg">
                  Annuities: {formatCurrency(submittedData.annuities)}
                </p>
              </div>
            </div>
          </div>

          <div className="absolute top-24 flex justify-center items-center w-full space-x-64">
            <div className="relative">
              <img src={smiley} alt="Smiley" className="w-22 h-22 ms-40" />
              <div
                className="absolute -bottom-6 w-32 h-20 border-t-3 border-blue-400 rounded-t-full transform -translate-x-1/2"
                style={{
                  transform: "translateX(-50%) rotateZ(50deg)",
                  left: "135%",
                }}
              ></div>
            </div>
            <div className="relative">
              <img src={smiley} alt="Smiley" className="w-22 h-22" />
              <div
                className="absolute -bottom-6 w-32 h-20 border-t-3 border-blue-400 rounded-t-full transform -translate-x-1/2"
                style={{
                  transform: "translateY(50%) rotateZ(310deg)",
                  right: "0%",
                  top: "0%",
                }}
              ></div>
            </div>
          </div>

          <div className="relative border-3 me-25 border-blue-400 rounded-[90%] px-25 py-8 bg-white bg-opacity-10 mt-38 w-[60%] max-w-5xl mx-auto flex flex-col items-center justify-center text-center shadow-md">
            <h2 className="text-xl font-semibold mb-4">Major Bills</h2>

            <div className="grid grid-cols-2 gap-x-24 gap-y-3 text-md w-full justify-items-center">
              <div className="space-y-2 italic text-left">
                <p className="text-sm">
                  Monthly mortgage & property taxes:{" "}
                  {formatCurrency(submittedData.mortgagePropertyTax)}
                </p>
                <p className="text-sm">
                  Car Payments: {formatCurrency(submittedData.carPayments)}
                </p>
                <p className="text-sm">
                  Electric / Gas: {formatCurrency(submittedData.electricGas)}
                </p>
                <p className="text-sm">
                  Water: {formatCurrency(submittedData.water)}
                </p>
              </div>
              <div className="space-y-3 italic text-left">
                <p className="text-sm">
                  Cable Internet: {formatCurrency(submittedData.cableInternet)}
                </p>
                <p className="text-sm">
                  Cell Phone: {formatCurrency(submittedData.cellPhone)}
                </p>
                <p className="text-sm">
                  Car Insurance: {formatCurrency(submittedData.carInsurance)}
                </p>
                <p className="text-sm">
                  Gas for car: {formatCurrency(submittedData.gasForCar)}
                </p>
                <p className="text-sm">
                  Food: {formatCurrency(submittedData.food)}
                </p>
                <p className="text-sm">
                  Other loans: {formatCurrency(submittedData.otherLoans)}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    };

     // Custom arrow components
      const CustomPrevArrow = (props) => {
        const { onClick } = props;
        return (
          <button
            type="button"
            onClick={onClick}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 border-1 border-gray-300"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
        );
      };
    
      const CustomNextArrow = (props) => {
        const { onClick } = props;
        return (
          <button
            type="button"
            onClick={onClick}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 border-1 border-gray-300"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        );
      };
    
      // React Slick settings with fixed arrow functionality
      const sliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        afterChange: (current) => setCurrentSlide(current),
        prevArrow: <CustomPrevArrow />,
        nextArrow: <CustomNextArrow />,
        appendDots: (dots) => (
          <div className="mt-4">
            <ul className="flex justify-center space-x-2">{dots}</ul>
          </div>
        ),
        customPaging: (i) => (
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
            i === currentSlide ? 'bg-blue-600 scale-125' : 'bg-gray-300'
          }`} />
        )
      };

    return (
      <div className="relative h-[500px]">
        <button
          onClick={downloadCurrentSlide}
          className="absolute top-3 right-3 z-40 bg-white p-2 rounded-full shadow hover:bg-gray-100"
          title="Download this slide"
        >
          <ArrowDownTrayIcon className="w-6 h-6 text-gray-700" />
        </button>
       
        <Slider ref={sliderRef} {...sliderSettings}>
          <div className="h-[1123px] slick-slide"><MortgageProtectionInfo /></div>
          <div className="h-[1123px] slick-slide"><CertificateInfo /></div>
          <div className="h-[1123px] slick-slide"><CarrierInfo /></div>
          <div className="h-[1123px] slick-slide"><KeyThingsToCover /></div>
          <div className="h-[1123px] slick-slide"><SlidePersonalInfo /></div>
          <div className="h-[1123px] slick-slide"><SlideFinancialOverview /></div>
        </Slider>

      </div>
    );
  }
);

// ⭐ Required for ESLint — FIX 1
PreviewComponent.displayName = "PreviewComponent";

export default PreviewComponent;
