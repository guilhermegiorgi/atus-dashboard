"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Tags,
  Users,
  Bell,
  Palette,
  Plus,
  Trash2,
  Edit3,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UsersManager } from "@/components/settings/UsersManager";

type Tab = "tags" | "users" | "notifications" | "appearance";

const tabs: { id: Tab; label: string; icon: typeof SettingsIcon }[] = [
  { id: "tags", label: "Tags", icon: Tags },
  { id: "users", label: "Usuários", icon: Users },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "appearance", label: "Aparência", icon: Palette },
];

const COLOR_OPTIONS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#6B7280",
];

interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

const mockTags: Tag[] = [
  { id: "1", name: "Quente", color: "#EF4444", count: 12 },
  { id: "2", name: "Frio", color: "#3B82F6", count: 8 },
  { id: "3", name: "Follow-up", color: "#F97316", count: 24 },
  { id: "4", name: "Qualificado", color: "#22C55E", count: 15 },
  { id: "5", name: "Negociando", color: "#8B5CF6", count: 6 },
  { id: "6", name: "Convertido", color: "#10B981", count: 3 },
];

const mockNotifications = [
  {
    id: "1",
    title: "Novo lead recebido",
    description: "Receber notificação quando um novo lead entrar em contato",
    enabled: true,
    channel: "all",
  },
  {
    id: "2",
    title: "Lead quente",
    description: "Notificar quando um lead for marcado como quente",
    enabled: true,
    channel: "email",
  },
  {
    id: "3",
    title: "Follow-up pendente",
    description: "Lembrar sobre leads que precisam de follow-up",
    enabled: true,
    channel: "push",
  },
  {
    id: "4",
    title: "Mensagem não respondida",
    description: "Alertar quando houver mensagens sem resposta",
    enabled: false,
    channel: "all",
  },
  {
    id: "5",
    title: "Conversão realizada",
    description: "Notificar quando um lead for convertido",
    enabled: true,
    channel: "all",
  },
];

function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        "w-11 h-6 rounded-full transition-colors relative shrink-0",
        enabled ? "bg-dd-accent-green" : "bg-dd-border-subtle",
      )}
    >
      <span
        className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
          enabled ? "left-6" : "left-1",
        )}
      />
    </button>
  );
}

