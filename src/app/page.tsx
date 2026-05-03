"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Zap,
  Users,
  BarChart3,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  LayoutDashboard,
  Target,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api/client";

interface StatsData {
  total: number;
  novos: number;
  em_atendimento: number;
  convertidos: number;
  perdidos: number;
}

interface AnalyticsData {
  total_leads: number;
  taxa_conversao_operacional: number;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  time: string;
}

export default function HomePage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [inboxCount, setInboxCount] = useState<number | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [statsResult, analyticsResult, inboxResult, activityResult] =
        await Promise.all([
          api.getLeadsStats(),
          api.getAnalyticsOverview(),
          api.getInboxConversations({ limit: 1 }),
          fetch("/api/v1/activity").then(
            (r) => r.json() as Promise<{ data: ActivityItem[] }>,
          ),
        ]);

      if (statsResult.data) setStats(statsResult.data);
      if (analyticsResult.data) setAnalytics(analyticsResult.data);
      if (inboxResult.data?.meta) setInboxCount(inboxResult.data.meta.total);
      if (activityResult.data) setActivity(activityResult.data);

      setLoading(false);
    }

    loadData();
  }, []);

  const quickStats = [
    {
      label: "total leads",
      value: stats?.total?.toLocaleString("pt-BR") || "0",
      change: stats?.novos ? `+${stats.novos}` : "+0",
      icon: Users,
      trend: "up",
    },
    {
      label: "new today",
      value: stats?.novos?.toString() || "0",
      change: "+0%",
      icon: Users,
      trend: "up",
    },
    {
      label: "conversions",
      value: stats?.convertidos?.toLocaleString("pt-BR") || "0",
      change: "+0%",
      icon: TrendingUp,
      trend: "up",
    },
    {
      label: "em atendimento",
      value: stats?.em_atendimento?.toString() || "0",
      change: "+0%",
      icon: BarChart3,
      trend: "up",
    },
  ];

  const features = [
    {
      title: "leads",
      description: "Gerencie e acompanhe todos os seus leads em um só lugar",
      icon: Users,
      href: "/leads",
      count: stats?.total?.toString() || "0",
    },
    {
      title: "analytics",
      description: "Visualize métricas e estatísticas em tempo real",
      icon: BarChart3,
      href: "/analytics",
      count: analytics?.total_leads?.toString() || "0",
    },
    {
      title: "inbox",
      description: "Acompanhe todas as conversas com seus leads",
      icon: MessageSquare,
      href: "/conversations",
      count: inboxCount?.toString() || "0",
    },
    {
      title: "pipeline",
      description: "Monitore seu funil de vendas e conversões",
      icon: TrendingUp,
      href: "/pipeline",
      count: stats?.em_atendimento?.toString() || "0",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-dd-accent-green" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div
        className="flex items-center justify-between opacity-0 animate-in"
        style={{ animationDelay: "0.05s" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-dd-surface">
            <Zap className="h-4 w-4 text-dd-on-primary" />
          </div>
          <div>
            <h1 className="text-base font-medium tracking-tight text-dd-on-primary">
              atus
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-dd-on-muted">
              lead management
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {quickStats.map((stat, i) => (
          <div
            key={stat.label}
            className="card-premium p-4 hover:card-premium-hover transition-all duration-300 opacity-0 animate-in"
            style={{ animationDelay: `${0.1 + i * 0.05}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="h-3.5 w-3.5 text-dd-on-muted" />
              <span className="text-[10px] font-medium text-dd-accent-green/80">
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-light tracking-tight text-dd-on-primary">
              {stat.value}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-dd-on-muted mt-1.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Features */}
        <div className="col-span-2 space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-dd-on-muted px-0.5">
            Navigation
          </div>
          <div className="grid grid-cols-2 gap-2">
            {features.map((feature, i) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="card-premium p-4 group hover:card-premium-hover transition-all duration-300 opacity-0 animate-in"
                style={{ animationDelay: `${0.25 + i * 0.05}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-dd-border-subtle bg-dd-surface/[0.02]">
                    <feature.icon className="h-3.5 w-3.5 text-dd-on-muted" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-dd-on-muted">
                      {feature.count}
                    </span>
                    <ArrowUpRight className="h-3 w-3 text-dd-on-muted/60 group-hover:text-dd-on-muted transition-colors" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-dd-on-primary tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] text-dd-on-muted mt-1 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Dashboard Link */}
          <Link
            href="/dashboard"
            className="card-premium p-4 flex items-center justify-between group hover:card-premium-hover transition-all duration-300 mt-2 opacity-0 animate-in"
            style={{ animationDelay: "0.45s" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-dd-border-subtle bg-dd-surface/[0.02]">
                <LayoutDashboard className="h-3.5 w-3.5 text-dd-on-muted" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-dd-on-primary tracking-wide">
                  Dashboard
                </h3>
                <p className="text-[11px] text-dd-on-muted">
                  Visão geral completa com métricas
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-dd-on-muted/60 group-hover:text-dd-on-muted transition-colors" />
          </Link>
        </div>

        {/* Activity */}
        <div className="space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-dd-on-muted px-0.5">
            Status
          </div>
          <div
            className="card-premium p-4 space-y-4 opacity-0 animate-in"
            style={{ animationDelay: "0.3s" }}
          >
            {activity.length === 0 && (
              <p className="text-[11px] text-dd-on-muted">
                Nenhuma atividade recente
              </p>
            )}
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-dd-border-subtle bg-dd-surface/[0.02]">
                  <Users className="h-3 w-3 text-dd-on-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-dd-on-surface leading-snug">
                    {item.message}
                  </p>
                  <p className="text-[10px] text-dd-on-muted mt-0.5">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tracking CTA */}
          <Link
            href="/tracking"
            className="card-premium p-4 block group hover:card-premium-hover transition-all duration-300 opacity-0 animate-in"
            style={{ animationDelay: "0.35s" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-dd-border-subtle bg-dd-surface/[0.02]">
                <Target className="h-3.5 w-3.5 text-dd-on-muted" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-dd-on-primary tracking-wide">
                  Links Rastreados
                </h3>
                <p className="text-[11px] text-dd-on-muted">
                  Acompanhe a origem dos seus leads
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
