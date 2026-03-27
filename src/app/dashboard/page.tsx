"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { mockLeads } from "@/types/leads";

const stats = [
  {
    title: "Total Leads",
    value: mockLeads.length,
    description: "Todos os leads registrados",
    icon: Users,
    trend: "+12% este mês",
  },
  {
    title: "Leads Novos",
    value: mockLeads.filter(l => l.status === 'new').length,
    description: "Leads não contatados",
    icon: Clock,
    trend: "+5 novos hoje",
  },
  {
    title: "Convertidos",
    value: mockLeads.filter(l => l.status === 'converted').length,
    description: "Leads que converteram",
    icon: CheckCircle,
    trend: "+3 esta semana",
  },
  {
    title: "Taxa de Conversão",
    value: `${((mockLeads.filter(l => l.status === 'converted').length / mockLeads.length) * 100).toFixed(1)}%`,
    description: "De leads convertidos",
    icon: TrendingUp,
    trend: "+2.3% vs mês anterior",
  },
];

const recentLeads = mockLeads.slice(0, 5);

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral dos seus leads e métricas
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads Recentes</CardTitle>
          <CardDescription>
            Últimos 5 leads adicionados ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">{lead.company}</p>
                </div>
                <Badge variant={
                  lead.status === 'new' ? 'default' :
                  lead.status === 'contacted' ? 'secondary' :
                  lead.status === 'qualified' ? 'outline' :
                  lead.status === 'converted' ? 'default' :
                  'destructive'
                }>
                  {lead.status === 'new' ? 'Novo' :
                   lead.status === 'contacted' ? 'Contatado' :
                   lead.status === 'qualified' ? 'Qualificado' :
                   lead.status === 'converted' ? 'Convertido' :
                   'Perdido'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}