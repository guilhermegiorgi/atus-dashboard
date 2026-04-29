"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Home,
  BarChart3,
  Link2,
  MessageSquare,
  TrendingUp,
  MessageCircle,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "overview", href: "/", icon: Home, label: "Início" },
  { name: "leads", href: "/leads", icon: Users, label: "Leads" },
  {
    name: "analytics",
    href: "/analytics",
    icon: BarChart3,
    label: "Analytics",
  },
  { name: "tracking", href: "/tracking", icon: Link2, label: "Tracking" },
  {
    name: "inbox",
    href: "/conversations",
    icon: MessageSquare,
    label: "Inbox",
  },
  { name: "crm", href: "/crm", icon: MessageCircle, label: "CRM Chat" },
  { name: "pipeline", href: "/pipeline", icon: TrendingUp, label: "Pipeline" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-16 flex-col border-r border-dd-border-subtle bg-dd-primary">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-dd-border-subtle">
        <Link href="/" className="flex items-center justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-dd-full bg-dd-accent-green">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col items-center gap-1 py-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.label}
              className={cn(
                "group flex h-11 w-11 items-center justify-center rounded-dd transition-all duration-150",
                isActive
                  ? "bg-dd-surface-raised text-dd-on-primary"
                  : "text-dd-muted hover:bg-dd-surface hover:text-dd-on-surface",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive
                    ? "text-dd-accent-green"
                    : "text-dd-muted group-hover:text-dd-on-surface",
                )}
              />
            </Link>
          );
        })}
      </nav>

      {/* Dashboard link at bottom */}
      <div className="border-t border-dd-border-subtle py-3">
        <Link
          href="/settings"
          title="Configurações"
          className="group flex h-11 w-11 items-center justify-center rounded-dd mx-auto transition-all duration-150 text-dd-muted hover:bg-dd-surface hover:text-dd-on-surface"
        >
          <Settings className="h-5 w-5 transition-colors group-hover:text-dd-on-surface" />
        </Link>
        <Link
          href="/dashboard"
          title="Dashboard"
          className="group flex h-11 w-11 items-center justify-center rounded-dd mx-auto transition-all duration-150 text-dd-muted hover:bg-dd-surface hover:text-dd-on-surface mt-1"
        >
          <LayoutDashboard className="h-5 w-5 transition-colors group-hover:text-dd-on-surface" />
        </Link>
      </div>
    </div>
  );
}
