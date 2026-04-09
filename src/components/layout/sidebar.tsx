'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Home,
  BarChart3,
  Link2,
  MessageSquare,
  TrendingUp,
  Zap,
} from 'lucide-react';

const navigation = [
  { name: 'Início', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Análises', href: '/analytics', icon: BarChart3 },
  { name: 'Tracking', href: '/tracking', icon: Link2 },
  { name: 'Conversas', href: '/conversations', icon: MessageSquare },
  { name: 'Pipeline', href: '/pipeline', icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col glass border-r border-border/50">
      <div className="flex h-20 items-center gap-3 border-b border-border/50 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-600 glow-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight">ATUS</h1>
          <span className="text-xs text-muted-foreground">Lead Management</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                isActive
                  ? 'bg-primary/10 text-primary glow-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary" />
              )}
              <item.icon className={cn(
                'h-5 w-5 transition-transform duration-300',
                isActive ? 'scale-110' : 'group-hover:scale-110'
              )} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border/50 p-4">
        <div className="rounded-xl bg-secondary/50 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Sistema Online</span>
          </div>
          <p className="mt-1 text-sm font-medium">Dashboard v1.0</p>
        </div>
      </div>
    </div>
  );
}
