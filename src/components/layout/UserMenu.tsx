"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserInfo {
  nome?: string;
  name?: string;
  email?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setUser(data.user || data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const displayName = user?.nome || user?.name || "Usuário";
  const initials = getInitials(displayName);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        title={displayName}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full bg-dd-surface-overlay text-xs font-semibold text-dd-on-muted transition-all duration-150 hover:bg-dd-border hover:text-dd-on-primary",
          open && "bg-dd-border text-dd-on-primary",
        )}
      >
        {initials || <User className="h-4 w-4" />}
      </button>

      {open && (
        <div className="absolute bottom-full left-1/2 mb-2 w-52 -translate-x-1/2 rounded-lg border border-dd-border-subtle bg-dd-surface shadow-lg animate-fade-in">
          <div className="border-b border-dd-border-subtle px-3 py-2.5">
            <p className="truncate text-sm font-medium text-dd-on-primary">
              {displayName}
            </p>
            {user?.email && (
              <p className="truncate text-xs text-dd-on-muted">{user.email}</p>
            )}
          </div>
          <div className="p-1">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex w-full items-center gap-2 rounded-dd px-3 py-2 text-sm text-dd-on-muted transition-colors hover:bg-dd-surface-raised hover:text-dd-red"
            >
              <LogOut className="h-4 w-4" />
              {loading ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
