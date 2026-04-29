"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Tags,
  Users,
  Bell,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "tags" | "users" | "notifications" | "appearance";

const tabs: { id: Tab; label: string; icon: typeof SettingsIcon }[] = [
  { id: "tags", label: "Tags", icon: Tags },
  { id: "users", label: "Usuários", icon: Users },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "appearance", label: "Aparência", icon: Palette },
];

// Mock data for tags - will be replaced with API
const mockTags = [
  { id: "1", name: "Quente", color: "#EF4444", count: 12 },
  { id: "2", name: "Frio", color: "#3B82F6", count: 8 },
  { id: "3", name: "Follow-up", color: "#F97316", count: 24 },
  { id: "4", name: "Qualificado", color: "#22C55E", count: 15 },
  { id: "5", name: "Negociando", color: "#8B5CF6", count: 6 },
  { id: "6", name: "Convertido", color: "#10B981", count: 3 },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("tags");
  const [tags] = useState(mockTags);

  return (
    <div className="flex flex-1 h-full bg-dd-primary">
      {/* Sidebar de config */}
      <div className="w-64 border-r border-dd-border-subtle bg-dd-surface p-4">
        <h1 className="mb-6 flex items-center gap-2 text-h3 text-dd-on-primary">
          <SettingsIcon className="h-5 w-5" />
          Configurações
        </h1>

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-dd px-3 py-2 text-left text-sm transition-colors",
                activeTab === tab.id
                  ? "bg-dd-surface-raised text-dd-on-surface"
                  : "text-dd-muted hover:bg-dd-surface-overlay hover:text-dd-on-surface",
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
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-h3 text-dd-on-primary">Gerenciar Tags</h2>
                <p className="text-sm text-dd-on-muted mt-1">
                  Crie e gerencie tags para classificar seus leads
                </p>
              </div>
              <button className="px-4 py-2 bg-dd-accent-green text-white rounded-dd text-sm font-medium hover:bg-[#17a348] transition-colors">
                + Nova Tag
              </button>
            </div>

            {/* Lista de tags */}
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 rounded-dd bg-dd-surface border border-dd-border-subtle"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm text-dd-on-surface">
                      {tag.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-dd-on-muted">
                      {tag.count} leads
                    </span>
                    <button className="text-dd-muted hover:text-dd-on-surface text-xs">
                      Editar
                    </button>
                    <button className="text-dd-muted hover:text-dd-accent-red text-xs">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2 className="text-h3 text-dd-on-primary mb-4">Usuários</h2>
            <p className="text-dd-on-muted">
              Gerencie usuários e permissões do sistema
            </p>
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <h2 className="text-h3 text-dd-on-primary mb-4">Notificações</h2>
            <p className="text-dd-on-muted">
              Configure suas preferências de notificação
            </p>
          </div>
        )}

        {activeTab === "appearance" && (
          <div>
            <h2 className="text-h3 text-dd-on-primary mb-4">Aparência</h2>
            <p className="text-dd-on-muted">
              Personalize a aparência do sistema
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
