export { dynamic, revalidate } from "@/lib/server/atus-route";

import { proxyAtusJson } from "@/lib/server/atus-proxy";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_: Request, { params }: RouteContext) {
  return proxyAtusJson({
    path: `/api/v1/tracked-links/${params.id}`,
  });
}
