import "server-only";

function readRequiredEnv(
  primary: "ATUS_BOT_BASE_URL" | "ATUS_BOT_API_KEY",
  fallback?: "NEXT_PUBLIC_API_URL" | "NEXT_PUBLIC_API_KEY"
) {
  const value = process.env[primary]?.trim() || process.env[fallback ?? ""]?.trim();

  if (!value) {
    throw new Error(`Missing required env var: ${primary}`);
  }

  return value;
}

export function getAtusBotConfig() {
  return {
    baseUrl: readRequiredEnv("ATUS_BOT_BASE_URL", "NEXT_PUBLIC_API_URL"),
    apiKey: readRequiredEnv("ATUS_BOT_API_KEY", "NEXT_PUBLIC_API_KEY"),
  };
}
