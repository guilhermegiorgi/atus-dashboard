"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, FileText, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BUILT_IN_TEMPLATES,
  MessageTemplate,
} from "@/components/darkdesk/TemplatePicker";

interface TemplateForm {
  name: string;
  content: string;
  category: string;
}

const CATEGORIES = [
  "Atendimento",
  "Follow-up",
  "Vendas",
  "Documentação",
  "Outros",
];

export function TemplatesManager() {
  const [templates, setTemplates] =
    useState<MessageTemplate[]>(BUILT_IN_TEMPLATES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<TemplateForm>({
    name: "",
    content: "",
    category: "Atendimento",
  });
  const [search, setSearch] = useState("");

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = () => {
    if (!form.name.trim() || !form.content.trim()) return;

    if (editingId) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                name: form.name,
                content: form.content,
                category: form.category,
              }
            : t,
        ),
      );
      setEditingId(null);
    } else {
      const newTemplate: MessageTemplate = {
        id: `custom-${Date.now()}`,
        name: form.name,
        content: form.content,
        category: form.category,
        variables: extractVariables(form.content),
      };
      setTemplates((prev) => [...prev, newTemplate]);
      setIsCreating(false);
    }

    setForm({ name: "", content: "", category: "Atendimento" });
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingId(template.id);
    setIsCreating(false);
    setForm({
      name: template.name,
      content: template.content,
      category: template.category,
    });
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm({ name: "", content: "", category: "Atendimento" });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setForm({ name: "", content: "", category: "Atendimento" });
  };

  const isEditing = editingId !== null || isCreating;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-dd-on-primary">
            Templates de Mensagem
          </h2>
          <p className="text-sm text-dd-muted mt-1">
            Crie modelos para agilizar o atendimento
          </p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
            setForm({ name: "", content: "", category: "Atendimento" });
          }}
          disabled={isEditing}
          className="flex items-center gap-2 rounded-md bg-dd-accent-green px-3 py-2 text-sm text-white hover:bg-dd-green-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Template
        </button>
      </div>

      {/* Form */}
      {isEditing && (
        <div className="rounded-lg border border-dd-border-subtle bg-dd-surface-raised p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-dd-on-primary">
              {editingId ? "Editar Template" : "Novo Template"}
            </h3>
            <button
              onClick={handleCancel}
              className="text-dd-muted hover:text-dd-on-surface"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-dd-muted mb-1">Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Boas-vindas"
                className="w-full rounded-md bg-dd-surface px-3 py-2 text-sm text-dd-on-surface placeholder:text-dd-muted border border-dd-border-subtle focus:border-dd-accent-green focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-dd-muted mb-1">
                Categoria
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-md bg-dd-surface px-3 py-2 text-sm text-dd-on-surface border border-dd-border-subtle focus:border-dd-accent-green focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-dd-muted mb-1">
              Conteúdo
              <span className="text-dd-on-muted/60 ml-1">
                (use {"{{nome}}"} para variáveis)
              </span>
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Olá {{nome}}, como posso ajudar?"
              rows={4}
              className="w-full rounded-md bg-dd-surface px-3 py-2 text-sm text-dd-on-surface placeholder:text-dd-muted border border-dd-border-subtle focus:border-dd-accent-green focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="rounded-md px-3 py-1.5 text-sm text-dd-muted hover:text-dd-on-surface transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!form.name.trim() || !form.content.trim()}
              className="flex items-center gap-1.5 rounded-md bg-dd-accent-green px-3 py-1.5 text-sm text-white hover:bg-dd-green-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar templates..."
          className="w-full rounded-md bg-dd-surface-raised px-3 py-2 pl-9 text-sm text-dd-on-surface placeholder:text-dd-muted border border-dd-border-subtle focus:border-dd-accent-green focus:outline-none"
        />
        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dd-muted" />
      </div>

      {/* Template list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 mx-auto text-dd-on-muted/40 mb-2" />
            <p className="text-sm text-dd-on-muted">
              {search ? "Nenhum template encontrado" : "Nenhum template criado"}
            </p>
          </div>
        ) : (
          filtered.map((template) => (
            <div
              key={template.id}
              className={cn(
                "flex items-start justify-between rounded-lg border p-4 transition-colors",
                editingId === template.id
                  ? "border-dd-accent-green/30 bg-dd-accent-green/5"
                  : "border-dd-border-subtle bg-dd-surface-raised hover:border-dd-border-subtle/80",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-dd-on-primary">
                    {template.name}
                  </h4>
                  <span className="text-[10px] text-dd-on-muted/60 px-1.5 py-0.5 rounded bg-dd-surface-overlay">
                    {template.category}
                  </span>
                </div>
                <p className="text-xs text-dd-on-muted mt-1 line-clamp-2">
                  {template.content}
                </p>
                {template.variables && template.variables.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {template.variables.map((v) => (
                      <span
                        key={v}
                        className="text-[10px] text-dd-accent-blue px-1.5 py-0.5 rounded bg-dd-accent-blue/10"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 ml-3">
                <button
                  onClick={() => handleEdit(template)}
                  disabled={isEditing && editingId !== template.id}
                  className="flex h-7 w-7 items-center justify-center rounded text-dd-muted hover:text-dd-on-surface hover:bg-dd-surface-overlay disabled:opacity-50 transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  disabled={isEditing}
                  className="flex h-7 w-7 items-center justify-center rounded text-dd-muted hover:text-dd-accent-red hover:bg-dd-accent-red/10 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, ""))));
}
