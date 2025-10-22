import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import { Button, Spinner } from "components/ui";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import couponService from "utils/couponService";
import { toast } from "sonner";
import { useAuthContext } from "app/contexts/auth/context";

// import subscriptionService from "utils/subscriptionService";
const CancelModal = ({ isOpen, close, id, resetPage, setResetPage }) => {
  const { logout } = useAuthContext();
  console.log(logout);
  const [loading, setLoading] = useState(false);
  const { handleSubmit } = useForm({
    mode: "onChange",
  });
  const submitData = () => {
    setLoading(true);
    couponService
      .deleteCoupon(id)
      .then((response) => {
        if (response.data.status === 200) {
          setResetPage(!resetPage);
          close();
          toast.success(response?.data?.message || "Deleted Successfully");
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
                Are you sure?
              </DialogTitle>
              <form onSubmit={handleSubmit(submitData)}>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  The promocodes using this coupon will be disabled.
                </p>

                {/* Textarea */}
                {/* Cancel Button */}
                <Button
                  // onClick={close}
                  disabled={loading}
                  color="error"
                  type="submit"
                  className="mt-6 w-full rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600"
                >
                  {!loading ? "Delete" : <Spinner />}
                </Button>
              </form>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
};

export default CancelModal;
