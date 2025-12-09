import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import SharedSidebar from "../components/SharedSidebar";
import { smsService } from "utils/apiService";
import { toast } from "sonner";
import moment from "moment";

const SmsConversation = () => {
  const { mortgage_id, lead_member_id } = useParams();
  const navigate = useNavigate();
  const conversationEndRef = useRef(null);
  const conversationContainerRef = useRef(null);

  // Lead list state
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Conversation state
  const [selectedLead, setSelectedLead] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationPage, setConversationPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [conversationLoadingMore, setConversationLoadingMore] = useState(false);

  // Get local timezone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Fetch leads list
  const fetchLeads = useCallback(async (page = currentPage, itemsPerPage = perPage) => {
    setLeadsLoading(true);
    try {
      const response = await smsService.getSentLeadsPaginated({
        page,
        per_page: itemsPerPage,
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
  }, [currentPage, perPage]);

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
    const leadMemberId = lead.lead_member_id || lead.mailing_assignee_id;
    if (leadMemberId) {
      fetchConversation(leadMemberId, 1, false);
      // Update URL without navigation
      navigate(`/sms-conversation/${lead.mortgage_id || lead.mortgage_id}/${leadMemberId}`, {
        replace: true,
      });
    }
  };

  // Handle scroll to load more messages
  const handleScroll = useCallback(() => {
    if (!conversationContainerRef.current || conversationLoadingMore || !hasMoreMessages) return;

    const container = conversationContainerRef.current;
    // Load more when scrolled near the top (within 100px)
    if (container.scrollTop < 100) {
      const leadMemberId =
        selectedLead?.lead_member_id ||
        selectedLead?.mailing_assignee_id ||
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
    fetchLeads(1, perPage);
  }, [perPage]);

  // Select lead from URL params
  useEffect(() => {
    if (mortgage_id && lead_member_id && leads.length > 0) {
      const lead = leads.find(
        (l) =>
          (l.mortgage_id === mortgage_id || l.mortgage_id?.toString() === mortgage_id) &&
          (l.lead_member_id === lead_member_id ||
            l.lead_member_id?.toString() === lead_member_id ||
            l.mailing_assignee_id === lead_member_id ||
            l.mailing_assignee_id?.toString() === lead_member_id)
      );
      if (lead && (!selectedLead || selectedLead.mortgage_id !== lead.mortgage_id)) {
        handleSelectLead(lead);
      }
    }
  }, [mortgage_id, lead_member_id, leads]);

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
      fetchLeads(newPage, perPage);
    }
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    fetchLeads(1, newPerPage);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return moment(dateString).format("MMM DD, YYYY h:mm A");
  };

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      <SharedSidebar currentPath="/sms-conversation" />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Lead List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-[var(--color-atoll)] dark:text-blue-400 mb-4">
              SMS Conversations
            </h2>

            {/* Search */}
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-gray-900 focus:border-[var(--color-atoll)] focus:ring-2 focus:ring-[var(--color-atoll)] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Leads List */}
          <div className="flex-1 overflow-y-auto p-4">
            {leadsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-[var(--color-atoll)]"></div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {leads
                    .filter((lead) => {
                      if (!searchTerm) return true;
                      const search = searchTerm.toLowerCase();
                      return (
                        (lead.full_name || lead.name || "").toLowerCase().includes(search) ||
                        (lead.phone || "").toLowerCase().includes(search)
                      );
                    })
                    .map((lead) => {
                      const isSelected =
                        selectedLead?.mortgage_id === lead.mortgage_id &&
                        (selectedLead?.lead_member_id === lead.lead_member_id ||
                          selectedLead?.mailing_assignee_id === lead.mailing_assignee_id);
                      return (
                        <div
                          key={`${lead.mortgage_id}-${lead.lead_member_id || lead.mailing_assignee_id}`}
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
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {lead.phone || "N/A"}
                          </p>
                        </div>
                      );
                    })}
                </div>

                {/* Pagination */}
                {totalRecords > 0 && (
                  <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-600">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Showing {(currentPage - 1) * perPage + 1} to{" "}
                        {Math.min(currentPage * perPage, totalRecords)} of {totalRecords}
                      </div>
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
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {selectedLead ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {selectedLead.full_name || selectedLead.name || "Unknown"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedLead.phone || "N/A"}
                </p>
              </div>

              <div
                ref={conversationContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
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
                  conversation.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`flex ${message.direction === "outbound" || message.type === "sent" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.direction === "outbound" || message.type === "sent"
                            ? "bg-[var(--color-atoll)] text-white"
                            : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                        }`}
                      >
                        <p className="text-sm">{message.message || message.body || message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.direction === "outbound" || message.type === "sent"
                              ? "text-blue-100"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {formatDate(message.created_at || message.sent_at || message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No messages yet
                  </div>
                )}
                <div ref={conversationEndRef} />
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

