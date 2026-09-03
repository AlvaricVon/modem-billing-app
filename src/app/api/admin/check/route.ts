import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

const ADMIN_PASS = process.env.ADMIN_PASS ?? "indosarana2026";

export function isValidAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [nonce, sig] = parts;
  const expected = createHash("sha256")
    .update(`${nonce}:${ADMIN_PASS}`)
    .digest("hex");
  return sig === expected;
}

export function getSessionToken(req: NextRequest): string | undefined {
  return req.cookies.get("admin_session")?.value;
}

export async function GET(req: NextRequest) {
  const token = getSessionToken(req);
  return NextResponse.json({ authenticated: isValidAdminSession(token) });
}
