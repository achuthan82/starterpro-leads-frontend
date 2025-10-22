import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import { Button, Textarea,  GhostSpinner } from "components/ui";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import prospectService from "utils/prospectService";
import { toast } from "sonner";
import { useAuthContext } from "app/contexts/auth/context";

// import subscriptionService from "utils/subscriptionService";
const RejectModal = ({
  isOpen,
  close,
  selectedId,
  getProspectList,
  currentPage,
}) => {
  const { logout } = useAuthContext();
  console.log(logout);
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });
  const submitData = (data) => {
    setLoading(true);
    prospectService
      .handleAction(selectedId, "reject", data.reason)
      .then((response) => {
        if (response.data.status === 200) {
          getProspectList(currentPage);
          close();
          toast.success(response?.data?.message || "Success!");
        } else {
          toast.error(response?.data?.message || "Please try again later");
        }
      })
      .catch(() => {
        toast.error("Please try again later");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <>
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
            <DialogPanel className="dark:bg-dark-700 relative w-full max-w-lg rounded-2xl bg-white px-6 py-8 text-center shadow-xl transition-all sm:px-8">
              {/* Close Icon */}
              <div className="absolute top-4 right-4">
                <XCircleIcon
                  onClick={close}
                  className="text-error h-7 w-7 cursor-pointer transition-transform hover:scale-105"
                />
              </div>

              {/* Icon */}
              <div className="mb-4 flex justify-center">
                <XCircleIcon className="h-20 w-20 text-red-500" />
              </div>

              {/* Heading */}
              <DialogTitle
                as="h3"
                className="text-2xl font-semibold text-gray-800 dark:text-gray-100"
              >
                Are you Sure?
              </DialogTitle>
              <form onSubmit={handleSubmit(submitData)}>
                <Controller
                  name="reason"
                  control={control}
                  rules={{
                    required: false,
                  }}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Enter your reason here..."
                      rows={5}
                      className="dark:bg-dark-600 mt-6 w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-800 transition focus:ring-2 focus:ring-red-400 focus:outline-none dark:border-gray-600 dark:text-gray-100"
                    />
                  )}
                />
                {errors.reason && (
                  <span className="text-md mt-4 text-red-500">
                    Reason is required
                  </span>
                )}
                <span className="mt-2 font-medium text-neutral-500">
                  Note- The entered reason will be shared to the user via mail
                </span>
                {/* Cancel Button */}
                <Button
                  disabled={loading}
                  color="error"
                  type="submit"
                  className="mt-6 w-full rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600"
                >
                  {!loading ? "Reject" : <GhostSpinner/>}
                </Button>
              </form>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
};

export default RejectModal;
