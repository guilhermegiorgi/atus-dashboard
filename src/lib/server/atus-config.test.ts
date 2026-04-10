import { afterEach, describe, expect, it } from "vitest";
import { getAtusBotConfig } from "./atus-config";

const ORIGINAL_ENV = { ...process.env };

describe("getAtusBotConfig", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("reads server-only AtusBot env vars", () => {
    process.env.ATUS_BOT_BASE_URL = "https://chatbot.atusbr.com.br";
    process.env.ATUS_BOT_API_KEY = "secret-key";

    expect(getAtusBotConfig()).toEqual({
      baseUrl: "https://chatbot.atusbr.com.br",
      apiKey: "secret-key",
    });
  });

  it("throws when a required env var is missing", () => {
    delete process.env.ATUS_BOT_BASE_URL;
    process.env.ATUS_BOT_API_KEY = "secret-key";

    expect(() => getAtusBotConfig()).toThrow(
      "Missing required env var: ATUS_BOT_BASE_URL"
    );
  });
});
