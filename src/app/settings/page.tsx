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
  UserPlus,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "tags" | "users" | "notifications" | "appearance";

const tabs: { id: Tab; label: string; icon: typeof SettingsIcon }[] = [
  { id: "tags", label: "Tags", icon: Tags },
  { id: "users", label: "Usuários", icon: Users },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "appearance", label: "Aparência", icon: Palette },
];

const mockTags = [
  { id: "1", name: "Quente", color: "#EF4444", count: 12 },
  { id: "2", name: "Frio", color: "#3B82F6", count: 8 },
  { id: "3", name: "Follow-up", color: "#F97316", count: 24 },
  { id: "4", name: "Qualificado", color: "#22C55E", count: 15 },
  { id: "5", name: "Negociando", color: "#8B5CF6", count: 6 },
  { id: "6", name: "Convertido", color: "#10B981", count: 3 },
];

const mockUsers = [
  {
    id: "1",
    name: "Guilherme Giorgi",
    email: "guilherme@atus.com.br",
    role: "admin",
    status: "active",
  },
  {
    id: "2",
    name: "Carlos Silva",
    email: "carlos@atus.com.br",
    role: "corretor",
    status: "active",
  },
  {
    id: "3",
    name: "Ana Paula",
    email: "ana@atus.com.br",
    role: "corretor",
    status: "inactive",
  },
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

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-DD bg-dd-surface border border-dd-border-subtle",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("tags");
  const [tags] = useState(mockTags);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [notifications, setNotifications] = useState(mockNotifications);

  const toggleNotification = (id: string, enabled: boolean) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled } : n)),
    );
  };

  return (
    <div className="flex flex-1 h-full bg-dd-primary">
      {/* Sidebar - estilo DarkDesk */}
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
              <button className="flex items-center gap-2 px-4 py-2 bg-dd-accent-green text-white rounded-DD text-sm font-medium hover:bg-[#17a348] transition-colors">
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
                    <button className="p-1.5 text-dd-muted hover:text-dd-on-surface rounded transition-colors">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button className="p-1.5 text-dd-muted hover:text-dd-accent-red rounded transition-colors">
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
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-dd-on-primary">
                  Usuários
                </h2>
                <p className="text-sm text-dd-muted mt-1">
                  Gerencie usuários e permissões do sistema
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-dd-accent-green text-white rounded-DD text-sm font-medium hover:bg-[#17a348] transition-colors">
                <UserPlus className="h-4 w-4" />
                Novo Usuário
              </button>
            </div>

            <div className="space-y-1">
              {mockUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-DD bg-dd-surface border border-dd-border-subtle hover:border-dd-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-dd-surface-raised flex items-center justify-center text-dd-muted font-medium text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dd-on-surface">
                        {user.name}
                      </p>
                      <p className="text-xs text-dd-muted">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded",
                        user.status === "active"
                          ? "bg-dd-accent-green/20 text-dd-accent-green"
                          : "bg-dd-surface-raised text-dd-muted",
                      )}
                    >
                      {user.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                    <span className="text-xs text-dd-muted bg-dd-surface-raised px-2 py-1 rounded capitalize">
                      {user.role}
                    </span>
                    <button className="p-1.5 text-dd-muted hover:text-dd-on-surface rounded transition-colors">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
              {/* Theme Selection */}
              <Card className="p-4">
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
              </Card>

              {/* Accent Color */}
              <Card className="p-4">
                <h3 className="text-sm font-medium text-dd-on-surface mb-3 flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Cor de Destaque
                </h3>
                <div className="flex gap-3">
                  {["#22C55E", "#3B82F6", "#8B5CF6", "#F97316", "#EF4444"].map(
                    (color) => (
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
                    ),
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
