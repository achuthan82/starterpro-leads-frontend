import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Button } from "components/ui";

export default function CommitmentAgreementModal({
  isOpen,
  onClose,
  //   billingType,
}) {
  //   const yearlyPrice = "$49.99";
  //   const monthlyPrice = "$69.99";
  //   const yearlyNonCompliance = "$89.99";
  //   const monthlyNonCompliance = "$129.99";

  //   const displayedPrice = billingType === "yearly" ? yearlyPrice : monthlyPrice;
  //   const displayedNonCompliance =
  //     billingType === "yearly" ? yearlyNonCompliance : monthlyNonCompliance;

  const [isChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40" />
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
          <DialogPanel className="z-50 dark:bg-dark-700 max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
            {/* Title */}
            <DialogTitle className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              🧾 StarterPro Leads — Terms & Conditions
            </DialogTitle>

            {/* Scrollable Content */}
            <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-2 text-gray-700 dark:text-gray-300">
              <p>
                This Agreement (“Agreement”) governs all transactions between
                StarterPro Leads LLC (“StarterPro Leads”) and the purchasing
                agent or entity (“Agent”). By placing an order, making payment,
                or receiving any leads or services from StarterPro Leads, the
                Agent acknowledges acceptance of these Terms and Conditions.
              </p>

              <p>
                🕒 <strong>1. TIMELINE / ROR / PRICING</strong>
                <br />
                Lead pricing varies depending on the selected program.
              </p>

              <p>
                For direct mail campaigns, billing occurs on Wednesdays, mailing
                campaign lead orders are confirmed between Thursday and Friday
                and mailings are sent out the following Monday. Leads typically
                begin to generate within 7–10 days after mailing.
              </p>

              <p>
                All subscription programs require a minimum commitment of four
                (4) weeks.
              </p>

              <p>
                If a subscription is canceled before meeting this minimum, the
                difference between the one-time order rate and the subscription
                rate will be charged for each week mailed.
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
                sold policies must be marked as “Sold” with proof of the policy
                provided and submitted to the suppression team.
              </p>

              <p>
                💳 <strong>3. CARD DECLINE / DISPUTE</strong>
                <br />
                StarterPro Leads does not provide refunds, exchanges, or returns
                for any leads purchased.
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
                StarterPro Leads has no control over errors caused by the United
                States Postal Service (USPS).
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
                All leads provided are intended solely for the Agent’s internal
                business use and may not be resold, shared, or redistributed.
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
                The Agent agrees not to disclose this information without prior
                written consent.
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
                By replying YES, the Agent confirms agreement to these terms and
                consents to receive SMS updates.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>

              <Button
                variant="solid"
                color="primary"
                disabled={!isChecked || submitting}
                onClick={handleSubmit}
                isLoading={submitting}
              >
                Agree & Continue
              </Button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
