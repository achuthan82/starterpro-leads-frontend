import { Card, Button } from 'components/ui';

const LeadStateCard = ({ stateName, stateCode, completed, incomplete, onViewLeads }) => {
  const totalLeads = completed + incomplete;
  const completedPct = totalLeads ? (completed / totalLeads) * 100 : 0;
  const incompletePct = totalLeads ? (incomplete / totalLeads) * 100 : 0;

  return (
    <Card className="p-6 flex flex-col h-full shieldnest-white-column rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-bold text-[#0a2463] dark:text-blue-400">{stateName}</span>
        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-3 py-1 text-sm font-semibold">{stateCode}</span>
      </div>
      {/* Pricing info */}
      {/* <div className="mb-2 flex justify-between items-center">
        <span className="text-gray-700 font-medium">{startingPrice !== null ? `Starting at $${startingPrice}` : 'Pricing unavailable'}</span>
      </div> */}
      <div className="mb-2">
        <div className="flex w-full h-7 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
          <div
            className="flex items-center justify-center text-white text-sm font-bold"
            style={{ width: `${incompletePct}%`, transition: 'width 0.3s', backgroundColor: '#f4d03f' }}
          >
            {incomplete > 0 && incomplete}
          </div>
          <div
            className="flex items-center justify-center text-white text-sm font-bold"
            style={{ width: `${completedPct}%`, transition: 'width 0.3s', backgroundColor: '#0a2463' }}
          >
            {completed > 0 && completed}
          </div>
        </div>
      </div>
      <div className="flex gap-4 text-xs mt-2 mb-2 text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded inline-block" style={{ backgroundColor: '#f4d03f' }}></span>
          <span>Incomplete Leads</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded inline-block" style={{ backgroundColor: '#0a2463' }}></span>
          <span>Completed Leads</span>
        </div>
      </div>
      <div className="flex justify-between items-center mt-auto pt-2">
        <span className="text-gray-700 dark:text-gray-300 font-medium">{completed + incomplete} Total Leads</span>
        <Button style={{ backgroundColor: '#0a2463' }} className="px-6 text-white hover:bg-[#0a1a4a] transition-colors" onClick={onViewLeads}>
          View Leads
        </Button>
      </div>
    </Card>
  );
};

export default LeadStateCard; 