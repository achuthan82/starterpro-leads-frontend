import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  TagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Spinner, Card } from "components/ui";
import { promoCodeService } from "utils/apiService";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import couponService from "utils/couponService";
import Select from "react-select";

const PromoSection = ({
  promoCodeCounts,
  loading,
  promoCodes,
  fetchPromoCodes,
  totalPages,
  totalPromos,
  currentPage,
  setCurrentPage,
  selectedIndex,
  resetPage,
  setTotalPages,
  setTotalPromos,
}) => {
  const navigate = useNavigate();
  const statusOptions = [
    { value: "all", label: "All" },
    { value: 1, label: "Active" },
    { value: 0, label: "Inactive" },
  ];
  const [searchTerm, setSearchTerm] = useState("");
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [confirmationData, setConfirmationData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteData, setDeleteData] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const randomColors = [
    "#0a2463",
    "#5ab453",
    "#92c933",
    "#FF2ECF",
    "#E000AD",
    "#FFA71A",
    "#FF4F1A",
    "#384766",
    "#506877",
    "#3D4E70",
    "#4A4A4F",
    "#6D7EA1",
    "#70838F",
    "#B8008C",
    "#FF75DF",
  ];
  const getCoupons = () => {
    setCouponsLoading(true);
    couponService
      .getCoupons(1, 100)
      .then((resp) => {
        if (resp.data.status === 200) {
          setCoupons(
            resp.data.data.map((item) => {
              return {
                label: item.name,
                value: item.stripe_coupon_id,
                id: item.id,
                expiry: item.redeem_by,
                max_redemption: item.max_redemptions,
              };
            }),
          );
        } else if (resp.data.status === 204) {
          setCoupons([]);
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Please try again later");
      })
      .finally(() => {
        setCouponsLoading(false);
      });
  };
  const handleStatusChange = (promoCode, newStatus) => {
    const isActive = newStatus === "active";
    const action = isActive ? "activate" : "deactivate";

    setConfirmationData({
      promoCode,
      action,
      isActive,
      message: `Are you sure you want to ${action} promo code "${promoCode.code}"? This will ${isActive ? "enable" : "disable"} its usage.`,
    });
    setShowConfirmation(true);
  };

  const confirmStatusChange = async () => {
    if (!confirmationData) return;

    const { promoCode, isActive } = confirmationData;
    setStatusLoadingId(promoCode.id);

    try {
      const response = await promoCodeService.togglePromoCodeStatus(
        promoCode.id,
        isActive,
      );
      console.log("Status change response:", response);

      if (response.status === 200 || response.success) {
        toast.success(
          `Promo code ${isActive ? "activated" : "deactivated"} successfully`,
        );
        // Refresh the promo codes list
        fetchPromoCodes(
          currentPage,
          10,
          searchTerm,
          selectedCoupon?.value,
          selectedStatus?.value,
        );
      } else {
        toast.error("Failed to update promo code status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating promo code status:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else if (error.response?.status === 403) {
        toast.error("You do not have permission to perform this action.");
      } else if (error.response?.status === 404) {
        toast.error("Promo code not found.");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to update promo code status. Please try again.",
        );
      }
    } finally {
      setStatusLoadingId(null);
      setShowConfirmation(false);
      setConfirmationData(null);
    }
  };

  const cancelStatusChange = () => {
    setShowConfirmation(false);
    setConfirmationData(null);
  };
  const getStatusBadge = (isActive) => {
    console.log("isActive", isActive);
    const statusClasses = {
      true: { name: "active", color: "bg-[#0a2463] text-white" },
      false: { name: "inactive", color: "bg-red-600 text-white" },
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[isActive]?.color || "bg-gray-100 text-gray-800"}`}
      >
        {statusClasses[isActive]?.name?.charAt(0).toUpperCase() +
          statusClasses[isActive]?.name?.slice(1) || ""}
      </span>
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };
  const handleDelete = (promoCode) => {
    setDeleteData({
      promoCode,
      action: "delete",
    });
    setShowDeleteConfirmation(true);
  };
  const confirmDelete = async () => {
    if (!deleteData) return;

    const { promoCode } = deleteData;
    setDeleteLoadingId(promoCode.id);

    try {
      const response = await promoCodeService.deletePromoCode(promoCode.id);
      console.log("Delete response:", response);

      if (response.status === 200 || response.status === 204) {
        toast.success("Promo code deleted successfully");
        // Refresh the promo codes list
        fetchPromoCodes(
          currentPage,
          10,
          searchTerm,
          selectedCoupon?.value,
          selectedStatus?.value,
        );
      } else {
        toast.error("Failed to delete promo code. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting promo code:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else if (error.response?.status === 403) {
        toast.error("You do not have permission to perform this action.");
      } else if (error.response?.status === 404) {
        toast.error("Promo code not found.");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to delete promo code. Please try again.",
        );
      }
    } finally {
      setDeleteLoadingId(null);
      setShowDeleteConfirmation(false);
      setDeleteData(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeleteData(null);
  };
  const handleCoupon = (selectedOption) => {
    setSelectedCoupon(selectedOption);
    setCurrentPage(1);
    fetchPromoCodes(
      1,
      10,
      searchTerm,
      selectedOption.value,
      selectedStatus?.value,
    );
  };
  const handleStatus = (selectedOption) => {
    setSelectedStatus(selectedOption);
    setCurrentPage(1);
    fetchPromoCodes(
      1,
      10,
      searchTerm,
      selectedCoupon?.value,
      selectedOption.value,
    );
  };
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        if (showConfirmation) {
          cancelStatusChange();
        }
        if (showDeleteConfirmation) {
          cancelDelete();
        }
      }
    };

    if (showConfirmation || showDeleteConfirmation) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showConfirmation, showDeleteConfirmation]);
  useEffect(() => {
    if (searchTerm !== "") {
      var handler = setTimeout(() => {
        setCurrentPage(1);
        fetchPromoCodes(
          1,
          10,
          searchTerm,
          selectedCoupon?.value,
          selectedStatus?.value,
        );
      }, 500);
    } else {
      fetchPromoCodes(
        1,
        10,
        searchTerm,
        selectedCoupon?.value,
        selectedStatus?.value,
      );
    }
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);
  useEffect(() => {
    if (selectedIndex === 1) {
      getCoupons();
    }
  }, [selectedIndex]);
  useEffect(() => {
     console.log('entered run')
    setCurrentPage(1);
    setTotalPages(0);
    setTotalPromos(0);
    setSearchTerm("");
    setSelectedCoupon(null);
    setSelectedStatus(statusOptions[0]);
    fetchPromoCodes(1, 10);
  }, [resetPage]);
  return (
    <>
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card
          className="shieldnest-white-column p-6"
          style={{ borderLeft: `5px solid ${randomColors[0]}` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Promo Codes
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {promoCodeCounts?.total}
              </p>
            </div>
            <div className="shieldnest-bg1 flex h-12 w-12 items-center justify-center rounded-full">
              <TagIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card
          className="shieldnest-white-column p-6"
          style={{ borderLeft: `5px solid ${randomColors[1]}` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Codes</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {promoCodeCounts?.active}
              </p>
            </div>
            <div className="shieldnest-bg2 flex h-12 w-12 items-center justify-center rounded-full">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card
          className="shieldnest-white-column p-6"
          style={{ borderLeft: `5px solid oklch(57.7% 0.245 27.325)` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Inactive Codes
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {promoCodeCounts?.inactive}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600">
              <ExclamationTriangleIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search by promo code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-[var(--color-atoll)] focus:ring-2 focus:ring-[var(--color-atoll)] focus:outline-none"
            />
          </div>

          <div className="sm:w-48">
            <Select
              isLoading={couponsLoading}
              value={selectedCoupon}
              onChange={handleCoupon}
              options={coupons}
              placeholder="Select Coupon"
              classNamePrefix="react-select"
            />
          </div>

          <div className="sm:w-48">
            <Select
              isLoading={couponsLoading}
              value={selectedStatus}
              onChange={handleStatus}
              options={statusOptions}
              placeholder="Select Coupon"
              classNamePrefix="react-select"
            />
          </div>
        </div>
      </Card>

      {/* Promo Codes Table */}
      <Card className="shieldnest-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Promo Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Coupon ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Expires At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Max Redemptions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
                      <span className="ml-2 text-gray-900 dark:text-gray-100">Loading promo codes...</span>
                    </div>
                  </td>
                </tr>
              ) : promoCodes.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No promo codes found
                  </td>
                </tr>
              ) : (
                promoCodes.map((promoCode) => (
                  <tr key={promoCode.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {(() => {
                          const color =
                            randomColors[
                              promoCodes.indexOf(promoCode) %
                                randomColors.length
                            ];
                          return (
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full"
                              style={{ backgroundColor: color }}
                            >
                              <span className="text-sm font-medium text-white">
                                {promoCode.code
                                  ?.substring(0, 2)
                                  .toUpperCase() || "PC"}
                              </span>
                            </div>
                          );
                        })()}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {promoCode.code}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {promoCode.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {promoCode?.coupon?.name || promoCode?.coupon}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(promoCode.active)}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                      {formatDate(promoCode.expires_at)}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                      {typeof promoCode.max_redemptions === "number"
                        ? promoCode.max_redemptions
                        : promoCode.max_redemptions}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                      {promoCode.amount_off
                        ? `${promoCode.currency?.toUpperCase() || ""} ${(promoCode.amount_off / 100).toFixed(2)}`
                        : promoCode.percent_off
                          ? `${promoCode.percent_off}%`
                          : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {promoCode.active ? (
                          <button
                            onClick={() =>
                              handleStatusChange(promoCode, "inactive")
                            }
                            disabled={statusLoadingId === promoCode.id}
                            className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {statusLoadingId === promoCode.id ? (
                              <Spinner />
                            ) : (
                              <>
                                <EyeSlashIcon className="h-3 w-3" />
                                <span>Deactivate</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleStatusChange(promoCode, "active")
                            }
                            disabled={statusLoadingId === promoCode.id}
                            className="flex items-center space-x-1 text-xs text-green-600 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {statusLoadingId === promoCode.id ? (
                              <Spinner />
                            ) : (
                              <>
                                <EyeIcon className="h-3 w-3" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(promoCode)}
                          disabled={deleteLoadingId === promoCode.id}
                          className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deleteLoadingId === promoCode.id ? (
                            <Spinner />
                          ) : (
                            <>
                              <TrashIcon className="h-3 w-3" />
                              <span>Delete</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(currentPage * 10, totalPromos)} of {totalPromos}{" "}
                    coupons
                  </div>
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    First
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`rounded px-3 py-1 text-sm ${
                            currentPage === pageNum
                              ? "bg-[var(--color-atoll)] text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      {showConfirmation && confirmationData && (
        <div
          className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-600/65"
          onClick={cancelStatusChange}
        >
          <div
            className="mx-4 w-full max-w-md rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm {confirmationData.action}
              </h3>
            </div>

            <p className="mb-6 text-gray-600">{confirmationData.message}</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelStatusChange}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                disabled={statusLoadingId === confirmationData.promoCode.id}
                className={`rounded-lg px-4 py-2 transition-colors ${
                  confirmationData.isActive
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {statusLoadingId === confirmationData.promoCode.id ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Updating...
                  </div>
                ) : (
                  confirmationData.action.charAt(0).toUpperCase() +
                  confirmationData.action.slice(1)
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && deleteData && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center">
              <ExclamationTriangleIcon className="mr-3 h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Promo Code
              </h3>
            </div>

            <p className="mb-6 text-gray-600">
              Are you sure you want to delete promo code &quot;
              {deleteData.promoCode.code}&quot;? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoadingId === deleteData.promoCode.id}
                className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteLoadingId === deleteData.promoCode.id ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Deleting...
                  </div>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PromoSection;
