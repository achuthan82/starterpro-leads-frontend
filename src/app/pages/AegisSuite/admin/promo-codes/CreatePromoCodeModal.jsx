import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import { useForm, Controller } from "react-hook-form";
import { Button, Spinner, Input, Radio } from "components/ui";
import { toast } from "sonner";
import { promoCodeService } from "utils/apiService";
import Select from "react-select";
import couponService from "utils/couponService";
import moment from "moment";
const CreatePromoCodeModal = ({
  isOpen,
  close,
  fetchPromoCodes,
  setCurrentPage,
}) => {
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [assigneesLoading, setAssigneesLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('')
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      active: true,
      code: "",
      coupon: "",
      expires_at: "",
      max_redemptions: 1,
    },
  });
  const watchPublic = watch("public");
  const watchCoupon = watch("coupon");
  console.log("coupon", watchCoupon);
  const submitData = async (data) => {
    setLoading(true);

    try {
      // Convert date to Unix timestamp
      const payload = {
        active: data.active,
        code: data.code,
        coupon_code_id: data.coupon.id,
        coupon_code:data.coupon.value,
        expires_at: moment(data.expires_at).format("MM-DD-YYYY HH:mm:ss"),
        is_public:data.public === 'yes' ? true : false,
        max_redemptions: parseInt(data.max_redemptions),
        restrictions_minimum_amount:parseInt(data.min_amount_spent)
      };
      if (data.public === "no") {
        payload["assigned_users"] = data.assignees.map((item) => item.value);
      }
      console.log("Creating promo code with payload:", payload);

      const response = await promoCodeService.createPromoCode(payload);
      console.log("Create promo code response:", response);

      if (response.status === 201 || response.status === 200) {
        toast.success("Promo code created successfully!");
        closeModal();
        setCurrentPage(1);
        fetchPromoCodes(1);
      } else {
        toast.error(response.message || "Failed to create promo code");
      }
    } catch (error) {
      console.error("Error creating promo code:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if (error.response?.status === 403) {
        toast.error("You do not have permission to perform this action.");
      } else if (error.response?.status === 422) {
        // Validation errors
        const validationErrors = error.response.data?.errors || {};
        const errorMessages = Object.values(validationErrors).flat();
        toast.error(errorMessages.join(", ") || "Validation failed");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to create promo code. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const getCoupons = () => {
    setLoading(true);
    couponService
      .getCoupons(1, 100)
      .then((resp) => {
        if (resp.data.status === 200) {
          setCoupons(
            resp.data.data.map((item) => {
              return {
                label: item.name,
                value: item.stripe_coupon_id,
                id:item.id,
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
        setLoading(false);
      });
  };
  const closeModal = () => {
    reset();
    close();
  };
  const fetchAssignees = (val) => {
    setAssigneesLoading(true);
    promoCodeService
      .getAssignees(val)
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          setAssignees(
            response.data.map((item) => {
              return { value: item.id, label: item.name };
            }),
          );
        } else {
          setAssignees([]);
        }
      })
      .catch(() => {
        setAssignees([]);
      })
      .finally(() => {
        setAssigneesLoading(false);
      });
  };
  useEffect(() => {
    if (isOpen) {
      getCoupons();
    }
  }, [isOpen]);
  useEffect(() => {
    if (watchPublic === "no") {
      fetchAssignees('');
    }
  }, [watchPublic]);
  // Get current date for min date
  const getCurrentDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const loadOptions = (inputValue, actionMeta) => {
      setSearchValue(inputValue);
      if (actionMeta.action === "input-change") {
        fetchAssignees(inputValue);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
        onClose={closeModal}
      >
        {/* Overlay */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        {/* Modal Content */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel className="dark:bg-dark-700 relative w-full max-w-[600px] rounded-2xl bg-white px-6 py-8 text-center shadow-xl transition-all sm:px-8">
            <DialogTitle
              as="h3"
              className="text-2xl font-semibold text-gray-800 dark:text-gray-100"
            >
              Create New Promo Code
            </DialogTitle>

            <form onSubmit={handleSubmit(submitData)}>
              <div className="grid gap-y-4 pt-4">
                {/* Status Selection */}
                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="active"
                  >
                    Status <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="active"
                    rules={{ required: "Status is required" }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full rounded-lg border px-3 py-2 focus:border-[var(--color-atoll)] focus:ring-2 focus:ring-[var(--color-atoll)] focus:outline-none ${
                          errors.active ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value={true}>Active</option>
                        <option value={false}>Inactive</option>
                      </select>
                    )}
                  />
                  {errors.active && (
                    <span className="text-sm text-red-500">
                      {errors.active.message}
                    </span>
                  )}
                </div>

                {/* Promo Code */}
                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="code"
                  >
                    Promo Code <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="code"
                    rules={{
                      required: "Promo code is required",
                      minLength: {
                        value: 3,
                        message: "Promo code must be at least 3 characters",
                      },
                      maxLength: {
                        value: 50,
                        message: "Promo code must be less than 50 characters",
                      },
                      pattern: {
                        value: /^[A-Z0-9_-]+$/i,
                        message:
                          "Promo code can only contain letters, numbers, hyphens, and underscores",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="code"
                        placeholder="e.g., NEWCOUPON123"
                        invalid={errors.code}
                        onChange={(event) => {
                          // Convert to uppercase
                          const value = event.target.value.toUpperCase();
                          field.onChange(value);
                        }}
                      />
                    )}
                  />
                  {errors.code && (
                    <span className="text-sm text-red-500">
                      {errors.code.message}
                    </span>
                  )}
                </div>
                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="active"
                  >
                    Public Promo Code <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="public"
                    control={control}
                    rules={{ required: "Please select Yes or No" }}
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-5">
                        <Radio
                          label="Yes"
                          name="public"
                          checked={field.value === "yes"}
                          onChange={() => field.onChange("yes")}
                        />
                        <Radio
                          label="No"
                          name="public"
                          checked={field.value === "no"}
                          onChange={() => field.onChange("no")}
                        />
                      </div>
                    )}
                  />

                  {errors.public && (
                    <p className="text-sm text-red-500">
                      {errors.public.message}
                    </p>
                  )}
                </div>
                {watchPublic === "no" && (
                  <div className="w-full">
                    <label
                      className="mb-1 block text-left text-sm font-medium"
                      htmlFor="code"
                    >
                      Assignees<span className="text-red-500">*</span>
                    </label>
                    <Controller
                    
                      name="assignees"
                      control={control}
                      rules={{
                        required: "Please Select Minimum 1 Assignee",
                      }}
                      render={({ field }) => (
                        <Select
                          isMulti={true}
                          {...field}
                          isLoading={assigneesLoading}
                          options={assignees}
                          placeholder="Select Assignees"
                          classNamePrefix="react-select"
                          onInputChange={loadOptions}
                          inputValue={searchValue}
                          className={
                            errors.assignees
                              ? "rounded border border-red-500"
                              : ""
                          }
                        />
                      )}
                    />
                  </div>
                )}

                {/* Coupon ID */}
                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="coupon"
                  >
                    Coupon <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="coupon"
                    control={control}
                    rules={{
                      required: "This field is required",
                    }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={coupons}
                        placeholder="Select Coupons"
                        classNamePrefix="react-select"
                        className={
                          errors.coupon ? "rounded border border-red-500" : ""
                        }
                      />
                    )}
                  />
                  {errors.coupon && (
                    <span className="text-sm text-red-500">
                      {errors.coupon.message}
                    </span>
                  )}
                </div>

                {/* Expiration Date */}
                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="expires_at"
                  >
                    Expiration Date & Time
                  </label>
                  <Controller
                    control={control}
                    name="expires_at"
                    rules={{
                      validate: (value) => {
                        if (!value) return true;
                        const selectedDate = moment(value, "YYYY-MM-DDTHH:mm");
                        if (!watchCoupon.expiry) return true;
                        const couponExpiry = moment(
                          watchCoupon.expiry,
                          "MM-DD-YYYY HH:mm:ss",
                        );
                        

                        if (!selectedDate.isValid()) {
                          return "Invalid date format.";
                        }

                        return selectedDate.isBefore(couponExpiry)
                          ? true
                          : "Expiry date must be before the coupon expiry.";
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="datetime-local"
                        id="expires_at"
                        min={getCurrentDate()}
                        invalid={errors.expires_at}
                        
                      />
                    )}
                  />
                  {errors.expires_at && (
                    <span className="text-sm text-red-500">
                      {errors.expires_at.message}
                    </span>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty for no expiration
                  </p>
                </div>
                       {/* Max Redemptions */}
                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="max_redemptions"
                  >
                    Minimum amount to be spent in Dollars<span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="min_amount_spent"
                    rules={{
                      required: "Max redemptions is required",
                      validate: (value) =>  Number.isInteger(Number(value)) || "Decimal values are not allowed",

                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        id="min_amount_spent"
                        placeholder="10"
                        invalid={errors.min_amount_spent}
                      />
                    )}
                  />
                  {errors.min_amount_spent && (
                    <span className="text-sm text-red-500">
                      {errors.min_amount_spent.message}
                    </span>
                  )}
                
                </div>
                {/* Max Redemptions */}
                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="max_redemptions"
                  >
                    Max Redemptions <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="max_redemptions"
                    rules={{
                      required: "Max redemptions is required",
                      min: {
                        value: 1,
                        message: "Max redemptions must be at least 1",
                      },
                      max: {
                        value: watchCoupon?.max_redemption
                          ? watchCoupon?.max_redemption
                          : 1,
                        message:
                          "Max redemptions must be less than max redemptions of selected coupon",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        id="max_redemptions"
                        placeholder="10"
                        invalid={errors.max_redemptions}
                      />
                    )}
                  />
                  {errors.max_redemptions && (
                    <span className="text-sm text-red-500">
                      {errors.max_redemptions.message}
                    </span>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum number of times this promo code can be used
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="mt-6 w-full pt-4 text-center">
                  <Button
                    color="primary"
                    style={{ backgroundColor: "var(--atoll)" }}
                    type="submit"
                    className="mr-4 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading && <Spinner className="me-1 h-3 w-3" />}
                    Create Promo Code
                  </Button>
                  <Button
                    type="button"
                    className="rounded border border-gray-400 px-6 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={closeModal}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default CreatePromoCodeModal;
