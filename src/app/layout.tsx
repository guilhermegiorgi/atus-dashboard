import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
    <html lang="pt-BR" className="h-full">
      <body
        className={cn("font-sans antialiased h-full bg-background", geistSans.variable, geistMono.variable)}
      >
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 overflow-auto p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
