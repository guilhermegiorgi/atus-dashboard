import Link from "next/link";
import { Zap, ArrowRight, Users, BarChart3, MessageSquare, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Gestão de Leads",
    description: "Gerencie e acompanhe todos os seus leads em um só lugar",
  },
  {
    icon: BarChart3,
    title: "Análises Detalhadas",
    description: "Visualize métricas e estatísticas em tempo real",
  },
  {
    icon: MessageSquare,
    title: "Conversas",
    description: "Acompanhe todas as conversas com seus leads",
  },
  {
    icon: TrendingUp,
    title: "Pipeline de Vendas",
    description: "Acompanhe o funil de vendas e conversões",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16 animate-fade-in">
      <div className="flex flex-col items-center justify-center py-16 space-y-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-600 glow-primary-strong animate-pulse">
          <Zap className="h-10 w-10 text-primary-foreground" />
        </div>
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="text-gradient">ATUS</span> Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Plataforma completa para gestão de leads e conversas da Atus
          </p>
        </div>
        <Link href="/dashboard">
          <button className="group flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 glow-primary">
            <span>Acessar Dashboard</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="group glass rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:glow-primary animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-8 border border-border/50">
        <h2 className="text-2xl font-bold mb-4">Sobre a Plataforma</h2>
        <p className="text-muted-foreground leading-relaxed">
          O ATUS Dashboard é uma plataforma moderna de gestão de leads, projetada para ajudar 
          sua equipe a acompanhar, analisar e converter leads de forma eficiente. Com métricas 
          em tempo real, visualização de conversas e um pipeline de vendas intuitivo, você 
          terá total controle sobre seu funil comercial.
        </p>
      </div>
    </div>
  );
}
