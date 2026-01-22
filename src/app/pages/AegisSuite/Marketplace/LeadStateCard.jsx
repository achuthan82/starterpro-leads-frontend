import { Card, Button } from "components/ui";

const LeadStateCard = ({
  stateName,
  stateCode,
  completed,
  incomplete,
  onViewLeads,
}) => {
  const totalLeads = completed + incomplete;
  const completedPct = totalLeads ? (completed / totalLeads) * 100 : 0;
  const incompletePct = totalLeads ? (incomplete / totalLeads) * 100 : 0;

  return (
    <Card className="shieldnest-white-column flex h-full flex-col rounded-xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-lg font-bold text-[#0a2463] dark:text-blue-400">
          {stateName}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {stateCode}
        </span>
      </div>
      {/* Pricing info */}
      {/* <div className="mb-2 flex justify-between items-center">
        <span className="text-gray-700 font-medium">{startingPrice !== null ? `Starting at $${startingPrice}` : 'Pricing unavailable'}</span>
      </div> */}
      <div className="mb-2">
        <div className="flex h-7 w-full overflow-hidden rounded border border-gray-200 dark:border-gray-700">
          <div
            className="flex items-center justify-center text-sm font-bold text-white"
            style={{
              width: `${incompletePct}%`,
              transition: "width 0.3s",
              backgroundColor: "#f4d03f",
            }}
          >
            {incomplete > 0 && incomplete}
          </div>
          <div
            className="flex items-center justify-center text-sm font-bold text-white"
            style={{
              width: `${completedPct}%`,
              transition: "width 0.3s",
              backgroundColor: "#0a2463",
            }}
          >
            {completed > 0 && completed}
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {completed + incomplete} Total Leads
        </span>
        <Button
          style={{ backgroundColor: "#0a2463" }}
          data-testid="btn-view-leads"
          className="px-6 text-white transition-colors hover:bg-[#0a1a4a]"
          onClick={onViewLeads}
        >
          View Leads
        </Button>
      </div>
    </Card>
  );
};

export default LeadStateCard;
