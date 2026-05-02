import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

function getAtusConfig() {
  const baseUrl = (process.env["ATUS_BOT_BASE_URL"] || process.env["NEXT_PUBLIC_API_URL"] || "").trim();
  const apiKey = (process.env["ATUS_BOT_API_KEY"] || process.env["NEXT_PUBLIC_API_KEY"] || "").trim();
  return { baseUrl, apiKey };
}

async function proxyToAtus(req: Request, res: Response, atusPath: string, method?: string) {
  const { baseUrl, apiKey } = getAtusConfig();

  if (!baseUrl || !apiKey) {
    res.status(503).json({
      error: "ATUS API not configured. Set ATUS_BOT_BASE_URL and ATUS_BOT_API_KEY environment variables.",
    });
    return;
  }

  const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const targetUrl = `${baseUrl}${atusPath}${query}`;
  const fetchMethod = method || req.method;

  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-api-key": apiKey,
  };

  try {
    const fetchOptions: RequestInit = {
      method: fetchMethod,
      headers,
    };

    if (["POST", "PUT", "PATCH"].includes(fetchMethod) && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : { error: await response.text() };

    res.status(response.status).json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: `Proxy error: ${message}` });
  }
}

// Wildcard proxy for /api/internal/* → /api/v1/internal/* (or passthrough)
// The internal routes on the Next.js side proxy to the Atus API at specific paths.
// Here we map the internal paths to the actual Atus API paths.

// Leads
router.get("/internal/leads", (req, res) => proxyToAtus(req, res, "/api/v1/leads"));
router.post("/internal/leads", (req, res) => proxyToAtus(req, res, "/api/v1/leads"));
router.get("/internal/leads/followup-queue", (req, res) => proxyToAtus(req, res, "/api/v1/leads/followup-queue"));
router.get("/internal/leads/:id", (req, res) => proxyToAtus(req, res, `/api/v1/leads/${req.params.id}`));
router.put("/internal/leads/:id", (req, res) => proxyToAtus(req, res, `/api/v1/leads/${req.params.id}`, "PUT"));
router.delete("/internal/leads/:id", (req, res) => proxyToAtus(req, res, `/api/v1/leads/${req.params.id}`, "DELETE"));
router.get("/internal/leads/:id/conversas", (req, res) => proxyToAtus(req, res, `/api/v1/leads/${req.params.id}/conversas`));
router.get("/internal/leads/:id/actions", (req, res) => proxyToAtus(req, res, `/api/v1/leads/${req.params.id}/actions`));
router.post("/internal/leads/:id/human-intervention", (req, res) => proxyToAtus(req, res, `/api/v1/leads/${req.params.id}/human-intervention`, "POST"));
router.get("/internal/leads/:id/operational-status", (req, res) => proxyToAtus(req, res, `/api/v1/leads/${req.params.id}/operational-status`));

// Inbound
router.post("/internal/inbound/leads", (req, res) => proxyToAtus(req, res, "/api/v1/inbound/leads", "POST"));

// Inbox conversations
router.get("/internal/inbox/conversations", (req, res) => proxyToAtus(req, res, "/api/v1/inbox/conversations"));
router.get("/internal/inbox/conversations/:leadId", (req, res) => proxyToAtus(req, res, `/api/v1/inbox/conversations/${req.params.leadId}`));
router.post("/internal/inbox/conversations/:leadId/messages", (req, res) => proxyToAtus(req, res, `/api/v1/inbox/conversations/${req.params.leadId}/messages`, "POST"));
router.post("/internal/inbox/conversations/:leadId/assign", (req, res) => proxyToAtus(req, res, `/api/v1/inbox/conversations/${req.params.leadId}/assign`, "POST"));
router.post("/internal/inbox/conversations/:leadId/state", (req, res) => proxyToAtus(req, res, `/api/v1/inbox/conversations/${req.params.leadId}/state`, "POST"));
router.post("/internal/inbox/conversations/:leadId/return-to-bot", (req, res) => proxyToAtus(req, res, `/api/v1/inbox/conversations/${req.params.leadId}/return-to-bot`, "POST"));

