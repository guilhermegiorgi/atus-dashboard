import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { AppContent } from "@/components/layout/AppContent";

export const metadata: Metadata = {
  title: "ATUS Dashboard | Gestão de Leads",
  description: "Plataforma de gestão de leads e conversas da Atus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full dark">
      <body
        className={cn(
          "font-sans antialiased h-full bg-background text-foreground",
        )}
      >
        <div className="flex h-full">
          <Sidebar />
          <AppContent>{children}</AppContent>
        </div>
      </body>
    </html>
  );
}
