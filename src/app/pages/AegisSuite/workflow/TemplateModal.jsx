import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { Button } from "components/ui";
import { useMemo } from "react";
import { TextEditor } from "components/shared/form/TextEditor";
const TemplateModal = ({ isOpen, onClose }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const frequencyOptions = [{ value: "day", label: "Day" }];

  const periodOptions = useMemo(() => {
    let arr = [];
    for (let i = 1; i < 32; i++) {
      arr.push({ value: i, label: `${i}` });
    }
    return arr;
  }, []);

  const submitData = (data) => {
    console.log("Selected:", data);
    // onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
        onClose={onClose}
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
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
          <DialogPanel className="relative w-full max-w-xl rounded-2xl bg-white px-6 py-8 text-center shadow-xl">
            <DialogTitle
              as="h3"
              className="text-xl font-semibold text-gray-800"
            >
              Create Template
            </DialogTitle>

            <form onSubmit={handleSubmit(submitData)} className="mt-6">
              {/* Simple Select */}
              <div className="mb-6 w-full text-left">
                <label className="mb-1 block text-sm font-medium">
                  Frequency
                </label>

                <Controller
                  name="frequency"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      defaultValue={frequencyOptions[0]}
                      options={frequencyOptions}
                      placeholder="Choose…"
                      classNamePrefix="react-select"
                      isDisabled
                    />
                  )}
                />
              </div>
              <div className="mb-6 w-full text-left">
                <label className="mb-1 block text-sm font-medium">
                  Choose Period
                </label>

                <Controller
                  name="period"
                  control={control}
                  rules={{
                    required: "This field is required",
                  }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={periodOptions}
                      placeholder="Choose…"
                      classNamePrefix="react-select"
                      className={
                        errors.period ? "rounded border border-red-500" : ""
                      }
                    />
                  )}
                />
                {errors.period && (
                  <span className="text-sm text-red-500">
                    {errors.period.message}
                  </span>
                )}
              </div>
              <div className="mb-6 max-w-xl">
                <TextEditor placeholder="Enter your content here..." />
              </div>
              {/* Buttons */}
              <div className="flex justify-center gap-4">
                <Button
                  color="primary"
                  type="submit"
                  className="rounded px-6 py-2 text-white"
                >
                  Save
                </Button>

                <Button
                  type="button"
                  className="rounded border border-gray-400 px-6 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default TemplateModal;
