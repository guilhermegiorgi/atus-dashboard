"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Trash2, UserPlus, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import {
  User,
  UserRole,
  CreateUserValues,
  UpdateUserValues,
} from "@/types/leads";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "owner", label: "Proprietário" },
  { value: "admin", label: "Administrador" },
  { value: "corretor", label: "Corretor" },
  { value: "viewer", label: "Visualizador" },
];

export function UsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form values
  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("corretor");
  const [formSenha, setFormSenha] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    const result = await api.getUsers(100, 0);
    if (result.data) {
      setUsers(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setFormNome("");
    setFormEmail("");
    setFormTelefone("");
    setFormRole("corretor");
    setFormSenha("");
    setEditingUser(null);
  };

  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormNome(user.nome);
    setFormEmail(user.email);
    setFormTelefone(user.telefone || "");
    setFormRole(user.role);
    setFormSenha("");
    setIsEditOpen(true);
  };

  const handleCreate = async () => {
    if (!formNome || !formEmail || !formRole) return;
    setSaving(true);
    const values: CreateUserValues = {
      nome: formNome,
      email: formEmail,
      telefone: formTelefone || undefined,
      role: formRole,
      senha: formSenha || "mudar123",
    };
    const result = await api.createUser(values);
    if (!result.error) {
      await loadUsers();
      setIsCreateOpen(false);
      resetForm();
    } else {
      setError(result.message);
    }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    setSaving(true);
    const values: UpdateUserValues = {
      nome: formNome,
      email: formEmail,
      telefone: formTelefone || undefined,
      role: formRole,
    };
    const result = await api.updateUser(editingUser.id, values);
    if (!result.error) {
      await loadUsers();
      setIsEditOpen(false);
      resetForm();
    } else {
      setError(result.message);
    }
    setSaving(false);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    const result = await api.deleteUser(userId);
    if (!result.error) {
      await loadUsers();
    }
  };

  const handleToggleStatus = async (user: User) => {
    const result = await api.updateUserStatus(user.id, { ativo: !user.ativo });
    if (!result.error) {
      await loadUsers();
    }
  };

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
          <h2 className="text-xl font-semibold text-dd-on-primary">Usuários</h2>
          <p className="text-sm text-dd-muted mt-1">
            Gerencie usuários e permissões do sistema
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-dd-accent-green hover:bg-[#17a348]"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-dd-accent-red/10 border border-dd-accent-red/20 text-dd-accent-red text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1">
        {users.length === 0 ? (
          <div className="text-center py-8 text-dd-muted">
            Nenhum usuário encontrado
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-DD bg-dd-surface border border-dd-border-subtle hover:border-dd-border transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-dd-surface-raised flex items-center justify-center text-dd-muted font-medium text-sm">
                  {user.nome?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium text-dd-on-surface">
                    {user.nome}
                  </p>
                  <p className="text-xs text-dd-muted">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(user)}
                  className={`text-xs px-2 py-1 rounded ${
                    user.ativo
                      ? "bg-dd-accent-green/20 text-dd-accent-green"
                      : "bg-dd-surface-raised text-dd-muted"
                  }`}
                >
                  {user.ativo ? "Ativo" : "Inativo"}
                </button>
                <span className="text-xs text-dd-muted bg-dd-surface-raised px-2 py-1 rounded capitalize">
                  {user.role}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-dd-muted hover:text-dd-on-surface"
                  onClick={() => openEdit(user)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-dd-muted hover:text-dd-accent-red"
                  onClick={() => handleDelete(user.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-dd-surface border-dd-border-subtle">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-dd-muted">Nome</label>
              <Input
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                className="mt-1 bg-dd-primary border-dd-border-subtle"
              />
            </div>
            <div>
              <label className="text-sm text-dd-muted">Email</label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="mt-1 bg-dd-primary border-dd-border-subtle"
              />
            </div>
            <div>
              <label className="text-sm text-dd-muted">Telefone</label>
              <Input
                value={formTelefone}
                onChange={(e) => setFormTelefone(e.target.value)}
                className="mt-1 bg-dd-primary border-dd-border-subtle"
              />
            </div>
            <div>
              <label className="text-sm text-dd-muted">Role</label>
              <Select
                value={formRole}
                onValueChange={(v) => setFormRole(v as UserRole)}
              >
                <SelectTrigger className="mt-1 bg-dd-primary border-dd-border-subtle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-dd-muted">
                Senha (padrão: mudar123)
              </label>
              <Input
                type="password"
                value={formSenha}
                onChange={(e) => setFormSenha(e.target.value)}
                className="mt-1 bg-dd-primary border-dd-border-subtle"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving || !formNome || !formEmail}
              className="bg-dd-accent-green hover:bg-[#17a348]"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-dd-surface border-dd-border-subtle">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-dd-muted">Nome</label>
              <Input
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                className="mt-1 bg-dd-primary border-dd-border-subtle"
              />
            </div>
            <div>
              <label className="text-sm text-dd-muted">Email</label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="mt-1 bg-dd-primary border-dd-border-subtle"
              />
            </div>
            <div>
              <label className="text-sm text-dd-muted">Telefone</label>
              <Input
                value={formTelefone}
                onChange={(e) => setFormTelefone(e.target.value)}
                className="mt-1 bg-dd-primary border-dd-border-subtle"
              />
            </div>
            <div>
              <label className="text-sm text-dd-muted">Role</label>
              <Select
                value={formRole}
                onValueChange={(v) => setFormRole(v as UserRole)}
              >
                <SelectTrigger className="mt-1 bg-dd-primary border-dd-border-subtle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={saving || !formNome || !formEmail}
              className="bg-dd-accent-green hover:bg-[#17a348]"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
