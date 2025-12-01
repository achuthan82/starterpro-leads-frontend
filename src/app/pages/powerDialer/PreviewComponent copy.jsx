import { useState, useRef, useEffect } from "react";
import * as htmlToImage from "html-to-image";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import Slider from "react-slick";
import { ChevronLeftIcon, ChevronRightIcon, MegaphoneIcon } from "@heroicons/react/24/outline";
import profileService from "utils/profileService";

// Import Slick CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import bg from "./images/mortgageProtection.jpg"
import smiley from "./images/smile-icon.svg"; 

const PreviewComponent = ({ submittedData, licenseDetails = null }) => {
  console.log(submittedData)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carriersLogo, setCarriersLogo] = useState(null);
  const [carriersLoading, setCarriersLoading] = useState(false);

  // Derived URLs so we can use them in download logic as well
  const licenseImage =
    licenseDetails?.image || licenseDetails?.certificate || null;

  const carriersImage =
    carriersLogo?.image ||
    carriersLogo?.url ||
    carriersLogo?.logo_url ||
    carriersLogo ||
    null;

  const sliderRef = useRef(null);

  // Fetch carriers logo on mount
  useEffect(() => {
    const fetchCarriersLogo = async () => {
      setCarriersLoading(true);
      try {
        const response = await profileService.getCarriersLogo();
        if (response.data && response.data.status === 200 && response.data.data) {
          setCarriersLogo(response.data.data);
        } else {
          setCarriersLogo(null);
        }
      } catch (error) {
        console.error('Error fetching carriers logo:', error);
        setCarriersLogo(null);
      } finally {
        setCarriersLoading(false);
      }
    };
    fetchCarriersLogo();
  }, []);

  const formatYesNo = (value) => {
    if (value === 'yes') return 'Yes';
    if (value === 'no') return 'No';
    return '-';
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

const downloadImageFile = async (url, fileName) => {
  try {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Image download failed", error);
  }
};

const downloadCurrentSlide = async () => {
  // Slide 2 (index 1): CertificateInfo
  if (currentSlide === 1 && licenseImage) {
    downloadImageFile(licenseImage, "slide-2-certificate.png");
    return;
  }

  // Slide 3 (index 2): CarrierInfo
  if (currentSlide === 2 && carriersImage) {
    downloadImageFile(carriersImage, "slide-3-carriers.png");
    return;
  }

  // All other slides → html-to-image
  const slide = document.querySelector(
    `.slick-slide[data-index="${currentSlide}"]:not(.slick-cloned)`
  );

  if (!slide) return;

  const node = slide.firstElementChild || slide;

  try {
    const dataUrl = await htmlToImage.toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `slide-${currentSlide + 1}.png`;
    link.click();
  } catch (err) {
    console.error("Failed to download slide:", err);
  }
};



  // Slide Components
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
        {/* Title */}
        <h1 className="text-6xl font-medium leading-tight my-15">
          MORTGAGE <br /> PROTECTION
        </h1>

        {/* Subtext */}
        <div className="space-y-2 font-light text-lg mb-12">
          <p>* Protect Your Most Valuable Asset</p>
          <p>* Your Home and or your Retirement Nest Egg</p>
        </div>

        {/* Footer Info */}
        <div className="flex justify-between w-full max-w-3xl font-light text-sm">
          <div className="space-y-1">
            <p>• {JSON.parse(localStorage.getItem('currentUser'))?.name}</p>
            <p>• Senior Field Underwriter</p>
          </div>

          <div className="space-y-1 text-left">
            <p>State License ID: {licenseDetails?.license_number || 'N/A'}</p>
            <p>NPN: {JSON.parse(localStorage.getItem('currentUser'))?.npn || 'N/A'}</p>
          </div>
        </div>
      </div>
    );
  };

  const CertificateInfo = () => {
    const licenseImage = licenseDetails?.image || licenseDetails?.certificate;
    
    return (
      <div
        className="flex-col bg-white border-t-[40px] border-b-[40px] border-[#3BA9F4] items-center justify-center text-white text-lg font-normal px-12 py-2"
      >
        <div className="flex items-center justify-center h-full">
          {licenseImage ? (
            <img src={licenseImage} alt="license certificate" className="w-full h-full object-contain"/>
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
    const carriersImage = carriersLogo?.image || carriersLogo?.url || carriersLogo?.logo_url || carriersLogo;
    
    return (
      <div
        className="flex-col bg-white border-t-[40px] border-b-[40px] border-[#3BA9F4] items-center justify-center text-white text-lg font-normal px-12 py-2"
      >
        <div className="flex items-center justify-center h-full">
          {carriersLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-xl font-medium">Loading carriers...</p>
            </div>
          ) : carriersImage ? (
            <img src={carriersImage} alt="carriers" className="w-full h-full object-contain"/>
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
        {/* Left Blue Section with Icon */}
        <div className="bg-[#3BA9F4] w-1/4 flex items-center justify-center">
          <MegaphoneIcon className="w-32 h-32 text-white" />
        </div>

        {/* Right Content Section */}
        <div className="flex-col justify-center px-16 w-3/4">
          {/* Title */}
          <h1 className="text-5xl font-extrabold leading-tight my-15">
            4 Key Things <br /> To Cover Today
          </h1>

          {/* Subtitle */}
          <p className="text-lg mb-6">
            My Role & Purpose:{" "}
            <span className="italic font-medium text-gray-600">
              (You Cannot Buy Insurance Today)
            </span>
          </p>

          {/* Numbered List */}
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
          minHeight: '100vh'
        }}
      >
        {/* Title */}
        <h1 className="text-3xl font-semibold text-left my-3">
          Verifying Information
        </h1>

        {/* 3 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 w-full max-w-6xl">
          {/* Health Section */}
          <div>
            <h2 className="text-md font-semibold mb-1">Health</h2>
            <ul className="space-y-2 list-disc list-inside text-xs">
              <li>Age: {submittedData.age || "-"}</li>
              <li>Height/Weight: {submittedData.height || "-"} / {submittedData.weight || "-"}</li>
              <li>Heart Attack: {formatYesNo(submittedData.heartAttack)}</li>
              <li>Stroke: {formatYesNo(submittedData.stroke)}</li>
              <li>Cancer: {formatYesNo(submittedData.cancer)}</li>
              <li>Stents: {formatYesNo(submittedData.stents)}</li>
              <li>Diabetes: {formatYesNo(submittedData.diabetes)}</li>
              <li>Complications with Diabetes: {formatYesNo(submittedData.diabetesComplications)}</li>
              <li>High Blood Pressure: {formatYesNo(submittedData.highBloodPressure)}</li>
              <li>High Cholesterol: {formatYesNo(submittedData.highCholesterol)}</li>
              <li>Kidney or Liver Disease: {formatYesNo(submittedData.kidneyLiverDisease)}</li>
              <li>Anxiety/Depression: {formatYesNo(submittedData.anxietyDepression)}</li>
              <li>Thyroid: {formatYesNo(submittedData.thyroid)}</li>
              <li>Asthma/COPD: {formatYesNo(submittedData.asthmaCOPD)}</li>
              <li>Lupus or RA: {formatYesNo(submittedData.lupusRA)}</li>
            </ul>
          </div>

          {/* Lifestyle Section */}
          <div>
            <h2 className="text-md font-semibold mb-1">Lifestyle</h2>
            <ul className="space-y-2 list-disc list-inside text-xs">
              <li>
                License Suspensions: {formatYesNo(submittedData.licenseSuspensions)}
              </li>
              <li>
                Speeding Tickets: {formatYesNo(submittedData.speedingTickets)}
              </li>
              <li>
                DUI or DWI (Last 10 years): {formatYesNo(submittedData.duiDwi)}
              </li>
              <li>
                Felony/Probation/Parole: {formatYesNo(submittedData.felonyProbationParole)}
              </li>
            </ul>
          </div>

          {/* Occupation Section */}
          <div>
            <h2 className="text-md font-semibold mb-1">Occupation</h2>
            <ul className="space-y-2 list-disc list-inside text-xs">
              <li>Retired: {submittedData.occupation === 'retired' ? 'Yes' : 'No'}</li>
              <li>Working: {submittedData.occupation === 'working' ? 'Yes' : 'No'}</li>
            </ul>     
          </div>
        </div>
        <p className="mt-4 underline text-xs ">
          Prescription Medications Prescribed:
        </p>
        <p className="text-sm mt-2 text-xs">
          {submittedData.prescriptionMeds || "-"}
        </p>
      </div>
    );
  };

  const SlideFinancialOverview = () => {
    if (!submittedData) return null;

    const formatCurrency = (value) =>
      value ? `$${Number(value).toLocaleString()}` : "-";

    return (
      <div
        className="relative flex-col bg-white items-center justify-center text-gray-800 font-sans overflow-hidden"
      >
        {/* Title */}
        <h1 className="text-3xl font-bold my-4 text-left w-full px-6">
          Financial Risk
        </h1>

        {/* Left Text Section */}
        <div className="absolute left-12 top-30 text-2xl space-y-4 font-medium">
          <p className="text-lg">Payoff - {formatCurrency(submittedData.payoff)}</p>
          <p className="text-lg">Equity - {formatCurrency(submittedData.equity)}</p>

          <div className="mt-8">
            <p className="font-bold text-xl">Fall Back:</p>
            <div className="space-y-2 text-lg mt-4">
              <p className="text-lg">Checking - {formatCurrency(submittedData.checking)}</p>
              <p className="text-lg">Savings - {formatCurrency(submittedData.savings)}</p>
              <p className="text-lg">401K - {formatCurrency(submittedData.retirement401k)}</p>
              <p className="text-lg">IRA - {formatCurrency(submittedData.ira)}</p>
              <p className="text-lg">Annuities - {formatCurrency(submittedData.annuities)}</p>
            </div>
          </div>
        </div>

        {/* Smiley Faces with Blue Curved Lines */}
        <div className="absolute top-24 flex justify-center items-center w-full space-x-64">
          <div className="relative">
            <img src={smiley} alt="Smiley" className="w-22 h-22 ms-40" />
            <div
              className="absolute -bottom-6 w-32 h-20 border-t-3 border-blue-400 rounded-t-full transform -translate-x-1/2"
              style={{ transform: 'translateX(-50%) rotateZ(50deg)', left: '135%' }}
            ></div>
          </div>
          <div className="relative">
            <img src={smiley} alt="Smiley" className="w-22 h-22" />
            <div className="absolute -bottom-6 w-32 h-20 border-t-3 border-blue-400 rounded-t-full transform -translate-x-1/2"
              style={{ transform: 'translateY(50%) rotateZ(310deg)', right: '0%', top: '0%' }}
            >
            </div>
          </div>
        </div>

        {/* Blue Oval for Major Bills */}
        <div className="relative border-3 me-25 border-blue-400 rounded-[90%] px-25 py-8 bg-white bg-opacity-10 mt-38 w-[60%] max-w-5xl mx-auto flex flex-col items-center justify-center text-center shadow-md">
          <h2 className="text-xl font-semibold mb-4">Major Bills</h2>

          <div className="grid grid-cols-2 gap-x-24 gap-y-3 text-md w-full justify-items-center">
            <div className="space-y-2 italic text-left">
              <p className="text-sm">Monthly mortgage & property taxes - {formatCurrency(submittedData.mortgagePropertyTax)}</p>
              <p className="text-sm">Car Payments - {formatCurrency(submittedData.carPayments)}</p> 
              <p className="text-sm">Electric / Gas - {formatCurrency(submittedData.electricGas)}</p>
              <p className="text-sm">Water - {formatCurrency(submittedData.water)}</p>
              {/* <p className="text-sm">Other Bills</p> */}
            </div>
            <div className="space-y-3 italic text-left">
              <p className="text-sm">Cable Internet - {formatCurrency(submittedData.cableInternet)}</p>
              <p className="text-sm">Cell Phone - {formatCurrency(submittedData.cellPhone)}</p>
              <p className="text-sm">Car Insurance - {formatCurrency(submittedData.carInsurance)}</p>
              <p className="text-sm">Gas for car - {formatCurrency(submittedData.gasForCar)}</p>
              <p className="text-sm">Food - {formatCurrency(submittedData.food)}</p>
              <p className="text-sm">Other loans - {formatCurrency(submittedData.otherLoans)}</p>
            </div>
          </div>
        </div>
      </div>
    );
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
    <div className="h-[500px] slick-slide">
      <MortgageProtectionInfo />
    </div>
    <div className="h-[500px] slick-slide">
      <CertificateInfo />
    </div>
    <div className="h-[500px] slick-slide">
      <CarrierInfo />
    </div>
    <div className="h-[500px] slick-slide">
      <KeyThingsToCover />
    </div>
    <div className="h-[500px] slick-slide">
      <SlidePersonalInfo />
    </div>
    <div className="h-[500px] slick-slide">
      <SlideFinancialOverview />
    </div>
  </Slider>
</div>

);

};

export default PreviewComponent;