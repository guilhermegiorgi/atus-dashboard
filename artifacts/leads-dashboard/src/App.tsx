import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
  Search,
  X,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { Lead } from "@/types/leads";

const queryClient = new QueryClient();

const navigation = [
  { name: "overview", href: "/", icon: Home, label: "Início" },
  { name: "leads", href: "/leads", icon: Users, label: "Leads" },
  { name: "analytics", href: "/analytics", icon: BarChart3, label: "Analytics" },
  { name: "tracking", href: "/tracking", icon: Link2, label: "Tracking" },
  { name: "inbox", href: "/conversations", icon: MessageSquare, label: "Inbox" },
  { name: "crm", href: "/crm", icon: MessageCircle, label: "CRM Chat" },
  { name: "pipeline", href: "/pipeline", icon: TrendingUp, label: "Pipeline" },
  { name: "settings", href: "/settings", icon: Settings, label: "Configurações" },
];

function Sidebar() {
  const [location] = useLocation();
  return (
    <div className="flex h-full w-16 flex-col border-r border-dd-border-subtle bg-dd-primary">
      <div className="flex h-16 items-center justify-center border-b border-dd-border-subtle">
        <Link href="/" className="flex items-center justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-dd-full bg-dd-accent-green">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col items-center gap-1 py-3">
        {navigation.map((item) => {
          const isActive = location === item.href;
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
      <div className="border-t border-dd-border-subtle py-3">
        <Link
          href="/dashboard"
          title="Dashboard"
          className="group flex h-11 w-11 items-center justify-center rounded-dd mx-auto transition-all duration-150 text-dd-muted hover:bg-dd-surface hover:text-dd-on-surface"
        >
          <LayoutDashboard className="h-5 w-5 transition-colors group-hover:text-dd-on-surface" />
        </Link>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && !query) {
      api.getPaginatedLeads({ limit: 5, offset: 0 }).then((result) => {
        if (!result.error && result.data) setRecentLeads(result.data.data);
      });
    }
  }, [isOpen, query]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      const result = await api.getPaginatedLeads({ search: query, limit: 8, offset: 0 } as Parameters<typeof api.getPaginatedLeads>[0]);
      setLoading(false);
      if (!result.error && result.data) setResults(result.data.data);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-dd border border-dd-border-subtle bg-dd-surface px-3 py-2 text-sm text-dd-muted transition-all hover:border-dd-border hover:text-dd-on-surface"
      >
        <Search className="h-4 w-4" />
        <span>Buscar leads...</span>
        <kbd className="ml-2 rounded border border-dd-border-subtle px-1.5 py-0.5 text-xs font-medium">⌘K</kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-lg rounded-dd border border-dd-border bg-dd-surface shadow-2xl">
            <div className="flex items-center gap-3 border-b border-dd-border-subtle px-4">
              <Search className="h-4 w-4 text-dd-muted" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome, telefone..."
                className="flex-1 bg-transparent py-4 text-sm text-dd-on-primary outline-none placeholder:text-dd-muted"
              />
              <button onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4 text-dd-muted" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {loading && <div className="px-3 py-4 text-center text-sm text-dd-muted">Buscando...</div>}
              {!loading && query && results.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-dd-muted">Nenhum resultado</div>
              )}
              {!query && recentLeads.length > 0 && (
                <div>
                  <div className="mb-1 flex items-center gap-2 px-3 py-2 text-xs text-dd-muted">
                    <Clock className="h-3 w-3" /> Recentes
                  </div>
                  {recentLeads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => setIsOpen(false)}
                      className="flex w-full items-center gap-3 rounded-dd px-3 py-2 text-left text-sm transition-all hover:bg-dd-surface-raised"
                    >
                      <div className="h-8 w-8 rounded-dd-full bg-dd-surface-overlay flex items-center justify-center text-xs text-dd-on-muted">
                        {(lead.nome_completo || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-dd-on-surface">{lead.nome_completo || "Sem nome"}</p>
                        <p className="text-xs text-dd-muted">{lead.telefone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {results.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center gap-3 rounded-dd px-3 py-2 text-left text-sm transition-all hover:bg-dd-surface-raised"
                >
                  <div className="h-8 w-8 rounded-dd-full bg-dd-surface-overlay flex items-center justify-center text-xs text-dd-on-muted">
                    {(lead.nome_completo || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-dd-on-surface">{lead.nome_completo || "Sem nome"}</p>
                    <p className="text-xs text-dd-muted">{lead.telefone}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AppContent({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isCRMPage = location === "/crm";

  return (
    <main className={cn("flex-1 flex flex-col h-full", !isCRMPage && "p-8 overflow-auto", isCRMPage && "overflow-hidden")}>
      {!isCRMPage && (
        <div className="mb-6 flex justify-end">
          <GlobalSearch />
        </div>
      )}
      {children}
    </main>
  );
}

// Lazy page imports
import { lazy, Suspense } from "react";

const HomePage = lazy(() => import("./app/page"));
const LeadsPage = lazy(() => import("./app/leads/page"));
const AnalyticsPage = lazy(() => import("./app/analytics/page"));
const TrackingPage = lazy(() => import("./app/tracking/page"));
const ConversationsPage = lazy(() => import("./app/conversations/page"));
const CRMPage = lazy(() => import("./app/crm/page"));
const PipelinePage = lazy(() => import("./app/pipeline/page"));
const SettingsPage = lazy(() => import("./app/settings/page"));
const DashboardPage = lazy(() => import("./app/dashboard/page"));
const BoardPage = lazy(() => import("./app/board/page"));

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/30" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/leads" component={LeadsPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/tracking" component={TrackingPage} />
        <Route path="/conversations" component={ConversationsPage} />
        <Route path="/crm" component={CRMPage} />
        <Route path="/pipeline" component={PipelinePage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/board" component={BoardPage} />
        <Route>
          <div className="flex h-64 items-center justify-center">
            <p className="text-white/40">Página não encontrada</p>
          </div>
        </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <div className="flex h-full">
          <Sidebar />
          <AppContent>
            <Router />
          </AppContent>
        </div>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
