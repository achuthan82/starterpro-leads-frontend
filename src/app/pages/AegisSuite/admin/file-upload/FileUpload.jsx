import { Button, Card, GhostSpinner, Input } from "components/ui";
import Select from "react-select";
import { useDropzone } from "react-dropzone";
import { useDisclosure } from "hooks";
import SharedSidebar from "../../components/SharedSidebar";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { useState, Fragment, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import RoleGuard from "middleware/RoleGuard";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import leadUploadService from "utils/leadUploadService";
import { getReactSelectDarkModeStyles } from "utils/reactSelectDarkMode";
const FileUpload = () => {
  const { handleSubmit } = useForm({});
  const DB_HEADERS = [
    "MORTGAGE_ID",
    "FULL_NAME",
    "FIRST",
    "LAST",
    "ADDRESS",
    "CITY",
    "STATE",
    "ZIP",
    "LOAN_DATE",
    "LOAN_TYPE",
    "LOAN_AMOUNT",
    "AGENT_NAME",
    "AGENT_ID",
    "LENDER_NAME",
  ];
  const [files, setFiles] = useState([]);
  const [type, setType] = useState("");
  const [campaign, setCampaign] = useState("");
  const [isOpen, { open, close }] = useDisclosure(false);
  const [CSVHeaders, setCSVHeaders] = useState([]);
  const [templates, setTemplates] = useState([{ value: "new", label: "New" }]);
  const [template, setTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editFlag, setEditFlag] = useState(false);
  const [headers, setHeaders] = useState([
    { MORTGAGE_ID: "" },
    { FIRST: "" },
    { LAST: "" },
    { FULL_NAME: "" },
    { ADDRESS: "" },
    { CITY: "" },
    { STATE: "" },
    { ZIP: "" },
    { LENDER_NAME: "" },
    { AGENT_NAME: "" },
    { AGENT_ID: "" },
    { LOAN_DATE: "" },
    { LOAN_TYPE: "" },
    { LOAN_AMOUNT: "" },
  ]);
  const [templateData, setTemplateData] = useState([]);
  const [templateId, setTemplateId] = useState(null);
  console.log(templateId);
  const types = [
    {
      value: 1,
      label: "New MTG",
      category_id: 1,
    },
  ];
  console.log(templateName, setTemplates);
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: ".csv",
    onDrop: (acceptedFiles) => {
      console.log("acceptedFiles", acceptedFiles[0].type);
      setFiles([...files, ...acceptedFiles.map((file) => Object.assign(file))]);
      if (acceptedFiles[0].type === "text/csv") {
        console.log("entered..");
        const arr = [];
        const reader = new FileReader();
        reader.onload = function (e) {
          const data = e.currentTarget.result;
          const header = data.split(/[\r\n]+/)[0];
          const headers = header.split(",");

          headers.map((element) => {
            const clean = element.replace(/^"(.*)"$/, "$1").trim();
            if (clean)
              arr.push({ value: clean, label: clean, selected: false });
          });
          console.log("arr", arr);
          setCSVHeaders(arr);
          open();
          fetchTemplates();
        };
        reader.readAsText(acceptedFiles[0]);
      } else {
        toast.error("Invalid File format");
      }
    },
  });
  const handleType = (selectedOption) => {
    if (selectedOption) {
      setType(selectedOption.value);
    } else {
      setType("");
    }
  };
  const templateHandler = (e) => {
    console.log(e);
    console.log(CSVHeaders);
    const csv_headers = [...CSVHeaders];
    csv_headers.map((el, i) => {
      csv_headers[i].selected = false;
    });
    console.log(csv_headers);
    // setTemplateData([])
    if (e.value === "new") {
      setTemplate(false);
      setNewTemplate(true);
      setTemplateName("");
    } else {
      setNewTemplate(false);
      setTemplate(true);
      setTemplateData(e.template_data);
      setHeaders(e.template_data);
      setTemplateId(e.value);
    }
  };
  const handleHeaders = (e, element) => {
    if (template) {
      console.log("entered..", templateData);
      const index_template = templateData.findIndex(
        (tempData) => Object.keys(tempData)[0] === element,
      );
      const copyTempData = [...templateData];
      copyTempData[index_template][`${element}`] = e.value;
      copyTempData[index_template]["selected"] = false;
      setTemplateData(copyTempData);

      const csv_headers = [...CSVHeaders];
      const index = csv_headers.findIndex((header) => header.value === e.value);
      const values = [...headers];
      console.log(values);

      const header_index = values.findIndex(
        (el) => Object.keys(el)[0] === element,
      );
      const headerValues = [];

      /*** Check if already selected */
      if (values[header_index][`${element}`] !== "") {
        console.log(values[header_index][`${element}`]);
        console.log(csv_headers);
        const index_old = csv_headers.findIndex(
          (header) => header.value === values[header_index][`${element}`],
        );
        console.log(index_old);
        if (index_old > -1) csv_headers[index_old].selected = false;
      }

      values[header_index][`${element}`] = e.value;
      /**** get all selected values */
      values.forEach((el) => {
        // console.log(Object.values(el)[0])
        if (Object.values(el)[0]) headerValues.push(Object.values(el)[0]);
      });
      setHeaders(values);

      /****Set selected false (disable selected header fields) */
      csv_headers.map((el, i) => {
        if (csv_headers[index].value === el.value) {
          csv_headers[index].selected = true;
        } else {
          if (headerValues.length > 0) {
            for (let t = 0; t < headerValues.length; t++) {
              if (el.value === headerValues[t]) {
                csv_headers[i].selected = true;
              }
              // else {
              //   csv_headers[i].selected = false
              // }
            }
          }
        }
      });
      console.log(templateData);
      setCSVHeaders(csv_headers);
    } else {
      const csv_headers = [...CSVHeaders];
      const index = csv_headers.findIndex((header) => header.value === e.value);
      const values = [...headers];
      console.log(values);
      const header_index = values.findIndex(
        (el) => Object.keys(el)[0] === element,
      );
      const headerValues = [];

      /*** Check if already selected */
      if (values[header_index][`${element}`] !== "") {
        console.log(values[header_index][`${element}`]);
        console.log(csv_headers);
        const index_old = csv_headers.findIndex(
          (header) => header.value === values[header_index][`${element}`],
        );
        console.log(index_old);
        if (index_old > -1) csv_headers[index_old].selected = false;
      }

      values[header_index][`${element}`] = e.value;
      /**** get all selected values */
      values.forEach((el) => {
        // console.log(Object.values(el)[0])
        if (Object.values(el)[0]) headerValues.push(Object.values(el)[0]);
      });
      setHeaders(values);

      /****Set selected false (disable selected header fields) */
      csv_headers.map((el, i) => {
        if (csv_headers[index].value === el.value) {
          csv_headers[index].selected = true;
        } else {
          if (headerValues.length > 0) {
            for (let t = 0; t < headerValues.length; t++) {
              if (el.value === headerValues[t]) {
                csv_headers[i].selected = true;
              }
              // else {
              //   csv_headers[i].selected = false
              // }
            }
          }
        }
      });
      console.log(templateData);
      setCSVHeaders(csv_headers);
    }
  };
  const uploadData = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", files[0]);
    if (campaign) {
      formData.append("campaign", campaign);
    }
    const headersObject = headers.reduce((acc, obj) => {
      const key = Object.keys(obj)[0];
      acc[key] = obj[key];
      return acc;
    }, {});
    formData.append("csv_headers", JSON.stringify(headersObject));

    leadUploadService
      .uploadLeads(type, formData)
      .then((response) => {
        if (response.data.status === 200) {
          toast.success("Successfully uploaded");
          setTemplates([]);
          setLoading(false);
          close();
          setFiles([]);
          setCSVHeaders([]);
          // setTemplates([{value: 'new', label: 'NEW'}])
          setTemplateData([]);
          setTemplate(false);
          setTemplateName("");
          // setTempName('')
          setEditFlag(false);
          // setTemplateId('')
          setNewTemplate(false);
        }
      })
      .catch(() => {
        toast.error("An error occured..please try again later");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const submitData = () => {
    let validationArr = [...headers];
    console.log("validation-arr", validationArr);
    validationArr = validationArr.filter(
      (elem) => elem["FULL_NAME"] !== "" && elem["AGENT_ID"] !== "",
    );
    const validation = validationArr.every(
      (item) => Object.values(item)[0] !== "",
    );
    if (validation) {
      if (!newTemplate && !editFlag) {
        uploadData();
      } else {
        console.log(newTemplate, templateName);
        setLoading(true);

        if ((newTemplate && templateName !== "") || editFlag) {
          let apicall;
          if (newTemplate) {
            apicall = leadUploadService.addTemplate({
              name: newTemplate ? templateName : "",
              data: [...validationArr],
              category: 1,
              source: type,
            });
          } else {
            apicall = leadUploadService.updateTemplate(
              {
                // name: newTemplate ? templateName : "",
                data: [...validationArr],
                category: 1,
                source: type,
              },
              templateId,
            );
          }

          apicall
            .then((response) => {
              console.log("enter-response");
              console.log(response);
              if (response.data.status === 200) {
                uploadData();
              } else {
                setLoading(false);
                toast.error("Error on adding template");
              }
            })
            .catch(() => {
              setLoading(false);
              toast.error("Error on adding template");
            });
        } else {
          toast.error("Name is Required");
        }
      }
    } else {
      toast.error("Please select all mandatory fields");
    }
  };
  const fetchTemplates = () => {
    const temp_arr = [{ value: "new", label: "NEW" }];
    leadUploadService
      .getTemplate()
      .then((response) => {
        if (response.data.status === 200) {
          response.data.data.map((element) => {
            temp_arr.push({
              value: element.id,
              label: element.name,
              template_data: element.data,
            });
          });
          setTemplates(temp_arr);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };
  const handleClose = () => {
    setTemplates([]);
    setLoading(false);
    close();
    setFiles([]);
    setCSVHeaders([]);
    // setTemplates([{value: 'new', label: 'NEW'}])
    setTemplateData([]);
    setTemplate(false);
    setTemplateName("");
    // setTempName('')
    setEditFlag(false);
    // setTemplateId('')
    setNewTemplate(false);
  };
  useEffect(() => {
    if (!templateData || !CSVHeaders.length) return;
    templateData.map((element) => {
      const index = CSVHeaders.findIndex(
        (header) => header.value === Object.values(element)[0],
      );
      if (index < 0) {
        setEditFlag(true);
      }
    });
  }, [templateData, CSVHeaders]);
  return (
    <RoleGuard allowedRoles="admin">
      <div>
        <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
          <SharedSidebar currentPath="admin/file-upload" />
          <div className="flex flex-1 flex-col overflow-hidden">
            <header className="border-b border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">
                    Upload Leads
                  </h1>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Upload New Leads
                  </p>
                </div>
              </div>
            </header>
            <div className="mt-4 p-4">
              <Card className="bg-white p-3 dark:bg-gray-800">
                <div className="border-b border-neutral-400 py-2">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {" "}
                    Upload Lead Data With Mortgage
                  </h4>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <Input
                    className="w-full rounded-md border border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#0a2463] focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    placeholder="Enter Campaign Id"
                    onChange={(event) => setCampaign(event.target.value)}
                  />
                  <Select
                    id="country"
                    placeholder="Choose Type"
                    isClearable={false}
                    styles={getReactSelectDarkModeStyles()}
                    //   className="react-select customised-select me-1"
                    classNamePrefix="select"
                    menuPlacement="top"
                    //   theme={selectThemeColors}
                    options={types}
                    onChange={handleType}
                  />
                </div>
                <div className="mt-4" style={{ position: "relative" }}>
                  {(!campaign || !type) && (
                    <div
                      className="overlay bg-[rgba(255,255,255,0.75)] dark:bg-[rgba(10,36,99,0.6)]"
                      style={{
                        position: "absolute",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        // background: "rgba(255,255,255,0.75)",
                        zIndex: "3",
                      }}
                    ></div>
                  )}
                  <div {...getRootProps({ className: "dropzone" })}>
                    <input {...getInputProps()} />
                    <div
                      className="flex flex-col items-center justify-center"
                      style={{ border: "1px dashed", padding: "4rem" }}
                    >
                      <CloudArrowUpIcon className="size-30" />
                      <h5>Drop Files here or click to upload</h5>
                      <p className="text-secondary">
                        Drop files here or click{" "}
                        <a href="/" onClick={(e) => e.preventDefault()}>
                          browse
                        </a>{" "}
                        thorough your machine
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            <Transition appear show={isOpen} as={Fragment}>
              <Dialog
                as="div"
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
                onClose={handleClose}
              >
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute inset-0 bg-gray-900/50 transition-opacity dark:bg-black/40" />
                </TransitionChild>
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <DialogPanel className="scrollbar-sm max-w-xxl dark:bg-dark-700 relative flex w-full origin-top flex-col overflow-hidden overflow-y-auto rounded-lg bg-white transition-all duration-300 dark:bg-gray-800">
                    <div className="flex justify-end">
                      <span onClick={close} className="cursor-pointer">
                        <XMarkIcon className="size-7" />
                      </span>
                    </div>
                    <div className="mt-4 text-center">
                      <DialogTitle
                        as="h3"
                        className="dark:text-dark-100 text-2xl text-gray-800"
                      >
                        Upload New Lead
                      </DialogTitle>
                    </div>
                    <form onSubmit={handleSubmit(submitData)} className="p-6">
                      <div className="mt-3 grid w-full gap-4">
                        {/* Template selection */}
                        <div className="col-span-12">
                          <div className="grid grid-cols-12 items-center gap-2">
                            <div className="col-span-4">
                              <label className="mb-1 block text-left text-sm font-medium">
                                Select Template{" "}
                                <span className="text-red-500">*</span>
                              </label>
                            </div>
                            <div className="col-span-8">
                              <Select
                                className="react-select w-full"
                                classNamePrefix="select"
                                name="template"
                                options={templates}
                                onChange={(e) => templateHandler(e)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* New template input */}
                        {newTemplate && (
                          <div className="col-span-12">
                            <div className="grid grid-cols-12 items-center gap-2">
                              <div className="col-span-4">
                                <label
                                  className="mb-1 block text-left text-sm font-medium"
                                  htmlFor="name"
                                >
                                  Template Name
                                </label>
                              </div>
                              <div className="col-span-8">
                                <Input
                                  id="name"
                                  name="name"
                                  placeholder="Template 1"
                                  onChange={(e) =>
                                    setTemplateName(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="mt-4 text-lg font-semibold">
                          Table Headings
                        </p>
                      </div>
                      {/* DB Headers mapping */}
                      <div className="mt-4 grid w-full gap-4">
                        {!template &&
                          DB_HEADERS.map((element, idx) => (
                            <div key={idx} className="col-span-12">
                              <div className="grid grid-cols-12 items-center gap-2">
                                <div className="col-span-4">
                                  <label className="mb-1 block text-left text-sm font-medium">
                                    {element}
                                  </label>
                                </div>
                                <div className="col-span-8">
                                  <Select
                                    className="react-select w-full"
                                    classNamePrefix="select"
                                    name={element}
                                    options={CSVHeaders}
                                    onChange={(e) => handleHeaders(e, element)}
                                    isOptionDisabled={(option) =>
                                      option.selected
                                    }
                                  />
                                </div>
                              </div>
                              <hr className="hr-bottom mt-2" />
                            </div>
                          ))}
                        {template &&
                          templateData.map((element, idx) => {
                            const index = CSVHeaders.findIndex(
                              (header) =>
                                header.value === Object.values(element)[0],
                            );
                            return (
                              <div key={idx} className="col-span-12">
                                <div className="grid grid-cols-12 items-center gap-2">
                                  <div className="col-span-4">
                                    <label className="mb-1 block text-left text-sm font-medium">
                                      {Object.keys(element)[0]}
                                    </label>
                                  </div>

                                  <div className="col-span-8">
                                    <Select
                                      className="react-select"
                                      classNamePrefix="select"
                                      name={Object.keys(element)[0]}
                                      value={
                                        index > -1 ? CSVHeaders[index] : ""
                                      }
                                      options={CSVHeaders}
                                      onChange={(e) =>
                                        handleHeaders(
                                          e,
                                          Object.keys(element)[0],
                                        )
                                      }
                                      isOptionDisabled={(option) =>
                                        option.selected
                                      }
                                    />
                                  </div>
                                </div>
                                <hr className="hr-bottom" />
                              </div>
                            );
                          })}
                      </div>
                      <div className="mt-4 flex justify-center gap-4">
                        <Button
                          type="submit"
                          className="mr-1"
                          color="primary"
                          disabled={loading}
                        >
                          {loading && (
                            <GhostSpinner className="size-4 border-2" />
                          )}{" "}
                          Submit
                        </Button>
                        <Button
                          type="reset"
                          color="secondary"
                          outline
                          onClick={() => {
                            close()
                            // clearAll()
                          }}
                        >
                          Discard
                        </Button>
                      </div>
                    </form>
                  </DialogPanel>
                </TransitionChild>
              </Dialog>
            </Transition>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default FileUpload;
