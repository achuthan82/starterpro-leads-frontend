import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import { useForm, Controller } from "react-hook-form";
import { Button, Spinner, Input } from "components/ui";
import Select from "react-select";
import { ArrowPathIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

const SchedulerModal = ({ isOpen, close }) => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(1);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onChange",
  });

  const getCurrentDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const submitData = async (data) => {
    console.log(data);
    setLoading(true);
  };

  const closeModal = () => {
    reset();
    close();
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
              Schedule Campaign
            </DialogTitle>

            <form onSubmit={handleSubmit(submitData)}>
              <div className="grid gap-y-4 pt-4">
                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="code"
                  >
                    Campaign<span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="campaign"
                    control={control}
                    rules={{
                      required: "This field is Required",
                    }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={[]}
                        placeholder="Select Campaign"
                        classNamePrefix="react-select"
                        className={
                          errors.campaign ? "rounded border border-red-500" : ""
                        }
                      />
                    )}
                  />
                </div>
                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="code"
                  >
                    Schedule Type<span className="text-red-500">*</span>
                  </label>
                  <div className="mt-3 grid w-full grid-cols-12 gap-2">
                    <div
                      onClick={() => setSelected(1)}
                      className={`col-span-6 flex cursor-pointer items-center justify-center rounded-lg border-2 border-neutral-300 p-4 hover:bg-blue-50 ${selected === 1 ? "border-neutral-500 bg-blue-50" : ""}`}
                    >
                      <div>
                        <div className="mb-2 flex justify-center">
                          <CalendarDaysIcon className="size-7" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-500">
                            One Time
                          </h4>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => setSelected(2)}
                      className={`col-span-6 flex cursor-pointer items-center justify-center rounded-lg border-2 border-neutral-300 p-4 hover:bg-blue-50 ${selected === 2 ? "border-neutral-500 bg-blue-50" : ""}`}
                    >
                      <div>
                        <div className="mb-2 flex justify-center">
                          <ArrowPathIcon className="size-7" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-500">
                            Recurring
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {selected === 1 ? (
                  <>
                    <div className="w-full">
                      <label
                        className="mb-1 block text-left text-sm font-medium"
                        htmlFor="expires_at"
                      >
                        Start Date & time
                      </label>
                      <Controller
                        control={control}
                        name="start_date"
                        rules={{ required: "Expiry Date is Required" }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="datetime-local"
                            id="expires_at"
                            min={getCurrentDate()}
                            invalid={errors.start_date}
                          />
                        )}
                      />
                      {errors.start_date && (
                        <span className="text-sm text-red-500">
                          {errors.start_date.message}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-full">
                      <label
                        className="mb-1 block text-left text-sm font-medium"
                        htmlFor="code"
                      >
                        Frequency <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="time_zone"
                        control={control}
                        rules={{
                          required: "This field is Required",
                        }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={[]}
                            placeholder="Select Frequency"
                            classNamePrefix="react-select"
                            className={
                              errors.frequency
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
                        htmlFor="expires_at"
                      >
                        Time
                      </label>
                      <Controller
                        control={control}
                        name="time"
                        rules={{ required: "Expiry Date is Required" }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="time"
                            id="time"
                            invalid={errors.time}
                          />
                        )}
                      />
                      {errors.time && (
                        <span className="text-sm text-red-500">
                          {errors.time.message}
                        </span>
                      )}
                    </div>
                    <div className="w-full">
                      <label
                        className="mb-1 block text-left text-sm font-medium"
                        htmlFor="expires_at"
                      >
                        End Date & Time (optional)
                      </label>
                      <Controller
                        control={control}
                        name="end_date"
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="datetime-local"
                            id="expires_at"
                            min={getCurrentDate()}
                          />
                        )}
                      />
                    </div>
                  </>
                )}
                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="code"
                  >
                    Time Zone<span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="time_zone"
                    control={control}
                    rules={{
                      required: "This field is Required",
                    }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={[]}
                        placeholder="Select Time Zone"
                        classNamePrefix="react-select"
                        className={
                          errors.time_zone
                            ? "rounded border border-red-500"
                            : ""
                        }
                      />
                    )}
                  />
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
                    Create
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

export default SchedulerModal;
