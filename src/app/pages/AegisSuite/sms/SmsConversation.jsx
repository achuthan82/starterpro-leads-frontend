import { useState, useEffect, useRef, useCallback } from "react";
// import { useNavigate } from "react-router";
import {
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Switch } from "@headlessui/react";
import { smsService, automationService } from "utils/apiService";
import { toast } from "sonner";
import moment from "moment";

const SmsConversation = ({mortgage_id, lead_member_id}) => {
  // const { mortgage_id, lead_member_id } = useParams();
  // const navigate = useNavigate();
  const conversationEndRef = useRef(null);
  const conversationContainerRef = useRef(null);

  // Lead list state
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchFilter, setSearchFilter] = useState("");

  // Conversation state
  const [selectedLead, setSelectedLead] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationPage, setConversationPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [conversationLoadingMore, setConversationLoadingMore] = useState(false);
  
  // Reply state
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  
  // Automation toggle state
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [automationLoading, setAutomationLoading] = useState(false);

  // Get local timezone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Fetch leads list
  const fetchLeads = useCallback(async (page = currentPage, itemsPerPage = perPage, search = searchFilter) => {
    setLeadsLoading(true);
    try {
      const response = await smsService.getSentLeadsPaginated({
        page,
        per_page: itemsPerPage,
        name: search || undefined,
      });

      const leadsData = response.data || response.leads || [];
      const pagination = response.pagination || {};
      const total = pagination.total || response.total || 0;
      const totalPagesCalc = Math.ceil(total / itemsPerPage);

      setLeads(leadsData);
      setTotalRecords(total);
      setTotalPages(totalPagesCalc);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error(error?.message || "Failed to load leads");
      setLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  }, [currentPage, perPage, searchFilter]);

  // Fetch conversation
  const fetchConversation = useCallback(
    async (leadMemberId, page = 1, append = false) => {
      if (!leadMemberId) return Promise.resolve();

      if (append) {
        setConversationLoadingMore(true);
      } else {
        setConversationLoading(true);
        setConversationPage(1);
      }

      try {
        const response = await smsService.getConversationPaginated({
          page,
          per_page: 10,
          mailing_assignee_id: leadMemberId,
          time_zone: timeZone,
        });

        const messages = response.data || response.messages || [];
        const pagination = response.pagination || {};
        const total = pagination.total || response.total || 0;
        const currentTotal = append ? conversation.length + messages.length : messages.length;

        // Reverse messages if they come in reverse chronological order (oldest first)
        const sortedMessages = [...messages].reverse();

        if (append) {
          setConversation((prev) => [...sortedMessages, ...prev]);
        } else {
          setConversation(sortedMessages);
        }

        setHasMoreMessages(currentTotal < total);
        setConversationPage(page);
        return Promise.resolve();
      } catch (error) {
        console.error("Error fetching conversation:", error);
        toast.error(error?.message || "Failed to load conversation");
        if (!append) {
          setConversation([]);
        }
        return Promise.reject(error);
      } finally {
        setConversationLoading(false);
        setConversationLoadingMore(false);
      }
    },
    [timeZone, conversation.length]
  );

  // Handle lead selection
  const handleSelectLead = (lead) => {
  setSelectedLead(lead);
  setReplyText("");

  setAutomationEnabled(
    lead.sms_automation_enabled || lead.originalData?.sms_automation_enabled || false
  );

  const leadMemberId = lead.assignee_id;
  if (leadMemberId) {
    // Just fetch conversation — do NOT navigate
    fetchConversation(leadMemberId, 1, false);
  }
};

  // Handle automation toggle
  const handleAutomationToggle = async (enabled) => {
    if (!selectedLead || automationLoading) return;

    const assigneeId = selectedLead.assignee_id || selectedLead.lead_member_id;
    if (!assigneeId) {
      toast.error("Missing lead information");
      return;
    }

    setAutomationLoading(true);
    const payload = { sms_automation_enabled: enabled };

    try {
      const response = await automationService.toggleLeadManagementAutomation(assigneeId, payload);
      
      if (response?.data?.status === 200 || response?.status === 200) {
        setAutomationEnabled(enabled);
        // Update the selected lead with new automation status
        setSelectedLead({
          ...selectedLead,
          sms_automation_enabled: enabled,
          originalData: {
            ...selectedLead.originalData,
            sms_automation_enabled: enabled,
          },
        });
        // Update the lead in the leads list
        setLeads((prevLeads) =>
          prevLeads.map((l) => {
            if (
              l.assignee_id === assigneeId ||
              l.lead_member_id === assigneeId ||
              (l.mortgage_id === selectedLead.mortgage_id && l.assignee_id === assigneeId)
            ) {
              return {
                ...l,
                sms_automation_enabled: enabled,
                originalData: {
                  ...l.originalData,
                  sms_automation_enabled: enabled,
                },
              };
            }
            return l;
          })
        );
        toast.success("SMS automation updated successfully");
      } else {
        toast.error(response?.data?.message || "Failed to update automation");
      }
    } catch (error) {
      console.error("Error toggling automation:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to update automation");
    } finally {
      setAutomationLoading(false);
    }
  };

  // Handle send reply
  const handleSendReply = async () => {
    if (!selectedLead || !replyText.trim() || sendingReply) return;

    setSendingReply(true);
    try {
      const mailingAssigneeId = selectedLead.assignee_id || selectedLead.lead_member_id;
      const mortgageId = selectedLead.mortgage_id;
      
      if (!mailingAssigneeId || !mortgageId) {
        toast.error("Missing lead information");
        return;
      }

      // Get queue_id from the last message if available
      const lastMessage = conversation.length > 0 ? conversation[conversation.length - 1] : null;
      const queueId = lastMessage?.queue_id || null;

      const payload = {
        mailing_assignee_id: mailingAssigneeId,
        mortgage_id: mortgageId,
        text: replyText.trim(),
      };

      if (queueId) {
        payload.queue_id = queueId;
      }

      await smsService.sendSmsToLead(payload);
      
      // Clear reply text
      setReplyText("");
      
      // Refresh conversation to show the new message
      const leadMemberId = selectedLead.assignee_id;
      if (leadMemberId) {
        await fetchConversation(leadMemberId, 1, false);
      }
      
      toast.success("Message sent successfully");
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to send message");
    } finally {
      setSendingReply(false);
    }
  };

  // Handle scroll to load more messages
  const handleScroll = useCallback(() => {
    if (!conversationContainerRef.current || conversationLoadingMore || !hasMoreMessages) return;

    const container = conversationContainerRef.current;
    // Load more when scrolled near the top (within 100px)
    if (container.scrollTop < 100) {
      const leadMemberId =
        selectedLead?.assignee_id ||
        lead_member_id;
      if (leadMemberId) {
        const previousScrollHeight = container.scrollHeight;
        fetchConversation(leadMemberId, conversationPage + 1, true).then(() => {
          // Maintain scroll position after loading older messages
          setTimeout(() => {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeight;
          }, 0);
        });
      }
    }
  }, [conversationLoadingMore, hasMoreMessages, conversationPage, selectedLead, lead_member_id, fetchConversation]);

  // Initial load
  useEffect(() => {
    fetchLeads(1, perPage, searchFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage]);

  // Select lead from URL params
  useEffect(() => {
    if (mortgage_id && lead_member_id && leads.length > 0) {
      const lead = leads.find(
        (l) =>
          (l.mortgage_id === mortgage_id || l.mortgage_id?.toString() === mortgage_id) &&
          (l.assignee_id === lead_member_id ||
            l.assignee_id?.toString() === lead_member_id)
      );
      if (lead && (!selectedLead || selectedLead.mortgage_id !== lead.mortgage_id)) {
        handleSelectLead(lead);
      }
    }
  }, [mortgage_id, lead_member_id, leads]);

  // Update automation status when selectedLead changes
  useEffect(() => {
    if (selectedLead) {
      setAutomationEnabled(
        selectedLead.sms_automation_enabled ||
        selectedLead.originalData?.sms_automation_enabled ||
        false
      );
    }
  }, [selectedLead]);

  // Setup scroll listener
  useEffect(() => {
    const container = conversationContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversationEndRef.current && !conversationLoadingMore) {
      conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation, conversationLoadingMore]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchLeads(newPage, perPage, searchFilter);
    }
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    fetchLeads(1, newPerPage, searchFilter);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    // Handle format like "11-29-2025 12:30:14" (MM-DD-YYYY HH:mm:ss)
    const parsedDate = moment(dateString, ["MM-DD-YYYY HH:mm:ss", "YYYY-MM-DD HH:mm:ss", moment.ISO_8601], true);
    if (parsedDate.isValid()) {
      return parsedDate.format("MMM DD, YYYY h:mm A");
    }
    // Fallback to default parsing
    return moment(dateString).format("MMM DD, YYYY h:mm A");
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[400px] bg-[var(--color-ecru-white)] dark:bg-gray-900">
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar - Lead List */}
        <div className="w-full lg:w-1/3 border-r-0 lg:border-r border-b lg:border-b-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col max-h-[40vh] lg:max-h-none">
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
              {/* <button
                onClick={() => navigate("/power-dialer")}
                className="flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-[var(--color-atoll)] dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                title="Back to Power Dialer"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button> */}
              <h2 className="text-lg sm:text-xl font-bold text-[var(--color-atoll)] dark:text-blue-400">
                SMS Conversations
              </h2>
            </div>

            {/* Search Filter */}
            <div className="mb-0 sm:mb-4">
              <input
                type="text"
                placeholder="Search by name or ID"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCurrentPage(1);
                    fetchLeads(1, perPage, e.target.value);
                  }
                }}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-[var(--color-atoll)] focus:ring-2 focus:ring-[var(--color-atoll)] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    fetchLeads(1, perPage, searchFilter);
                  }}
                  className="flex-1 rounded-lg bg-[var(--color-atoll)] px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-[var(--color-atoll)]/90 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Search
                </button>
                <button
                  onClick={() => {
                    setSearchFilter("");
                    setCurrentPage(1);
                    fetchLeads(1, perPage, "");
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Leads List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {leadsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-[var(--color-atoll)]"></div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {leads.map((lead) => {
                      const isSelected =
                        selectedLead?.mortgage_id === lead.mortgage_id &&
                        (selectedLead?.assignee_id === lead.assignee_id);
                      return (
                        <div
                          key={`${lead.mortgage_id}-${lead.assignee_id}`}
                          onClick={() => handleSelectLead(lead)}
                          className={`cursor-pointer rounded-lg border-l-4 p-3 transition-all ${
                            isSelected
                              ? "border border-blue-200 border-l-[var(--color-atoll)] bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20"
                              : "border border-gray-200 border-l-transparent bg-white hover:border-[var(--color-atoll)] dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[var(--color-atoll)]"
                          }`}
                        >
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {lead.full_name || lead.name || "Unknown"}
                          </h3>
                          <div className="mt-1 space-y-1">
                            {lead.mortgage_id && (
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Mortgage ID: {lead.mortgage_id}
                              </p>
                            )}
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {lead.phone || "N/A"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Pagination */}
                {totalRecords > 0 && (
                  <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-600">
                    <div className="flex items-center justify-between gap-3">
                      {/* <div className="text-xs text-gray-600 dark:text-gray-400">
                        Showing {(currentPage - 1) * perPage + 1} to{" "}
                        {Math.min(currentPage * perPage, totalRecords)} of {totalRecords}
                      </div> */}
                      <div className="flex items-center gap-2">
                        <select
                          value={perPage}
                          onChange={(e) => handlePerPageChange(Number(e.target.value))}
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:ring-1 focus:ring-[var(--color-atoll)] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                        {totalPages > 1 && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage <= 1}
                              className="p-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeftIcon className="h-4 w-4" />
                            </button>
                            <span className="px-2 text-xs text-gray-600 dark:text-gray-400">
                              {currentPage} / {totalPages}
                            </span>
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage >= totalPages}
                              className="p-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronRightIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Side - Conversation */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 min-h-[60vh] lg:min-h-0">
          {selectedLead ? (
            <>
              <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {selectedLead.full_name || selectedLead.name || "Unknown"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {selectedLead.phone || "N/A"}
                    </p>
                  </div>
                  
                  {/* SMS Automation Toggle */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <div className="flex flex-col items-end">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        SMS Automation
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {automationEnabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                    <Switch
                      checked={automationEnabled}
                      onChange={handleAutomationToggle}
                      disabled={automationLoading}
                      className={`${
                        automationEnabled
                          ? "bg-[var(--color-atoll)]"
                          : "bg-gray-200 dark:bg-gray-600"
                      } relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-atoll)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span
                        className={`${
                          automationEnabled ? "translate-x-5 sm:translate-x-6" : "translate-x-1"
                        } inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                    {automationLoading && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-atoll)] border-t-transparent"></div>
                    )}
                  </div>
                </div>
              </div>

              <div
                ref={conversationContainerRef}
                className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4"
              >
                {conversationLoadingMore && (
                  <div className="flex justify-center py-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-[var(--color-atoll)]"></div>
                  </div>
                )}

                {conversationLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-[var(--color-atoll)]"></div>
                  </div>
                ) : conversation.length > 0 ? (
                  conversation.map((message, index) => {
                    const isOutbound = message.direction === "outbound";
                    const messageText = message.message_body || message.message || message.body || message.content || "";
                    const messageId = message.twilio_message_sid || message.id || index;
                    const messageDate = message.created_at || message.sent_at || message.timestamp;
                    
                    return (
                      <div
                        key={messageId}
                        className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-2 sm:p-3 ${
                            isOutbound
                              ? "bg-[var(--color-atoll)] text-white"
                              : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                          }`}
                        >
                          <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{messageText}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOutbound
                                ? "text-blue-100"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {formatDate(messageDate)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No messages yet
                  </div>
                )}
                <div ref={conversationEndRef} />
              </div>

              {/* Reply Input */}
              <div className="border-t border-gray-200 p-3 sm:p-4 dark:border-gray-700 flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    placeholder="Type your message..."
                    rows={2}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 text-sm text-gray-900 focus:border-[var(--color-atoll)] focus:ring-2 focus:ring-[var(--color-atoll)] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 resize-none"
                    disabled={sendingReply}
                  />
                 <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sendingReply || !selectedLead}
                  className="
                    rounded-lg bg-[var(--color-atoll)]
                    px-3 sm:px-4 h-10 sm:h-auto
                    text-sm font-medium text-white 
                    hover:bg-[var(--color-atoll)]/90 
                    disabled:opacity-50 disabled:cursor-not-allowed 
                    dark:bg-blue-600 dark:hover:bg-blue-700
                    flex items-center justify-center
                    whitespace-nowrap
                  "
                >
                  {sendingReply ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    "Send"
                  )}
                </button>

                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Select a lead to view conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmsConversation;

