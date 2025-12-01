import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import { Button, Spinner, Input, Textarea } from "components/ui";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import Select from "react-select";
import profileService from "utils/profileService";

const ScriptModal = ({ isOpen, close, editData, setEditData, setCurrentPage, activeTab, getScriptData}) => {
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const options = [
    { value: "address", label: "Address" },
    { value: "call_in_date_time", label: "Call In Date Time" },
    { value: "campaign_name", label: "Campaign Name" },
    { value: "city", label: "City" },
    { value: "first_name", label: "First Name" },
    { value: "full_name", label: "Full Name" },
    { value: "ivr_logs", label: "Ivr Logs" },

    { value: "ivr_response.ani", label: "Ivr Response – Ani" },
    { value: "ivr_response.mortgage_id", label: "Ivr Response – Mortgage Id" },
    { value: "ivr_response.sid", label: "Ivr Response – Sid" },
    { value: "ivr_response.status", label: "Ivr Response – Status" },
    { value: "ivr_response.timestamp", label: "Ivr Response – Timestamp" },

    { value: "last_name", label: "Last Name" },
    { value: "lead_member_id", label: "Lead Member Id" },
    { value: "lead_status", label: "Lead Status" },
    { value: "lender_name", label: "Lender Name" },
    { value: "loan_amount", label: "Loan Amount" },
    { value: "loan_date", label: "Loan Date" },
    { value: "mortgage_id", label: "Mortgage Id" },
    { value: "notes", label: "Notes" },
    { value: "state", label: "State" },
    { value: "zip", label: "Zip" },
  ];
  const typeOptions = [
    {
      value: 1,
      label: "script",
    },
    {
      value: 2,
      label: "Objection",
    },
  ];
  const {
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue,
  } = useForm({
    mode: "onChange",
  });
  const watchDescription = watch("description");
  const handleInsert = () => {
    setValue("description", (watchDescription || "") + `{{${selectedOption}}}`);
  };
  const handleVariable = (opt) => {
    if (opt) {
      setSelectedOption(opt.value);
    }
  };
  const submitData = (data) => {
    setLoading(true);
    const payload = {
      title: data.title,
      description: data.description,
    //   type_: data.type.value,
    };
    if (!editData) {
        payload['type_'] = data.type.value
    }
    let sendData
    if (!editData) {
        sendData = profileService.addScript(payload)
    } else {
              sendData = profileService.editScript(editData.id, payload)

    }
      sendData.then((response) => {
        if (response.data.status === 201 || response.data.status === 200) {
          toast.success(response?.data?.message || "Success!");
          setEditData(null)
          close();
          setCurrentPage(0)
          getScriptData(1, 5, activeTab)
        } else {
          toast.error(response?.data?.message);
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Please try again later");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    if (editData) {
        setValue('title', editData.title)
        setValue('description', editData.description)
    }
  },[editData])
  return (
    <div>
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
                Add Script {!editData ? 'Add Script' : 'Edit Script'}
              </DialogTitle>

              <form onSubmit={handleSubmit(submitData)}>
                <div className="grid gap-y-4 pt-4">
                  <div className="w-full">
                    <label
                      className="mb-1 block text-left text-sm font-medium"
                      htmlFor="code"
                    >
                      Title<span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="title"
                      rules={{
                        required: "Title is required",
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          id="title"
                          // placeholder="e.g., NEWCOUPON123"
                          invalid={errors.title}
                        />
                      )}
                    />
                    {errors.title && (
                      <span className="text-sm text-red-500">
                        {errors.title.message}
                      </span>
                    )}
                  </div>
                  {
                    !editData &&  <div className="mb-2 w-full">
                    <label
                      className="mb-1 block text-left text-sm font-medium"
                      htmlFor="code"
                    >
                      Choose Type<span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="type"
                      control={control}
                      rules={{
                        required: "Please Select a State",
                      }}
                      render={({ field }) => (
                        <Select
                          {...field}
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
                  }
                 
                  <div className="w-full">
                    <label
                      className="mb-1 block text-left text-sm font-medium"
                      htmlFor="code"
                    >
                      Select Variables
                    </label>
                    <div className="flex w-full items-center gap-2">
                      <Select
                        options={options}
                        onChange={handleVariable}
                        placeholder="Select variable..."
                        className="flex-grow-1"
                      />

                      <button
                        type="button"
                        onClick={handleInsert}
                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                      >
                        Insert
                      </button>
                    </div>
                  </div>
                  <div className="w-full">
                    <label
                      className="mb-1 block text-left text-sm font-medium"
                      htmlFor="code"
                    >
                      Description<span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="description"
                      rules={{
                        required: "Title is required",
                      }}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          type="text"
                          id="description"
                          // placeholder="e.g., NEWCOUPON123"
                          invalid={errors.description}
                        />
                      )}
                    />
                    {errors.description&& (
                      <span className="text-sm text-red-500">
                        {errors.description.message}
                      </span>
                    )}
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
                     Submit
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
    </div>
  );
};

export default ScriptModal;
