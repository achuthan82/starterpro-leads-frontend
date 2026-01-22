import { useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { Card, Button, Spinner } from "components/ui";
import axios from "utils/axios";
import { apiUtils } from "utils/apiService";
import { addToCart } from "utils/cartService";
import { toast } from "sonner";
import { useCart } from "app/contexts/cart/CartContext";
import { convertDays } from "utils/utlis";

const MarketplaceLeadDetailsModal = ({ open, state, onClose, pricingData }) => {
  //onAddToCart
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [quantities, setQuantities] = useState({}); // { [ageGroupId]: { completed: n, incomplete: n } }
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  const { refreshCart } = useCart();

  useEffect(() => {
    console.log(open);
    console.log(state);
    if (!open || !state) return;
    setLoading(true);
    setError(null);
    setData([]);
    setQuantities({});
    const fetchData = async () => {
      try {
        const token = window.localStorage.getItem("authToken");
        const res = await axios.get(
          `/marketplace/completed-incomplete-for-sale-days-wise/${state}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        setData(res.data.data || []);
      } catch (err) {
        setError(apiUtils.formatError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [open, state]);

  const handleQtyChange = (ageId, type, val, max) => {
    setQuantities((q) => ({
      ...q,
      [ageId]: {
        ...q[ageId],
        [type]: Math.max(0, Math.min(val, max)),
      },
    }));
  };

  const handleAddToCart = async (
    ageId,
    group,
    monthPricingGold,
    monthPricingSilver,
  ) => {
    const qty = quantities[ageId] || {};
    if ((qty.completed || 0) + (qty.incomplete || 0) === 0) return;
    setCartLoading(true);
    setCartError(null);
    try {
      let added = false;
      // Add completed leads (is_gold: true)
      if (qty.completed && monthPricingGold) {
        await addToCart({
          pricing_id: monthPricingGold.id || monthPricingGold.pricing_id,
          quantity: qty.completed,
          state,
          start_day: monthPricingGold.start_day,
          end_day: monthPricingGold.end_day,
        });
        added = true;
      }
      // Add incomplete leads (is_gold: false)
      if (qty.incomplete && monthPricingSilver) {
        await addToCart({
          pricing_id: monthPricingSilver.id || monthPricingSilver.pricing_id,
          quantity: qty.incomplete,
          state,
          start_day: monthPricingSilver.start_day,
          end_day: monthPricingSilver.end_day,
        });
        added = true;
      }
      setQuantities((q) => ({
        ...q,
        [ageId]: { completed: 0, incomplete: 0 },
      }));
      if (added) {
        toast.success("Added to cart!");
        await refreshCart();
      }
    } catch (error) {
      setCartError(error.message || "Failed to add to cart.");
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        data-testid='modal-close-lead-age-variants'
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={onClose}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-gray-900/50 transition-opacity dark:bg-black/40" />
        </TransitionChild>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogPanel className="scrollbar-sm dark:bg-dark-700 relative flex max-w-lg flex-col overflow-y-auto rounded-lg bg-white px-4 py-6 text-center transition-opacity duration-300 sm:px-5 dark:bg-gray-800">
            <DialogTitle as="h3" className="mb-4 text-left text-xl font-bold">
              {state ? `${state} - Lead Age Variants` : "Lead Age Variants"}
            </DialogTitle>
            {loading ? (
              <Spinner />
            ) : error ? (
              <div className="rounded-md bg-red-100 p-4 text-red-500">
                {error}
              </div>
            ) : (
              <div className="space-y-6">
                {data.map((group, idx) => {
                  console.log(group);
                  const ageId = group.id || idx;
                  const qty = quantities[ageId] || {
                    completed: 0,
                    incomplete: 0,
                  };
                  const available =
                    (group.completed ? group.completed : 0) +
                      (group.incomplete ? group.incomplete : 0) || 0;
                  const badgeColor =
                    available < 10
                      ? "bg-red-200 text-red-700"
                      : "bg-green-100 text-green-700";

                  // Find pricing for this state and month
                  /*let statePricing = null;
                  if (pricingData && Array.isArray(pricingData)) {
                    statePricing = pricingData.find(p => p.state_code === state || p.state === state);
                  }*/
                  let monthPricingGold = null;
                  let monthPricingSilver = null;
                  if (pricingData && pricingData?.length > 0) {
                    monthPricingGold = pricingData.find(
                      (m) =>
                        m.start_day === group.start_day && m.completed === true,
                    );
                    monthPricingSilver = pricingData.find(
                      (m) =>
                        m.start_day === group.start_day &&
                        m.completed === false,
                    );
                    console.log(monthPricingGold, monthPricingSilver);
                  }
                  // Get unit prices
                  const completedPrice = monthPricingGold
                    ? monthPricingGold.unit_price
                    : null;
                  const incompletePrice = monthPricingSilver
                    ? monthPricingSilver.unit_price
                    : null;
                  console.log(completedPrice, incompletePrice);
                  return (
                    <Card key={ageId} className="p-4 text-left">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold">
                            {convertDays(group.start_day)}
                          </span>
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            Old
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}
                        >
                          {available} available
                        </span>
                      </div>
                      <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                        Add Leads
                      </div>
                      <div className="mb-2 flex items-center gap-4">
                        <div className="flex-1">
                          <div className="font-semibold text-green-700">
                            Completed Leads(
                            {group?.completed ? group.completed : 0})
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {completedPrice !== null
                                ? `$${completedPrice} per lead`
                                : "N/A"}
                            </span>
                            <Button
                              size="xs"
                              data-testid={`btn-dec-completed-${ageId}`}
                              onClick={() =>
                                handleQtyChange(
                                  ageId,
                                  "completed",
                                  (qty.completed || 0) - 1,
                                  group.completed,
                                )
                              }
                            >
                              -
                            </Button>
                            <input
                              type="number"
                              min={0}
                              max={group.gold}
                              value={qty.completed || 0}
                              data-testid={`input-completed-${ageId}`}
                              onChange={(e) =>
                                handleQtyChange(
                                  ageId,
                                  "completed",
                                  Number(e.target.value),
                                  group.completed,
                                )
                              }
                              className="w-10 rounded border text-center"
                            />
                            <Button
                              size="xs"
                              data-testid={`btn-inc-completed-${ageId}`}
                              onClick={() =>
                                handleQtyChange(
                                  ageId,
                                  "completed",
                                  (qty.completed || 0) + 1,
                                  group.completed,
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-yellow-700">
                            Incomplete Leads(
                            {group?.incomplete ? group.incomplete : 0})
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {incompletePrice !== null
                                ? `$${incompletePrice} per lead`
                                : "N/A"}
                            </span>
                            <Button
                              size="xs"
                              data-testid={`btn-dec-incomplete-${ageId}`}
                              onClick={() =>
                                handleQtyChange(
                                  ageId,
                                  "incomplete",
                                  (qty.incomplete || 0) - 1,
                                  group.incomplete,
                                )
                              }
                            >
                              -
                            </Button>
                            <input
                              type="number"
                              min={0}
                              max={group.incomplete}
                              value={qty.incomplete || 0}
                              onChange={(e) =>
                                handleQtyChange(
                                  ageId,
                                  "incomplete",
                                  Number(e.target.value),
                                  group.incomplete,
                                )
                              }
                              className="w-10 rounded border text-center"
                              data-testid={`input-incomplete-${ageId}`}
                            />
                            <Button
                              size="xs"
                              onClick={() =>
                                handleQtyChange(
                                  ageId,
                                  "incomplete",
                                  (qty.incomplete || 0) + 1,
                                  group.incomplete,
                                )
                              }
                              data-testid={`btn-inc-incomplete-${ageId}`}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                      {cartError && (
                        <div className="mb-2 text-xs text-red-500">
                          {cartError}
                        </div>
                      )}
                      <Button
                        color="success"
                        className="mt-2 w-full"
                        disabled={
                          (qty.completed || 0) + (qty.incomplete || 0) === 0 ||
                          cartLoading
                        }
                        onClick={() =>
                          handleAddToCart(
                            ageId,
                            group,
                            monthPricingGold,
                            monthPricingSilver,
                          )
                        }
                        data-testid={`btn-add-to-cart-${ageId}`}
                      >
                        {cartLoading ? "Adding..." : "Add to Cart"}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
            <Button variant="outline" className="mt-6" onClick={onClose} data-testid='btn-close-lead-age-variants'>
              Close
            </Button>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default MarketplaceLeadDetailsModal;
