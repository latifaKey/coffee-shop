import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  
  // Cek semua kemungkinan token (prioritas: admin > member > legacy)
  const adminToken = cookieStore.get("admin_token")?.value;
  const memberToken = cookieStore.get("member_token")?.value;
  const legacyToken = cookieStore.get("auth_token")?.value;
  
  const authToken = adminToken || memberToken || legacyToken;

  if (!authToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Decode session token
    const sessionData = JSON.parse(
      Buffer.from(authToken, "base64").toString("utf-8")
    );

    // Validate token fields
    if (!sessionData || !sessionData.userId || !sessionData.timestamp) {
      console.warn("Auth: session token missing required fields", sessionData);
      return NextResponse.json({ error: "Invalid token data" }, { status: 401 });
    }

    // Check if token is expired (7 days)
    const tokenTimestamp = Number(sessionData.timestamp);
    if (isNaN(tokenTimestamp)) {
      console.warn("Auth: invalid timestamp in token", sessionData);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const tokenAge = Date.now() - tokenTimestamp;
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    if (tokenAge > maxAge) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    // Fetch full user data from database for phone
    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
