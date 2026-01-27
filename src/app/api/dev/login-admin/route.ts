import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  const sessionData = {
    userId: "admin-dev",
    name: "Admin Dev",
    email: "admin@barizta.com",
    role: "admin",
    timestamp: Date.now(),
  };

  const token = Buffer.from(JSON.stringify(sessionData)).toString("base64");

  const res = NextResponse.json({ ok: true, message: "dev admin login set" });
  res.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: (process.env.NODE_ENV as string | undefined) === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}