function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-dd-surface border border-dd-border-subtle rounded-DD w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-dd-border-subtle">
          <h3 className="text-lg font-semibold text-dd-on-primary">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-dd-muted hover:text-dd-on-surface rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function TagModal({
  isOpen,
  onClose,
  tag,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  tag?: Tag | null;
  onSave: (tag: Tag) => void;
}) {
  const [name, setName] = useState(tag?.name || "");
  const [color, setColor] = useState(tag?.color || COLOR_OPTIONS[0]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: tag?.id || Date.now().toString(),
      name: name.trim(),
      color,
      count: tag?.count || 0,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tag ? "Editar Tag" : "Nova Tag"}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dd-on-surface mb-2">
            Nome da Tag
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Quente, Frio, Follow-up..."
            className="w-full px-3 py-2 bg-dd-primary border border-dd-border-subtle rounded-DD text-dd-on-surface placeholder:text-dd-muted focus:outline-none focus:border-dd-accent-green"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dd-on-surface mb-2">
            Cor
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all",
                  color === c
                    ? "border-white scale-110"
                    : "border-transparent hover:scale-105",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-dd-muted hover:text-dd-on-surface"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-dd-accent-green text-white rounded-DD text-sm font-medium hover:bg-[#17a348] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-4 w-4" />
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-dd-surface border border-dd-border-subtle rounded-DD w-full max-w-sm mx-4 shadow-2xl">
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-dd-accent-red/20 flex items-center justify-center mb-4">
            <Trash2 className="h-6 w-6 text-dd-accent-red" />
          </div>
          <h3 className="text-lg font-semibold text-dd-on-primary mb-2">
            {title}
          </h3>
          <p className="text-sm text-dd-muted mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm text-dd-muted hover:text-dd-on-surface border border-dd-border-subtle rounded-DD"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 text-sm bg-dd-accent-red text-white rounded-DD hover:bg-red-600 transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("tags");
  const [tags, setTags] = useState<Tag[]>(mockTags);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [notifications, setNotifications] = useState(mockNotifications);

  // Modal states
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);

  const toggleNotification = (id: string, enabled: boolean) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled } : n)),
    );
  };

  const handleNewTag = () => {
    setEditingTag(null);
    setTagModalOpen(true);
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagModalOpen(true);
  };

  const handleDeleteTag = (tag: Tag) => {
    setDeletingTag(tag);
    setDeleteModalOpen(true);
  };

  const handleSaveTag = (tag: Tag) => {
    if (editingTag) {
      setTags((prev) => prev.map((t) => (t.id === tag.id ? tag : t)));
    } else {
      setTags((prev) => [...prev, tag]);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingTag) {
      setTags((prev) => prev.filter((t) => t.id !== deletingTag.id));
    }
    setDeleteModalOpen(false);
    setDeletingTag(null);
  };

  return (
    <div className="flex flex-1 h-full bg-dd-primary">
      {/* Sidebar */}
      <div className="w-56 border-r border-dd-border-subtle bg-dd-primary flex flex-col">
        <div className="p-4 border-b border-dd-border-subtle">
          <h1 className="flex items-center gap-2 text-lg font-semibold text-dd-on-primary">
            <SettingsIcon className="h-5 w-5" />
            Configurações
          </h1>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 rounded-DD px-3 py-2.5 text-left text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-dd-surface-raised text-dd-on-primary"
                  : "text-dd-muted hover:bg-dd-surface hover:text-dd-on-surface",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <ChevronRight
                className={cn(
                  "h-3 w-3 ml-auto transition-transform",
                  activeTab === tab.id ? "rotate-90" : "opacity-0",
                )}
              />
            </button>
          ))}
        </nav>
      </div>

      {/* Área de conteúdo */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === "tags" && (
          <div className="max-w-3xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-dd-on-primary">
                  Gerenciar Tags
                </h2>
                <p className="text-sm text-dd-muted mt-1">
                  Crie e gerencie tags para classificar seus leads
                </p>
              </div>
              <button
                onClick={handleNewTag}
                className="flex items-center gap-2 px-4 py-2 bg-dd-accent-green text-white rounded-DD text-sm font-medium hover:bg-[#17a348] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nova Tag
              </button>
            </div>

            <div className="space-y-1">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 rounded-DD bg-dd-surface border border-dd-border-subtle hover:border-dd-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm font-medium text-dd-on-surface">
                      {tag.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dd-muted mr-2">
                      {tag.count} leads
                    </span>
                    <button
                      onClick={() => handleEditTag(tag)}
                      className="p-1.5 text-dd-muted hover:text-dd-on-surface rounded transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag)}
                      className="p-1.5 text-dd-muted hover:text-dd-accent-red rounded transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="max-w-3xl">
            <UsersManager />
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="max-w-3xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-dd-on-primary">
                Notificações
              </h2>
              <p className="text-sm text-dd-muted mt-1">
                Configure suas preferências de notificação
              </p>
            </div>

            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-3 rounded-DD bg-dd-surface border border-dd-border-subtle"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-1.5 rounded",
                        notification.enabled
                          ? "bg-dd-accent-green/20 text-dd-accent-green"
                          : "bg-dd-surface-raised text-dd-muted",
                      )}
                    >
                      {notification.channel === "email" && (
                        <Mail className="h-3.5 w-3.5" />
                      )}
                      {notification.channel === "push" && (
                        <Smartphone className="h-3.5 w-3.5" />
                      )}
                      {notification.channel === "all" && (
                        <Bell className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dd-on-surface">
                        {notification.title}
                      </p>
                      <p className="text-xs text-dd-muted">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={notification.enabled}
                    onChange={(v) => toggleNotification(notification.id, v)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="max-w-3xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-dd-on-primary">
                Aparência
              </h2>
              <p className="text-sm text-dd-muted mt-1">
                Personalize a aparência do sistema
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-DD bg-dd-surface border border-dd-border-subtle">
                <h3 className="text-sm font-medium text-dd-on-surface mb-3 flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Tema
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex-1 p-3 rounded-DD border transition-all",
                      theme === "dark"
                        ? "border-dd-accent-green bg-dd-accent-green/5"
                        : "border-dd-border-subtle hover:border-dd-border",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Moon className="h-4 w-4 text-dd-muted" />
                      {theme === "dark" && (
                        <span className="w-2 h-2 rounded-full bg-dd-accent-green" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-dd-on-surface text-left">
                      Escuro
                    </p>
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex-1 p-3 rounded-DD border transition-all",
                      theme === "light"
                        ? "border-dd-accent-green bg-dd-accent-green/5"
                        : "border-dd-border-subtle hover:border-dd-border",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Sun className="h-4 w-4 text-dd-muted" />
                      {theme === "light" && (
                        <span className="w-2 h-2 rounded-full bg-dd-accent-green" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-dd-on-surface text-left">
                      Claro
                    </p>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-DD bg-dd-surface border border-dd-border-subtle">
                <h3 className="text-sm font-medium text-dd-on-surface mb-3 flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Cor de Destaque
                </h3>
                <div className="flex gap-3">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "w-9 h-9 rounded-full border-2 transition-all",
                        color === "#22C55E"
                          ? "border-white"
                          : "border-transparent hover:border-dd-border",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      <TagModal
        isOpen={tagModalOpen}
        onClose={() => {
          setTagModalOpen(false);
          setEditingTag(null);
        }}
        tag={editingTag}
        onSave={handleSaveTag}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingTag(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Tag"
        message={`Tem certeza que deseja excluir a tag "${deletingTag?.name}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
