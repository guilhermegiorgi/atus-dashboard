import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Bem-vindo ao Atus Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Sistema de gerenciamento de leads
        </p>
        <Link href="/dashboard">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Ir para o Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}