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
import appointmentService from "utils/appointmentService";
import Select from "react-select";

const InviteModal = ({ isInviteOpen, inviteClose }) => {
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [clients, setClients] = useState([])
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    mode: "onChange",
  });

  const selectedType = watch("type");

  const submitData = async (form) => {
    setLoading(true);
  
     const payload = {
      name:form?.client?.full_name,
      title: form.title,
      mortgage_id:form?.client?.mortgage_id,
      lead_member_id:form?.client?.lead_member_id
    };
    if (form.type === "email") {
      payload['email'] = form.email;
    }

    if (form.type === "sms") {
      payload['phone'] = `+1${form.phone}`;
    }

    if (form.type === "both") {
      payload['email'] = form.email;
      payload['phone'] = `+1${form.phone}`;
    }

    try {
      const response =
        await appointmentService.createPublicAppointment(payload);
      if (
        response.status === 201 ||
        response.status === 200 ||
        response.success
      ) {
        toast.success(
          response.message || "Appointment scheduled successfully!",
        );
        inviteClose();
      } else {
        toast.error(response.message || "Failed to schedule appointment");
      }
    } catch (err) {
      console.error("Error scheduling appointment:", err);
      toast.error(err.message || "Failed to schedule appointment");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
     setValue('phone', '')
     setValue('email', '')
     setValue('client', '')
     setValue('title', '')
     setValue('type', '')
     inviteClose()
  }

  const handleClient = (selectedClient) => {
    setValue('phone', selectedClient?.ivr_response?.ani.slice(2))
    setValue('email', selectedClient?.email)
  }

  const loadOptions = (inputValue, actionMeta) => {
    setSearchValue(inputValue);
    if (actionMeta.action === "input-change") {
      getClients(inputValue);
    }
  };

  const getClients = (name = "") => {
    setClientsLoading(true);
    const params = { page: 1, per_page: 50, name: name };
    appointmentService
    .getPaginatedLeads(params)
    .then((response) => {
      console.log(response);
      if (response.status === 200) {
        setClients(
          response.data.map((item) => {
            return {
              label: item.full_name,
              value: item.lead_member_id,
              ...item,
            };
          }),
        );
      } else if (response.status === 204) {
        setClients([]);
      } else {
        setClients([]);
        toast.error(response?.data?.message || "Failed to fetch clients");
      }
    })
    .catch((error) => {
      setClients([]);
      toast.error(error?.message || "Failed to fetch clients");
    })
    .finally(() => {
      setClientsLoading(false);
    });
  };

  useEffect(() => {
    if (isInviteOpen) {
      getClients();
    }
  }, [isInviteOpen]);

  return (
    <Transition appear show={isInviteOpen} as={Fragment}>
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
              Invite User
            </DialogTitle>

            <form onSubmit={handleSubmit(submitData)}>
              <div className="grid gap-y-4 pt-4">
                {/* NAME */}
                <div className="w-full">
                  <label className="mb-1 block text-left text-sm font-medium">
                    Choose Client <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="client"
                    control={control}
                    rules={{ required: "Please select a client" }}
                    render={({ field }) => (
                      <>
                        <Select
                          {...field}
                          isLoading={clientsLoading}
                          options={clients}
                          onInputChange={loadOptions}
                          inputValue={searchValue}
                          placeholder="Select Client"
                          classNamePrefix="react-select"
                          onChange={(value) => { field.onChange(value); handleClient(value)}} // important!
                        />

                        {errors.client && (
                          <span className="text-sm text-red-500">
                            {errors.client.message}
                          </span>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* TITLE */}
                <div className="w-full">
                  <label className="mb-1 block text-left text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                  </label>

                  <Controller
                    control={control}
                    name="title"
                    rules={{ required: "Title is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter title"
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

                {/* INVITE TYPE */}
                <div className="w-full">
                  <label className="mb-1 block text-left text-sm font-medium">
                    Invite via <span className="text-red-500">*</span>
                  </label>

                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: "Please select an option" }}
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-5">
                        <Radio
                          label="Email"
                          name="type"
                          checked={field.value === "email"}
                          onChange={() => {
                            field.onChange("email");
                            // setValue("phone", "");
                          }}
                        />

                        <Radio
                          label="SMS"
                          name="type"
                          checked={field.value === "sms"}
                          onChange={() => {
                            field.onChange("sms");
                            // setValue("email", "");
                          }}
                        />

                        <Radio
                          label="Both"
                          name="type"
                          checked={field.value === "both"}
                          onChange={() => {
                            field.onChange("both");
                            // setValue("phone", "");
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

                {/* EMAIL FIELD */}
                {selectedType === "email" && (
                  <div className="w-full">
                    <label className="mb-1 block text-left text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>

                    <Controller
                      control={control}
                      name="email"
                      rules={{
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email address",
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="email"
                          placeholder="user@example.com"
                          invalid={errors.email}
                        />
                      )}
                    />

                    {errors.email && (
                      <span className="text-sm text-red-500">
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                )}

                {/* PHONE FIELD */}
                {selectedType === "sms" && (
                  <div className="w-full">
                    <label className="mb-1 block text-left text-sm font-medium">
                      Phone Number <span className="text-red-500">*</span>
                    </label>

                    <Controller
                      control={control}
                      name="phone"
                      rules={{
                        required: "Phone number is required",
                        // pattern: {
                        //   value: /^[0-9]{10}$/,
                        //   message: "Phone number must be exactly 10 digits",
                        // },
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          //   placeholder="+1 555 987 6543"
                          invalid={errors.phone}
                        />
                      )}
                    />

                    {errors.phone && (
                      <span className="text-sm text-red-500">
                        {errors.phone.message}
                      </span>
                    )}
                  </div>
                )}

                {selectedType === "both" && (
                  <>
                  <div className="w-full">
                    <label className="mb-1 block text-left text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>

                    <Controller
                      control={control}
                      name="email"
                      rules={{
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email address",
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="email"
                          placeholder="user@example.com"
                          invalid={errors.email}
                        />
                      )}
                    />

                    {errors.email && (
                      <span className="text-sm text-red-500">
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                  <div className="w-full">
                  <label className="mb-1 block text-left text-sm font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </label>

                  <Controller
                    control={control}
                    name="phone"
                    rules={{
                      required: "Phone number is required",
                      // pattern: {
                      //   value: /^[0-9]{10}$/,
                      //   message: "Phone number must be exactly 10 digits",
                      // },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        //   placeholder="+1 555 987 6543"
                        invalid={errors.phone}
                      />
                    )}
                  />

                  {errors.phone && (
                    <span className="text-sm text-red-500">
                      {errors.phone.message}
                    </span>
                  )}
                </div>
                </>
                )}

                {/* BUTTONS */}
                <div className="mt-6 w-full pt-4 text-center">
                  <Button
                    color="primary"
                    style={{ backgroundColor: "var(--atoll)" }}
                    type="submit"
                    className="mr-4 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading && <Spinner className="me-1 h-3 w-3" />}
                    Invite
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

export default InviteModal;
