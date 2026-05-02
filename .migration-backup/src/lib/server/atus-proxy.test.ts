import { beforeEach, describe, expect, it, vi } from "vitest";
import { proxyAtusJson } from "./atus-proxy";

describe("proxyAtusJson", () => {
  beforeEach(() => {
    process.env.ATUS_BOT_BASE_URL = "https://chatbot.atusbr.com.br";
    process.env.ATUS_BOT_API_KEY = "secret-key";
    vi.restoreAllMocks();
  });

  it("forwards the request with x-api-key and query string", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: [{ id: "1" }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      )
    );

    const response = await proxyAtusJson({
      path: "/api/v1/leads",
      searchParams: new URLSearchParams({ status: "NOVO", limit: "20" }),
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://chatbot.atusbr.com.br/api/v1/leads?status=NOVO&limit=20",
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-api-key": "secret-key",
        }),
      })
    );

    expect(response.status).toBe(200);
  });

  it("preserves backend error responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "lead not found" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        })
      )
    );

    const response = await proxyAtusJson({
      path: "/api/v1/leads/abc",
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "lead not found" });
  });
});
