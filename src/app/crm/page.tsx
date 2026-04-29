"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ConversationList,
  ChatHeader,
  ChatArea,
  ChatInput,
} from "@/components/darkdesk";
import { api } from "@/lib/api/client";
import {
  InboxConversationDetail,
  InboxConversationFilters,
  InboxConversationSummary,
} from "@/types/dashboard";

const PAGE_SIZE = 20;

export default function CRMPage() {
  const [filters] = useState<InboxConversationFilters>({
    limit: PAGE_SIZE,
    offset: 0,
  });
  const [conversations, setConversations] = useState<
    InboxConversationSummary[]
  >([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<InboxConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadInbox = useCallback(async () => {
    setLoading(true);

    const result = await api.getInboxConversations(filters);

    if (result.error || !result.data) {
      setLoading(false);
      return;
    }

    const nextConversations = result.data.data;
    setConversations(nextConversations);

    // Auto-select first conversation
    if (nextConversations.length > 0 && !selectedLeadId) {
      setSelectedLeadId(nextConversations[0].lead_id);
    }

    setLoading(false);
  }, [filters, selectedLeadId]);

  const loadConversationDetail = useCallback(async (leadId: string) => {
    setDetailLoading(true);
    const result = await api.getInboxConversationDetail(leadId);

    if (result.error || !result.data) {
      setDetailLoading(false);
      return;
    }

    setSelectedConversation(result.data);
    setDetailLoading(false);
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    if (!selectedLeadId) {
      setSelectedConversation(null);
      return;
    }
    loadConversationDetail(selectedLeadId);
  }, [selectedLeadId, loadConversationDetail]);

  const handleSelectConversation = (id: string) => {
    setSelectedLeadId(id);
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedLeadId || !message.trim()) return;

    await api.sendInboxMessage(selectedLeadId, {
      message: message.trim(),
      actor_name: "Dashboard",
      actor_type: "admin",
      introduce_actor: false,
    });

    // Refresh conversation
    await loadConversationDetail(selectedLeadId);
    await loadInbox();
  };

  return (
    <div className="flex flex-1 bg-dd-primary">
      {/* Conversation List - 320px */}
      <div className="w-80 flex-shrink-0 border-r border-dd-border-subtle">
        <ConversationList
          conversations={conversations}
          selectedId={selectedLeadId}
          onSelect={handleSelectConversation}
          isLoading={loading}
        />
      </div>

      {/* Chat Area - flex-1 */}
      <div className="flex flex-1 flex-col min-w-0">
        <ChatHeader
          conversation={selectedConversation}
          isLoading={detailLoading}
        />
        <ChatArea
          conversation={selectedConversation}
          isLoading={detailLoading}
        />
        {selectedConversation && (
          <ChatInput
            onSend={handleSendMessage}
            disabled={detailLoading}
            placeholder="Digite uma mensagem..."
          />
        )}
      </div>
    </div>
  );
}
