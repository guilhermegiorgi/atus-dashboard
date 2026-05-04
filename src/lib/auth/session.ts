import "server-only";

import { cookies } from "next/headers";

const SESSION_COOKIE = "atus-session";

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getSessionToken();
  return !!token;
}
