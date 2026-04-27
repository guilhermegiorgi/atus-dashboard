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
  Zap,
} from "lucide-react";

const navigation = [
  { name: "overview", href: "/", icon: Home },
  { name: "leads", href: "/leads", icon: Users },
  { name: "analytics", href: "/analytics", icon: BarChart3 },
  { name: "tracking", href: "/tracking", icon: Link2 },
  { name: "inbox", href: "/conversations", icon: MessageSquare },
  { name: "pipeline", href: "/pipeline", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-56 flex-col border-r border-white/5 bg-[#050505]">
      <div className="flex h-14 items-center gap-3 border-b border-white/5 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-white">
          <Zap className="h-4 w-4 text-black" />
        </div>
        <span className="text-sm font-medium text-white">atus</span>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-white text-black"
                  : "text-white/40 hover:text-white hover:bg-white/5",
              )}
            >
              <item.icon
                className={cn(
                  "h-3.5 w-3.5",
                  isActive ? "text-black" : "text-white/40",
                )}
              />
              <span className="lowercase">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span className="lowercase">dashboard</span>
        </Link>
      </div>
    </div>
  );
}
