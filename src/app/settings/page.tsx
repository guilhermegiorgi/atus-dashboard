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
  Shield,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("tags");
  const [tags] = useState(mockTags);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  return (
    <div className="flex flex-1 h-full bg-dd-primary">
      {/* Sidebar de config */}
      <div className="w-56 border-r border-dd-border-subtle bg-dd-surface flex flex-col">
        <div className="p-4 border-b border-dd-border-subtle">
          <h1 className="flex items-center gap-2 text-lg font-semibold text-dd-on-primary">
            <SettingsIcon className="h-5 w-5 text-dd-accent-green" />
            Configurações
          </h1>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-dd px-3 py-2.5 text-left text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-dd-surface-raised text-dd-on-surface border border-dd-border-subtle"
                  : "text-dd-muted hover:bg-dd-surface-overlay hover:text-dd-on-surface border border-transparent",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
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
              <button className="flex items-center gap-2 px-4 py-2 bg-dd-accent-green text-white rounded-dd text-sm font-medium hover:bg-[#17a348] transition-colors">
                <Plus className="h-4 w-4" />
                Nova Tag
              </button>
            </div>

            {/* Lista de tags */}
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-4 rounded-dd bg-dd-surface border border-dd-border-subtle hover:border-dd-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full ring-2 ring-dd-border-subtle"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm font-medium text-dd-on-surface">
                      {tag.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-dd-muted bg-dd-surface-raised px-2 py-1 rounded">
                      {tag.count} leads
                    </span>
                    <button className="p-1.5 text-dd-muted hover:text-dd-on-surface hover:bg-dd-surface-raised rounded transition-colors">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-dd-muted hover:text-dd-accent-red hover:bg-dd-surface-raised rounded transition-colors">
                      <Trash2 className="h-4 w-4" />
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
              <button className="flex items-center gap-2 px-4 py-2 bg-dd-accent-green text-white rounded-dd text-sm font-medium hover:bg-[#17a348] transition-colors">
                <UserPlus className="h-4 w-4" />
                Novo Usuário
              </button>
            </div>

            <div className="space-y-2">
              {mockUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-dd bg-dd-surface border border-dd-border-subtle hover:border-dd-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-dd-surface-raised flex items-center justify-center text-dd-muted font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dd-on-surface">
                        {user.name}
                      </p>
                      <p className="text-xs text-dd-muted">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
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
                    <button className="p-1.5 text-dd-muted hover:text-dd-on-surface hover:bg-dd-surface-raised rounded transition-colors">
                      <Edit3 className="h-4 w-4" />
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

            <div className="space-y-2">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-4 rounded-dd bg-dd-surface border border-dd-border-subtle hover:border-dd-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-DD",
                        notification.enabled
                          ? "bg-dd-accent-green/20 text-dd-accent-green"
                          : "bg-dd-surface-raised text-dd-muted",
                      )}
                    >
                      {notification.channel === "email" && (
                        <Mail className="h-4 w-4" />
                      )}
                      {notification.channel === "push" && (
                        <Smartphone className="h-4 w-4" />
                      )}
                      {notification.channel === "all" && (
                        <Bell className="h-4 w-4" />
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
                  <button
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative",
                      notification.enabled
                        ? "bg-dd-accent-green"
                        : "bg-dd-surface-raised",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                        notification.enabled ? "left-6" : "left-1",
                      )}
                    />
                  </button>
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
              <div className="p-4 rounded-dd bg-dd-surface border border-dd-border-subtle">
                <h3 className="text-sm font-medium text-dd-on-surface mb-3 flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Tema
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex-1 p-4 rounded-DD border transition-all",
                      theme === "dark"
                        ? "border-dd-accent-green bg-dd-accent-green/10"
                        : "border-dd-border-subtle hover:border-dd-border",
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Moon className="h-4 w-4 text-dd-muted" />
                      {theme === "dark" && (
                        <span className="w-2 h-2 rounded-full bg-dd-accent-green" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-dd-on-surface">
                      Escuro
                    </p>
                    <p className="text-xs text-dd-muted mt-1">
                      Interface escura otimizada
                    </p>
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex-1 p-4 rounded-DD border transition-all",
                      theme === "light"
                        ? "border-dd-accent-green bg-dd-accent-green/10"
                        : "border-dd-border-subtle hover:border-dd-border",
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Sun className="h-4 w-4 text-dd-muted" />
                      {theme === "light" && (
                        <span className="w-2 h-2 rounded-full bg-dd-accent-green" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-dd-on-surface">
                      Claro
                    </p>
                    <p className="text-xs text-dd-muted mt-1">
                      Interface clara clássica
                    </p>
                  </button>
                </div>
              </div>

              {/* Accent Color */}
              <div className="p-4 rounded-dd bg-dd-surface border border-dd-border-subtle">
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
                          "w-10 h-10 rounded-full border-2 transition-all",
                          color === "#22C55E"
                            ? "border-white"
                            : "border-transparent hover:border-dd-border",
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ),
                  )}
                </div>
              </div>

              {/* Sidebar Position */}
              <div className="p-4 rounded-dd bg-dd-surface border border-dd-border-subtle">
                <h3 className="text-sm font-medium text-dd-on-surface mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Posição da Sidebar
                </h3>
                <div className="flex gap-3">
                  <button className="flex-1 p-3 rounded-DD border border-dd-accent-green bg-dd-accent-green/10 text-center">
                    <p className="text-sm font-medium text-dd-on-surface">
                      Esquerda
                    </p>
                  </button>
                  <button className="flex-1 p-3 rounded-DD border border-dd-border-subtle hover:border-dd-border text-center">
                    <p className="text-sm font-medium text-dd-muted">Direita</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
