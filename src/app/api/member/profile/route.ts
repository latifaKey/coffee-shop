import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth-utils";
import { auth } from "@/lib/auth";

// GET - Get user profile
export async function GET() {
  try {
    const cookieStore = await cookies();
    const memberToken = cookieStore.get("member_token")?.value;
    const legacyToken = cookieStore.get("auth_token")?.value;
    
    const token = memberToken || legacyToken;

    // Try NextAuth session first (for Google OAuth users)
    const session = await auth();
    let userId: number | undefined;

    if (session?.user?.email) {
      // Get user ID from email
      const userFromEmail = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });
      userId = userFromEmail?.id;
    } else if (token) {
      // Fallback to JWT token
      const jwtSession = await verifyToken(token);
      if (!jwtSession) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
      }
      userId = jwtSession.userId;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        provider: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const memberToken = cookieStore.get("member_token")?.value;
    const legacyToken = cookieStore.get("auth_token")?.value;
    
    const token = memberToken || legacyToken;

    // Try NextAuth session first (for Google OAuth users)
    const session = await auth();
    let userId: number | undefined;

    if (session?.user?.email) {
      // Get user ID from email
      const userFromEmail = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });
      userId = userFromEmail?.id;
    } else if (token) {
      // Fallback to JWT token
      const jwtSession = await verifyToken(token);
      if (!jwtSession) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      userId = jwtSession.userId;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone } = body;

    let normalizedPhone: string | undefined;
    if (phone !== undefined) {
      const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
      if (!trimmedPhone) {
        return NextResponse.json({ error: "Nomor telepon wajib diisi" }, { status: 400 });
      }
      const digitsOnly = trimmedPhone.replace(/[^\d+]/g, "");
      if (digitsOnly.length < 9) {
        return NextResponse.json({ error: "Nomor telepon tidak valid" }, { status: 400 });
      }
      normalizedPhone = digitsOnly;
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        ...(normalizedPhone !== undefined && { phone: normalizedPhone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Profil berhasil diperbarui",
      user: updatedUser 
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
