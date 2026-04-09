import "server-only";

function readRequiredEnv(name: "ATUS_BOT_BASE_URL" | "ATUS_BOT_API_KEY") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

export function getAtusBotConfig() {
  return {
    baseUrl: readRequiredEnv("ATUS_BOT_BASE_URL"),
    apiKey: readRequiredEnv("ATUS_BOT_API_KEY"),
  };
}
