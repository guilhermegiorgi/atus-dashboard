export { dynamic, revalidate } from "@/lib/server/atus-route";

import { proxyAtusJson } from "@/lib/server/atus-proxy";

export async function GET() {
  return proxyAtusJson({ path: "/api/v1/metrics/flow" });
}
