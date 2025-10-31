import { useState, useEffect } from "react";
import { Card, Spinner } from "components/ui";
import SharedSidebar from "../components/SharedSidebar";
import { subscriptionService } from "utils/apiService";
import {
  CreditCardIcon,
  // CheckIcon,
  // XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { toast } from "sonner";
import { Fragment } from "react";

const SubscriptionPlans = () => {
  const randomColors = [
    "#0a2463",
    "#5ab453",
    "#92c933",
    "#FF2ECF",
    "#E000AD",
    "#FFA71A",
    "#FF4F1A",
    "#384766",
    "#506877",
    "#3D4E70",
    "#4A4A4F",
    "#6D7EA1",
    "#70838F",
    "#B8008C",
    "#FF75DF",
  ];
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    quantity: 1,
    unit_price: "",
    is_fresh_leads: "true",
    month: "",
    source: "1",
  });
  const [createErrors, setCreateErrors] = useState({});
  const [createLoading, setCreateLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    title: "",
    description: "",
    quantity: 1,
    unit_price: "",
    is_fresh_leads: "true",
    month: "",
    source: "1",
    category: 1,
  });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePlanId, setDeletePlanId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const sourceOptions = [{ value: 1, label: "NEW MTG" }];
  const categoryOptions = [{ value: 1, label: "Mailed Leads" }];
  const validateCreateForm = () => {
    const errors = {};
    if (!createForm.title.trim()) errors.title = "Title is required";
    if (!createForm.description.trim())
      errors.description = "Description is required";
    if (
      !createForm.quantity ||
      isNaN(createForm.quantity) ||
      Number(createForm.quantity) < 1
    )
      errors.quantity = "Quantity must be at least 1";
    if (!createForm.unit_price || isNaN(createForm.unit_price))
      errors.unit_price = "Unit price is required and must be a number";
    if (createForm.unit_price && Number(createForm.unit_price) < 0)
      errors.unit_price = "Unit price must be positive";
    // if (createForm.month === '') errors.month = 'Lead Type is required';
    if (!createForm.source) errors.source = "Source is required";
    if (!createForm.category) errors.category = "Category is required";

    return errors;
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatePlanSubmit = async (e) => {
    e.preventDefault();
    const errors = validateCreateForm();
    setCreateErrors(errors);
    console.log(errors);
    if (Object.keys(errors).length > 0) return;
    setCreateLoading(true);
    try {
      const payload = {
        category: 1,
        currency: "usd",
        description: createForm.description,
        is_fresh_leads: true,
        // is_fresh_leads: createForm.is_fresh_leads === 'true' || createForm.is_fresh_leads === true,
        // month: Number(createForm.month),
        quantity: Number(createForm.quantity),
        source: Number(createForm.source),
        title: createForm.title,
        unit_price: parseFloat(createForm.unit_price),
      };
      const response = await subscriptionService.createProductPricing(payload);
      if (
        response.data &&
        (response.data.success || response.data.status === 200)
      ) {
        toast.success(response.data.message || "Plan created successfully!");
        setShowCreateModal(false);
        setCreateForm({
          title: "",
          description: "",
          quantity: 1,
          unit_price: "",
          is_fresh_leads: "true",
          month: "",
          source: "1",
        });
        setCreateErrors({});
        fetchPlans();
      } else {
        toast.error(response.data.message || "Failed to create plan");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to create plan",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editForm.title.trim()) errors.title = "Title is required";
    if (!editForm.description.trim())
      errors.description = "Description is required";
    if (
      !editForm.quantity ||
      isNaN(editForm.quantity) ||
      Number(editForm.quantity) < 1
    )
      errors.quantity = "Quantity must be at least 1";
    if (!editForm.unit_price || isNaN(editForm.unit_price))
      errors.unit_price = "Unit price is required and must be a number";
    if (editForm.unit_price && Number(editForm.unit_price) < 0)
      errors.unit_price = "Unit price must be positive";
    // if (editForm.month === '') errors.month = 'Lead Type is required';
    if (!editForm.source) errors.source = "Source is required";
    if (!editForm.category) errors.category = "Category is required";

    return errors;
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditPlanSubmit = async (e) => {
    e.preventDefault();
    const errors = validateEditForm();
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setEditLoading(true);
    try {
      const payload = {
        category: 1,
        currency: "usd",
        description: editForm.description,
        is_fresh_leads:
          editForm.is_fresh_leads === "true" ||
          editForm.is_fresh_leads === true,
        month: Number(editForm.month),
        quantity: Number(editForm.quantity),
        source: Number(editForm.source),
        title: editForm.title,
        unit_price: parseFloat(editForm.unit_price),
      };
      const response = await subscriptionService.updateProductPricing(
        editForm.id,
        payload,
      );
      if (
        response.data &&
        (response.data.success || response.data.status === 200)
      ) {
        toast.success(response.data.message || "Plan updated successfully!");
        setShowEditModal(false);
        setEditForm({
          id: "",
          title: "",
          description: "",
          quantity: 1,
          unit_price: "",
          is_fresh_leads: "true",
          month: "",
          source: "1",
          category: 1,
        });
        setEditErrors({});
        fetchPlans();
      } else {
        toast.error(response.data.message || "Failed to update plan");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to update plan",
      );
    } finally {
      setEditLoading(false);
    }
  };

  // Fetch subscription plans data
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await subscriptionService.getAdminPlans();
      console.log("Subscription plans API response:", response);

      if (response.data.data && Array.isArray(response.data.data)) {
        const processedPlans = response.data.data.map((plan, index) => {
          // Generate color based on index or plan properties
          const colors = ["blue", "green", "purple", "orange", "red"];
          const color = colors[index % colors.length];

          // Determine if this plan is popular (you can customize this logic)
          const popular = index === 1; // Make the second plan popular for demo

          return {
            id: plan.id,
            name: plan.title,
            price: plan.unit_price, //net_price
            billingCycle: "week", // As per requirement, use 'week' instead of month
            description:
              plan.description || `Plan with ${plan.quantity} quantity`,
            features: [
              `${plan.quantity} leads per week`,
              plan.is_fresh_leads ? "Fresh leads included" : "Standard leads",
              "Lead management system",
              "Email support",
              "Basic reporting",
            ],
            limitations: [
              "No advanced analytics",
              "No API access",
              "Limited customization",
            ],
            subscribers: plan.active_subscriptions_count || 0,
            revenue: plan.net_price * (plan.active_subscriptions_count || 0),
            color: color,
            popular: popular,
            // Store original plan data for reference
            originalData: plan,
          };
        });

        setPlans(processedPlans);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error("Error fetching subscription plans:", err);

      // Handle different error scenarios
      if (err.response) {
        // Server responded with error status
        switch (err.response.status) {
          case 401:
            setError("Unauthorized access. Please log in again.");
            break;
          case 403:
            setError(
              "Access forbidden. You do not have permission to view subscription plans.",
            );
            break;
          case 404:
            setError("Subscription plans not found.");
            break;
          case 500:
            setError("Server error. Please try again later.");
            break;
          default:
            setError(
              `Error loading subscription plans: ${err.response.data?.message || err.message}`,
            );
        }
      } else if (err.request) {
        // Network error
        setError(
          "Network error. Please check your internet connection and try again.",
        );
      } else {
        // Other error
        setError(`Error loading subscription plans: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const totalSubscribers = plans.reduce(
    (sum, plan) => sum + plan.subscribers,
    0,
  );
  const totalRevenue = plans.reduce((sum, plan) => sum + plan.revenue, 0);
  const avgRevenuePerUser =
    totalSubscribers > 0 ? totalRevenue / totalSubscribers : 0;

  // const handleEditPlan = (planId) => {
  //   alert(`Edit plan: ${planId} (This would open an edit modal)`);
  // };

  const openDeleteModal = (planId) => {
    setDeletePlanId(planId);
    setShowDeleteModal(true);
  };

  const handleDeletePlan = async () => {
    if (!deletePlanId) return;
    setDeleteLoading(true);
    try {
      const response =
        await subscriptionService.deactivateProductPricing(deletePlanId);
      if (
        response.data &&
        (response.data.success || response.data.status === 200)
      ) {
        toast.success(
          response.data.message || "Plan deactivated successfully!",
        );
        setShowDeleteModal(false);
        setDeletePlanId(null);
        fetchPlans();
      } else if (
        response.data &&
        (response.data.success || response.data.status === 201)
      ) {
        toast.success(
          response.data.message || "Plan deactivated successfully!",
        );
        setShowDeleteModal(false);
        setDeletePlanId(null);
        fetchPlans();
      } else {
        toast.error(response.data.message || "Failed to deactivate plan");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to deactivate plan",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (plan) => {
    setEditForm({
      id: plan.id,
      title: plan.name || "",
      description: plan.description || "",
      quantity: plan.originalData?.quantity || plan.quantity || 1,
      unit_price: plan.price || plan.unit_price || "",
      is_fresh_leads: plan.originalData?.is_fresh_leads ? "true" : "false",
      month:
        plan.originalData?.month?.toString() ?? plan.month?.toString() ?? "",
      source:
        plan.originalData?.source?.toString() ?? plan.source?.toString() ?? "1",
      category:
        plan.originalData?.category?.toString() ??
        plan.category?.toString() ??
        1,
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  // const handleCreatePlan = () => {
  //   alert('Create new plan functionality would be implemented here');
  // };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-900/30",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-700",
        button:
          "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-900/30",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-200 dark:border-green-700",
        button:
          "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-900/30",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-700",
        button:
          "bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600",
      },
      orange: {
        bg: "bg-orange-50 dark:bg-orange-900/30",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-200 dark:border-orange-700",
        button:
          "bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600",
      },
      red: {
        bg: "bg-red-50 dark:bg-red-900/30",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-200 dark:border-red-700",
        button:
          "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      {/* Sidebar */}
      <SharedSidebar currentPath="/admin/subscriptions" />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0a2463]">
                Subscription Plans
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Manage subscription plans and pricing
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 rounded-lg bg-[#f4d03f] px-4 py-2 text-white transition-colors hover:bg-[#e6c035]"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Create Plan</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Loading subscription plans...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <svg
                    className="h-8 w-8 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                  Error Loading Data
                </h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    fetchPlans();
                  }}
                  className="rounded-lg bg-[#0a2463] px-4 py-2 text-white transition-colors hover:bg-[#0a1a4a]"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card
                  className="shieldnest-white-column p-6"
                  style={{ borderLeft: `5px solid ${randomColors[0]}` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Total Subscribers
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {totalSubscribers}
                      </p>
                    </div>
                    <div className="shieldnest-bg1 flex h-12 w-12 items-center justify-center rounded-full">
                      <UserGroupIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>

                <Card
                  className="shieldnest-white-column p-6"
                  style={{ borderLeft: `5px solid ${randomColors[1]}` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Weekly Revenue
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                        ${totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="shieldnest-bg2 flex h-12 w-12 items-center justify-center rounded-full">
                      <CurrencyDollarIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>

                <Card
                  className="shieldnest-white-column p-6"
                  style={{ borderLeft: `5px solid ${randomColors[2]}` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Average Revenue Per User
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                        ${avgRevenuePerUser.toFixed(0)}
                      </p>
                      {/* <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Average Revenue Per User</p> */}
                    </div>
                    <div className="shieldnest-bg3 flex h-12 w-12 items-center justify-center rounded-full">
                      <CreditCardIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </Card>

                <h3 className="mt-2 mb-0 text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Available Plans
                </h3>
              </div>

              {/* Subscription Plans */}
              {plans.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <CreditCardIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                      No Subscription Plans
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      No subscription plans found.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  {/* {plans.map((plan) => {
                    const colorClasses = getColorClasses(plan.color);
                    return (
                      <Card key={plan.id} className={`relative overflow-hidden bg-white dark:bg-gray-800`}>

                        <div className={`p-6`}>
                          <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ color: '#0a2463' }}>{plan.name}</h3>
                            <div className="flex items-baseline justify-center mb-2">
                              <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">${plan.price}</span>
                              <span className="text-gray-500 dark:text-gray-400 ml-1">/{plan.billingCycle}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{plan.description}</p>
                          </div>
                          <div className={`${colorClasses.bg} ${colorClasses.border} border rounded-lg p-4 mb-6`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Subscribers</p>
                                <p className={`text-2xl font-bold ${colorClasses.text}`}>{plan.subscribers}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Revenue</p>
                                <p className={`text-2xl font-bold ${colorClasses.text}`}>${plan.revenue}</p>
                              </div>
                            </div>
                          </div>


                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(plan)}
                              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                            >
                              <PencilIcon className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => openDeleteModal(plan.id)}
                              className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-2"
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })} */}
                  {plans.map((plan) => {
                    const colorClasses = getColorClasses(plan.color);
                    return (
                      <Card
                        key={plan.id}
                        className={`relative overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-md`}
                      >
                        <div className="p-6">
                          {/* Header */}
                          <div className="mb-6 text-center">
                            <h3 className="mb-2 text-xl font-bold text-[#0a5a78] dark:text-[#4d9fff]">
                              {plan.name}
                            </h3>

                            <div className="mb-2 flex items-baseline justify-center">
                              <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                                ${plan.price}
                              </span>
                              <span className="ml-1 text-gray-500 dark:text-gray-400">
                                /{plan.billingCycle}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {plan.description}
                            </p>
                          </div>

                          {/* Metrics block */}
                          <div
                            className={` ${colorClasses.bg} dark:bg-opacity-10 ${colorClasses.border} mb-6 rounded-lg border p-4 dark:border-gray-700`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  Subscribers
                                </p>
                                <p
                                  className={`text-2xl font-bold ${colorClasses.text}`}
                                >
                                  {plan.subscribers}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  Revenue
                                </p>
                                <p
                                  className={`text-2xl font-bold ${colorClasses.text}`}
                                >
                                  ${plan.revenue}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(plan)}
                              className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                              <PencilIcon className="h-4 w-4" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => openDeleteModal(plan.id)}
                              className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-red-100 px-4 py-2 text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-800/60"
                            >
                              <TrashIcon className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Transition appear show={showCreateModal} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
          onClose={() => setShowCreateModal(false)}
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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
          </TransitionChild>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="relative w-full max-w-lg rounded-2xl bg-white px-6 py-8 shadow-xl transition-all sm:px-8 dark:bg-gray-800">
              <DialogTitle
                as="h3"
                className="mb-6 text-center text-2xl font-semibold text-gray-800 dark:text-blue-400"
              >
                Create Subscription Plan
              </DialogTitle>
              <form onSubmit={handleCreatePlanSubmit}>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-100">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={createForm.title}
                    onChange={handleCreateInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#0a2463] focus:outline-none"
                  />
                  {createErrors.title && (
                    <p className="mt-1 text-xs text-red-500">
                      {createErrors.title}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-100">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={createForm.description}
                    onChange={handleCreateInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#0a2463] focus:outline-none"
                    rows={3}
                  />
                  {createErrors.description && (
                    <p className="mt-1 text-xs text-red-500">
                      {createErrors.description}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-100">
                    Mailer Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={createForm.quantity}
                    onChange={handleCreateInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#0a2463] focus:outline-none"
                  />
                  {createErrors.quantity && (
                    <p className="mt-1 text-xs text-red-500">
                      {createErrors.quantity}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-100">
                    Price
                  </label>
                  <input
                    type="number"
                    name="unit_price"
                    step="0.01"
                    value={createForm.unit_price}
                    onChange={handleCreateInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#0a2463] focus:outline-none"
                  />
                  {createErrors.unit_price && (
                    <p className="mt-1 text-xs text-red-500">
                      {createErrors.unit_price}
                    </p>
                  )}
                </div>
                {/* <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Is Fresh Leads</label>
                  <select name="is_fresh_leads" value={createForm.is_fresh_leads} onChange={handleCreateInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2463]">
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div> */}
                {/* <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead Type</label>
                  <select name="month" value={createForm.month} onChange={handleCreateInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2463]">
                    <option value="">Select Lead Type</option>
                    {leadTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  {createErrors.month && <p className="text-red-500 text-xs mt-1">{createErrors.month}</p>}
                </div> */}
                <div className="mb-6">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-100">
                    Category
                  </label>
                  <select
                    name="category"
                    value={createForm.category}
                    onChange={handleCreateInputChange}
                    className="w-full rounded-lg border border-[#75150b] px-3 py-2 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {createErrors.category && (
                    <p className="mt-1 text-xs text-red-500">
                      {createErrors.category}
                    </p>
                  )}
                </div>
                <div className="mb-6">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-100">
                    Source
                  </label>
                  <select
                    name="source"
                    value={createForm.source}
                    onChange={handleCreateInputChange}
                    className="w-full rounded-lg border border-[#75150b] dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white px-3 py-2"
                  >
                    <option value="">Select Source</option>
                    {sourceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {createErrors.source && (
                    <p className="mt-1 text-xs text-red-500">
                      {createErrors.source}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateForm({
                        title: "",
                        description: "",
                        quantity: 0,
                        unit_price: 0,
                        category: "",
                        source: "",
                      });
                      setCreateErrors({
                        title: "",
                        description: "",
                        quantity: "",
                        unit_price: "",
                        category: "",
                        source: "",
                      });
                    }}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className={`flex items-center dark:text-white dark:bg-blue-600 justify-center rounded-md bg-[#0a2463] px-4 py-2 text-sm text-white hover:bg-[#0a1a4a] ${createLoading ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    {createLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="mr-2 h-4 w-4 animate-spin text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      "Create Plan"
                    )}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>

      <Transition appear show={showEditModal} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
          onClose={() => setShowEditModal(false)}
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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
          </TransitionChild>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="relative w-full max-w-lg rounded-2xl bg-white px-6 py-8 shadow-xl transition-all sm:px-8 dark:bg-gray-800">
              <DialogTitle
                as="h3"
                className="mb-6 text-center text-2xl font-semibold text-gray-800 dark:text-blue-400"
              >
                Edit Subscription Plan
              </DialogTitle>
              <form onSubmit={handleEditPlanSubmit}>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-100">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#0a2463] focus:outline-none"
                  />
                  {editErrors.title && (
                    <p className="mt-1 text-xs text-red-500">
                      {editErrors.title}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-100">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#0a2463] focus:outline-none"
                    rows={3}
                  />
                  {editErrors.description && (
                    <p className="mt-1 text-xs text-red-500">
                      {editErrors.description}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-100">
                    Mailer Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={editForm.quantity}
                    onChange={handleEditInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#0a2463] focus:outline-none"
                  />
                  {editErrors.quantity && (
                    <p className="mt-1 text-xs text-red-500">
                      {editErrors.quantity}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-100">
                    {" "}
                    Price
                  </label>
                  <input
                    type="number"
                    name="unit_price"
                    step="0.01"
                    value={editForm.unit_price}
                    onChange={handleEditInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#0a2463] focus:outline-none"
                  />
                  {editErrors.unit_price && (
                    <p className="mt-1 text-xs text-red-500">
                      {editErrors.unit_price}
                    </p>
                  )}
                </div>
                {/* <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Is Fresh Leads</label>
                  <select name="is_fresh_leads" value={editForm.is_fresh_leads} onChange={handleEditInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2463]">
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div> */}
                {/* <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead Type</label>
                  <select name="month" value={editForm.month} onChange={handleEditInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2463]">
                    <option value="">Select Lead Type</option>
                    {leadTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  {editErrors.month && <p className="text-red-500 text-xs mt-1">{editErrors.month}</p>}
                </div> */}
                <div className="mb-6">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-100">
                    Category
                  </label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditInputChange}
                    className="w-full rounded-lg border border-[#75150b] dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white px-3 py-2 focus:border-[#75150b] focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {editErrors.category && (
                    <p className="mt-1 text-xs text-red-500">
                      {editErrors.category}
                    </p>
                  )}
                </div>
                <div className="mb-6">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-100">
                    Source
                  </label>
                  <select
                    name="source"
                    value={editForm.source}
                    onChange={handleEditInputChange}
                    className="w-full rounded-lg border border-[#75150b] dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white px-3 py-2 focus:border-[#75150b] focus:outline-none"
                  >
                    <option value="">Select Source</option>
                    {sourceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {editErrors.source && (
                    <p className="mt-1 text-xs text-red-500">
                      {editErrors.source}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className={`flex items-center dark:text-white dark:bg-blue-600 justify-center rounded-md bg-[#0a2463] px-4 py-2 text-sm text-white hover:bg-[#0a1a4a] ${editLoading ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    {editLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="mr-2 h-4 w-4 animate-spin text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      "Update Plan"
                    )}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>

      <Transition appear show={showDeleteModal} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 sm:px-5"
          onClose={() => setShowDeleteModal(false)}
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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
          </TransitionChild>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="relative w-full max-w-md rounded-2xl bg-white px-6 py-8 shadow-xl transition-all sm:px-8 dark:bg-gray-800">
              <DialogTitle
                as="h3"
                className="mb-6 text-center text-xl font-semibold text-gray-800 dark:text-gray-100"
              >
                Deactivate Plan
              </DialogTitle>
              <p className="mb-6 text-center text-gray-700 dark:text-gray-100">
                Are you sure you want to deactivate this plan? This action
                cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeletePlan}
                  disabled={deleteLoading}
                  className={`flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 ${deleteLoading ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {deleteLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="mr-2 h-4 w-4 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                      Deactivating...
                    </span>
                  ) : (
                    "Deactivate"
                  )}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </div>
  );
};

export default SubscriptionPlans;
