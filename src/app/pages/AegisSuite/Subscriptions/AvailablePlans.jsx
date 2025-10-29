import { useState, useEffect, Fragment } from 'react';
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  DialogTitle
} from "@headlessui/react";
import { subscriptionService, apiUtils } from 'utils/apiService';
import { Button, Card, Spinner,Pagination, PaginationItems, PaginationNext, PaginationPrevious } from 'components/ui';
import { useDisclosure } from "hooks";
import PurchaseLeads from './PurchaseLeads';
import { XMarkIcon } from "@heroicons/react/24/solid";
import { XCircleIcon } from '@heroicons/react/24/outline';

const AvailablePlans = ({ subscription }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('')
  const [isOpen, { open, close }] = useDisclosure(false);
  const [isAlertOpen, { open: alertOpen, close: alertClose }] = useDisclosure(false);
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  // console.log(subscription, 'subscription')
  const selectPlan = (plan) => {
    if (subscription && subscription?.status === 'active') {
      alertOpen()
    } else {
      setSelectedPlan(plan)
      open()
    }
  }
  const fetchPlans = async (page, per_page) => {
    try {
      setLoading(true);
      const response = await subscriptionService.getAvailablePlans(page, per_page);
      console.log(response)
      setPlans(response?.data?.data);
      setPagination(response?.data?.pagination)
    } catch (err) {
      setError(apiUtils.formatError(err));
    } finally {
      setLoading(false);
    }
  };
  
  const handlePage = (val) => {
    setCurrentPage(val)
    fetchPlans(val, 20)
  }

  useEffect(() => {
    fetchPlans(1, 20);
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Available Plans</h2>

      {loading && <Spinner />}

      {error && <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans && plans.length > 0 ? plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
            <div className="p-6 flex-grow">
              <h3 className="text-xl font-semibold text-[#031746] dark:text-[#4d7cff]" >{plan.title}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.unit_price}</span>
                <span className="text-gray-500">/{plan.quantity}</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-dark-800" style={{ backgroundColor: '#0a2463', color: '#fff' }}>
              <Button variant="solid" color="primary" className="w-full" onClick={() => selectPlan(plan)}>
                Subscribe
              </Button>
            </div>
          </Card>
        )) : <div className="text-gray-500 mt-2">No plans found</div>}
      </div>

      <div className="flex justify-center items-center mt-6">
        {
          pagination && <div className="max-w-xl">
            <Pagination total={Math.ceil((pagination.total / 20))} value={currentPage} onChange={(val) => handlePage(val)}>
              <PaginationPrevious />
              <PaginationItems />
              <PaginationNext />
            </Pagination>
          </div>
        }

      </div>
      {/*.......................... Subscription Modal .......................*/}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          onClose={close}
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
            <DialogPanel className=" scrollbar-sm relative flex w-full overflow-y-auto max-w-xxl origin-top flex-col overflow-hidden rounded-lg bg-[#000000] dark:bg-[#000000] transition-all duration-300 ">
              <div className="flex justify-end">
                <span onClick={close} className='cursor-pointer'>
                  <XMarkIcon className="size-7" stroke='#fff'/>
                </span>
              </div>
              <PurchaseLeads selectedPlan={selectedPlan} plans={plans}/>
            </DialogPanel>
          </TransitionChild>

        </Dialog>
      </Transition>
      {/*.......................... Alert Modal .............................*/}
      <Transition appear show={isAlertOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          onClose={alertClose}
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
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/40" />
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
            <DialogPanel className="scrollbar-sm relative flex max-w-md flex-col overflow-y-auto rounded-lg bg-white dark:bg-gray-800 px-4 py-10 text-center transition-opacity duration-300 dark:bg-dark-700 sm:px-5">
              <XCircleIcon className="mx-auto inline size-28 shrink-0 text-error" />

              <div className="mt-4">
                <DialogTitle
                  as="h3"
                  className="text-2xl text-gray-800 dark:text-dark-100"
                >
                  Active Subscription Detected
                </DialogTitle>

                <p className="mt-2">
                  You currently have an active subscription. Please cancel your existing plan before proceeding with the purchase of a new one.
                </p>
                <Button onClick={alertClose} color="success" className="mt-6">
                  Close
                </Button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </div>
  );
};

export default AvailablePlans; 