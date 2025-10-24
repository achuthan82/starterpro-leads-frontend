import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import SharedSidebar from "../../components/SharedSidebar";
import { promoCodeService } from "utils/apiService";
import { useDisclosure } from "hooks";
import CreatePromoCodeModal from "./CreatePromoCodeModal";
import { toast } from "sonner";
import { Button } from "components/ui";
import CreateCoupon from "./CreateCoupon";
import clsx from "clsx";
import Coupons from "./Coupons";
import PromoSection from "./PromoSection";

const ManagePromoCode = () => {
  const navigate = useNavigate();
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPromos, setTotalPromos] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [resetPage, setResetPage] = useState(false);
  const [promoCodeCounts, setPromoCodeCounts] = useState({
    active: 0,
    inactive: 0,
    total: 0,
  });
  const [editData, setEditData] = useState(null);

  const [isOpen, { open, close }] = useDisclosure(false);
  const [isCouponOpen, { open: couponOpen, close: couponClose }] =
    useDisclosure(false);
  // Fetch promo codes with filters
  const fetchPromoCodes = useCallback(async (page, per_page, search, coupon, status) => {
    try {
      setLoading(true);
      const params = {page:page, per_page:per_page};

      // Apply filters
      if (status !== "all") {
        params.is_active = status;
      }
      if (search) {
        params.code = search;
      }
      if (coupon) {
        params.coupon_name = coupon;
      }

      console.log("Fetching promo codes with params:", params);
      const response = await promoCodeService.getPromoCodes(params);
      console.log("Promo codes API response:", response);

      let promoCodesData = [];
      if (response.data && Array.isArray(response.data)) {
        // Transform Stripe coupon objects to our expected format
        promoCodesData = response.data.map((coupon, index) => ({
          id: coupon.id || `coupon_${index}`,
          code: coupon.code || coupon.id || "N/A",
          coupon: coupon?.name || coupon.coupon || "N/A",
          active: coupon.is_active !== false, // Stripe uses 'valid' property
          expires_at: coupon.expires_at
            ? Math.floor(new Date(coupon.expires_at * 1000).getTime() / 1000)
            : null,
          max_redemptions: coupon.max_redemptions || "Unlimited",
          // Additional Stripe properties for reference
          amount_off: coupon?.amount_off || null,
          percent_off: coupon?.percent_off || null,
          currency: coupon?.currency || null,
          duration: coupon?.duration || null,
          times_redeemed: coupon?.times_redeemed || null,
          created: coupon?.created || null,
        }));
      }
      if (response.data.pagination) {
        setTotalPromos(response.data.pagination.total);
        var totalPagesCount = 1;
        totalPagesCount = Math.ceil(
          response.data.pagination.total / response.data.pagination.per_page,
        );
      } else {
        totalPagesCount = response.totalPages || response.total_pages || 1;
      }
      setTotalPages(totalPagesCount);
      setPromoCodes(promoCodesData);

      // Calculate counts
      const activeCount = promoCodesData.filter((pc) => pc.active).length;
      const inactiveCount = promoCodesData.filter((pc) => !pc.active).length;
      setPromoCodeCounts({
        active: activeCount,
        inactive: inactiveCount,
        total: promoCodesData.length,
      });
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      if (error.status === 401 || error.message?.includes("login")) {
        navigate("/login");
        return;
      }
      setPromoCodes([]);
      toast.error("Failed to fetch promo codes");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle status change with confirmation

  // Delete functionality

  // Initial load
  useEffect(() => {
    if (selectedIndex === 1) {
    fetchPromoCodes(currentPage, 10);
    }``
  }, [ currentPage, selectedIndex]);

 

  // Check if user is admin
  const userRole = localStorage.getItem("userRole");
  if (userRole !== "admin") {
    navigate("/agent-dashboard");
    return null;
  }

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      <SharedSidebar currentPath="/admin/promo-codes" />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">
                Manage Promo Codes
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Create and manage promotional codes for your platform
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {selectedIndex === 0 && (
                <button
                  onClick={couponOpen}
                  className="flex items-center space-x-2 rounded-lg bg-[#0a2463] px-4 py-2 text-white transition-colors hover:bg-[#0a2463]/90"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create New Coupon</span>
                </button>
              )}
              {selectedIndex === 1 && (
                <button
                  onClick={open}
                  className="flex items-center space-x-2 rounded-lg bg-[#f4d03f] px-4 py-2 text-white transition-colors hover:bg-[#e6c035]"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create New Promo Code</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Statistics Cards */}
          <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            {/* Tab Headers */}
            <TabList className="hide-scrollbar flex overflow-x-auto">
              <Tab
                className={({ selected }) =>
                  clsx(
                    "shrink-0 border-b-2 px-3 py-2 font-medium whitespace-nowrap",
                    selected
                      ? "border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-400"
                      : "dark:hover:text-dark-100 dark:focus:text-dark-100 border-transparent hover:text-gray-800 focus:text-gray-800",
                  )
                }
                as={Button}
                unstyled
              >
                Coupon Codes
              </Tab>
              <Tab
                className={({ selected }) =>
                  clsx(
                    "shrink-0 border-b-2 px-3 py-2 font-medium whitespace-nowrap",
                    selected
                      ? "border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-400"
                      : "dark:hover:text-dark-100 dark:focus:text-dark-100 border-transparent hover:text-gray-800 focus:text-gray-800",
                  )
                }
                as={Button}
                unstyled
              >
                Promo Codes
              </Tab>{" "}
            </TabList>

            {/* Shared Content */}
            <TabPanels className="mt-4">
              <TabPanel>
                <Coupons
                  resetPage={resetPage}
                  setResetPage={setResetPage}
                  couponOpen={couponOpen}
                  setEditData={setEditData}
                  selectedIndex = {selectedIndex}
                />
              </TabPanel>
              <TabPanel>
                <PromoSection
                  selectedIndex={selectedIndex}
                  loading={loading}
                  promoCodeCounts={promoCodeCounts}
                  promoCodes={promoCodes}
                  fetchPromoCodes={fetchPromoCodes}
                  totalPages={totalPages}
                  totalPromos={totalPromos}
                  setTotalPages={setTotalPages}
                  setTotalPromos={setTotalPromos}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              </TabPanel>
            </TabPanels>
          </TabGroup>
          <CreatePromoCodeModal
            resetPage={resetPage}
            isOpen={isOpen}
            close={close}
            fetchPromoCodes={fetchPromoCodes}
            setCurrentPage={setCurrentPage}
          />
          <CreateCoupon
            resetPage={resetPage}
            isCouponOpen={isCouponOpen}
            couponClose={couponClose}
            setResetPage={setResetPage}
            editData={editData}
            setEditData={setEditData}
          ></CreateCoupon>
        </main>
      </div>
    </div>
  );
};

export default ManagePromoCode;
