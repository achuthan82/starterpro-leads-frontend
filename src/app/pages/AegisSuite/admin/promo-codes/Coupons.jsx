import { useEffect, useState } from "react";
import couponService from "utils/couponService";
import { toast } from "sonner";
import { Card, Spinner } from "components/ui";
import {  PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useDisclosure } from "hooks";
import CancelModal from "./CancelModal";

const Coupons = ({resetPage, couponOpen, setEditData, setResetPage}) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);
    const [isOpen, { open, close }] = useDisclosure(false);
  
  const getCoupons = (page, per_page) => {
    setLoading(true);
    couponService
      .getCoupons(page, per_page)
      .then((resp) => {
        if (resp.data.status === 200) {
          setCoupons(resp.data.data);
          if (resp.data.pagination) {
            setTotalCoupons(resp.data.pagination.total);
            var totalPagesCount = 1;
            totalPagesCount = Math.ceil(
              resp.data.pagination.total / resp.data.pagination.per_page,
            );
          } else {
            totalPagesCount = resp.totalPages || resp.total_pages || 1;
          }
          setTotalPages(totalPagesCount);
        } else if (resp.data.status === 204) {
          setCoupons([]);
        } else {
          toast.error(resp?.data?.message || "Please try again later");
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Please try again later");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleEdit = (data) => {
      setEditData(data)
      couponOpen()
  }
  const handleDelete = (coupon) => {
    setLoadingId(coupon.stripe_coupon_id)
    open()
  }
  useEffect(() => {
    getCoupons(currentPage, 10);
  }, [currentPage]);
  useEffect(() => {
    setTotalCoupons(0)
    setTotalPages(1)
    setCurrentPage(0)
    getCoupons(1, 10)
  }, [resetPage])
  return (
    <div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Coupon ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Max Redemptions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Status
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
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
                      <span className="ml-2">Loading coupons...</span>
                    </div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No coupons found
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    {/* Coupon Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {coupon.name}
                      </div>
                    </td>

                    {/* Coupon ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {coupon.stripe_coupon_id}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-4 whitespace-nowrap capitalize">
                      {coupon.duration}
                    </td>

                    {/* Max Redemptions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {coupon.max_redemptions}
                    </td>

                    {/* Discount */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {coupon.amount_off
                        ? `$${(coupon.amount_off / 100).toFixed(2)}`
                        : `${coupon.percent_off}%`}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {coupon.is_active ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs leading-5 font-semibold text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-red-100 px-2 text-xs leading-5 font-semibold text-red-800">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                        
                            <>
                              <PencilIcon className="h-3 w-3"  />
                              <span>Edit</span>
                            </>
                          
                        </button>
                        <button
                          disabled={loadingId === coupon.id}
                          onClick={() => handleDelete(coupon)}
                          className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {loadingId === coupon.id ? (
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
                    {Math.min(currentPage * 10, totalCoupons)} of {totalCoupons}{" "}
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
      <CancelModal isOpen={isOpen} id={loadingId} close={close} resetPage={resetPage} setResetPage={setResetPage}/>
    </div>
  );
};

export default Coupons;
