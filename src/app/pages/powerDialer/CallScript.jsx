
const CallScript = ({ selectedScript, onScriptChange, lead }) => {
  console.log('selected-script', selectedScript)
  const scriptSections = [
    'Opening',
    'Qualification',
    'Objections',
    'Closing',
    'Follow-up',
    'Appointment',
    'Voicemail',
    'Referral'
  ];

  const scriptContent = {
    Opening: `Hello ${lead?.name || '[Lead Name]'}, this is [Your Name] from ShieldNest. How are you doing today?`,
    Qualification: "I'm following up on your interest in mortgage protection. Could you tell me a bit about your current situation?",
    Objections: "I understand your concerns. Many of our clients felt the same way initially, but here's how we can help...",
    Closing: "Based on our discussion, the mortgage protection plan would provide you with peace of mind. Shall we proceed with the application?",
    'Follow-up': "I wanted to follow up on our previous conversation about mortgage protection. Have you had any additional thoughts or questions?",
    Appointment: "Would you be available for a 15-minute call on [date] at [time] to discuss this further?",
    Voicemail: `Hi ${lead?.name || '[Lead Name]'}, this is [Your Name] from ShieldNest calling about mortgage protection. Please call me back at [your number].`,
    Referral: "While I have you on the line, do you know anyone else who might benefit from mortgage protection?"
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Call Script</h2>
      
      {/* Script Type Selector */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {scriptSections.map((script) => (
          <button
            key={script}
            onClick={() => onScriptChange(script)}
            className={`p-2 text-xs rounded transition-colors ${
              selectedScript === script
                ? 'bg-[var(--color-atoll)] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {script}
          </button>
        ))}
      </div>

      {/* Script Content */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-y-auto">
        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {scriptContent[selectedScript]}
        </div>
      </div>

      {!lead && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Select a lead and script type to view the teleprompter
        </div>
      )}
    </div>
  );
};

export default CallScript;