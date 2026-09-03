import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";

const ADMIN_USER = process.env.ADMIN_USER ?? "admin";
const ADMIN_PASS = process.env.ADMIN_PASS ?? "indosarana2026";

function sign(value: string) {
  return createHash("sha256")
    .update(`${value}:${ADMIN_PASS}`)
    .digest("hex");
}

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = (await req.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const username = (body.username ?? "").trim();
  const password = body.password ?? "";

  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return NextResponse.json(
      { error: "Username atau password salah" },
      { status: 401 }
    );
  }

  const nonce = randomBytes(24).toString("hex");
  const sessionToken = `${nonce}.${sign(nonce)}`;

  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_session", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return res;
}
