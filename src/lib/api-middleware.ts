import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth-utils";

/**
 * API Middleware untuk verifikasi admin role
 * Gunakan untuk wrap API routes yang perlu admin access
 */
export async function requireAdmin(request: NextRequest): Promise<{ 
  success: true; 
  session: { userId: number; name: string; email: string; role: "admin" | "member" } 
} | { 
  success: false; 
  response: NextResponse 
}> {
  const adminToken = request.cookies.get("admin_token")?.value;
  const authToken = request.cookies.get("auth_token")?.value;
  const token = adminToken || authToken;

  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized - Token tidak ditemukan" },
        { status: 401 }
      ),
    };
  }

  const session = await verifyToken(token);

  if (!session) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized - Token tidak valid" },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "admin") {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Forbidden - Akses admin diperlukan" },
        { status: 403 }
      ),
    };
  }

  return { success: true, session };
}

/**
 * API Middleware untuk verifikasi authenticated user (admin atau member)
 */
export async function requireAuth(request: NextRequest): Promise<{ 
  success: true; 
  session: { userId: number; name: string; email: string; role: "admin" | "member" } 
} | { 
  success: false; 
  response: NextResponse 
}> {
  const adminToken = request.cookies.get("admin_token")?.value;
  const memberToken = request.cookies.get("member_token")?.value;
  const authToken = request.cookies.get("auth_token")?.value;
  const token = adminToken || memberToken || authToken;

  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized - Login diperlukan" },
        { status: 401 }
      ),
    };
  }

  const session = await verifyToken(token);

  if (!session) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized - Session tidak valid" },
        { status: 401 }
      ),
    };
  }

  return { success: true, session };
}

/**
 * API Middleware untuk verifikasi member role
 */
export async function requireMember(request: NextRequest): Promise<{ 
  success: true; 
  session: { userId: number; name: string; email: string; role: "admin" | "member" } 
} | { 
  success: false; 
  response: NextResponse 
}> {
  const memberToken = request.cookies.get("member_token")?.value;
  const authToken = request.cookies.get("auth_token")?.value;
  const token = memberToken || authToken;

  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized - Member login diperlukan" },
        { status: 401 }
      ),
    };
  }

  const session = await verifyToken(token);

  if (!session) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized - Session tidak valid" },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "member") {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Forbidden - Akses member diperlukan" },
        { status: 403 }
      ),
    };
  }

  return { success: true, session };
}
