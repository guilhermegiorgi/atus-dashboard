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
import { Corretor } from "@/types/leads";
import { X, ShieldAlert } from "lucide-react";

const PAGE_SIZE = 20;
const ACTOR_NAME = "Dashboard";
const ACTOR_TYPE = "admin";

const MUTABLE_STATES = [
  "TRIAGE_HUMAN",
  "HUMAN_ACTIVE",
  "HUMAN_STANDBY",
  "CLOSED",
] as const;

function stateLabel(state: string) {
  switch (state) {
    case "TRIAGE_HUMAN":
      return "Triagem humana";
    case "ASSIGNED_TO_BROKER":
      return "Atribuída";
    case "HUMAN_ACTIVE":
      return "Humano ativo";
    case "HUMAN_STANDBY":
      return "Em espera";
    case "RETURNED_TO_BOT":
      return "Devolvida ao bot";
    case "CLOSED":
      return "Fechada";
    default:
      return state || "-";
  }
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function CRMPage() {
  const [filters, setFilters] = useState<InboxConversationFilters>({
    limit: PAGE_SIZE,
    offset: 0,
  });
  const [meta, setMeta] = useState({ total: 0, limit: PAGE_SIZE, offset: 0 });
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
  const [corretores, setCorretores] = useState<Corretor[]>([]);

  // Detail panel state
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  // Assign modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignCorretorId, setAssignCorretorId] = useState("");
  const [assignNote, setAssignNote] = useState("");

  // State change modal
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [stateValue, setStateValue] = useState("HUMAN_STANDBY");
  const [stateReason, setStateReason] = useState("");

  // Return to bot modal
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");

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
    setMeta(result.data.meta);

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

  // Load corretores once
  useEffect(() => {
    api.getCorretores().then((r) => {
      if (r.data) setCorretores(r.data);
    });
  }, []);

  const handleSelectConversation = (id: string) => {
    setSelectedLeadId(id);
  };

  const refreshSelected = async () => {
    if (selectedLeadId) {
      await loadConversationDetail(selectedLeadId, true);
    }
    await loadInbox();
  };

  // --- Chat actions ---
  const handleSendMessage = async (message: string) => {
    if (!selectedLeadId || !message.trim()) return;

    const result = await api.sendInboxMessage(selectedLeadId, {
      message: message.trim(),
      actor_name: ACTOR_NAME,
      actor_type: ACTOR_TYPE,
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
            ACTOR_NAME,
            ACTOR_TYPE,
          );
          break;
        case "video":
          result = await api.sendInboxVideo(
            selectedLeadId,
            base64,
            undefined,
            ACTOR_NAME,
            ACTOR_TYPE,
          );
          break;
        case "document":
          result = await api.sendInboxDocument(
            selectedLeadId,
            base64,
            file.name,
            undefined,
            ACTOR_NAME,
            ACTOR_TYPE,
          );
          break;
        case "sticker":
          result = await api.sendInboxSticker(
            selectedLeadId,
            base64,
            ACTOR_NAME,
            ACTOR_TYPE,
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
        ACTOR_NAME,
        ACTOR_TYPE,
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
      ACTOR_NAME,
      ACTOR_TYPE,
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
      ACTOR_NAME,
      ACTOR_TYPE,
    );

    if (result.error) {
      showToast(`Erro ao enviar contato: ${result.error}`, "error");
    } else {
      showToast("Contato enviado com sucesso", "success");
      await loadConversationDetail(selectedLeadId, true);
      await loadInbox();
    }
  };

  // --- Operational actions ---
  const handleHeaderAction = (action: string) => {
    switch (action) {
      case "view":
        setDetailPanelOpen(true);
        break;
      case "assign":
        setAssignCorretorId(selectedConversation?.assigned_corretor_id ?? "");
        setAssignNote("");
        setAssignModalOpen(true);
        break;
      case "intervene":
        setStateValue(
          selectedConversation &&
            MUTABLE_STATES.includes(
              selectedConversation.conversation_state as (typeof MUTABLE_STATES)[number],
            )
            ? selectedConversation.conversation_state
            : "HUMAN_STANDBY",
        );
        setStateReason("");
        setStateModalOpen(true);
        break;
      case "release":
        setReturnReason("");
        setReturnModalOpen(true);
        break;
    }
  };

  const handleAssign = async () => {
    if (!selectedLeadId || !assignCorretorId) return;

    const result = await api.assignInboxConversation(selectedLeadId, {
      assigned_corretor_id: assignCorretorId,
      assigned_by: ACTOR_NAME,
      note: assignNote || undefined,
    });

    if (result.error) {
      showToast(`Erro ao atribuir: ${result.error}`, "error");
    } else {
      showToast("Conversa atribuída com sucesso", "success");
      setAssignModalOpen(false);
      await refreshSelected();
    }
  };

  const handleStateChange = async () => {
    if (!selectedLeadId) return;

    const result = await api.updateInboxConversationState(selectedLeadId, {
      state: stateValue,
      actor_name: ACTOR_NAME,
      reason: stateReason || undefined,
    });

    if (result.error) {
      showToast(`Erro ao alterar estado: ${result.error}`, "error");
    } else {
      showToast("Estado atualizado com sucesso", "success");
      setStateModalOpen(false);
      await refreshSelected();
    }
  };

  const handleReturnToBot = async () => {
    if (!selectedLeadId) return;

    const result = await api.returnInboxConversationToBot(selectedLeadId, {
      actor_name: ACTOR_NAME,
      reason: returnReason || undefined,
    });

    if (result.error) {
      showToast(`Erro ao devolver: ${result.error}`, "error");
    } else {
      showToast("Conversa devolvida ao bot", "success");
      setReturnModalOpen(false);
      await refreshSelected();
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

      {/* Assign Modal */}
      {assignModalOpen && (
        <Modal
          onClose={() => setAssignModalOpen(false)}
          title="Atribuir corretor"
        >
          <div className="space-y-3">
            {corretores.length === 0 ? (
              <p className="text-xs text-dd-on-muted">
                Nenhum corretor disponível
              </p>
            ) : (
              <select
                value={assignCorretorId}
                onChange={(e) => setAssignCorretorId(e.target.value)}
                className="h-9 w-full rounded-dd bg-dd-surface-raised border border-dd-border-subtle px-2 text-sm text-dd-on-surface focus:border-dd-accent-green focus:outline-none"
              >
                <option value="">Selecione um corretor</option>
                {corretores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              placeholder="Nota (opcional)"
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
              className="h-9 w-full rounded-dd bg-dd-surface-raised border border-dd-border-subtle px-3 text-sm text-dd-on-surface placeholder:text-dd-muted focus:border-dd-accent-green focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="rounded-dd px-3 py-1.5 text-sm text-dd-muted hover:text-dd-on-surface transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssign}
                disabled={!assignCorretorId || corretores.length === 0}
                className="rounded-dd bg-dd-accent-green px-3 py-1.5 text-sm text-white hover:bg-dd-green-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Atribuir
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* State Change Modal */}
      {stateModalOpen && (
        <Modal onClose={() => setStateModalOpen(false)} title="Alterar estado">
          <div className="space-y-3">
            <select
              value={stateValue}
              onChange={(e) => setStateValue(e.target.value)}
              className="h-9 w-full rounded-dd bg-dd-surface-raised border border-dd-border-subtle px-2 text-sm text-dd-on-surface focus:border-dd-accent-green focus:outline-none"
            >
              {MUTABLE_STATES.map((s) => (
                <option key={s} value={s}>
                  {stateLabel(s)}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Motivo (opcional)"
              value={stateReason}
              onChange={(e) => setStateReason(e.target.value)}
              className="h-9 w-full rounded-dd bg-dd-surface-raised border border-dd-border-subtle px-3 text-sm text-dd-on-surface placeholder:text-dd-muted focus:border-dd-accent-green focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setStateModalOpen(false)}
                className="rounded-dd px-3 py-1.5 text-sm text-dd-muted hover:text-dd-on-surface transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleStateChange}
                className="rounded-dd bg-dd-accent-green px-3 py-1.5 text-sm text-white hover:bg-dd-green-hover transition-colors"
              >
                Atualizar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Return to Bot Modal */}
      {returnModalOpen && (
        <Modal
          onClose={() => setReturnModalOpen(false)}
          title="Devolver ao bot"
        >
          <div className="space-y-3">
            <p className="text-xs text-dd-on-muted">
              A conversa será devolvida ao bot para automação.
            </p>
            <input
              type="text"
              placeholder="Motivo (opcional)"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="h-9 w-full rounded-dd bg-dd-surface-raised border border-dd-border-subtle px-3 text-sm text-dd-on-surface placeholder:text-dd-muted focus:border-dd-accent-green focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setReturnModalOpen(false)}
                className="rounded-dd px-3 py-1.5 text-sm text-dd-muted hover:text-dd-on-surface transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReturnToBot}
                className="rounded-dd bg-dd-accent-orange px-3 py-1.5 text-sm text-white hover:opacity-80 transition-colors flex items-center gap-1.5"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Devolver
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detail Side Panel */}
      {detailPanelOpen && selectedConversation && (
        <DetailPanel
          conversation={selectedConversation}
          onClose={() => setDetailPanelOpen(false)}
        />
      )}

      {/* Conversation List */}
      <div className="w-80 flex-shrink-0 h-full border-r border-dd-border-subtle overflow-hidden">
        <ConversationList
          conversations={conversations}
          selectedId={selectedLeadId}
          onSelect={handleSelectConversation}
          isLoading={loading}
          onAction={handleHeaderAction}
          filters={filters}
          onFiltersChange={setFilters}
          meta={meta}
          onPageChange={(offset) => setFilters((f) => ({ ...f, offset }))}
        />
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col min-h-0">
        <ChatHeader
          conversation={selectedConversation}
          isLoading={detailLoading}
          onAction={handleHeaderAction}
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

/* ---------- Shared modal component ---------- */

function Modal({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 cursor-pointer"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-dd-md border border-dd-border-subtle bg-dd-surface p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-dd-on-surface">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="text-dd-muted hover:text-dd-on-surface"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

/* ---------- Detail side panel ---------- */

function DetailPanel({
  conversation,
  onClose,
}: {
  conversation: InboxConversationDetail;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/40 cursor-pointer"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 z-40 w-96 border-l border-dd-border-subtle bg-dd-surface overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between border-b border-dd-border-subtle p-4">
          <h3 className="text-sm font-medium text-dd-on-primary">
            Detalhes do Lead
          </h3>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-dd-muted hover:text-dd-on-surface transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Lead info */}
          <Section title="Lead">
            <Row label="Nome" value={conversation.nome_completo} />
            <Row label="Telefone" value={conversation.telefone} />
            <Row label="Email" value={conversation.email} />
            <Row label="Atualizada" value={conversation.updated_at} />
          </Section>

          {/* Origin */}
          <Section title="Origem e Tracking">
            <Row label="Canal" value={conversation.canal_origem} />
            <Row label="Sistema" value={conversation.sistema_origem} />
            <Row label="Tracked ref" value={conversation.tracked_codigo_ref} />
            <Row label="Link click ID" value={conversation.link_click_id} />
          </Section>

          {/* Ownership */}
          <Section title="Ownership Humano">
            <Row label="Owner" value={conversation.owner_user_name} />
            <Row label="Tipo" value={conversation.owner_user_type} />
            <Row
              label="Corretor"
              value={conversation.assigned_corretor_id ?? "Não atribuído"}
            />
            <Row label="Atribuído por" value={conversation.assigned_by} />
          </Section>

          {/* Qualification */}
          <Section title="Qualificação">
            <p className="text-xs text-dd-on-surface">
              {conversation.qualification_summary || "-"}
            </p>
          </Section>

          {/* Operational status */}
          {conversation.operational_status && (
            <Section title="Status Operacional">
              <Row
                label="Ação recomendada"
                value={conversation.operational_status.recommended_action}
              />
              <Row
                label="Campos faltantes"
                value={
                  conversation.operational_status.missing_fields.join(", ") ||
                  "-"
                }
              />
              <Row
                label="Confirmação pendente"
                value={
                  conversation.operational_status.confirmation_pending
                    ? "Sim"
                    : "Não"
                }
              />
              <Row
                label="Contaminado"
                value={
                  conversation.operational_status.is_contaminated
                    ? "Sim"
                    : "Não"
                }
              />
            </Section>
          )}

          {/* Status badges */}
          <Section title="Estado">
            <div className="flex flex-wrap gap-2">
              <Badge>{stateLabel(conversation.conversation_state)}</Badge>
              {conversation.status && <Badge>{conversation.status}</Badge>}
              {conversation.fase && <Badge>{conversation.fase}</Badge>}
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-dd-md border border-dd-border-subtle p-3">
      <div className="text-[11px] uppercase tracking-wide text-dd-on-muted mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="text-[11px] text-dd-on-muted">{label}</span>
      <span className="text-xs text-dd-on-surface text-right truncate max-w-[60%]">
        {value || "-"}
      </span>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-xs bg-dd-surface-raised px-2 py-0.5 text-[10px] font-medium text-dd-on-muted">
      {children}
    </span>
  );
}
