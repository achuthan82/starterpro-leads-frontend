import { useRef } from "react";
import Logo from "assets/app-logo/form-image.png?.react";
import SignatureCanvas from "react-signature-canvas";
const MailRequestFormNew = () => {
  const sigCanvas = useRef();

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const signatureData = sigCanvas.current.toDataURL();
    console.log("Signature Data URL:", signatureData);
    alert("Form submitted!");
  };

  return (
    <div>
      <div className="flex min-h-screen flex-col items-center px-4 py-12 text-white">
        {" "}
        <div className="mb-10">
          <img
            src={Logo}
            alt="StarterPro Leads"
            className="mx-auto h-auto w-40 rounded-lg shadow-md"
          />
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl space-y-8 rounded-2xl bg-[#d7d7da] p-8 text-neutral-900 shadow-lg"
        >
          <div className="space-y-4">
            <h1 className="text-center text-2xl font-bold">
              🧾 StarterPro Leads — Terms & Conditions
            </h1>
            <p className="text-sm leading-relaxed">
              This Agreement (“Agreement”) governs all transactions between{" "}
              <strong>StarterPro Leads LLC</strong> (“StarterPro Leads”) and the
              purchasing agent or entity (“Agent”). By placing an order, making
              payment, or receiving any leads or services from StarterPro Leads,
              the Agent acknowledges acceptance of these Terms and Conditions.
            </p>

            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                🕒 <strong>1. TIMELINE / ROR / PRICING</strong>
              </p>
              <p>
                Lead pricing varies depending on the selected program. For
                direct mail campaigns, billing occurs on Wednesdays, and
                mailings are sent the following Monday. Leads typically begin to
                generate within 7–10 days after mailing.
              </p>
              <p>
                All subscription programs require a minimum commitment of four
                (4) weeks. If canceled early, the rate difference between the
                subscription and one-time order rates will apply.
              </p>

              <p>
                📅 <strong>2. REPORTING</strong>
              </p>
              <p>
                Unreported sales for purchased leads will automatically recycle
                into the CRM after 30 days.
              </p>

              <p>
                💳 <strong>3. CARD DECLINE / DISPUTE</strong>
              </p>
              <p>
                No refunds, exchanges, or returns. Disputed transactions will
                result in permanent account closure.
              </p>

              <p>
                💰 <strong>4. CREDITS</strong>
              </p>
              <p>
                StarterPro Leads does not issue credits or refunds under any
                circumstances.
              </p>

              <p>
                ⚖️ <strong>5. NO GUARANTEE OF PERFORMANCE</strong>
              </p>
              <p>
                No guarantees are made regarding sales or performance. Success
                depends on Agent’s practices and compliance.
              </p>

              <p>
                🧩 <strong>6. DATA USE AND COMPLIANCE</strong>
              </p>
              <p>
                All leads are for internal business use only and must comply
                with federal and state laws.
              </p>

              <p>
                🔒 <strong>7. CONFIDENTIALITY</strong>
              </p>
              <p>
                All lead data and pricing are confidential and cannot be shared
                without written consent.
              </p>

              <p>
                ❌ <strong>8. SUBSCRIPTION CANCELLATION POLICY</strong>
              </p>
              <p>
                Written cancellation is required at least seven (7) days before
                the next billing cycle.
              </p>

              <p>
                ⚠️ <strong>9. LIMITATION OF LIABILITY</strong>
              </p>
              <p>
                Liability is limited to the amount paid for the leads in
                question.
              </p>

              <p>
                🛡️ <strong>10. INDEMNIFICATION</strong>
              </p>
              <p>
                The Agent agrees to indemnify and hold StarterPro Leads harmless
                against all claims or damages.
              </p>

              <p>
                🛠️ <strong>11. MODIFICATION OF TERMS</strong>
              </p>
              <p>
                Terms may be modified at any time; continued use indicates
                acceptance.
              </p>

              <p>
                📄 <strong>12. ENTIRE AGREEMENT</strong>
              </p>
              <p>
                This document constitutes the entire agreement and supersedes
                prior communications.
              </p>

              <p>
                ⚖️ <strong>13. ARBITRATION</strong>
              </p>
              <p>
                Disputes will be resolved by binding arbitration in Miami-Dade
                County, Florida.
              </p>

              <p>
                💼 <strong>14. CRM PLATFORM SUBSCRIPTION</strong>
              </p>
              <p>
                CRM access requires an active subscription ($49.99/month
                minimum; or higher if no active lead purchases).
              </p>

              <p>
                💳 <strong>15. PAYMENT AUTHORIZATION</strong>
              </p>
              <p>
                By signing, you authorize recurring charges according to the
                agreed billing schedule.
              </p>

              <p>
                ✍️ <strong>ACKNOWLEDGMENT:</strong> By signing below, you agree
                to all terms listed above.
              </p>
            </div>
          </div>
          {/* Signature Field */}
          <div className="space-y-2">
            <label htmlFor="signature" className="block font-semibold">
              Signature *
            </label>
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              backgroundColor="#f8fafc"
              canvasProps={{
                className:
                  "w-full h-32 border-2 border-neutral-400 rounded-lg bg-neutral-50",
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

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MailRequestFormNew;
