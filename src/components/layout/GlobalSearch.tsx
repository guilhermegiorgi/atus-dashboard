"use client";

import { useEffect, useState } from "react";
import { Search, X, Clock } from "lucide-react";
import { api } from "@/lib/api/client";
import { Lead } from "@/types/leads";

interface GlobalSearchProps {
  onSelectLead?: (lead: Lead) => void;
}

export function GlobalSearch({ onSelectLead }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);

  // Keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load recent leads on open
  useEffect(() => {
    if (isOpen && !query) {
      api.getPaginatedLeads({ limit: 5, offset: 0 }).then((result) => {
        if (!result.error && result.data) {
          setRecentLeads(result.data.data);
        }
      });
    }
  }, [isOpen, query]);

  // Search on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const result = await api.getPaginatedLeads({ limit: 10, offset: 0 });

      if (!result.error && result.data) {
        const filtered = result.data.data.filter(
          (lead) =>
            lead.nome_completo?.toLowerCase().includes(query.toLowerCase()) ||
            lead.telefone?.includes(query) ||
            lead.email?.toLowerCase().includes(query.toLowerCase()),
        );
        setResults(filtered);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (lead: Lead) => {
    onSelectLead?.(lead);
    setIsOpen(false);
    setQuery("");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-dd-border bg-dd-surface px-3 py-1.5 text-sm text-dd-on-muted hover:border-dd-border hover:text-dd-on-surface transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Buscar...</span>
        <kbd className="hidden rounded bg-dd-surface-raised px-1.5 py-0.5 text-[10px] text-dd-on-muted sm:inline-flex">
          Ctrl+K
        </kbd>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[15vh]"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-dd-border bg-dd-primary shadow-2xl animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-dd-border px-4 py-3">
          <Search className="h-5 w-5 text-dd-on-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar leads por nome, telefone ou email..."
            className="flex-1 bg-transparent text-sm text-dd-on-primary placeholder:text-dd-on-muted focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setIsOpen(false)}
            className="rounded p-1 hover:bg-dd-surface text-dd-on-muted hover:text-dd-on-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {loading ? (
            <div className="py-8 text-center text-sm text-dd-on-muted">
              Buscando...
            </div>
          ) : query && results.length === 0 ? (
            <div className="py-8 text-center text-sm text-dd-on-muted">
              Nenhum resultado para &quot;{query}&quot;
            </div>
          ) : query ? (
            <div className="space-y-1">
              {results.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => handleSelect(lead)}
                  className="w-full flex items-center gap-3 rounded-lg p-3 text-left hover:bg-dd-surface transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-dd-surface-raised flex items-center justify-center text-sm font-medium text-dd-on-primary">
                    {(lead.nome_completo || "SN").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-dd-on-primary">
                      {lead.nome_completo || "Sem nome"}
                    </p>
                    <p className="truncate text-xs text-dd-on-muted">
                      {lead.telefone} {lead.email && `· ${lead.email}`}
                    </p>
                  </div>
                  <span className="text-xs text-dd-on-muted">
                    {lead.status}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="px-3 py-2 text-xs font-medium uppercase text-dd-on-muted flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Recentes
              </div>
              {recentLeads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => handleSelect(lead)}
                  className="w-full flex items-center gap-3 rounded-lg p-3 text-left hover:bg-dd-surface transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-dd-surface-raised flex items-center justify-center text-sm font-medium text-dd-on-primary">
                    {(lead.nome_completo || "SN").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-dd-on-primary">
                      {lead.nome_completo || "Sem nome"}
                    </p>
                    <p className="truncate text-xs text-dd-on-muted">
                      {lead.telefone}
                    </p>
                  </div>
                  <span className="text-xs text-dd-on-muted">
                    {lead.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-dd-border px-4 py-2 text-xs text-dd-on-muted">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="rounded bg-dd-surface-raised px-1.5 py-0.5">
                Enter
              </kbd>{" "}
              para selecionar
            </span>
            <span>
              <kbd className="rounded bg-dd-surface-raised px-1.5 py-0.5">
                Esc
              </kbd>{" "}
              para fechar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
