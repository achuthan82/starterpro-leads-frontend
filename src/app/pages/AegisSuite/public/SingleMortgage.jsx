import { useParams } from "react-router";
import axios from "axios";
import { JWT_HOST_API } from "configs/auth.config";
import { useEffect, useState } from "react";
import Logo from "assets/app-logo/logo-text.svg"; // image import

const SingleMortgage = () => {
  const { mortgage_id, uuid } = useParams();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const getLeadInfo = async () => {
    try {
      const response = await axios.get(
        `${JWT_HOST_API}/leads/single_mortgage_public/${mortgage_id}/${uuid}`
      );
      if (response.data?.status === 200) {
        setInfo(response.data.data);
      } else {
        setInfo(null);
      }
    } catch (err) {
      console.error("Error fetching mortgage info:", err);
      setInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLeadInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderInfoTable = () => {
    if (!info) return null;

    const fields = [
      { label: "Full Name", value: info.full_name },
      { label: "First Name", value: info.first_name },
      { label: "Last Name", value: info.last_name },
      { label: "Lender Name", value: info.lender_name },
      { label: "Loan Amount", value: info.loan_amount ? `$${info.loan_amount.toLocaleString()}` : "N/A" },
      { label: "Loan Date", value: info.loan_date || "N/A" },
      { label: "Address", value: info.address },
      { label: "City", value: info.city },
      { label: "State", value: info.state },
      { label: "ZIP", value: info.zip },
      { label: "Mortgage ID", value: info.mortgage_id },
    ];

    return (
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 mt-8 w-full max-w-3xl mx-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {fields.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 w-1/3">
                  {row.label}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 break-words">
                  {row.value ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">
                Lead Info
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Know your Lead Details
              </p>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="mt-1 flex-1 overflow-auto p-8">
          {/* Centered logo + tagline */}
          <div className="max-w-5xl mx-auto mb-6 text-center">
            <img
              src={Logo}
              alt="Company Logo"
              className="h-30 w-auto mx-auto mb-3 drop-shadow-sm"
            />
            <p className="text-gray-600 dark:text-gray-300 text-sm max-w-2xl mx-auto">
              Welcome to our public mortgage information portal. Here you can
              view verified loan and lender details securely and easily.
            </p>
          </div>

          {/* Content area */}
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="text-gray-500 dark:text-gray-300 animate-pulse">
                  Loading lead information...
                </div>
              </div>
            ) : info ? (
              renderInfoTable()
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                No lead information found.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SingleMortgage;
