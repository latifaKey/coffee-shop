import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Helper function to decode Base64 token (same as /api/auth/me)
function decodeToken(token: string) {
  try {
    const sessionData = JSON.parse(
      Buffer.from(token, "base64").toString("utf-8")
    );
    
    if (!sessionData || !sessionData.userId || !sessionData.timestamp) {
      return null;
    }
    
    // Check if token is expired (7 days)
    const tokenAge = Date.now() - Number(sessionData.timestamp);
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    
    if (tokenAge > maxAge) {
      return null;
    }
    
    return sessionData;
  } catch {
    return null;
  }
}

// GET - Fetch current user profile
export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token")?.value;
    const memberToken = cookieStore.get("member_token")?.value;
    const legacyToken = cookieStore.get("auth_token")?.value;
    
    const token = adminToken || memberToken || legacyToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = decodeToken(token);
    if (!session) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token")?.value;
    const memberToken = cookieStore.get("member_token")?.value;
    const legacyToken = cookieStore.get("auth_token")?.value;
    
    const token = adminToken || memberToken || legacyToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = decodeToken(token);
    if (!session) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone } = body;

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

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: session.userId }
        }
      });

      if (existingUser) {
        return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(normalizedPhone !== undefined && { phone: normalizedPhone })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Update session token dengan data baru
    const newSession = {
      userId: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      timestamp: Date.now()
    };
    const newToken = Buffer.from(JSON.stringify(newSession)).toString("base64");

    // Determine which cookie to update
    const cookieName = adminToken ? "admin_token" : memberToken ? "member_token" : "auth_token";
    
    const response = NextResponse.json({ user: updatedUser, message: "Profil berhasil diperbarui" });
    
    // Set updated cookie
    response.cookies.set(cookieName, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}
