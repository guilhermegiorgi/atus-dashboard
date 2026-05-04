function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<unknown>>,
) {
  const csv = [
    headers.map(escapeCsvField).join(","),
    ...rows.map((row) => row.map(escapeCsvField).join(",")),
  ].join("\n");

  const blob = new Blob(["﻿" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportLeadsCsv(
  leads: Array<Record<string, unknown>>,
  filename = "leads",
) {
  const headers = [
    "Nome",
    "Telefone",
    "Email",
    "Status",
    "Tipo Interesse",
    "Canal Origem",
    "Sistema Origem",
    "Corretor",
    "Follow-up",
    "Criado em",
    "Atualizado em",
  ];

  const rows = leads.map((l) => [
    l.nome_completo,
    l.telefone,
    l.email,
    l.status,
    l.tipo_interesse,
    l.canal_origem,
    l.sistema_origem,
    l.corretor_id,
    l.em_follow_up ? "Sim" : "Não",
    l.created_at,
    l.updated_at,
  ]);

  downloadCsv(filename, headers, rows);
}

export function exportAnalyticsCsv(
  data: Array<Record<string, unknown>>,
  columns: Array<{ key: string; label: string }>,
  filename = "analytics",
) {
  const headers = columns.map((c) => c.label);
  const rows = data.map((row) => columns.map((c) => row[c.key]));
  downloadCsv(filename, headers, rows);
}
