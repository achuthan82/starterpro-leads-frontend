import { Fragment, useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import SlideDown from "react-slidedown";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { Button, Spinner, Input, Checkbox } from "components/ui";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import adminService from "utils/adminService";
import { getReactSelectDarkModeStyles } from "utils/reactSelectDarkMode";

const UserModal = ({
  isOpen,
  close,
  fetchUsers,
  editData,
  setEditData,
  setCurrentPage,
}) => {
  const [inputFields, setInputFields] = useState([
    { id: "", auto_generate: false, source: "" },
  ]);

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  console.log("currentUser", currentUser);

  const types_ = {
    1: "NEW MTG",
    // 2: "RETRO MTG",
    // 3: "FEX",
  };

  const roleOptions = [
    { label: "Admin", value: 1 },
    { label: "Agent", value: 2 },
  ];

  const agencyOptions1 = [
    { label: "StarterPro", value: 'StarterPro' },
    { label: "YS Financials", value: 'YS Financials' },
  ]

  const agencyOptions2 = [
    { label: "YS Financials", value: 'YS Financials' },
  ]

  const [loading, setLoading] = useState(false);

  const types = [
    {
      value: 1,
      label: "NEW MTG",
      category_id: 1,
      isDisabled: inputFields.some((u) => u.source === 1),
    },
    // { value: 2, label: "RETRO MTG", category_id: 1, isDisabled: inputFields.some((u) => u.source === 2) },
    // { value: 3, label: "FEX", category_id: 1, isDisabled: inputFields.some((u) => u.source === 3)},
  ];
  const increaseCount = () => {
    const values = inputFields.map((item, index) => {
      return { ...item, identificator: index };
    });
    console.log("values", values);
    values.push({
      id: "",
      auto_generate: false,
      source: "",
      identificator:
        values.length > 0 ? values[values.length - 1].identificator + 1 : 0,
    });
    console.log("values", values);
    setInputFields(values);
  };

  //Delete repeater form
  const deleteForm = (e, i) => {
    console.log("TEST", e, i);
    e.preventDefault();
    const values = [...inputFields];
    values.splice(i, 1);
    console.log(i, values);
    setInputFields(values);
    // e.target.closest('form').remove()
  };

  const handleInputField = (index, val) => {
    console.log(val);
    // setDisabledItem(val.value)
    const values = [...inputFields];
    values[index].source = val.value;
    values[index].category = val.category_id;
    console.log(values);
    setInputFields(values);
  };

  const handleCheckBox = (index, val) => {
    console.log(val.target.checked);
    const values = [...inputFields];
    values[index].auto_generate = val.target.checked;
    console.log(values);
    setInputFields(values);
  };

  const handleInputFieldValue = (index, val) => {
    console.log(val.target.value);
    const values = [...inputFields];
    values[index].id = val.target.value;
    console.log(values);
    setInputFields(values);
  };

  const submitData = (data) => {
    setLoading(true);
    const human = [];
    const auto = [];
    const edit_agents = [];
    const remove_agents = [];

    if (editData === null) {
      inputFields.forEach((element) => {
        if (element.source !== "") {
          if (element.auto_generate) {
            auto.push({
              id: null,
              source: element.source,
              category: element.category,
            });
          } else {
            human.push({
              id: element.id,
              source: element.source,
              category: element.category,
            });
          }
        }
      });
    } else {
      inputFields.forEach((element) => {
        if (element.source !== "") {
          console.log(editData.agents.some((el) => el.id === element.id));
          if (editData.agents.some((el) => el.id === element.id)) {
            edit_agents.push({
              id: element.id,
              source: element.source,
              category: element.category,
            });
          } else {
            if (element.auto_generate) {
              auto.push({
                id: null,
                source: element.source,
                category: element.category,
              });
            } else {
              human.push({
                id: element.id,
                source: element.source,
                category: element.category,
              });
            }
          }
        }
      });
      editData.agents.forEach((element) => {
        if (!inputFields.some((el) => el.id === element.id)) {
          remove_agents.push(element.id);
        }
      });
    }
    const d = {
      email: data.email,
      name: data.name,
      // phone: data.phone,
      role_id: parseInt(data.user_role.value),
      agents: {
        human,
        auto,
      },
    };
    if (data.phone) {
      d["phone"] = data.phone;
    }
    if (data?.agency_name) {
      d["agency_name"] = data?.agency_name.value;
    }
    if (data?.npn_number) {
      d["npn"] = data?.npn_number;
    }
    if (editData !== null) {
      d["edit_agents"] = edit_agents;
      d["remove_agents"] = remove_agents;
    }
    let val = false;
    for (const element of inputFields) {
      if (element.id === "") {
        if (element.auto_generate === false) {
          val = true;
        }
      }
    }
    if (inputFields.length === 0) {
      val = true;
    }
    if (val === false) {
      if (!editData) {
        adminService
          .inviteUser(d)
          .then((response) => {
            if (response.status === 200) {
              close();
              closeModal();
              fetchUsers();
              setCurrentPage(0);
              toast.success("Success!");
            } else {
              toast.error(
                response.message ? response.message : "Something went wrong",
              );
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        adminService
          .editUser(editData.id, d)
          .then((response) => {
            if (response.status === 200) {
              close();
              closeModal();
              fetchUsers();
              setCurrentPage(0);
              toast.success("User Details Updated !");
            } else {
              toast.error(
                response.message ? response.message : "Something went wrong",
              );
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      setLoading(false);
      toast.error("User can not be created without an Agent Id");
    }
  };
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    mode: "onChange",
  });
  const closeModal = () => {
    reset();
    // setError(null)
    setEditData(null);
    setValue("name", "");
    setValue("email", "");
    setValue("phone", "");
    setValue("npn_number", "");
    setValue("user_role", "");
    setValue("agency_name", "");
    setInputFields([{ id: "", auto_generate: false, source: "" }]);
  };
  useEffect(() => {
    if (editData !== null) {
      if (editData.agents.length > 0) {
        const inputData = editData.agents.map((item, index) => {
          return {
            id: item.id,
            auto_generate: false,
            source: item.source,
            category: item.category,
            identificator: index + 1,
          };
        });
        setInputFields(inputData);
      } else setInputFields([]);
      const role_id = roleOptions.findIndex(
        (item) => item.value === editData.role_id,
      );
      setValue("name", editData.name);
      if (editData.npn) setValue("npn_number", editData.npn);
      setValue("phone", editData.phone);
      setValue("email", editData.email);
      if (editData?.agency_name) setValue("agency_name", agencyOptions1.find(item => item.value === editData?.agency_name));
      setValue("user_role", roleOptions[role_id]);
    } else {
      console.log("errors", errors);
      // setError(null)
      setValue("name", "");
      setValue("phone", "");
      setValue("npn_number", "");
      setValue("email", "");
      setValue("user_role", "");
      setValue("agency_name", "");
      setInputFields([{ id: "", auto_generate: false, source: "" }]);
    }
  }, [editData]);
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
        onClose={() => {
          close();
          editData !== null && closeModal();
        }}
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
          <DialogPanel className="dark:bg-dark-700 relative w-full max-w-[800px] rounded-2xl bg-white px-6 py-8 text-center shadow-xl transition-all sm:px-8">
            <DialogTitle
              as="h3"
              className="text-2xl font-semibold text-gray-800 dark:text-gray-100"
            >
              {editData !== null ? "Edit User" : "Add New User"}
            </DialogTitle>
            <form onSubmit={handleSubmit(submitData)}>
              <div className="grid gap-y-3 pt-3">
                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="first_name"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="name"
                    rules={{ required: "Name is mandatory" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        innerRef={field.ref}
                        autoFocus
                        type="text"
                        id="name"
                        placeholder="Name"
                        className="w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                        invalid={errors.name}
                        onChange={(event) => {
                          field.onChange(event);
                        }}
                      />
                    )}
                  />
                  {errors.name && (
                    <span className="text-red-500">{errors.name.message}</span>
                  )}
                </div>

                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="agency_name"
                  >
                    Agency Name <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="agency_name"
                    rules={{ required: "Agency name is required" }}
                    render={({ field }) => (
                      <Select
                        options={currentUser.agency_name === 'StarterPro' ? agencyOptions1 : agencyOptions2}
                        {...field}
                        innerRef={field.ref}
                        autoFocus
                        styles={getReactSelectDarkModeStyles()}
                        invalid={errors.agency_name}
                        onChange={(event) => {
                          field.onChange(event);
                        }}
                      />
                    )}
                  />
                  {errors.agency_name && (
                    <span className="text-red-500">
                      {errors.agency_name.message}
                    </span>
                  )}
                </div>
                {editData !== null && editData.npn !== null && (
                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="npn_number"
                  >
                    NPN Number
                  </label>
                  <Controller
                    control={control}
                    name="npn_number"
                    render={({ field }) => (
                      <Input
                        {...field}
                        innerRef={field.ref}
                        autoFocus
                        type="text"
                        id="npn_number"
                        placeholder="NPN Number"
                        invalid={errors.npn_number}
                        className="w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                        onChange={(event) => {
                          field.onChange(event);
                        }}
                      />
                    )}
                  />
                  {errors.npn_number && (
                    <span className="text-red-500">
                      {errors.npn_number.message}
                    </span>
                  )}
                </div>
                )}

                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="email"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    id="email"
                    name="email"
                    control={control}
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /.+\..+/,
                        message: "Invalid Email",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        autoFocus
                        innerRef={field.ref}
                        type="email"
                        className="w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                        placeholder="john@example.com"
                        invalid={errors.email && true}
                        disabled={editData !== null}
                        {...field}
                      />
                    )}
                  />
                  {errors.email && (
                    <span className="text-red-500">{errors.email.message}</span>
                  )}
                </div>

                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="phone"
                  >
                    Phone
                  </label>
                  <Controller
                    control={control}
                    name="phone"
                    rules={{ required: false, minLength: 10, maxLength: 10 }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        innerRef={field.ref}
                        autoFocus
                        type="number"
                        id="phone"
                        placeholder="1223123099"
                        className="w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                        invalid={errors.phone}
                        onChange={(event) => {
                          field.onChange(event);
                        }}
                      />
                    )}
                  />
                  {errors.phone && errors.phone.type === "required" && (
                    <span className="text-red-500">Phone is required</span>
                  )}
                  {(errors.phone?.type === "minLength" ||
                    errors.phone?.type === "maxLength") && (
                    <span className="text-red-500">
                      Please enter a valid phone number
                    </span>
                  )}
                </div>

                <div className="w-full">
                  <label
                    className="mb-1 block text-left text-sm font-medium"
                    htmlFor="user_role"
                  >
                    Role <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="user_role"
                    rules={{ required: "Role is required" }}
                    render={({ field }) => (
                      <>
                        <Select
                          {...field}
                          autoFocus
                          options={roleOptions}
                          id="user_role"
                          invalid={errors.user_role}
                          styles={getReactSelectDarkModeStyles()}
                          onChange={(event) => {
                            field.onChange(event);
                          }}
                        />
                        {errors.user_role && (
                          <p className="text-red-500">
                            {errors.user_role.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                <SlideDown className="w-full">
                  {inputFields.map((e, i) => (
                    <div className="w-full" key={`${i}-${e.identificator}`}>
                      <div className="grid grid-cols-12 items-center gap-4">
                        <div className="col-span-12 items-start text-left md:col-span-4">
                          <label
                            className="mb-1 block text-left text-sm font-medium"
                            htmlFor="inventory"
                          >
                            Type <span className="text-red-500">*</span>
                          </label>
                          <Select
                            isClearable={false}
                            id={`key-${i}`}
                            className="react-select"
                            classNamePrefix="select"
                            options={types}
                            styles={getReactSelectDarkModeStyles()}
                            defaultValue={{
                              value: inputFields[i].source,
                              label: types_[inputFields[i].source],
                            }}
                            onChange={(val) => handleInputField(i, val)}
                          />
                        </div>

                        <div className="col-span-12 md:col-span-2">
                          <label
                            className="mb-1 block text-sm font-medium"
                            htmlFor={`agentId-${i}`}
                          >
                            Auto Generate
                          </label>
                          <Checkbox
                            className={`customCheck ${(inputFields[i].source === "" || inputFields[i].id !== "") && "customColor"}`}
                            style={{ width: "36px", height: "36px" }}
                            type="checkbox"
                            id={`agentId-${i}-${e.identificator}`}
                            disabled={
                              inputFields[i].source === "" ||
                              inputFields[i].id !== ""
                            }
                            checked={inputFields[i].auto_generate}
                            onChange={(val) => handleCheckBox(i, val)}
                          />
                        </div>

                        <div className="col-span-12 md:col-span-4">
                          <label
                            className="mb-1 block text-left text-sm font-medium"
                            htmlFor={`value-${i}`}
                          >
                            Agent Id
                          </label>
                          <Input
                            type="number"
                            name="value"
                            value={inputFields[i].id}
                            onChange={(val) => handleInputFieldValue(i, val)}
                            className="w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                            disabled={
                              inputFields[i].auto_generate ||
                              inputFields[i].source === ""
                            }
                          />
                        </div>

                        <div className="col-span-12 md:col-span-2">
                          <button
                            type="button"
                            className="mt-6 w-full rounded border border-red-500 px-2 py-1 text-red-500"
                            onClick={(e) => deleteForm(e, i)}
                          >
                            <TrashIcon className="inline-block h-6 w-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </SlideDown>
                 
                 {
                  inputFields.length === 0 && <div className="mb-2">
                  <Button
                    // color='pri'
                    type="button"
                    style={{ backgroundColor: "var(--fern)" }}
                    className="flex items-center gap-2 rounded px-4 py-2 text-white hover:bg-blue-900"
                    onClick={increaseCount}
                  >
                    <PlusIcon className="h-6 w-6" />
                    <span className="hidden sm:inline-block">Add New Type</span>
                  </Button>
                </div>
                 }
                

                <div className="mt-4 w-full pt-4 text-center">
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
                    type="reset"
                    className="rounded border border-gray-400 px-6 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      close();
                      closeModal();
                    }}
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

export default UserModal;
