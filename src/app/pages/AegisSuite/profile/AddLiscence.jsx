import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import { Button, Spinner, Input } from "components/ui";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import profileService from "utils/profileService";
import Select from "react-select";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { useDropzone } from "react-dropzone";

const AddLiscence = ({ isOpen, close }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [stateLoading, setStateLoading] = useState(false);
  //   const [files, setFiles] = useState([]);
  const [uploadedFile, setUploadedFile] = useState([]);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    mode: "onChange",
  });
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: ".png, .jpg",
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      //   setFiles([file]);
      setUploadedFile(file);
      setPreview(URL.createObjectURL(file));
    },
  });

  const submitData = (data) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("state", data.states.value);
    formData.append("license_number", data.liscence_number);
    profileService
      .addLiscenceDetails(formData)
      .then((response) => {
        if (response.data.status === 201) {
          toast.success("Added !");
         close()
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
  const getStates = () => {
    setStateLoading(true);
    profileService
      .getUsaStates()
      .then((response) => {
        console.log("response", response);
        setStateLoading(false);
        if (response.data.status === 200) {
          const dt = response.data.data;
          const arr = [];
          Object.keys(dt).map(function (key) {
            arr.push({ value: dt[key], label: key });
          });
          setStates(arr);
        } else if (response.data.status === 204) {
          setStates([]);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            "This Service is not available at the moment..please try again later",
        );
        setStateLoading(false);
      })
      .finally(() => {
        setStateLoading(false);
      });
  };
  useEffect(() => {
    if (isOpen) {
      getStates();
    }
  }, [isOpen]);
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
              Add Liscence
            </DialogTitle>

            <form onSubmit={handleSubmit(submitData)}>
              <div className="grid gap-y-4 pt-4">
                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="code"
                  >
                    Liscence Number<span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="liscence_number"
                    rules={{
                      required: "Liscence Number is required",
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        id="liscence_number"
                        // placeholder="e.g., NEWCOUPON123"
                        invalid={errors.liscence_number}
                      />
                    )}
                  />
                  {errors.liscence_number && (
                    <span className="text-sm text-red-500">
                      {errors.liscence_number.message}
                    </span>
                  )}
                </div>
                <div className="mb-2 w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="code"
                  >
                    Choose State<span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="states"
                    control={control}
                    rules={{
                      required: "Please Select a State",
                    }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={states}
                        isLoading={stateLoading}
                        placeholder="Select States"
                        classNamePrefix="react-select"
                        className={
                          errors.states ? "rounded border border-red-500" : ""
                        }
                      />
                    )}
                  />
                  {errors.states && (
                    <span className="text-sm text-red-500">
                      {errors.states.message}
                    </span>
                  )}
                </div>

                <div className="w-full">
                  <label className="mb-1 block text-left text-sm font-medium">
                    Upload Image <span className="text-red-500">*</span>
                  </label>

                  <div
                    {...getRootProps({
                      className:
                        "border border-dashed rounded-md p-4 text-center cursor-pointer hover:border-[#0a2463] dark:hover:border-[#f4d03f] transition-colors",
                    })}
                  >
                    <input {...getInputProps()} />

                    {!preview ? (
                      <div className="flex flex-col items-center space-y-1 text-gray-500">
                        <CloudArrowUpIcon className="h-6 w-6 text-gray-400" />
                        <p className="text-xs">Drop or click to upload</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <img
                          src={preview}
                          alt="Preview"
                          className="h-16 w-16 rounded-md border object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreview(null);
                            setUploadedFile(null);
                          }}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="mt-2 w-full text-center">
                  <Button
                    color="primary"
                    style={{ backgroundColor: "var(--atoll)" }}
                    type="submit"
                    className="mr-4 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading && <Spinner className="me-1 h-3 w-3" />}
                    Add
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
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
};

export default AddLiscence;
