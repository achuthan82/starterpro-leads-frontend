import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import Select from "react-select";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";

const CopyMoveModal = ({ isOpen, close, options = [], onSubmit }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      selectedOption: null,
    },
  });

  const submitForm = (data) => {
    onSubmit?.(data.selectedOption);
    close();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-6 sm:px-5"
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

        {/* Modal */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel className="dark:bg-dark-700 relative w-full max-w-md rounded-2xl bg-white px-6 py-6 text-gray-900 shadow-xl transition-all dark:text-gray-100">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Assign Leads to Agents</h2>
              <button
                onClick={close}
                className="dark:hover:bg-dark-600 rounded-lg p-2 transition-colors hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(submitForm)}>
              <div className="mb-4">
                <Controller
                  name="selectedOption"
                  control={control}
                  rules={{ required: "Please select an option" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      isMulti
                      options={options}
                      placeholder="Choose Agents..."
                      onChange={(value) => field.onChange(value)}
                    />
                  )}
                />
                {errors.selectedOption && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.selectedOption.message}
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Submit
                </button>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default CopyMoveModal;
