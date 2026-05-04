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

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

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

  const loadConversationDetail = useCallback(
    async (leadId: string, refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setDetailLoading(true);
      }
      const result = await api.getInboxConversationDetail(leadId);

      if (result.error || !result.data) {
        setDetailLoading(false);
        setIsRefreshing(false);
        return;
      }

      setSelectedConversation(result.data);
      setDetailLoading(false);
      setIsRefreshing(false);
    },
    [],
  );

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

    const result = await api.sendInboxMessage(selectedLeadId, {
      message: message.trim(),
      actor_name: "Dashboard",
      actor_type: "admin",
      introduce_actor: false,
    });

    if (result.error) {
      showToast("Erro ao enviar mensagem", "error");
    } else {
      await loadConversationDetail(selectedLeadId, true);
      await loadInbox();
    }
  };

  const handleSendMedia = async (
    type: "image" | "video" | "document" | "sticker",
    file: File,
  ) => {
    if (!selectedLeadId) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      let result;

      switch (type) {
        case "image":
          result = await api.sendInboxImage(
            selectedLeadId,
            base64,
            undefined,
            "Dashboard",
            "admin",
          );
          break;
        case "video":
          result = await api.sendInboxVideo(
            selectedLeadId,
            base64,
            undefined,
            "Dashboard",
            "admin",
          );
          break;
        case "document":
          result = await api.sendInboxDocument(
            selectedLeadId,
            base64,
            file.name,
            undefined,
            "Dashboard",
            "admin",
          );
          break;
        case "sticker":
          result = await api.sendInboxSticker(
            selectedLeadId,
            base64,
            "Dashboard",
            "admin",
          );
          break;
      }

      if (result?.error) {
        showToast(`Erro ao enviar ${type}: ${result.error}`, "error");
      } else {
        showToast(`${type} enviado com sucesso`, "success");
        await loadConversationDetail(selectedLeadId, true);
        await loadInbox();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendAudio = async (audioBlob: Blob) => {
    if (!selectedLeadId) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const result = await api.sendInboxAudio(
        selectedLeadId,
        base64,
        "Dashboard",
        "admin",
      );

      if (result.error) {
        showToast(`Erro ao enviar áudio: ${result.error}`, "error");
      } else {
        showToast("Áudio enviado com sucesso", "success");
        await loadConversationDetail(selectedLeadId, true);
        await loadInbox();
      }
    };
    reader.readAsDataURL(audioBlob);
  };

  const handleSendLocation = async (
    lat: number,
    lng: number,
    title?: string,
  ) => {
    if (!selectedLeadId) return;

    const result = await api.sendInboxLocation(
      selectedLeadId,
      lat,
      lng,
      title,
      "Dashboard",
      "admin",
    );

    if (result.error) {
      showToast(`Erro ao enviar localização: ${result.error}`, "error");
    } else {
      showToast("Localização enviada com sucesso", "success");
      await loadConversationDetail(selectedLeadId, true);
      await loadInbox();
    }
  };

  const handleSendContact = async (name: string, phone: string) => {
    if (!selectedLeadId) return;

    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEND:VCARD`;
    const result = await api.sendInboxContact(
      selectedLeadId,
      name,
      vcard,
      "Dashboard",
      "admin",
    );

    if (result.error) {
      showToast(`Erro ao enviar contato: ${result.error}`, "error");
    } else {
      showToast("Contato enviado com sucesso", "success");
      await loadConversationDetail(selectedLeadId, true);
      await loadInbox();
    }
  };

  return (
    <div className="relative flex flex-1 h-full bg-dd-primary overflow-hidden">
      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div className="absolute top-4 right-4 z-[100] flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm shadow-lg animate-slide-in-up ${
                toast.type === "error"
                  ? "bg-dd-accent-red-muted border border-dd-accent-red/30 text-dd-accent-red"
                  : "bg-dd-accent-green-muted border border-dd-accent-green/30 text-dd-accent-green"
              }`}
            >
              <span className="flex-1">{toast.message}</span>
              <button
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
                className="text-current opacity-60 hover:opacity-100"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Conversation List - 320px */}
      <div className="w-80 flex-shrink-0 h-full border-r border-dd-border-subtle overflow-hidden">
        <ConversationList
          conversations={conversations}
          selectedId={selectedLeadId}
          onSelect={handleSelectConversation}
          isLoading={loading}
        />
      </div>

      {/* Chat Area - flex-1 */}
      <div className="flex flex-1 flex-col min-h-0">
        <ChatHeader
          conversation={selectedConversation}
          isLoading={detailLoading}
        />
        <ChatArea
          conversation={selectedConversation}
          isLoading={detailLoading && !isRefreshing}
        />
        {selectedConversation && (
          <ChatInput
            onSend={handleSendMessage}
            onSendMedia={handleSendMedia}
            onSendLocation={handleSendLocation}
            onSendContact={handleSendContact}
            onAudio={handleSendAudio}
            disabled={detailLoading}
            placeholder="Digite uma mensagem..."
          />
        )}
      </div>
    </div>
  );
}
