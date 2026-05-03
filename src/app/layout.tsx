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
  const themeScript = `
    (function() {
      try {
        var t = localStorage.getItem('atus-theme');
        if (t === 'light') {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
        }
      } catch(e) {}
    })();
  `;

  return (
    <html lang="pt-BR" suppressHydrationWarning className="h-full dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
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
