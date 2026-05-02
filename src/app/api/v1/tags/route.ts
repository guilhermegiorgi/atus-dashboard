export { dynamic, revalidate } from "@/lib/server/atus-route";

import { proxyAtusJson } from "@/lib/server/atus-proxy";

export async function GET() {
  return proxyAtusJson({ path: "/api/v1/tags" });
}

export async function POST(request: Request) {
  const body = await request.json();
  return proxyAtusJson({
    path: "/api/v1/tags",
    method: "POST",
    body,
  });
}
