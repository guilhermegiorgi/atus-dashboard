"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import type { Tag } from "@/types/leads";

const TAG_COLORS = [
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

// TODO: implementar paginação real quando a API suportar cursor/offset dinâmico.
// Atualmente limitado a 100 tags — suficiente para o uso atual.
const TAGS_PAGE_LIMIT = 100;

export function TagsManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states — single modal for create and edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // Delete confirmation
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);

  // Form values
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState(TAG_COLORS[0]);

  const loadTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getTags(TAGS_PAGE_LIMIT, 0);
      if (result.data) {
        setTags(result.data);
      }
    } catch {
      setError("Erro ao carregar tags");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const resetForm = () => {
    setFormName("");
    setFormColor(TAG_COLORS[0]);
    setEditingTag(null);
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormName(tag.name);
    setFormColor(tag.color);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setError(null);
    setSaving(true);
    try {
      const payload = { name: formName.trim(), color: formColor };
      const result = editingTag
        ? await api.updateTag(editingTag.id, payload)
        : await api.createTag(payload);
      if (!result.error) {
        await loadTags();
        closeModal();
      } else {
        setError(
          result.message ||
            (editingTag ? "Erro ao atualizar tag" : "Erro ao criar tag"),
        );
      }
    } catch {
      setError(editingTag ? "Erro ao atualizar tag" : "Erro ao criar tag");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = (tag: Tag) => {
    setDeletingTag(tag);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTag) return;
    setError(null);
    setSaving(true);
    try {
      const result = await api.deleteTag(deletingTag.id);
      if (!result.error) {
        await loadTags();
      } else {
        setError(result.message || "Erro ao excluir tag");
      }
    } catch {
      setError("Erro ao excluir tag");
    } finally {
      setSaving(false);
      setDeletingTag(null);
    }
  };

  const isModalSaving = saving && !deletingTag;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-dd-muted" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-dd-on-primary">Tags</h2>
          <p className="text-sm text-dd-muted mt-1">
            Gerencie tags para classificar leads
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-dd-accent-green hover:bg-dd-green-hover"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Tag
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-dd-accent-red/10 border border-dd-accent-red/20 text-dd-accent-red text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1">
        {tags.length === 0 ? (
          <div className="text-center py-8 text-dd-muted">
            Nenhuma tag encontrada
          </div>
        ) : (
          tags.map((tag) => (
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
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar tag ${tag.name}`}
                  className="h-7 w-7 text-dd-muted hover:text-dd-on-surface focus-visible:ring-2 focus-visible:ring-dd-accent-green"
                  onClick={() => openEdit(tag)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Excluir tag ${tag.name}`}
                  className="h-7 w-7 text-dd-muted hover:text-dd-accent-red focus-visible:ring-2 focus-visible:ring-dd-accent-green"
                  onClick={() => handleDeleteRequest(tag)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="bg-dd-surface border-dd-border-subtle">
          <DialogHeader>
            <DialogTitle>{editingTag ? "Editar Tag" : "Nova Tag"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-dd-muted">Nome</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="mt-1 bg-dd-primary border-dd-border-subtle"
              />
            </div>
            <div>
              <label className="text-sm text-dd-muted">Cor</label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormColor(color)}
                    aria-label={`Selecionar cor ${color}`}
                    className={`w-6 h-6 rounded-full border-2 focus-visible:ring-2 focus-visible:ring-dd-accent-green ${
                      formColor === color
                        ? "border-white"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isModalSaving || !formName.trim()}
              className="bg-dd-accent-green hover:bg-dd-green-hover"
            >
              {isModalSaving && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingTag ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deletingTag}
        onOpenChange={(open) => {
          if (!open) setDeletingTag(null);
        }}
      >
        <DialogContent className="bg-dd-surface border-dd-border-subtle">
          <DialogHeader>
            <DialogTitle>Excluir tag</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-dd-muted py-4">
            Tem certeza que deseja excluir a tag{" "}
            <span className="text-dd-on-surface font-medium">
              {deletingTag?.name}
            </span>
            ? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTag(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={saving}
              className="bg-dd-accent-red hover:bg-dd-red-hover"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
