import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";
import { auth } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  
  // Cek semua kemungkinan token (prioritas: admin > member > legacy)
  const adminToken = cookieStore.get("admin_token")?.value;
  const memberToken = cookieStore.get("member_token")?.value;
  const legacyToken = cookieStore.get("auth_token")?.value;
  
  const authToken = adminToken || memberToken || legacyToken;

  // Try NextAuth session first (for Google OAuth users)
  const session = await auth();
  if (session?.user) {
    // Fetch full user data from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        provider: true,
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
        provider: user.provider,
      },
    });
  }

  // Fallback to JWT token (for email/password users)
  if (!authToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Verify JWT token
    const sessionData = await verifyToken(authToken);

    if (!sessionData) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
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
        provider: true,
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
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
