export { dynamic, revalidate } from "@/lib/server/atus-route";

import { NextResponse } from "next/server";
import { getAtusBotConfig } from "@/lib/server/atus-config";

interface LeadRaw {
  id: string;
  nome_completo?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  em_follow_up?: boolean;
  telefone?: string;
}

interface ActivityItem {
  id: string;
  type: "lead" | "conversion" | "followup" | "status_change";
  message: string;
  time: string;
  lead_id: string;
}

function buildActivityFromLead(lead: LeadRaw): ActivityItem | null {
  const name = lead.nome_completo || "Lead";
  const status = lead.status || "NOVO";

  if (status === "CONVERTIDO") {
    return {
      id: `conv-${lead.id}`,
      type: "conversion",
      message: `${name} convertido`,
      time: lead.updated_at || lead.created_at || "",
      lead_id: lead.id,
    };
  }

  if (lead.em_follow_up) {
    return {
      id: `fu-${lead.id}`,
      type: "followup",
      message: `${name} em follow-up`,
      time: lead.updated_at || lead.created_at || "",
      lead_id: lead.id,
    };
  }

  if (status === "EM_ATENDIMENTO") {
    return {
      id: `at-${lead.id}`,
      type: "lead",
      message: `${name} em atendimento`,
      time: lead.updated_at || lead.created_at || "",
      lead_id: lead.id,
    };
  }

  if (status === "NOVO") {
    return {
      id: `novo-${lead.id}`,
      type: "lead",
      message: `Novo lead: ${name}`,
      time: lead.created_at || "",
      lead_id: lead.id,
    };
  }

  return null;
}

function formatRelativeTime(isoDate: string): string {
  if (!isoDate) return "";
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d`;
}

export async function GET() {
  const { baseUrl, apiKey } = getAtusBotConfig();

  try {
    const response = await fetch(`${baseUrl}/api/v1/leads?limit=10`, {
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { data: [], error: "Failed to fetch activity" },
        { status: response.status },
      );
    }

    const payload = await response.json();
    const leads: LeadRaw[] = payload.data || [];

    const activities: ActivityItem[] = leads
      .map(buildActivityFromLead)
      .filter((item): item is ActivityItem => item !== null)
      .slice(0, 5)
      .map((item) => ({
        ...item,
        time: formatRelativeTime(item.time),
      }));

    return NextResponse.json({ data: activities });
  } catch {
    return NextResponse.json(
      { data: [], error: "Internal error" },
      { status: 500 },
    );
  }
}
