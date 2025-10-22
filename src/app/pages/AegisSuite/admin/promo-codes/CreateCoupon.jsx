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
import Select from "react-select";
import {
  subscriptionService,
  leadsService,
  couponService,
} from "utils/apiService";
import moment from "moment";
import { toast } from "sonner";

const CreateCoupon = ({
  isCouponOpen,
  couponClose,
  editData,
  setEditData,
  setResetPage,
  resetPage,
}) => {
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const duration = [
    {
      label: "Once",
      value: "once",
    },
    {
      label: "Forever",
      value: "forever",
    },
  ];
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    mode: "onChange",
  });
  const watchOffType = watch("off_type");
  const watchDuration = watch("duration");
  const watchType = watch("type");
  const getCurrentDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };
  // Fetch subscription plans data
  const fetchPlans = async () => {
    try {
      setPlansLoading(true);

      const response = await subscriptionService.getAdminPlans();
      console.log("Subscription plans API response:", response);

      if (response.data.data && Array.isArray(response.data.data)) {
        const processedPlans = response.data.data.map((plan) => {
          // Generate color based on index or plan properties
          return {
            value: plan.id,
            label: plan.title,
          };
        });

        setPlans(processedPlans);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error("Error fetching subscription plans:", err);
    } finally {
      setPlansLoading(false);
    }
  };
  const addCoupon = (data) => {
    setLoading(true);
    const payload = {
      name: data.name,
      is_used_in_marketplace:data?.type === 'marketplace' ? true : false,
      assigned_pricing_ids: data.plans.map((item) => item.value),
      duration: data.duration.value,
    };
    if (data.duration.value === "forever") {
      payload["max_redemptions"] = data.max_redemption;
      payload["percent_off"] = data.off_value;
    } else {
      payload["redeem_by"] = moment(data.redeem_by).format(
        "MM-DD-YYYY HH:mm:ss",
      );
      if (data.off_type === "amount") {
        payload["amount_off"] = data.off_value;
      } else {
        payload["percent_off"] = data.off_value;
      }
    }
    couponService
      .addCoupons(payload)
      .then((response) => {
        if (response.data.status === 201) {
          toast.success("Coupon Created!");
          couponClose();
          setResetPage(!resetPage);
        } else {
          toast.error(response?.data?.message || "Failed to Create Coupon");
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to Create Coupon");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const editCoupon = (data) => {
    setLoading(true);
    const payload = {
      name: data.name,
    };
    couponService
      .editCoupon(editData.stripe_coupon_id, payload)
      .then((response) => {
        if (response.data.status === 200) {
          toast.success("Coupon Edited!");
          setEditData(null)
          couponService.getCoupons(1, 10);
          couponClose();
          setResetPage(!resetPage);
        } else {
          toast.error(response?.data?.message || "Failed to Edit Coupon");
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to Edit Coupon");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const submitData = async (data) => {
    if (!editData) {
      addCoupon(data);
    } else {
      editCoupon(data)
    }
  };

  const closeModal = () => {
    reset();
    couponClose();
  };
  const fetchPricing = async () => {
    try {
      const data = await leadsService.getMarketplacePricing();
      if (data?.data) {
        setMarketData(
          data.data.map((item) => {
            return { label: item.description, value: item.id };
          }),
        );
      }
    } catch (error) {
      console.log(error);
      setMarketData([]);
    }
  };
  useEffect(() => {
    if (isCouponOpen) {
      fetchPlans();
      fetchPricing();
    }
  }, [isCouponOpen]);
  useEffect(() => {
    if (editData && isCouponOpen) {
      setValue("name", editData?.name);
    }
  }, [editData, isCouponOpen]);
  return (
    <Transition appear show={isCouponOpen} as={Fragment}>
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
              {!editData ? "Create New Coupon" : "Edit Coupon"}
            </DialogTitle>

            <form onSubmit={handleSubmit(submitData)}>
              <div className="grid gap-y-4 pt-4">
                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="code"
                  >
                    Name<span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="name"
                    rules={{
                      required: "Name is required",
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="code"
                        placeholder="e.g., NEWCOUPON123"
                        invalid={errors.code}
                      />
                    )}
                  />
                  {errors.name && (
                    <span className="text-sm text-red-500">
                      {errors.name.message}
                    </span>
                  )}
                </div>
                {
                  !editData &&  <>
                  <div className="w-full">
                    <label
                      className="mb-1 block text-left text-sm font-medium"
                      htmlFor="code"
                    >
                      Duration Type<span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="duration"
                      control={control}
                      rules={{
                        required: "Please Select Minimum 1 Pricing Plan",
                      }}
                      render={({ field }) => (
                        <Select
                          id="duration"
                          {...field}
                          options={duration}
                          placeholder="Select Duration"
                          classNamePrefix="react-select"
                          className={
                            errors.duration
                              ? "rounded border border-red-500"
                              : ""
                          }
                        />
                      )}
                    />
                  </div>
                  <div className="w-full">
                    <label
                      className="mb-1 block text-left text-sm font-medium"
                      htmlFor="active"
                    >
                      Applicable for<span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="type"
                      control={control}
                      rules={{ required: "Please select an option" }}
                      render={({ field }) => (
                        <div className="flex flex-wrap gap-5">
                          <Radio
                            label="Market Place"
                            name="type"
                            checked={field.value === "marketplace"}
                            onChange={() => {
                              field.onChange("marketplace");
                              setValue("plans", null);
                            }}
                          />
                          <Radio
                            label="Subscription Plans"
                            name="type"
                            checked={field.value === "subscription"}
                            onChange={() => {
                              field.onChange("subscription");
                              setValue("plans", null);
                            }}
                          />
                        </div>
                      )}
                    />

                    {errors.type && (
                      <p className="text-sm text-red-500">
                        {errors.type.message}
                      </p>
                    )}
                  </div>
                  {watchType && (
                    <div className="w-full">
                      <label
                        className="mb-1 block text-left text-sm font-medium"
                        htmlFor="code"
                      >
                        Choose Pricing Plans
                        <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="plans"
                        control={control}
                        rules={{
                          required: "Please Select Minimum 1 Pricing Plan",
                        }}
                        render={({ field }) => (
                          <Select
                            id="plans"
                            {...field}
                            isMulti={true}
                            isLoading={plansLoading}
                            options={
                              watchType === "marketplace" ? marketData : plans
                            }
                            placeholder="Select Plans"
                            classNamePrefix="react-select"
                            className={
                              errors.plans
                                ? "rounded border border-red-500"
                                : ""
                            }
                          />
                        )}
                      />
                    </div>
                  )}

                  {watchDuration?.value === "forever" && (
                    <div className="w-full">
                      <label
                        className="mb-1 block text-left text-sm font-medium"
                        htmlFor="code"
                      >
                        Maximum Redemptions
                        <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        control={control}
                        name="max_redemption"
                        rules={{
                          required: "Maximum Redemptions is required",
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            id="max_redemption"
                            invalid={errors.max_redemption}
                          />
                        )}
                      />
                      {errors.max_redemption && (
                        <span className="text-sm text-red-500">
                          {errors.max_redemption.message}
                        </span>
                      )}
                    </div>
                  )}

                  {watchDuration?.value !== "forever" && (
                    <div className="w-full">
                      <label
                        className="mb-1 block text-left text-sm font-medium"
                        htmlFor="active"
                      >
                        Choose off type<span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="off_type"
                        control={control}
                        rules={{ required: "Please select Yes or No" }}
                        render={({ field }) => (
                          <div className="flex flex-wrap gap-5">
                            <Radio
                              label="Percent"
                              name="off_type"
                              checked={field.value === "percent"}
                              onChange={() => field.onChange("percent")}
                            />
                            <Radio
                              label="Amount"
                              name="off_type"
                              checked={field.value === "amount"}
                              onChange={() => field.onChange("amount")}
                            />
                          </div>
                        )}
                      />

                      {errors.off_type && (
                        <p className="text-sm text-red-500">
                          {errors.off_type.message}
                        </p>
                      )}
                    </div>
                  )}

                  {(watchDuration?.value === "forever" || watchOffType) && (
                    <div className="w-full">
                      <label
                        className="mb-1 block text-left text-sm font-medium"
                        htmlFor="code"
                      >
                        {watchDuration?.value === "forever"
                          ? "Specify % Off"
                          : watchOffType === "percent"
                            ? "Specify % Off"
                            : "Specify Amount Off in Dollars"}
                        <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        control={control}
                        name="off_value"
                        rules={{
                          required: "This field is required",
                             validate: (value) =>  Number.isInteger(Number(value)) || "Decimal values are not allowed",
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            step='1'
                            type="number"
                            id="off_value"
                            invalid={errors.off_value}
                            inputMode="numeric" 
                          />
                        )}
                      />
                      {errors.off_value && (
                        <span className="text-sm text-red-500">
                          {errors.off_value.message}
                        </span>
                      )}
                    </div>
                  )}
                  {watchDuration?.value !== "forever" && (
                    <div className="w-full">
                      <label
                        className="mb-1 block text-left text-sm font-medium"
                        htmlFor="expires_at"
                      >
                        Expiration Date & Time
                      </label>
                      <Controller
                        control={control}
                        name="redeem_by"
                        rules={{ required: "Expiry Date is Required" }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="datetime-local"
                            id="redeem_by"
                            min={getCurrentDate()}
                            invalid={errors.expires_at}
                          />
                        )}
                      />
                      {errors.redeem_by && (
                        <span className="text-sm text-red-500">
                          {errors.redeem_by.message}
                        </span>
                      )}
                    </div>
                  )}
                </>
                }
               
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
                   {!editData ? 'Create Coupon' : 'Edit'} 
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

export default CreateCoupon;
