"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { AppContent } from "./AppContent";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <AppContent>{children}</AppContent>
    </div>
  );
}
