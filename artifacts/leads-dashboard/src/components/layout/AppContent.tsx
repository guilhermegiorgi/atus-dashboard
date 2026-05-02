"use client";

import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "@/components/layout/GlobalSearch";

interface AppContentProps {
  children: React.ReactNode;
}

export function AppContent({ children }: AppContentProps) {
  const [pathname] = useLocation();
  const isCRMPage = pathname === "/crm";

  return (
    <main
      className={cn(
        "flex-1 flex flex-col h-full",
        !isCRMPage && "p-8 overflow-auto",
        isCRMPage && "overflow-hidden",
      )}
    >
      {!isCRMPage && (
        <div className="mb-6 flex justify-end">
          <GlobalSearch />
        </div>
      )}
      {children}
    </main>
  );
}
