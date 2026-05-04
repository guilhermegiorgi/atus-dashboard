"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Credenciais inválidas");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Erro ao conectar ao servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dd-primary px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-dd-accent-green">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-dd-on-primary">
            Átus Dashboard
          </h1>
          <p className="mt-1 text-sm text-dd-on-muted">
            Faça login para continuar
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-dd-border-subtle bg-dd-surface p-6"
        >
          {/* Error */}
          {error && (
            <div className="mb-4 rounded-md border border-dd-accent-red/20 bg-dd-accent-red/10 px-3 py-2.5 text-sm text-dd-accent-red">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-medium text-dd-muted"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              className="w-full rounded-dd border border-dd-border-subtle bg-dd-surface-raised px-3 py-2.5 text-sm text-dd-on-primary placeholder:text-dd-muted outline-none transition-colors focus:border-dd-accent-green"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="senha"
              className="mb-1.5 block text-xs font-medium text-dd-muted"
            >
              Senha
            </label>
            <div className="relative">
              <input
                id="senha"
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-dd border border-dd-border-subtle bg-dd-surface-raised px-3 py-2.5 pr-10 text-sm text-dd-on-primary placeholder:text-dd-muted outline-none transition-colors focus:border-dd-accent-green"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dd-muted transition-colors hover:text-dd-on-surface"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "flex w-full items-center justify-center rounded-dd bg-dd-accent-green px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-dd-accent-green-hover",
              loading && "cursor-not-allowed opacity-70",
            )}
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
