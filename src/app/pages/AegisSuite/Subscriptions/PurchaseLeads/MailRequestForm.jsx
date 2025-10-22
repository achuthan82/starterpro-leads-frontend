import { useRef, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import SignatureCanvas from "react-signature-canvas";
import { Button, Input } from "components/ui";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import html2canvas from "html2canvas-pro";
import Logo from "assets/app-logo/logo-new.png?.react";

import { v4 as uuidv4 } from "uuid";
import { JWT_HOST_API, STRIPE_KEY } from "configs/auth.config";
import axios from "axios";

const stripePromise = loadStripe(STRIPE_KEY);

export default function MailerRequestForm({ selectedPlan, plans }) {
  const uuid4 = uuidv4();
  const token = localStorage.getItem("authToken");
  const device = localStorage.getItem("device_type");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const standardizedTZ =
    timezone === "Asia/Calcutta" ? "Asia/Kolkata" : timezone;
  const [states, setStates] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [qtyOptions, setQtyOptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });
  const user = localStorage.getItem("currentUser");
  const userData = JSON.parse(user);
  const sigPad = useRef();
  const callCoupons = true;
  const getStates = () => {
    setStatesLoading(true);
    const config = {
      method: "get",
      url: `${JWT_HOST_API}/pricing/usa_states`,
      headers: {
        Authorization: `Bearer ${token}`,
        "x-platform": device,
      },
    };
    axios(config)
      .then((response) => {
        console.log("response", response);
        setStatesLoading(false);
        if (response.data.status === 200) {
          const dt = response.data.data;
          const arr = [];
          Object.keys(dt).map(function (key) {
            arr.push({ value: dt[key], label: key });
          });
          setStates(arr);
        } else if (response.data.status === 401) {
          toast.error(response.data.message);
          // dispatch(handleLogout());
          // navigate("/login");
        } else if (response.data.status === 204) {
          setStates([]);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(() => {
        toast.error(
          "This Service is not available at the moment..please try again later",
        );
        setStatesLoading(false);
      });
  };

  const getCoupons = (id) => {
    setCouponsLoading(true);
    const config = {
      method: "post",
      url: `${JWT_HOST_API}/promotion_code/my-promotion-code-for-subscription/${id}?time_zone=${standardizedTZ}`,
      payload: {},
      headers: {
        Authorization: `Bearer ${token}`,
        "x-platform": device,
      },
    };
    axios(config)
      .then((response) => {
        console.log("response", response);
        setCouponsLoading(false);
        if (response.data.status === 200) {
          const cops = response.data.data.map((cp) => ({
            value: cp?.stripe_promotion_id,
            label: cp?.code,
            ...cp,
          })); //code: cp?.code, percent_off: cp?.percent_off
          setCoupons(cops);
        } else if (response.data.status === 401) {
          toast.error(response.data.message);
        } else if (response.data.status === 204) {
          setCoupons([]);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(() => {
        toast.error(
          "This Service is not available at the moment..please try again later",
        );
        setCouponsLoading(false);
      });
  };

  useEffect(() => {
    if (plans.length > 0) {
      const arr = [];
      plans.map(function (dt) {
        arr.push({
          value: dt?.unit_price,
          net_price: dt?.net_price,
          qty: dt?.quantity,
          label: dt?.title,
          id: dt?.id,
          stripe_price_id: dt?.stripe_price_id,
          stripe_product_id: dt?.stripe_product_id,
        });
      });
      setQtyOptions(arr);
    }
  }, [plans]);
  useEffect(() => {
    getStates();
    if (userData && userData?.name) {
      const nms = userData?.name.split(" ");
      setValue("firstName1", nms[0]);
      setValue("firstName2", nms[0]);
      setValue("firstName3", nms[0]);
      setValue("firstName4", nms[0]);
      setValue("firstName5", nms[0]);
      setValue("lastName1", nms[1]);
      setValue("lastName2", nms[1]);
      setValue("lastName3", nms[1]);
      setValue("lastName4", nms[1]);
      setValue("lastName5", nms[1]);
      setValue("phone", userData?.phone);
      setValue("agency", userData?.agency_name);
      setValue("email", userData?.email);
    }
  }, []);
  useEffect(() => {
    if (qtyOptions.length > 0) {
      const index = qtyOptions.findIndex((item) => item.id === selectedPlan);
      setValue("service", qtyOptions[index]);
      if (callCoupons) {
        getCoupons(qtyOptions[index].id);
      }
      setValue("totalAmount", qtyOptions[index].net_price);
      setTotal(qtyOptions[index].net_price);
    }
  }, [qtyOptions]);

  const handlePrice = (e) => {
    setValue("service", e, { shouldValidate: true });
    const total = e.net_price;
    setTotal(total);
    if (callCoupons) {
      getCoupons(e.id);
    }
    setValue("totalAmount", total, { shouldValidate: true });
  };

  const handleCoupon = (e) => {
    setValue("coupon", e);
    setCoupon(e);
  };

  const generateAndSendPDF = async () => {
    try {
      const element = document.getElementById("content-id");
      console.log("element", element);
      element
        .querySelectorAll(
          "div, p, h1, h2, h3, h4, h5, h6, span, a, button, input, textarea, select, option, label, table, th, td, tr, tbody, thead, tfoot, form, fieldset, legend, output, progress, meter, details, summary, dialog, iframe, video, audio, canvas, svg, path, rect, circle, ellipse, line, polyline, polygon, text, tspan, g, use, image, foreignObject, symbol, defs, clipPath, mask, pattern, symbol, defs, clipPath, mask, pattern",
        )
        .forEach((el) => {
          el.style.color = "#222222";
        });
      const canvas = await html2canvas(element, {
        scale: 1.4,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        color: "#222222",
      });

      const imgData = canvas.toDataURL("image/png");
      const config = {
        method: "post",
        url: `${JWT_HOST_API}/files/upload/purchase_agreement/${uuid4}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-platform": device,
        },
        data: { img: imgData },
      };

      const response = await axios(config);
      if (response.data.status === 200) {
        return true;
      } else {
        toast.error("Failed to send acknowledgement");
        return false;
      }
    } catch (error) {
      console.error("Error uploading acknowledgement:", error);
      toast.error("Error uploading acknowledgement");
      return false;
    }
  };

  const handleStripeCheckout = async (data) => {
    setLoading(true);
    try {
      const pdfSent = await generateAndSendPDF();
      console.log(pdfSent);
      if (!pdfSent) {
        toast.error("Failed to process agreement. Please try again.");
        setLoading(false);
        return;
      }

      const stripe = await stripePromise;
      if (!total || total <= 0) {
        throw new Error("Invalid payment amount");
      }
      const sts = [];
      data.states.map((st) => sts.push(st.value));
      const dt = {
        success_url: `${window.location.origin.toString()}/subscriptions/success`,
        cancel_url: `${window.location.origin.toString()}/subscriptions/cancel`,
        price_id: data.service.stripe_price_id,
        stripe_product_id: data.service.stripe_product_id,
        item: {
          name: data.service.label,
          quantity: 1,
          pricing_id: data.service.id,
          lead_quantity: data.service.qty,
          unit_price: data.service.value,
          net_price: data.service.net_price,
          total_amount: total,
          states: sts,
        },
      };
      if (data?.coupon?.value) {
        dt["stripe_promotion_id"] = data?.coupon?.value;
        dt["promo_code_db_id"] = data?.coupon?.id;
      }

      const config = {
        method: "post",
        url: `${JWT_HOST_API}/stripe/create-checkout-session/${uuid4}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-platform": device,
        },
        data: dt,
      };
      const response = await axios(config);
      console.log("response", response);
      if (response.data.status === 200) {
        const session = response?.data?.data;
        console.log("Checkout session created:", session);
        sessionStorage.setItem("session_id", session?.session_id);
        sessionStorage.setItem("subscription_amount", session?.amount_total);
        const result = await stripe.redirectToCheckout({
          sessionId: session?.session_id,
        });
        if (result.error) {
          throw new Error(result.error.message);
        }
      } else if (response.data.status === 401) {
        toast.error(response.data.message);
      } else if (response.data.status === 204) {
        return null;
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error && error.message) {
        toast.error(error.message);
      } else {
        toast.error(
          "This Service is not available at the moment..please try again later",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (!sigPad.current) {
        toast.error("Please provide your signature");
        return;
      }

      if (!total || total <= 0) {
        toast.error("Please select a mailer package");
        return;
      }

      // data.signature = sigPad.current.getTrimmedCanvas().toDataURL("image/png");
      await handleStripeCheckout(data);
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error(
        "An error occurred while submitting the form. Please try again.",
      );
    }
  };

  return (
    <>
      {/* <CardBody className="p-0"> */}
      <div className="w-full p-6 px-9" id="content-id">
        <div className="mb-2 text-center">
          <div className="flex justify-center mb-2">
            <img
              src={Logo}
              alt="Logo"
              style={{ maxWidth: "8%", height: "auto", objectFit: "contain" }}
            />
          </div>
          {/* <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-yellow-200/50 bg-gradient-to-br from-white to-yellow-50 shadow-2xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-aegis-navy h-12 w-12"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
            </svg>
          </div> */}
          {/* <img src="/Aegis Suite-icon.png" alt="Aegis Suite Logo" style={{ maxWidth: 130, marginBottom: 20, marginRight: 'auto', marginLeft: 'auto' }} /> */}
          <h2 className="mb-1" style={{ fontWeight: 700 }}>
            FIRST-TIME REQUEST FORM
          </h2>
          <p style={{ fontSize: 15 }}>
            Mailing services are provided by Aegis Suite. Please fill out this
            form to request your mailer services. Your mailing partner will
            contact you right after.
          </p>
        </div>
        <form className="text-dark" onSubmit={handleSubmit(onSubmit)}>
          {/* Section 1 */}
          <div className="mb-6">
            <h5 className="mb-2 text-lg font-semibold">
              What is the Aegis Suite Mailer Program?
            </h5>
            <p className="mb-3 text-sm">
              Our mailer program consists of printing first-time homeowner data
              (extracted from public records) onto a letter - this is known as a
              &quot;mailer&quot;. The amount of mailers and states is chosen by
              you before printer batch begins. We then seal, postage, wrap, and
              drop off the total mailers at the post office (for example, 3,000
              mailers to Texas) so that it can be processed and shipped by USPS.
              Mailers go out every Monday of every week. After delivery,
              homeowners will start calling our automated system, generating
              leads in real time for the agents!
            </p>

            <p className="flex flex-wrap items-center gap-2 text-sm">
              I
              <Controller
                name="firstName1"
                control={control}
                rules={{
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "First name must be at least 2 characters",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="First Name"
                    className={`rounded border px-2 py-1 text-sm ${errors.firstName1 ? "border-red-500" : "border-gray-300"}`}
                  />
                )}
              />
              <Controller
                name="lastName1"
                control={control}
                rules={{
                  required: "Last name is required",
                  minLength: {
                    value: 1,
                    message: "Last name must be at least 1 characters",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Last Name"
                    className={`rounded border px-2 py-1 text-sm ${errors.lastName1 ? "border-red-500" : "border-gray-300"}`}
                  />
                )}
              />
              have read the above section and fully understand what the mailer
              program is about. I understand that results are not guaranteed
            </p>

            {errors.firstName1 && (
              <span className="mt-1 block text-sm text-red-500">
                {errors.firstName1.message}
              </span>
            )}
            {errors.lastName1 && (
              <span className="mt-1 block text-sm text-red-500">
                {errors.lastName1.message}
              </span>
            )}
          </div>

          {/* Section 3 */}
          <div className="mb-4">
            <h5 className="mb-2 text-lg font-semibold">
              Important Information:
            </h5>
            <p className="mb-4 text-sm">
              YOUR ORDERED REQUEST MUST BE SUBMITTED BY END OF DAY WEDNESDAY.
              THE ORDER WILL BE CONFIRMED AND PAYMENT WILL BE PROCESSED ON
              WEDNESDAYS. ALL ORDERS ARE MAILED ON THE FOLLOWING MONDAY. YOU
              SHOULD START RECEIVING LEADS 5-7 DAYS FROM MAILING DATE. RETURN
              RATES ARE TYPICALLY 2% TO 8% (IT VARIES BY STATE) BUT IS NEVER
              GUARANTEED.
            </p>

            {/* Name Fields */}
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="firstName2"
                control={control}
                rules={{
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "First name must be at least 2 characters",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="First Name"
                    className={`w-full rounded border px-3 py-2 text-sm ${errors.firstName2 ? "border-red-500" : "border-gray-300"}`}
                  />
                )}
              />
              {errors.firstName2 && (
                <span className="text-sm text-red-500">
                  {errors.firstName2.message}
                </span>
              )}

              <Controller
                name="lastName2"
                control={control}
                rules={{
                  required: "Last name is required",
                  minLength: {
                    value: 1,
                    message: "Last name must be at least 1 characters",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Last Name"
                    className={`w-full rounded border px-3 py-2 text-sm ${errors.lastName2 ? "border-red-500" : "border-gray-300"}`}
                  />
                )}
              />
              {errors.lastName2 && (
                <span className="text-sm text-red-500">
                  {errors.lastName2.message}
                </span>
              )}
            </div>

            {/* Phone & Email */}
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit phone number",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Phone Number"
                    className={`w-full rounded border px-3 py-2 text-sm ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                  />
                )}
              />
              {errors.phone && (
                <span className="text-sm text-red-500">
                  {errors.phone.message}
                </span>
              )}

              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Email"
                    className={`w-full rounded border px-3 py-2 text-sm ${errors.email ? "border-red-500" : "border-gray-300"}`}
                  />
                )}
              />
              {errors.email && (
                <span className="text-sm text-red-500">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Agency Name */}
            <div className="mb-4">
              <Controller
                name="agency"
                control={control}
                rules={{
                  required: "Agency name is required",
                  minLength: {
                    value: 2,
                    message: "Agency name must be at least 2 characters",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Agency Name"
                    className={`w-full rounded border px-3 py-2 text-sm ${errors.agency ? "border-red-500" : "border-gray-300"}`}
                  />
                )}
              />
              {errors.agency && (
                <span className="text-sm text-red-500">
                  {errors.agency.message}
                </span>
              )}
            </div>

            {/* States Multi-select */}
            <div className="mb-2">
              <Controller
                name="states"
                control={control}
                rules={{
                  required: "Please Select Minimum 5 and Maximum 10 States",
                  validate: (value) =>
                    (value && value.length > 4 && value.length < 11) ||
                    "Please Select Minimum 5 and Maximum 10 States",
                }}
                render={({ field }) => (
                  <Select
                    {...field}
                    isMulti={true}
                    options={states}
                    isLoading={statesLoading}
                    placeholder="Select States"
                    classNamePrefix="react-select"
                    className={
                      errors.states ? "rounded border border-red-500" : ""
                    }
                  />
                )}
              />
              {errors.states && (
                <span className="text-sm text-red-500">
                  {errors.states.message}
                </span>
              )}
            </div>
          </div>

          {/* Section 4 */}
          <div className="mb-6">
            <div className="mb-4 rounded border border-gray-300 bg-gray-100 p-3 text-sm">
              <strong>
                DUE TO THE DEMAND OF OUR MAILER PROGRAM AND THE LIMITED AMOUNT
                OF MORTGAGES AVAILABLE FROM THE PUBLIC RECORDS, THE DATA USED TO
                SEND MAIL IS NOT EXCLUSIVE AND IS NOT UNIQUE TO YOU.
              </strong>
            </div>

            <p className="flex flex-wrap items-center gap-2 text-sm">
              I
              <Controller
                name="firstName3"
                control={control}
                rules={{ required: "First name is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="First Name"
                    className={`rounded border px-2 py-1 text-sm ${
                      errors.firstName3 ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                )}
              />
              <Controller
                name="lastName3"
                control={control}
                rules={{ required: "Last name is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Last Name"
                    className={`rounded border px-2 py-1 text-sm ${
                      errors.lastName3 ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                )}
              />
              have read and fully understand the above statement. I understand
              that the data used is not exclusive AND is not unique to me, and I
              accept these conditions.
            </p>

            {(errors.firstName3 || errors.lastName3) && (
              <div className="mt-1 space-y-1">
                {errors.firstName3 && (
                  <span className="block text-sm text-red-500">
                    {errors.firstName3.message}
                  </span>
                )}
                {errors.lastName3 && (
                  <span className="block text-sm text-red-500">
                    {errors.lastName3.message}
                  </span>
                )}
              </div>
            )}

            {/* This error seems unrelated to this section, keep only if used in form schema */}
            {errors.ack2 && (
              <span className="mt-1 block text-sm text-red-500">
                {errors.ack2.message || "This field is required"}
              </span>
            )}
          </div>

          {/* Mailer Package */}
          <div className="mb-6">
            <h5 className="mb-2 text-lg font-semibold">
              SELECT YOUR MAILER PACKAGE
            </h5>
            <p className="mb-4 text-sm">
              Please choose the mailer package that best fits your criteria. It
              is highly recommended to send on a WEEKLY basis to get the best
              results. This will ensure consistency and give you the best chance
              for success! If you would like to make changes to your order once
              the form is submitted, please contact your support manager
              immediately.
            </p>

            {/* Mailer Package Select */}
            <Controller
              name="service"
              control={control}
              rules={{ required: "Please select a mailer package" }}
              render={({ field }) => (
                <Select
                  {...field}
                  onChange={handlePrice}
                  options={qtyOptions}
                  placeholder="Choose Your Service"
                  className={
                    errors.service ? "rounded border border-red-500" : ""
                  }
                  classNamePrefix="react-select"
                />
              )}
            />
            {errors.service && (
              <div className="mt-1 text-sm text-red-500">
                {errors.service.message}
              </div>
            )}

            {/* Total Amount Input (Read-only) */}
            <div className="mt-4">
              <Controller
                name="totalAmount"
                control={control}
                rules={{ required: "Total amount is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    readOnly
                    placeholder="Total Amount"
                    className={`mt-1 w-full rounded border px-3 py-2 text-sm ${
                      errors.totalAmount ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                )}
              />
              {errors.totalAmount && (
                <span className="mt-1 block text-sm text-red-500">
                  {errors.totalAmount.message}
                </span>
              )}
            </div>
          </div>

          {/* Additional Terms */}
          <div className="mb-6">
            <h5 className="mb-2 text-lg font-semibold">Additional Terms</h5>

            <p className="mb-4 flex flex-wrap items-center gap-2 text-sm">
              I,
              <Controller
                name="firstName4"
                control={control}
                rules={{ required: "First name is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="First Name"
                    className={`rounded border px-2 py-1 text-sm ${
                      errors.firstName4 ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                )}
              />
              <Controller
                name="lastName4"
                control={control}
                rules={{ required: "Last name is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Last Name"
                    className={`rounded border px-2 py-1 text-sm ${
                      errors.lastName4 ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                )}
              />
              , agree to the Terms and Conditions set forth by Aegis Suite. I
              agree that all sales are final and as is. I agree that I will not
              be refunded under any circumstances. I agree that I will email
              Aegis Suite team on admin@Aegis Suiteleads.com, within 12hrs or
              less, if I want to make any changes to my order (for example:
              change states to mail to, or increase mailer from 3,000 to 5,000).
              I understand that if I do not communicate order changes, then
              Aegis Suite will fulfill the services based on what I am
              requesting on this form today. I also understand I am waiving my
              right to dispute this charge with my bank for claims or actions
              not received by cardholder or other similar claim or non-service.
              Aegis Suite accepts no responsibility for any issues arising from
              calling the leads, booking appointments, or any issues concerning
              the leads or the mailers. Aegis Suite is simply mailing the
              mailers for you with data obtained from public data sources. I
              understand I am required to comply with all applicable laws
              including but not limited to those governing insurance sales. I
              understand I am required to comply with all laws and rules
              regarding contacting any leads and not contacting them if they
              request to not be contacted. I accept full responsibility for
              remaining compliant. I agree to be TCPA compliant. I also have
              fully read and agree to the terms and conditions on Aegis
              Suiteleads.com (
              <a
                href="https://Aegis Suiteleads.com/terms-and-conditions/"
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://Aegis Suiteleads.com/terms-and-conditions/
              </a>
              ).
            </p>

            <p className="mb-4 text-sm">
              I hereby confirm that I have read all the terms and conditions of
              this Jotform Request for the Aegis Suite Mailer program.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Controller
                  name="firstName5"
                  control={control}
                  rules={{ required: "First name is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="First Name"
                      className={`w-full rounded border px-3 py-2 text-sm ${
                        errors.firstName5 ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  )}
                />
                {errors.firstName5 && (
                  <span className="mt-1 block text-sm text-red-500">
                    {errors.firstName5.message}
                  </span>
                )}
              </div>

              <div>
                <Controller
                  name="lastName5"
                  control={control}
                  rules={{ required: "Last name is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Last Name"
                      className={`w-full rounded border px-3 py-2 text-sm ${
                        errors.lastName5 ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  )}
                />
                {errors.lastName5 && (
                  <span className="mt-1 block text-sm text-red-500">
                    {errors.lastName5.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="mb-2">
            <span>Signature</span>
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: 6,
                width: 320,
                background: "#fafafa",
              }}
            >
              <SignatureCanvas
                ref={sigPad}
                penColor="black"
                canvasProps={{
                  width: 300,
                  height: 100,
                  className: "sigCanvas",
                }}
              />
            </div>
            <Button
              data-html2canvas-ignore="true"
              color="secondary"
              size="sm"
              type="button"
              className="mt-1"
              onClick={() => sigPad.current.clear()}
            >
              Clear
            </Button>
          </div>

          <div className="w-100" data-html2canvas-ignore="true">
            {/* <Label>Redeem Coupon</Label> */}
            {/* // <FormGroup> */}
            <Controller
              name="coupon"
              control={control}
              rules={{
                required: false,
              }}
              render={({ field }) => (
                <Select
                  label="Redeem Coupons"
                  {...field}
                  options={coupons}
                  isClearable={true}
                  isLoading={couponsLoading}
                  onChange={handleCoupon}
                  placeholder="Select Coupons"
                  className={errors.coupon ? "is-invalid" : ""}
                />
              )}
            />
            {errors.coupon && (
              <div className="text-danger" style={{ fontSize: 12 }}>
                {errors.coupon.message}
              </div>
            )}
            {coupon && coupon.name && (
              <small className="d-block mt-50">
                {coupon?.percent_off
                  ? `Get ${coupon?.percent_off}% off in stripe checkout`
                  : coupon?.amount_off
                    ? `Get ${coupon?.amount_off} off in stripe checkout`
                    : ""}
              </small>
            )}
            {/* // </FormGroup> */}
          </div>
          <div className="mt-3 text-center" data-html2canvas-ignore="true">
            <Button color="success" size="lg" type="submit" disabled={loading}>
              {loading ? "Processing..." : "Continue"}
            </Button>
          </div>
        </form>
      </div>
      {/* </CardBody> */}
    </>
  );
}
