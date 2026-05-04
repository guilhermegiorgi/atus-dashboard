"use client";

import { useState, useEffect, useRef } from "react";
import { Search, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  variables?: string[];
}

interface TemplatePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: MessageTemplate) => void;
  templates: MessageTemplate[];
  leadData?: Record<string, string>;
}

const BUILT_IN_TEMPLATES: MessageTemplate[] = [
  {
    id: "welcome",
    name: "Boas-vindas",
    content:
      "Olá {{nome}}! 👋 Bem-vindo(a) à Átus Imóveis. Como posso ajudá-lo(a)?",
    category: "Atendimento",
    variables: ["nome"],
  },
  {
    id: "followup",
    name: "Follow-up",
    content:
      "Oi {{nome}}, tudo bem? Estou entrando em contato sobre seu interesse em imóveis. Posso ajudar com mais informações?",
    category: "Follow-up",
    variables: ["nome"],
  },
  {
    id: "schedule_visit",
    name: "Agendar visita",
    content:
      "Olá {{nome}}! Gostaria de agendar uma visita ao imóvel? Temos disponibilidade nesta semana. Qual dia e horário fica melhor para você?",
    category: "Vendas",
    variables: ["nome"],
  },
  {
    id: "send_docs",
    name: "Solicitar documentos",
    content:
      "Olá {{nome}}, para prosseguir com a análise, preciso dos seguintes documentos:\n\n• RG/CPF\n• Comprovante de renda\n• Extrato FGTS\n\nPode enviar por aqui mesmo?",
    category: "Documentação",
    variables: ["nome"],
  },
  {
    id: "proposal_sent",
    name: "Proposta enviada",
    content:
      "{{nome}}, enviei a proposta para o imóvel que conversamos. Por favor, revise e me avise se tiver dúvidas. Estou à disposição!",
    category: "Vendas",
    variables: ["nome"],
  },
  {
    id: "greeting_morning",
    name: "Bom dia",
    content: "Bom dia, {{nome}}! ☀️ Como posso ajudá-lo(a) hoje?",
    category: "Atendimento",
    variables: ["nome"],
  },
  {
    id: "greeting_afternoon",
    name: "Boa tarde",
    content: "Boa tarde, {{nome}}! 🌤️ Em que posso ser útil?",
    category: "Atendimento",
    variables: ["nome"],
  },
];

function replaceVariables(
  content: string,
  variables: string[] = [],
  leadData: Record<string, string> = {},
): string {
  let result = content;
  for (const v of variables) {
    const value = leadData[v] || `{{${v}}}`;
    result = result.replace(new RegExp(`\\{\\{${v}\\}\\}`, "g"), value);
  }
  return result;
}

export function TemplatePicker({
  open,
  onClose,
  onSelect,
  templates,
  leadData,
}: TemplatePickerProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allTemplates = templates.length > 0 ? templates : BUILT_IN_TEMPLATES;

  const filtered = allTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleSelect = (template: MessageTemplate) => {
    const content = leadData
      ? replaceVariables(template.content, template.variables, leadData)
      : template.content;
    onSelect({ ...template, content });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-full left-0 right-0 mb-2 z-50 max-h-[320px] rounded-lg border border-dd-border-subtle bg-dd-surface-raised shadow-lg overflow-hidden flex flex-col">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-dd-border-subtle">
          <Search className="h-3.5 w-3.5 text-dd-muted flex-shrink-0" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar template..."
            className="flex-1 bg-transparent text-sm text-dd-on-surface placeholder:text-dd-muted focus:outline-none"
          />
          <button
            onClick={onClose}
            className="flex h-5 w-5 items-center justify-center rounded text-dd-muted hover:text-dd-on-surface"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* List */}
        <div ref={listRef} className="flex-1 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <FileText className="h-6 w-6 mx-auto text-dd-on-muted/40 mb-1.5" />
              <p className="text-xs text-dd-on-muted">
                Nenhum template encontrado
              </p>
            </div>
          ) : (
            filtered.map((template, i) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className={cn(
                  "w-full text-left px-3 py-2.5 transition-colors",
                  i === selectedIndex
                    ? "bg-dd-surface-overlay"
                    : "hover:bg-dd-surface-overlay/50",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-dd-on-primary">
                    {template.name}
                  </span>
                  <span className="text-[10px] text-dd-on-muted/60 px-1.5 py-0.5 rounded bg-dd-surface-overlay">
                    {template.category}
                  </span>
                </div>
                <p className="text-[11px] text-dd-on-muted mt-0.5 line-clamp-2">
                  {template.content}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-3 py-1.5 border-t border-dd-border-subtle text-[10px] text-dd-on-muted/60">
          ↑↓ navegar · Enter selecionar · Esc fechar
        </div>
      </div>
    </>
  );
}

export { BUILT_IN_TEMPLATES };