// Conversas (legacy)
router.get("/internal/conversas/:id/mensagens", (req, res) => proxyToAtus(req, res, `/api/v1/conversas/${req.params.id}/mensagens`));

// Metrics
router.get("/internal/metrics/flow", (req, res) => proxyToAtus(req, res, "/api/v1/metrics/flow"));
router.get("/internal/metrics/followup", (req, res) => proxyToAtus(req, res, "/api/v1/metrics/followup"));
router.get("/internal/metrics/sla", (req, res) => proxyToAtus(req, res, "/api/v1/metrics/sla"));

// Tracked links
router.get("/internal/tracked-links", (req, res) => proxyToAtus(req, res, "/api/v1/tracked-links"));
router.post("/internal/tracked-links", (req, res) => proxyToAtus(req, res, "/api/v1/tracked-links", "POST"));
router.get("/internal/tracked-links/:id", (req, res) => proxyToAtus(req, res, `/api/v1/tracked-links/${req.params.id}`));
router.put("/internal/tracked-links/:id", (req, res) => proxyToAtus(req, res, `/api/v1/tracked-links/${req.params.id}`, "PUT"));
router.delete("/internal/tracked-links/:id", (req, res) => proxyToAtus(req, res, `/api/v1/tracked-links/${req.params.id}`, "DELETE"));
router.get("/internal/tracked-links/:id/stats", (req, res) => proxyToAtus(req, res, `/api/v1/tracked-links/${req.params.id}/stats`));

// Analytics
router.get("/internal/analytics/overview", (req, res) => proxyToAtus(req, res, "/api/v1/analytics/overview"));
router.get("/internal/analytics/timeseries", (req, res) => proxyToAtus(req, res, "/api/v1/analytics/timeseries"));
router.get("/internal/analytics/sources", (req, res) => proxyToAtus(req, res, "/api/v1/analytics/sources"));
router.get("/internal/analytics/campaigns", (req, res) => proxyToAtus(req, res, "/api/v1/analytics/campaigns"));
router.get("/internal/analytics/corretors", (req, res) => proxyToAtus(req, res, "/api/v1/analytics/corretors"));
router.get("/internal/analytics/leads", (req, res) => proxyToAtus(req, res, "/api/v1/analytics/leads"));
router.get("/internal/analytics/rankings/origins", (req, res) => proxyToAtus(req, res, "/api/v1/analytics/rankings/origins"));
router.get("/internal/analytics/rankings/campaigns", (req, res) => proxyToAtus(req, res, "/api/v1/analytics/rankings/campaigns"));
router.get("/internal/analytics/rankings/corretors", (req, res) => proxyToAtus(req, res, "/api/v1/analytics/rankings/corretors"));
router.get("/internal/analytics/rankings/triage-ready", (req, res) => proxyToAtus(req, res, "/api/v1/analytics/rankings/triage-ready"));
router.get("/internal/analytics/rankings/lead-scores", (req, res) => proxyToAtus(req, res, "/api/v1/analytics/rankings/lead-scores"));

// Stats (legacy internal)
router.get("/internal/stats", (req, res) => proxyToAtus(req, res, "/api/v1/stats"));
router.get("/internal/stats/leads", (req, res) => proxyToAtus(req, res, "/api/v1/stats/leads"));

// MCP routes
router.get("/mcp/lead/:id", (req, res) => proxyToAtus(req, res, `/api/v1/leads/${req.params.id}`));
router.get("/mcp/lead-phone/:id/:telefone", (req, res) => proxyToAtus(req, res, `/api/v1/lead-phone/${req.params.id}/${req.params.telefone}`));
router.get("/mcp/leads", (req, res) => proxyToAtus(req, res, "/api/v1/leads"));
router.get("/mcp/stats", (req, res) => proxyToAtus(req, res, "/api/v1/stats"));

// V1 passthrough routes (direct proxy to Atus /api/v1/*)
// path-to-regexp v8 uses {*} for named wildcards
router.all("/v1/{*path}", (req, res) => {
  const pathParam = (req.params as Record<string, string>)["path"] || "";
  const atusPath = `/api/v1/${pathParam}`;
  proxyToAtus(req, res, atusPath, req.method);
});

export default router;
