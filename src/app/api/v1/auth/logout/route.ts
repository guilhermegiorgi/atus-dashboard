export { dynamic } from "@/lib/server/atus-route";

import { NextResponse } from "next/server";

const SESSION_COOKIE = "atus-session";

export async function POST() {
  const res = NextResponse.json({ success: true });

  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}
