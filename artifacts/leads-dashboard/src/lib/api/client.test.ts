import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./client";

describe("api client", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: [], meta: { total: 0 } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses same-origin proxy routes for internal requests", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://chatbot.atusbr.com.br";
    process.env.NEXT_PUBLIC_API_KEY = "public-key";

    await api.getPaginatedLeads({ limit: 20, offset: 0 });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/internal/leads?limit=20&offset=0",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Headers;

    expect(headers.get("x-api-key")).toBeNull();
    expect(headers.get("content-type")).toBeNull();
  });
});
