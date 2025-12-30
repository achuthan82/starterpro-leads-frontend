// import React from 'react';

import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import axios from "utils/axios";
import { toast } from "sonner";
import { convertDays } from "utils/utlis";
import { Spinner } from "components/ui";
const CartSidebar = ({
  open,
  onClose,
  cartData,
  setCartData,
  selectedAgency,
}) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  // Sync local state with cart when cart changes
  const toFloatWithoutRounding = (num, decimalPlaces) => {
    const numStr = String(num);
    const dotIndex = numStr.indexOf(".");

    if (dotIndex === -1) {
      return parseFloat(numStr); // No decimal part, return as is
    }

    const desiredLength = dotIndex + 1 + decimalPlaces;
    const truncatedStr = numStr.substring(0, desiredLength);
    return parseFloat(truncatedStr);
  };

  // Grand total calculation
  const grandTotal = useMemo(() => {
    return cartData.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    );
  }, [cartData]);
  const commission = useMemo(() => {
    return toFloatWithoutRounding((grandTotal * 0.04 * 100) / 100, 2);
  });
  const roundedTotalWithCommission = useMemo(() => {
    return toFloatWithoutRounding(grandTotal + commission, 2);
  }, [commission, grandTotal]);

  const roundedGrandTotal = grandTotal; //Math.round(grandTotal);

  const handleAgent = (selectedOption) => {
    if (selectedOption) {
      setSelectedAgent(selectedOption);
    }
  };
  const fetchAgents = async (name) => {
    setLoading(true);
    const query = { page: 1, per_page: 50 };
    if (!name) {
      query["name"] = name;
    }
    try {
      const token = window.localStorage.getItem("authToken");
      const res = await axios.get(
        `/starter-data/users-for-assigning/${selectedAgency?.value}`,
        { params: query },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      setAgents(
        res.data.data.map((item) => {
          return {
            value: item.agent_id,
            label: item.name,
            user_id: item.user_id,
          };
        }),
      );
    } catch {
      toast.error("Could not fetch Agents");
    } finally {
      setLoading(false);
    }
  };
  const assignLeads = async () => {
    setAssignLoading(true);

    try {
      const token = window.localStorage.getItem("authToken");
      /* eslint-disable no-unused-vars */
      const payload = cartData.map(({ pricing_id, ...rest }) => {
        return { ...rest };
      });
      /* eslint-disable no-unused-vars */
      const res = await axios.post(
        `/starter-data/assign/${selectedAgency?.value}/${selectedAgent?.value}/${selectedAgent?.user_id}`,
        { cart_items: payload },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      console.log(res.data);
      if (res.data.status === 201) {
        console.log("entered");
        sessionStorage.removeItem("cart");
        setCartData([]);
        toast.success("Success!!");
        onClose();
      }
    } catch {
      toast.error("Failed to Assign");
    } finally {
      setAssignLoading(false);
    }
  };
  const loadOptions = (inputValue, actionMeta) => {
    setSearchValue(inputValue);
    if (actionMeta.action === "input-change") {
      fetchAgents(inputValue);
    }
  };
  const removeFromCart = (id) => {
    const filteredData = cartData.filter((item) => item.pricing_id !== id);
    setCartData([...filteredData]);
    sessionStorage.removeItem("cart", JSON.stringify(filteredData));
  };
  useEffect(() => {
    if (open && cartData.length > 0) {
      fetchAgents();
    }
  }, [cartData, open]);

  return (
    <div
      className={`fixed top-0 right-0 z-[200] h-full w-96 max-w-full transform bg-white shadow-2xl transition-transform duration-300 dark:bg-gray-800 ${open ? "translate-x-0" : "translate-x-full"}`}
      style={{ boxShadow: open ? "rgba(0,0,0,0.2) -4px 0px 24px" : "none" }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-xl font-bold text-[#0a2463] dark:text-blue-400">
            Your Cart
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {cartData.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              Your cart is empty.
            </div>
          ) : (
            <>
              <ul className="space-y-4">
                {cartData.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-100">
                          {item.state || item.state_code}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {convertDays(item.start_day)}&nbsp;
                          {item.completed ? "Completed" : "Incomplete"}
                        </div>
                      </div>
                      <button
                        className="text-lg text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => removeFromCart(item.pricing_id)}
                        title="Remove"
                      >
                        &times;
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Qty:
                      </span>
                      <p>{item.quantity}</p>
                      <span className="ml-auto font-semibold text-[#0a2463] dark:text-blue-400">
                        ${item.unit_price} each
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Select
                  placeholder="Select Agent to be Assigned"
                  isLoading={loading}
                  onInputChange={loadOptions}
                  inputValue={searchValue}
                  options={agents}
                  onChange={handleAgent}
                ></Select>
              </div>
            </>
          )}
        </div>
        <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
          <div className="mb-2 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Subtotal:
              </span>
              <span className="text-base font-bold text-gray-700 dark:text-gray-200">
                ${roundedGrandTotal}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Processing Fee (4%):
              </span>
              <span className="text-base font-bold text-gray-700 dark:text-gray-200">
                ${commission}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Total:
              </span>
              <span className="text-xl font-bold text-[#0a2463] dark:text-blue-400">
                ${roundedTotalWithCommission}
              </span>
            </div>
          </div>
          <button
            className="w-full rounded-lg bg-[#0a2463] py-3 text-lg font-bold text-white transition-colors hover:bg-[#0a1a4a] disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
            disabled={cartData.length === 0 || !selectedAgent || assignLoading}
            onClick={assignLeads}
          >
            {assignLoading && <Spinner className="me-2 h-4 w-4 text-white" />}
            Click to Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
