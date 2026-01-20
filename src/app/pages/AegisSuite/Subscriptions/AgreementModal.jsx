import { Fragment, useState, useRef } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import Logo from "assets/app-logo/logo-text.svg";
import { Button, GhostSpinner } from "components/ui";
import SignatureCanvas from "react-signature-canvas";
import { v4 as uuidv4 } from "uuid";
import { loadStripe } from "@stripe/stripe-js";
import { JWT_HOST_API, STRIPE_KEY } from "configs/auth.config";
import axios from "axios";
import { toast } from "sonner";
import html2canvas from "html2canvas-pro";
import { useParams } from "react-router";
// import { jsPDF } from "jspdf";

export default function CommitmentAgreementModal({
  isOpen,
  onClose,
  selectedPlan,
  //   billingType,
}) {
  const uuid4 = uuidv4();
  const sigCanvas = useRef();

  const params = useParams();
  const clearSignature = () => {
    sigCanvas.current.clear();
    setIsSigned(false);
  };
  const stripePromise = loadStripe(STRIPE_KEY);
  const [isSigned, setIsSigned] = useState(false);
  // const [isChecked, setIsChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const generateAndSendPDF = async () => {
    try {
      const original = document.getElementById("content-id");
      if (!original) {
        toast.error("Could not find content to capture.");
        return false;
      }

      const element = original.cloneNode(true);
      document.body.appendChild(element);

      // Insert at very top of the agreement
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.top = "0";
      element.style.width = "820px";
      element.style.padding = "24px";
      element.style.background = "#ffffff";
      element.style.boxSizing = "border-box";

      const logoWrapper = document.createElement("div");
      logoWrapper.style.textAlign = "center";
      logoWrapper.style.marginBottom = "20px";

      const logoImg = document.createElement("img");
      logoImg.src = Logo;
      logoImg.style.width = "160px";
      logoImg.style.height = "auto";
      logoImg.style.margin = "0 auto";

      logoWrapper.appendChild(logoImg);

      // Insert at very top
      element.prepend(logoWrapper);
      const scrollArea = element.querySelector(".overflow-y-auto");
      if (scrollArea) {
        scrollArea.style.overflow = "visible";
        scrollArea.style.maxHeight = "none";
        scrollArea.style.height = "auto"; // important
        scrollArea.style.paddingRight = "0px";

        scrollArea.style.minHeight = scrollArea.scrollHeight + "px";
      }

      element.querySelectorAll("button").forEach((btn) => btn.remove());

      const sigImage = sigCanvas.current.toDataURL();

      const signatureBox = element.querySelector(".sigCanvas")?.parentElement;
      if (signatureBox) {
        signatureBox.innerHTML = "<strong>Signature:</strong>";

        const img = document.createElement("img");
        img.src = sigImage;
        img.style.width = "100%";
        img.style.marginTop = "8px";
        img.style.border = "1px solid #ccc";

        signatureBox.appendChild(img);
      }

      await new Promise((r) => setTimeout(r, 150));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight, // <-- key line
      });

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "purchase_agreement_preview.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(element);
      const response = await axios.post(
        `${JWT_HOST_API}/files/upload/platform/purchase_agreement/${uuid4}`,
        { img: imgData },
        {
          headers: {
            Authorization: `Bearer ${params?.token}`,
          },
        },
      );

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

  // const generateAndSendPDF = async () => {
  //   try {
  //     const element = document.getElementById("content-id");
  //     console.log("element", element);
  //     element
  //       .querySelectorAll(
  //         "div, p, h1, h2, h3, h4, h5, h6, span, a, button, input, textarea, select, option, label, table, th, td, tr, tbody, thead, tfoot, form, fieldset, legend, output, progress, meter, details, summary, dialog, iframe, video, audio, canvas, svg, path, rect, circle, ellipse, line, polyline, polygon, text, tspan, g, use, image, foreignObject, symbol, defs, clipPath, mask, pattern, symbol, defs, clipPath, mask, pattern",
  //       )
  //       .forEach((el) => {
  //         el.style.color = "#222222";
  //       });
  //     const canvas = await html2canvas(element, {
  //       scale: 1.4,
  //       useCORS: true,
  //       logging: false,
  //       backgroundColor: "#ffffff",
  //       color: "#222222",
  //     });

  //     const imgData = canvas.toDataURL("image/png");
  //     const config = {
  //       method: "post",
  //       url: `${JWT_HOST_API}/files/upload/platform/purchase_agreement/${uuid4}`,
  //       headers: {
  //         Authorization: `Bearer ${params?.token}`,
  //       },
  //       data: { img: imgData },
  //     };

  //     const response = await axios(config);
  //     if (response.data.status === 200) {
  //       return true;
  //     } else {
  //       toast.error("Failed to send acknowledgement");
  //       return false;
  //     }
  //   } catch (error) {
  //     console.error("Error uploading acknowledgement:", error);
  //     toast.error("Error uploading acknowledgement");
  //     return false;
  //   }
  // };
  const handleStripeCheckout = async () => {
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
      // if (!total || total <= 0) {
      //   throw new Error("Invalid payment amount");
      // }
      // const sts = ["AL", "AZ", "CO", "AR", "FL"];
      const dt = {
        success_url: `${window.location.origin.toString()}/checkout-success`,
        cancel_url: `${window.location.origin.toString()}/checkout-cancel`,
        price_id: selectedPlan.stripe_price_id,
        stripe_product_id: selectedPlan.stripe_product_id,
        item: {
          name: selectedPlan?.title,
          quantity: 1,
          pricing_id: selectedPlan.id,
          // lead_quantity: selectedPlan.quantity,
          unit_price: selectedPlan.unit_price,
          net_price: selectedPlan.net_price,
          total_amount: selectedPlan.net_price,
          // states: sts,
        },
      };

      const config = {
        method: "post",
        url: `${JWT_HOST_API}/stripe/create-platform-membership-checkout-session/${uuid4}`,
        headers: {
          Authorization: `Bearer ${params.token}`,
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
  const handleSubmit = async () => {
    setSubmitting(true);
    handleStripeCheckout();
    // await onAgree();
    setSubmitting(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-6 sm:px-5"
        onClose={onClose}
      >
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        {/* Modal Panel */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel className="dark:bg-dark-700 z-50 max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
            {/* Title */}
            <div id="content-id">
              <DialogTitle className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                🧾 StarterPro Leads — Terms & Conditions
              </DialogTitle>

              {/* Scrollable Content */}
              <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-2 text-gray-700 dark:text-gray-300">
                <p>
                  This Agreement (“Agreement”) governs all transactions between
                  StarterPro Leads LLC (“StarterPro Leads”) and the purchasing
                  agent or entity (“Agent”). By placing an order, making
                  payment, or receiving any leads or services from StarterPro
                  Leads, the Agent acknowledges acceptance of these Terms and
                  Conditions.
                </p>

                <p>
                  🕒 <strong>1. TIMELINE / ROR / PRICING</strong>
                  <br />
                  Lead pricing varies depending on the selected program.
                </p>

                <p>
                  For direct mail campaigns, billing occurs on Wednesdays,
                  mailing campaign lead orders are confirmed between Thursday
                  and Friday and mailings are sent out the following Monday.
                  Leads typically begin to generate within 7–10 days after
                  mailing.
                </p>

                <p>
                  All subscription programs require a minimum commitment of four
                  (4) weeks.
                </p>

                <p>
                  If a subscription is canceled before meeting this minimum, the
                  difference between the one-time order rate and the
                  subscription rate will be charged for each week mailed.
                </p>

                <p>
                  For “Lead Bank” purchases, leads are delivered instantaneously
                  upon payment.
                </p>

                <p>
                  📅 <strong>2. REPORTING</strong>
                  <br />
                  If a sale is not reported for a purchased lead, the lead will
                  automatically recycle into the CRM thirty (30) days after
                  delivery.
                </p>

                <p>
                  To report a sale, use the suppression option in your CRM. All
                  sold policies must be marked as “Sold” with proof of the
                  policy provided and submitted to the suppression team.
                </p>

                <p>
                  💳 <strong>3. CARD DECLINE / DISPUTE</strong>
                  <br />
                  StarterPro Leads does not provide refunds, exchanges, or
                  returns for any leads purchased.
                </p>

                <p>
                  In the event of a card decline, the Agent will be contacted to
                  resolve the issue. If unresolved, this signed acknowledgment
                  will be submitted as documentation in the event of a dispute.
                </p>

                <p>
                  If a dispute is initiated, the Agent’s account will be
                  immediately closed, and they will be permanently banned from
                  making any future purchases through StarterPro Leads.
                </p>

                <p>
                  All Lead Bank purchases are held to the same standard; no
                  credits, refunds, or exchanges will be issued.
                </p>

                <p>
                  💰 <strong>4. CREDITS</strong>
                  <br />
                  StarterPro Leads has no control over errors caused by the
                  United States Postal Service (USPS).
                </p>

                <p>
                  You acknowledge that potential delivery or processing errors
                  have been factored into the estimated Rate of Return (ROR) of
                  2–8%.
                </p>

                <p>
                  StarterPro Leads does not issue credits, refunds, or exchanges
                  under any circumstances. All “Lead Bank” purchases are subject
                  to the same policy.
                </p>

                <p>
                  ⚖️ <strong>5. NO GUARANTEE OF PERFORMANCE</strong>
                  <br />
                  StarterPro Leads makes no guarantees, representations, or
                  warranties regarding conversion rates, sales performance, or
                  specific outcomes resulting from the use of purchased leads.
                </p>

                <p>
                  The success of each lead depends on factors beyond the control
                  of StarterPro Leads, including the Agent’s sales ability,
                  follow-up, and compliance practices.
                </p>

                <p>
                  🧩 <strong>6. DATA USE AND COMPLIANCE</strong>
                  <br />
                  All leads provided are intended solely for the Agent’s
                  internal business use and may not be resold, shared, or
                  redistributed.
                </p>

                <p>
                  The Agent agrees to comply with all applicable laws including
                  the TCPA, CAN-SPAM, and DNC regulations.
                </p>

                <p>
                  🔒 <strong>7. CONFIDENTIALITY</strong>
                  <br />
                  All lead data, pricing structures, campaign details, and
                  communications from StarterPro Leads are confidential.
                </p>

                <p>
                  The Agent agrees not to disclose this information without
                  prior written consent.
                </p>

                <p>
                  ❌ <strong>8. SUBSCRIPTION CANCELLATION POLICY</strong>
                  <br />
                  Cancellation requests must be submitted in writing at least
                  seven (7) days before the next billing cycle.
                </p>

                <p>
                  Failure to provide timely notice will result in one additional
                  billing period.
                </p>

                <p>
                  ⚠️ <strong>9. LIMITATION OF LIABILITY</strong>
                  <br />
                  StarterPro Leads shall not be liable for indirect, incidental,
                  or consequential damages.
                </p>

                <p>
                  The maximum liability shall not exceed the amount paid for the
                  specific leads.
                </p>

                <p>
                  🛡️ <strong>10. INDEMNIFICATION</strong>
                  <br />
                  The Agent agrees to indemnify StarterPro Leads against all
                  claims arising from their use of leads or business practices.
                </p>

                <p>
                  🛠️ <strong>11. MODIFICATION OF TERMS</strong>
                  <br />
                  StarterPro Leads may modify these Terms at any time without
                  notice.
                </p>

                <p>
                  Continued use of services constitutes acceptance of updated
                  Terms.
                </p>

                <p>
                  📄 <strong>12. ENTIRE AGREEMENT</strong>
                  <br />
                  This document represents the entire agreement between the
                  parties.
                </p>

                <p>
                  ⚖️ <strong>13. ARBITRATION AND DISPUTE RESOLUTION</strong>
                  <br />
                  All disputes will be resolved by binding arbitration in
                  Miami-Dade County, Florida.
                </p>

                <p>
                  💼 <strong>14. CRM PLATFORM SUBSCRIPTION</strong>
                  <br />
                  An active CRM subscription is required for platform access.
                </p>

                <p>
                  $49.99/mo with 50 leads per month.
                  <br />
                  $89.99/mo yearly contract without leads.
                  <br />
                  $129.99/mo month-to-month without leads.
                </p>

                <p>
                  💳 <strong>15. PAYMENT AUTHORIZATION</strong>
                  <br />
                  By subscribing, the Agent authorizes recurring charges.
                </p>

                <p>
                  ✍️ <strong>ACKNOWLEDGMENT AND ACCEPTANCE</strong>
                  <br />
                  By replying YES, the Agent confirms agreement to these terms
                  and consents to receive SMS updates.
                </p>

                {/* <div className="mt-6 flex items-center justify-end gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => setIsChecked(!isChecked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="agreement" className="text-sm font-medium">
                    I agree to the terms and conditions
                  </label>
                </div> */}
                <div className="space-y-2">
                  <label htmlFor="signature" className="block font-semibold">
                    Signature *
                  </label>
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    backgroundColor="#f8fafc"
                    onEnd={() => {
                      const data = sigCanvas.current.toData();
                      setIsSigned(data.length > 0);
                    }}
                    canvasProps={{
                      width: 700,
                      height: 160,
                      className:
                        "w-full border-2 border-neutral-400 rounded-lg bg-neutral-50 sigCanvas",
                    }}
                  />
                  <div className="mt-1 flex justify-end space-x-4 text-sm">
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="font-medium text-red-600 hover:text-red-800"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  className='className="rounded hover:bg-gray-100" border border-gray-400 px-6 py-2 text-gray-700'
                  // color="secondary"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </Button>

                <Button
                  // variant="solid"
                  color="primary"
                  disabled={submitting || loading || !isSigned}
                  onClick={handleSubmit}
                  isLoading={submitting}
                >
                  {loading ? (
                    <>
                      <GhostSpinner className="mr-1 size-4 border-2" />
                      <span className="text-white">Loading</span>
                    </>
                  ) : (
                    "Agree & Continue"
                  )}
                </Button>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
