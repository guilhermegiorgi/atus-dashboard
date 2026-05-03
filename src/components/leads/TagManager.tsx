"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, X, Tag as TagIcon, Trash2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { Tag } from "@/types/leads";

interface TagManagerProps {
  leadId?: string;
  leadTags?: Tag[];
  onTagsUpdated?: () => void;
}

const TAG_COLORS = [
  "#6B7280", // gray
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#14B8A6", // teal
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
];

export function TagManager({
  leadId,
  leadTags = [],
  onTagsUpdated,
}: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [saving, setSaving] = useState(false);

  // Carregar todas as tags
  const loadTags = async () => {
    setLoading(true);
    setError(null);
    const result = await api.getTags(100, 0);
    if (result.error) {
      setError(result.message || "Erro ao carregar tags");
    } else {
      setTags(result.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTags();
  }, []);

  // Criar nova tag
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setSaving(true);
    const result = await api.createTag({
      name: newTagName.trim(),
      color: newTagColor,
    });
    if (result.error) {
      setError(result.message || "Erro ao criar tag");
    } else {
      setNewTagName("");
      setNewTagColor(TAG_COLORS[0]);
      setIsCreateOpen(false);
      await loadTags();
    }
    setSaving(false);
  };

  // Deletar tag
  const handleDeleteTag = async (tagId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tag?")) return;
    const result = await api.deleteTag(tagId);
    if (!result.error) {
      await loadTags();
    }
  };

  // Adicionar tag ao lead
  const handleAddTagToLead = async (tagId: string) => {
    if (!leadId) return;
    const result = await api.addLeadTags(leadId, [tagId]);
    if (!result.error && onTagsUpdated) {
      onTagsUpdated();
    }
  };

  // Remover tag do lead
  const handleRemoveTagFromLead = async (tagId: string) => {
    if (!leadId) return;
    const result = await api.removeLeadTag(leadId, tagId);
    if (!result.error && onTagsUpdated) {
      onTagsUpdated();
    }
  };

  const leadTagIds = leadTags.map((t) => t.id);

  return (
    <div className="space-y-3">
      {/* Header com botão de adicionar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TagIcon className="h-4 w-4 text-white/60" />
          <span className="text-sm font-medium text-white/80">Tags</span>
        </div>
        <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
          <DialogTrigger>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
            >
              <Plus className="h-3 w-3 mr-1" />
              Gerenciar
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-dd-primary border border-white/[0.12] text-white">
            <DialogHeader>
              <DialogTitle>Gerenciar Tags</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Criar nova tag */}
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/[0.12] bg-white/[0.04] hover:bg-white/10 w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar nova tag
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-dd-primary border border-white/[0.12] text-white">
                  <DialogHeader>
                    <DialogTitle>Criar Tag</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm text-white/60">Nome</label>
                      <Input
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Nome da tag"
                        className="bg-white/[0.04] border-white/[0.12] text-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/60">Cor</label>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {TAG_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => setNewTagColor(color)}
                            className={`w-6 h-6 rounded-full border-2 ${
                              newTagColor === color
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
                    <Button
                      onClick={handleCreateTag}
                      disabled={saving || !newTagName.trim()}
                      className="bg-white text-black hover:bg-white/90"
                    >
                      {saving ? "Salvando..." : "Criar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Lista de tags */}
              {loading ? (
                <div className="text-center py-4 text-white/40">
                  Carregando...
                </div>
              ) : error ? (
                <div className="text-dd-accent-red text-sm">{error}</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-2 rounded bg-white/[0.04] border border-white/[0.06]"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="text-sm text-white">{tag.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-dd-accent-red hover:text-dd-accent-red hover:bg-dd-accent-red/10"
                          onClick={() => handleDeleteTag(tag.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {tags.length === 0 && (
                    <div className="text-center py-4 text-white/40 text-sm">
                      Nenhuma tag criada
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tags do lead */}
      <div className="flex flex-wrap gap-1.5">
        {leadTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="pl-2 pr-1 py-0.5"
            style={{
              borderColor: tag.color + "40",
              backgroundColor: tag.color + "15",
              color: tag.color,
            }}
          >
            {tag.name}
            {leadId && (
              <button
                onClick={() => handleRemoveTagFromLead(tag.id)}
                className="ml-1 hover:bg-white/10 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}

        {/* Botão adicionar tags */}
        {leadId && (
          <Dialog>
            <DialogTrigger>
              <button className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-white/40 border border-dashed border-white/20 hover:border-white/40 hover:text-white/60 transition-colors">
                <Plus className="h-3 w-3" />
                Add
              </button>
            </DialogTrigger>
            <DialogContent className="bg-dd-primary border border-white/[0.12] text-white">
              <DialogHeader>
                <DialogTitle>Adicionar Tags</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-64 overflow-y-auto py-2">
                {tags
                  .filter((t) => !leadTagIds.includes(t.id))
                  .map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleAddTagToLead(tag.id)}
                      className="w-full flex items-center gap-2 p-2 rounded hover:bg-white/[0.06] transition-colors text-left"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm text-white">{tag.name}</span>
                    </button>
                  ))}
                {tags.filter((t) => !leadTagIds.includes(t.id)).length ===
                  0 && (
                  <div className="text-center py-4 text-white/40 text-sm">
                    Todas as tags já foram adicionadas
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {leadTags.length === 0 && (
        <p className="text-xs text-white/40">Nenhuma tag adicionada</p>
      )}
    </div>
  );
}
