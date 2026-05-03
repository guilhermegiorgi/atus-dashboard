"use client";

import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Tags,
  Users,
  Bell,
  Palette,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api/client";
import type { UserNotificationSettings } from "@/types/leads";
import { UsersManager } from "@/components/settings/UsersManager";
import { TagsManager } from "@/components/settings/TagsManager";

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
  "#1DB954",
  "#14B8A6",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#6B7280",
];

const ACCENT_COLOR = "#1DB954";

// TODO: obter de contexto de auth
const CURRENT_USER_ID = "1";

function applyTheme(theme: "dark" | "light") {
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
  }
  localStorage.setItem("atus-theme", theme);
}

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  channel: "email" | "push" | "all";
};

function settingsToNotifications(
  s: UserNotificationSettings,
): NotificationItem[] {
  return [
    {
      id: "new_lead",
      title: "Novo lead recebido",
      description: "Receber notificação quando um novo lead entrar em contato",
      enabled:
        s.notification_types.new_lead &&
        (s.email_notifications || s.push_notifications),
      channel: "all",
    },
    {
      id: "lead_conversion",
      title: "Conversão realizada",
      description: "Notificar quando um lead for convertido",
      enabled:
        s.notification_types.lead_conversion &&
        (s.email_notifications || s.push_notifications),
      channel: "all",
    },
    {
      id: "follow_up_reminder",
      title: "Follow-up pendente",
      description: "Lembrar sobre leads que precisam de follow-up",
      enabled: s.notification_types.follow_up_reminder && s.push_notifications,
      channel: "push",
    },
    {
      id: "intervention_alert",
      title: "Mensagem não respondida",
      description: "Alertar quando houver mensagens sem resposta",
      enabled:
        s.notification_types.intervention_alert &&
        (s.email_notifications || s.push_notifications),
      channel: "all",
    },
  ];
}

function buildPayload(
  current: UserNotificationSettings,
  notificationId: string,
  enabled: boolean,
): UserNotificationSettings {
  const types = { ...current.notification_types };

  switch (notificationId) {
    case "new_lead":
      types.new_lead = enabled;
      break;
    case "lead_conversion":
      types.lead_conversion = enabled;
      break;
    case "follow_up_reminder":
      types.follow_up_reminder = enabled;
      break;
    case "intervention_alert":
      types.intervention_alert = enabled;
      break;
  }

  return { ...current, notification_types: types };
}

function ToggleSwitch({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? "Desativar" : "Ativar"}
      onClick={() => onChange(!enabled)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChange(!enabled);
        }
      }}
      className={cn(
        "w-11 h-6 rounded-full transition-colors relative shrink-0",
        enabled ? "bg-dd-accent-green" : "bg-dd-border-subtle",
      )}
    >
      <span
        className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-dd-on-primary transition-transform",
          enabled ? "left-6" : "left-1",
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("tags");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [rawSettings, setRawSettings] =
    useState<UserNotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await api.getUserNotifications(CURRENT_USER_ID);
        if (result.data) {
          setRawSettings(result.data);
          setNotifications(settingsToNotifications(result.data));
        } else {
          setError(result.message || "Erro ao carregar notificações");
        }
      } catch {
        setError("Erro ao carregar notificações");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Initialize theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("atus-theme") as "dark" | "light" | null;
    const initial = saved || "dark";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggleNotification = async (id: string, enabled: boolean) => {
    if (!rawSettings) return;

    const updated = buildPayload(rawSettings, id, enabled);
    setRawSettings(updated);
    setNotifications(settingsToNotifications(updated));

    try {
      await api.updateUserNotifications(CURRENT_USER_ID, updated);
    } catch {
      setRawSettings(rawSettings);
      setNotifications(settingsToNotifications(rawSettings));
    }
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
              aria-label={`Aba ${tab.label}`}
              className={cn(
                "w-full flex items-center gap-3 rounded-DD px-3 py-2.5 text-left text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-dd-accent-green",
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
            <TagsManager />
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

            {loading && (
              <div className="space-y-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-DD bg-dd-surface border border-dd-border-subtle"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-7 w-7 rounded" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-56" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded bg-dd-accent-red/10 border border-dd-accent-red/20 text-dd-accent-red text-sm">
                {error}
              </div>
            )}

            {!loading && !error && (
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
            )}
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
                    onClick={() => {
                      setTheme("dark");
                      applyTheme("dark");
                    }}
                    aria-label="Tema escuro"
                    className={cn(
                      "flex-1 p-3 rounded-DD border transition-all focus-visible:ring-2 focus-visible:ring-dd-accent-green",
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
                    onClick={() => {
                      setTheme("light");
                      applyTheme("light");
                    }}
                    aria-label="Tema claro"
                    className={cn(
                      "flex-1 p-3 rounded-DD border transition-all focus-visible:ring-2 focus-visible:ring-dd-accent-green",
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
                      aria-label={`Cor ${color}`}
                      className={cn(
                        "w-9 h-9 rounded-full border-2 transition-all focus-visible:ring-2 focus-visible:ring-dd-accent-green",
                        color === ACCENT_COLOR
                          ? "border-dd-on-primary"
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
    </div>
  );
}
