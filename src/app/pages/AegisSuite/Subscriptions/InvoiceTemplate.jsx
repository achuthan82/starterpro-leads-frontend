import { useEffect, useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import invoiceService from "utils/invoiceService";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import Logo from "assets/app-logo/logo-text.svg?.react";

const InvoiceTemplate = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get("from");
  const [paymentData, setPaymentData] = useState(null);
  console.log(paymentData, setPaymentData);

  useEffect(() => {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 15);

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    if (document.getElementById("invoice-date")) {
      document.getElementById("invoice-date").textContent =
        today.toLocaleDateString("en-US", options);
    }
    if (document.getElementById("due-date")) {
      document.getElementById("due-date").textContent =
        dueDate.toLocaleDateString("en-US", options);
    }
  }, []);

  const getDetails = () => {
    invoiceService
      .getInvoiceDetails(params.id, type)
      .then((response) => {
        if (response.data.status === 200) {
          setPaymentData(response.data.data);
        } else {
          setPaymentData(null);
        }
      })
      .catch((error) => {
        setPaymentData(null);
        toast.error(error.message);
      });
  };
  useEffect(() => {
    getDetails();
  }, []);
  const downloadPDF = async () => {
    const element = document.getElementById("invoice-content");
    const canvas = await html2canvas(element, {
      scale: 1.4,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      color: "#222222",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = {
      width: pageWidth,
      height: (canvas.height * pageWidth) / canvas.width,
    };

    let position = 0;
    let heightLeft = imgProps.height;

    while (heightLeft > 0) {
      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        imgProps.width,
        imgProps.height,
      );
      heightLeft -= pageHeight;
      if (heightLeft > 0) {
        pdf.addPage();
        position = -pageHeight;
      }
    }

    pdf.save("invoice.pdf");
  };

  console.log("paymentData", paymentData);

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      succeeded: "bg-green-100 text-green-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      canceled: "bg-red-100 text-red-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      expired: "bg-red-100 text-red-800",
      paused: "bg-yellow-100 text-yellow-800",
    };
    return classes[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-gray-100 py-8 font-sans">
      <div className="no-print mx-auto mb-6 max-w-4xl px-4">
        <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow">
          <h1 className="text-atoll text-xl font-bold">
            {paymentData?.invoice_data?.bill_to?.name} - Invoice
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center rounded-lg border border-gray-400 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
            >
              <ArrowLeftIcon className="mr-2 h-5 w-5" />
              Back
            </button>
            <button
              onClick={downloadPDF}
              className="bg-atoll hover:bg-opacity-90 rounded-lg px-4 py-2 text-white transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={() => window.print()}
              className="hover:bg-opacity-90 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors"
            >
              Print Invoice
            </button>
          </div>
        </div>
      </div>
      <div id="invoice-content" className="a4-page mx-auto p-12">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          {/* Company Logo and Details */}
          <div className="flex items-center">
            <div className="flex items-center justify-between rounded-lg bg-white">
              <img
                src={Logo}
                alt="Logo"
                style={{
                  maxWidth: "40%",
                  height: "auto",
                  objectFit: "contain",
                }}
                className="dark:brightness-200"
              />
              {/* <img
                                src="/shieldnest-icon.png"
                                alt="ShieldNest"
                                className="w-15 h-15 object-contain text-white"
                            /> */}
            </div>
            {/* <div>
              <h1 className="text-atoll text-2xl font-bold">ShieldNest</h1>
              <p className="text-sm text-gray-600">
                Stronger Leads, Safer Families
              </p>
            </div> */}
          </div>

          {/* Invoice Title */}
          <div className="text-right">
            <h2 className="text-atoll mb-2 text-3xl font-bold">INVOICE</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Invoice #:</span>{" "}
                {paymentData?.invoice_data?.invoice_number || "N/A"}
              </p>
              <p>
                <span className="font-medium">Date:</span>{" "}
                <span id="invoice-date">
                  {paymentData?.invoice_data?.purchase_date ||
                    paymentData?.invoice_data?.start_date}
                </span>
              </p>
              {/* <p>
                                <span className="font-medium">Due Date:</span>{" "}
                                <span id="due-date">{paymentData?.due_date}</span>
                            </p> */}
            </div>
          </div>
        </div>
        {/* Company Address */}
        <div className="mb-8">
          {/* <div className="rounded-lg bg-gray-50 p-4"> */}
                    <div className="rounded-lg">

            <h3 className="text-atoll mb-2 font-semibold">From:</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p className="font-medium">
                {paymentData?.invoice_data?.from?.name}
              </p>
              <p>{paymentData?.invoice_data?.from?.address}</p>
              {/* <p>Phone: {paymentData?.invoice_data?.from?.phone}</p>
                            <p>
                                Email:{" "}
                                <a
                                    href={`mailto:${paymentData?.invoice_data?.from?.email}`}
                                    className="__cf_email__"
                                >
                                    {paymentData?.invoice_data?.from?.email}
                                </a>
                            </p> */}
              {/* <p>Tax ID: 12-3456789</p> */}
            </div>
          </div>
        </div>
        {/* Bill To Section */}
        <div className="mb-8 grid grid-cols-1 gap-8">
          {/* Bill To */}
          <div>
            <h3 className="text-atoll mb-3 border-b border-gray-200 pb-2 font-semibold">
              Bill To:
            </h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-900">
                {paymentData?.invoice_data?.bill_to?.name}
              </p>
              <p className="text-gray-700">
                {paymentData?.invoice_data?.bill_to?.agency}
              </p>
              <p className="text-gray-700">
                {paymentData?.invoice_data?.bill_to?.address}
              </p>
              {/* <p className="text-gray-700">{paymentData?.invoice_data?.bill_to?.phone}</p> */}
              <p className="text-gray-700">
                Email:{" "}
                <a
                  href="/cdn-cgi/l/email-protection"
                  className="__cf_email__"
                  data-cfemail="1e6d7f6c7f765e6977726d717077706d6b6c7f707d7b307d7173"
                >
                  {paymentData?.invoice_data?.bill_to?.email}
                  {/* [email&#160;protected] */}
                </a>
              </p>
            </div>
          </div>
          {/* Payment Info */}
          {/* <div>
                        <h3 className="font-semibold text-atoll mb-3 border-b border-gray-200 pb-2">
                            Payment Details:
                        </h3>
                        <div className="space-y-1 text-sm text-gray-700">
                            <p>
                                <span className="font-medium">Payment Terms:</span>{paymentData?.invoice_data?.payment_details?.payment_terms}
                            </p>
                            <p>
                                <span className="font-medium">Payment Method:</span> {paymentData?.invoice_data?.payment_details?.method}
                            </p>
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs font-medium text-blue-800 mb-1">Card Details:</p>
                            <p className="text-xs text-blue-700">Card Brand: {paymentData?.invoice_data?.payment_details?.card_brand}</p>
                            <p className="text-xs text-blue-700">Card Expiry: {paymentData?.invoice_data?.payment_details?.card_expiry}</p>
                            <p className="text-xs text-blue-700">Last 4 Digits: {paymentData?.invoice_data?.payment_details?.card_last4}</p>
                        </div>
                    </div> */}
        </div>
        {/* Invoice Items Table */}
        <div className="mb-8">
          <table className="invoice-table w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left text-sm font-medium">
                  Description
                </th>
                {paymentData?.invoice_data?.items &&
                  paymentData?.invoice_data?.items.length > 0 && (
                    <th className="w-20 p-3 text-center text-sm font-medium">
                      Qty
                    </th>
                  )}
                {paymentData?.invoice_data?.items &&
                  paymentData?.invoice_data?.items.length > 0 && (
                    <th className="w-24 p-3 text-right text-sm font-medium">
                      Rate
                    </th>
                  )}
                <th className="w-28 p-3 text-right text-sm font-medium">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentData?.invoice_data?.items &&
                paymentData?.invoice_data?.items.length > 0 &&
                paymentData?.invoice_data?.items.map((data, index) => {
                  return (
                    <tr key={index}>
                      <td className="p-3 text-sm">
                        <div className="font-medium text-gray-900">
                          {data.title || "N/A"}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {data.description || "N/A"}
                        </div>
                        {data.state && (
                          <div className="text-xs text-gray-500">
                            State: {data.state || "N/A"}
                          </div>
                        )}
                        {data.period && (
                          <div className="text-xs text-gray-500">
                            Period: {data.period || "N/A"}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center text-sm">
                        {data.quantity || 1}
                      </td>
                      <td className="p-3 text-right text-sm">
                        ${data.unit_price}
                      </td>
                      <td className="p-3 text-right text-sm font-medium">
                        ${data.subtotal}
                      </td>
                    </tr>
                  );
                })}
              {paymentData?.invoice_data?.description &&
                paymentData?.invoice_data?.start_date && (
                  <tr>
                    <td className="p-3 text-sm">
                      <div className="mt-1 text-xs text-gray-500">
                        {paymentData?.invoice_data?.description || "N/A"}
                      </div>
                    </td>
                    {/* <td className="p-3 text-right text-sm">${paymentData?.invoice_data?.unit_price}</td> */}
                    <td className="p-3 text-right text-sm font-medium">
                      ${paymentData?.subtotal}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
        {/* Totals Section */}
        <div className="mb-8 flex justify-end">
          <div className="w-80">
            <table className="w-full border border-gray-200">
              <tbody>
                <tr>
                  <td className="bg-gray-50 p-3 text-sm font-medium text-gray-700">
                    Subtotal:
                  </td>
                  <td className="p-3 text-right text-sm font-medium">
                    $
                    {paymentData?.subtotal ||
                      paymentData?.invoice_data?.subtotal}
                  </td>
                </tr>
                <tr>
                  <td className="bg-gray-50 p-3 text-sm font-medium text-gray-700">
                    Tax ({paymentData?.invoice_data?.commission}%):
                  </td>
                  <td className="p-3 text-right text-sm font-medium">
                    $
                    {paymentData?.invoice_data?.total_amount ||
                      paymentData?.amount_received}
                  </td>
                </tr>
                {paymentData?.discounted_price && (
                  <tr>
                    <td className="bg-gray-50 p-3 text-sm font-medium text-gray-700">
                      Discount (5%):
                    </td>
                    <td className="p-3 text-right text-sm font-medium text-green-600">
                      {paymentData.discounted_price}
                    </td>
                  </tr>
                )}

                <tr className="total-row border-atoll border-t-2">
                  <td className="text-atoll p-4 text-base font-bold">
                    Total Amount:
                  </td>
                  <td className="text-atoll p-4 text-right text-xl font-bold">
                    ${paymentData?.total_amount || paymentData?.amount_received}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* <div className="page-break" /> */}
        {/* Payment Status */}
        <div className="mb-12">
          <div className="flex items-center space-x-4">
            <div
              className={`px-4 py-2 ${getStatusBadgeClass(paymentData?.payment_status)} rounded-lg`}
            >
              <span
                className="text-sm font-medium"
                style={{ textTransform: "uppercase" }}
              >
                Status: {paymentData?.payment_status || "Pending"}
              </span>
            </div>
            {/* <div className="text-sm text-gray-600">
                            Payment due by <span className="font-medium">{paymentData?.due_date}</span>
                        </div> */}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <p>
                This invoice was generated electronically and is valid without
                signature.
              </p>
              <p>StarterProLeads Insurance Services LLC • Tax ID: 12-3456789</p>
            </div>
            <div className="text-right">
              <p className="text-atoll text-sm font-medium">Questions?</p>
              <p className="text-xs text-gray-600">Call (555) 123-4567</p>
              <p className="text-xs text-gray-600">
                <a
                  href="mailto:support@starterproleads.com"
                  className="text-blue-600 underline"
                >
                  support@starterproleads.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        :root {
          --atoll: #0a2463;
          --ecru-white: #fbfbf5;
          --fern: #5ab453;
          --atlantis: #92c933;
          --shadow-green: #99bac0;
          --deco: #cddf8f;
          --botticelli: #c9e0e5;
          --beryl-green: #d5e5c3;
          --waterloo: #7e8494;
          --gray-suit: #bcb9c6;
        }
        .bg-atoll { background-color: var(--atoll); }
        .bg-ecru-white { background-color: var(--ecru-white); }
        .text-atoll { color: var(--atoll); }
        .text-fern { color: var(--fern); }
        .border-atoll { border-color: var(--atoll); }
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        @media print {
          .no-print { display: none; }
           .a4-page {
    height: 600mm;
    overflow: visible !important;
    page-break-after: always;
    break-inside: avoid;
  }
        }
        @page {
          size: A4;
          margin: 0;
        }
        .invoice-table th {
          background-color: var(--atoll);
          color: white;
        }
        .invoice-table td, .invoice-table th {
          border: 1px solid #e5e7eb;
        }
        .total-row {
          background-color: var(--ecru-white);
        }
      `}</style>
    </div>
  );
};

export default InvoiceTemplate;
