import { useEffect, useState } from "react";
import Select from "react-select";
import { Card, Spinner } from "components/ui";
import { subscriptionService, apiUtils, adminService } from "utils/apiService";
import { getReactSelectDarkModeStyles } from "utils/reactSelectDarkMode";
import { useAuthContext } from "app/contexts/auth/context";
import { toast } from "sonner";
const LeadStateFilter = ({
  selected,
  onChange,
  options,
  setOptions,
  selectedAgency,
  setSelectedAgency,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const [agencyOptions, setAgencyOptions] = useState([]);
  const { user } = useAuthContext();

  const fetchAgencyList = async () => {
    setLoadingAgencies(true);
    try {
      const response = await adminService.getAgencyList();
      console.log("Agency list response:", response);

      // Transform API response to react-select format
      let agencies = [];
      if (response.data && Array.isArray(response.data)) {
        agencies = response.data.map((agency) => ({
          label: agency.name,
          value: agency.id,
          parent_agency_id: agency.parent_agency_id,
        }));
      } else if (Array.isArray(response)) {
        agencies = response.map((agency) => ({
          label: agency.name,
          value: agency.id,
          parent_agency_id: agency.parent_agency_id,
        }));
      } else if (response.agencies && Array.isArray(response.agencies)) {
        agencies = response.agencies.map((agency) => ({
          label: agency.name,
          value: agency.id,
          parent_agency_id: agency.parent_agency_id,
        }));
      }

      setAgencyOptions(agencies);
    } catch (error) {
      console.error("Error fetching agency list:", error);
      toast.error("Failed to load agency list");
      // Fallback to empty array or default options
      setAgencyOptions([]);
    } finally {
      setLoadingAgencies(false);
    }
  };
  const handleAgencyChange = (selectedOption) => {
    setSelectedAgency(selectedOption);
  };
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoading(true);
        const res = await subscriptionService.getUsaStates();
        // const opts = res.data.map(s => ({ value: s.code, label: s.name }));
        const arr = [];
        Object.keys(res.data.data).map(function (key) {
          arr.push({ value: res.data.data[key], label: key });
        });
        setOptions([{ value: "all", label: "All" }, ...arr]);
      } catch (err) {
        setError(apiUtils.formatError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchAgencyList();
    fetchStates();
  }, []);

  return (
    <Card className="mb-8 bg-white dark:bg-gray-800">
      <div>
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-[#0a2463] dark:text-gray-100">
            Find Your preferred Leads
          </h2>
          {loading ? (
            <Spinner />
          ) : (
            <div className="flex space-x-1">
              <Select
                isMulti
                options={options}
                value={selected}
                onChange={onChange}
                styles={getReactSelectDarkModeStyles()}
                className="react-select-container flex-grow-1"
                classNamePrefix="react-select"
                placeholder="Select states..."
              />
              {user?.agency?.name === "StarterPro" && (
                <Select
                  options={agencyOptions}
                  isLoading={loadingAgencies}
                  value={selectedAgency}
                  onChange={handleAgencyChange}
                  styles={getReactSelectDarkModeStyles()}
                  className="react-select-container flex-grow-1"
                  classNamePrefix="react-select"
                  placeholder="Select Agency..."
                />
              )}
            </div>
          )}
          {error && <div className="mt-2 text-red-500">{error}</div>}
        </div>
      </div>
    </Card>
  );
};

export default LeadStateFilter;
