import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import { Button, Input } from "components/ui";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { getReactSelectDarkModeStyles } from "utils/reactSelectDarkMode";

const AppointmentModal = ({ isOpen, close }) => {
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const typeOptions = [
    { value: "phonecall", label: "Phone Call" },
    { value: "inperson", label: "In-person Meeting" },
    { value: "presentation", label: "Presentation" },
  ];

  const onSubmit = (data) => {
    setLoading(true);
    console.log("Form Data:", data);
    setTimeout(() => {
      setLoading(false);
      close();
    }, 1000);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
        onClose={close}
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
              Add Appointment
            </DialogTitle>
            <div className="max-h-[80vh] overflow-y-auto px-6 py-4">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-y-4 pt-4 text-left">
                  {/* Title */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Title<span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="title"
                      control={control}
                      rules={{ required: "Title is required" }}
                      render={({ field }) => (
                        <Input {...field} type="text" invalid={errors.title} />
                      )}
                    />
                    {errors.title && (
                      <span className="text-sm text-red-500">
                        {errors.title.message}
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Choose Date<span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="date"
                      control={control}
                      rules={{ required: "Date is required" }}
                      render={({ field }) => (
                        <Input {...field} type="date" invalid={errors.date} />
                      )}
                    />
                    {errors.date && (
                      <span className="text-sm text-red-500">
                        {errors.date.message}
                      </span>
                    )}
                  </div>

                  {/* Time */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Choose Time<span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="time"
                      control={control}
                      rules={{ required: "Time is required" }}
                      render={({ field }) => (
                        <Input {...field} type="time" invalid={errors.time} />
                      )}
                    />
                    {errors.time && (
                      <span className="text-sm text-red-500">
                        {errors.time.message}
                      </span>
                    )}
                  </div>

                  {/* Type */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Type<span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="type"
                      control={control}
                      rules={{ required: "Please select a type" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          styles={getReactSelectDarkModeStyles()}
                          options={typeOptions}
                          placeholder="Select Type"
                          classNamePrefix="react-select"
                          className={
                            errors.type ? "rounded border border-red-500" : ""
                          }
                        />
                      )}
                    />
                    {errors.type && (
                      <span className="text-sm text-red-500">
                        {errors.type.message}
                      </span>
                    )}
                  </div>

                  {/* Client Name */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Client Name<span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="clientName"
                      control={control}
                      rules={{ required: "Client Name is required" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          invalid={errors.clientName}
                        />
                      )}
                    />
                    {errors.clientName && (
                      <span className="text-sm text-red-500">
                        {errors.clientName.message}
                      </span>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Phone Number<span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="phone"
                      control={control}
                      rules={{
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9+\-\s()]*$/,
                          message: "Invalid phone number",
                        },
                      }}
                      render={({ field }) => (
                        <Input {...field} type="text" invalid={errors.phone} />
                      )}
                    />
                    {errors.phone && (
                      <span className="text-sm text-red-500">
                        {errors.phone.message}
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Notes
                    </label>
                    <Controller
                      name="notes"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows="3"
                          className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Add any notes here..."
                        />
                      )}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="mt-4 text-center">
                    <Button
                      color="primary"
                      style={{ backgroundColor: "var(--atoll)" }}
                      type="submit"
                      className="mr-4 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Add"}
                    </Button>
                    <Button
                      type="button"
                      className="rounded border border-gray-400 px-6 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={close}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default AppointmentModal;
