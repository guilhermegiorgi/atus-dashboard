"use client";

import Link from "next/link";
import {
  Zap,
  Users,
  BarChart3,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  Link2,
  LayoutDashboard,
  Target,
  Clock,
  CheckCircle2,
} from "lucide-react";

const quickStats = [
  {
    label: "total leads",
    value: "2,847",
    change: "+12%",
    icon: Users,
    trend: "up",
  },
  { label: "new today", value: "156", change: "+8%", icon: Users, trend: "up" },
  {
    label: "conversions",
    value: "847",
    change: "+23%",
    icon: TrendingUp,
    trend: "up",
  },
  {
    label: "revenue",
    value: "R$ 1.2M",
    change: "+18%",
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
    count: "2.847",
  },
  {
    title: "analytics",
    description: "Visualize métricas e estatísticas em tempo real",
    icon: BarChart3,
    href: "/analytics",
    count: "12",
  },
  {
    title: "inbox",
    description: "Acompanhe todas as conversas com seus leads",
    icon: MessageSquare,
    href: "/conversations",
    count: "48",
  },
  {
    title: "pipeline",
    description: "Monitore seu funil de vendas e conversões",
    icon: TrendingUp,
    href: "/pipeline",
    count: "156",
  },
];

const recentActivity = [
  {
    type: "lead",
    message: "Novo lead: João Silva",
    time: "2 min atrás",
    icon: Users,
  },
  {
    type: "conversion",
    message: "Conversão: R$ 450.000",
    time: "15 min atrás",
    icon: CheckCircle2,
  },
  {
    type: "followup",
    message: "Follow-up enviado: Maria Santos",
    time: "32 min atrás",
    icon: Clock,
  },
  {
    type: "tracking",
    message: "Nova conversão de link rastreado",
    time: "1h atrás",
    icon: Link2,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div
        className="flex items-center justify-between opacity-0 animate-in"
        style={{ animationDelay: "0.05s" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white">
            <Zap className="h-4 w-4 text-black" />
          </div>
          <div>
            <h1 className="text-base font-medium tracking-tight text-white">
              atus
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-white/40">
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
              <stat.icon className="h-3.5 w-3.5 text-white/30" />
              <span className="text-[10px] font-medium text-emerald-400/80">
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-light tracking-tight text-white">
              {stat.value}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-white/30 mt-1.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Features */}
        <div className="col-span-2 space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-white/25 px-0.5">
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-white/[0.06] bg-white/[0.02]">
                    <feature.icon className="h-3.5 w-3.5 text-white/40" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-white/25">
                      {feature.count}
                    </span>
                    <ArrowUpRight className="h-3 w-3 text-white/15 group-hover:text-white/30 transition-colors" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-white tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] text-white/35 mt-1 leading-relaxed">
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
              <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-white/[0.06] bg-white/[0.02]">
                <LayoutDashboard className="h-3.5 w-3.5 text-white/40" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white tracking-wide">
                  Dashboard
                </h3>
                <p className="text-[11px] text-white/35">
                  Visão geral completa com métricas
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-white/15 group-hover:text-white/35 transition-colors" />
          </Link>
        </div>

        {/* Activity */}
        <div className="space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-white/25 px-0.5">
            Recent
          </div>
          <div
            className="card-premium p-4 space-y-4 opacity-0 animate-in"
            style={{ animationDelay: "0.3s" }}
          >
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-white/[0.06] bg-white/[0.02]">
                  <activity.icon className="h-3 w-3 text-white/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/70 leading-snug">
                    {activity.message}
                  </p>
                  <p className="text-[10px] text-white/25 mt-0.5">
                    {activity.time}
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
              <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-white/[0.06] bg-white/[0.02]">
                <Target className="h-3.5 w-3.5 text-white/40" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white tracking-wide">
                  Links Rastreados
                </h3>
                <p className="text-[11px] text-white/35">
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
