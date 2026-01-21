import { useState, useEffect } from 'react';
import {
  Card,
  Spinner,
  Pagination,
  PaginationItems,
  PaginationNext,
  PaginationPrevious
} from 'components/ui';
import { platformSubscriptionService, apiUtils } from 'utils/apiService';

const PlatformAvailablePlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPlans = async (page, perPage) => {
    try {
      setLoading(true);
      const response = await platformSubscriptionService.getAvailablePlans(
        page,
        perPage
      );
      setPlans(response?.data?.data || []);
      setPagination(response?.data?.pagination || null);
    } catch (err) {
      setError(apiUtils.formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPlans(page, 20);
  };

  useEffect(() => {
    fetchPlans(1, 20);
  }, []);

  return (
    <div className="relative">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Available Plans</h2>

      {error && (
        <div className="mb-8 rounded-xl bg-red-50 border border-red-200 p-5 text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-32">
          <Spinner className="w-12 h-12 text-indigo-600" />
        </div>
      )}

      {!loading && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {plans.map((plan) => {

            return (
              <Card
                key={plan.id}
                className={`
                  relative overflow-hidden rounded-3xl
                  bg-white dark:bg-gray-900
                  border border-gray-200 dark:border-gray-700
                  shadow-md hover:shadow-2xl
                  transition-all duration-500
                  hover:-translate-y-2
                  
              `}
              >
                {/* Gradient Accent */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1e3a8a] via-[#1e40af] to-[#60a5fa]" />

                {/* Badge */}
                
                <div className="p-8 flex flex-col h-full">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {plan.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Spacer */}
                  <div className="flex-grow" />

                  {/* Price */}
                  <div className="mt-6">
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-bold text-gray-900 dark:text-white">
                        ${plan.unit_price}
                      </span>
                      <span className="text-sm text-gray-500 mb-2">
                        /{plan.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && plans.length === 0 && (
        <div className="py-32 text-center">
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            No plans available
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Please check back later or contact support.
          </p>
        </div>
      )}

      {pagination && (
        <div className="mt-10 flex justify-center">
          <Pagination
            total={Math.ceil(pagination.total / 20)}
            value={currentPage}
            onChange={handlePageChange}
          >
            <PaginationPrevious />
            <PaginationItems />
            <PaginationNext />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default PlatformAvailablePlans;
