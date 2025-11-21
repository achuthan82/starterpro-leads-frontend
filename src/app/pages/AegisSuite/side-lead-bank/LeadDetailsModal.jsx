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
import { toast } from "sonner";
// import { useCart } from "app/contexts/cart/CartContext";

const MarketplaceLeadDetailsModal = ({
  open,
  state,
  onClose,
  pricingData,
  cartData,
  setCartData,
  selectedAgency
}) => {
  //onAddToCart
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [quantities, setQuantities] = useState({}); // { [ageGroupId]: { completed: n, incomplete: n } }
  const [cartLoading] = useState(false);
  const [cartError] = useState(null);
  // const { refreshCart } = useCart();

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
          `/starter-data/completed-incomplete-for-sale-days-wise/${selectedAgency?.value}/${state}`,
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
  }, [open, state, selectedAgency]);

  const handleQtyChange = (ageId, type, val, max) => {
    setQuantities((q) => ({
      ...q,
      [ageId]: {
        ...q[ageId],
        [type]: Math.max(0, Math.min(val, max)),
      },
    }));
  };

  const handleAddToCart = (
    ageId,
    group,
    monthPricingGold,
    monthPricingSilver,
  ) => {
    const qty = quantities[ageId] || {};
    console.log("entered", qty, monthPricingGold);

    if ((qty.completed || 0) + (qty.incomplete || 0) === 0) return;
    let added = false;
    if (qty.completed && monthPricingGold) {
      console.log("entered");
      sessionStorage.setItem(
        "cart",
        JSON.stringify([
          ...cartData,
          {
            pricing_id: monthPricingGold.id || monthPricingGold.pricing_id,
            quantity: qty.completed,
            state,
          },
        ]),
      );
      added = true;
      setCartData((prev) => [
        ...prev,
        {
          pricing_id: monthPricingGold.id || monthPricingGold.pricing_id,
          quantity: qty.completed,
          state,
        },
      ]);
    }
    if (qty.incomplete && monthPricingSilver) {
      console.log("entered");
      sessionStorage.setItem(
        "cart",
        JSON.stringify([
          ...cartData,
          {
            pricing_id: monthPricingSilver.id || monthPricingSilver.pricing_id,
            quantity: qty.incomplete,
            state,
          },
        ]),
      );
      added = true;

      setCartData((prev) => [
        ...prev,
        {
          pricing_id: monthPricingSilver.id || monthPricingSilver.pricing_id,
          quantity: qty.incomplete,
          state,
        },
      ]);
    }
    if (added) {
      toast.success("Added to cart!");
    }

    setQuantities((q) => ({ ...q, [ageId]: { completed: 0, incomplete: 0 } }));
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
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
                        String(m.month) === String(group.month) &&
                        m.completed === true,
                    );
                    monthPricingSilver = pricingData.find(
                      (m) =>
                        String(m.month) === String(group.month) &&
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
                            {group.month}+
                          </span>
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            Month Old
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
                      >
                        {cartLoading ? "Adding..." : "Add to Cart"}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
            <Button variant="outline" className="mt-6" onClick={onClose}>
              Close
            </Button>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default MarketplaceLeadDetailsModal;
