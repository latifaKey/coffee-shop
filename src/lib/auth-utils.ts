import { cookies } from "next/headers";
import { NextRequest } from "next/server";

type SessionData = {
  userId: number;
  name: string;
  email: string;
  role: "admin" | "member";
  timestamp: number;
};

/**
 * Helper untuk mendapatkan session dari cookies
 * Cek urutan: admin_token -> member_token -> auth_token (legacy)
 */
export async function getSessionFromCookies(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  
  // Prioritas: admin_token -> member_token -> auth_token (legacy)
  const adminToken = cookieStore.get("admin_token")?.value;
  const memberToken = cookieStore.get("member_token")?.value;
  const legacyToken = cookieStore.get("auth_token")?.value;
  
  const tokenToUse = adminToken || memberToken || legacyToken;
  
  if (!tokenToUse) {
    return null;
  }
  
  try {
    const sessionData = JSON.parse(
      Buffer.from(tokenToUse, "base64").toString("utf-8")
    ) as SessionData;
    return sessionData;
  } catch {
    return null;
  }
}

/**
 * Helper untuk mendapatkan session dari request cookies (untuk route handlers)
 */
export function getSessionFromRequest(request: Request): SessionData | null {
  // Parse cookies from request
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies: Record<string, string> = {};
  
  cookieHeader.split(";").forEach(cookie => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = value;
    }
  });
  
  // Prioritas: admin_token -> member_token -> auth_token (legacy)
  const tokenToUse = cookies.admin_token || cookies.member_token || cookies.auth_token;
  
  if (!tokenToUse) {
    return null;
  }
  
  try {
    const sessionData = JSON.parse(
      Buffer.from(tokenToUse, "base64").toString("utf-8")
    ) as SessionData;
    return sessionData;
  } catch {
    return null;
  }
}

/**
 * Helper untuk mendapatkan session dari NextRequest (untuk API routes)
 */
export function getSessionFromNextRequest(request: NextRequest): SessionData | null {
  const adminToken = request.cookies.get("admin_token")?.value;
  const memberToken = request.cookies.get("member_token")?.value;
  const authToken = request.cookies.get("auth_token")?.value;
  const tokenToUse = adminToken || memberToken || authToken;
  
  if (!tokenToUse) return null;
  
  try {
    const session = JSON.parse(Buffer.from(tokenToUse, "base64").toString("utf-8")) as SessionData;
    return session;
  } catch {
    return null;
  }
}

/**
 * Verify if request is from authenticated admin
 */
export function verifyAdminFromRequest(request: NextRequest): boolean {
  const session = getSessionFromNextRequest(request);
  return session?.role === "admin";
}

/**
 * Verify if request is from authenticated member
 */
export function verifyMemberFromRequest(request: NextRequest): boolean {
  const session = getSessionFromNextRequest(request);
  return session?.role === "member";
}

/**
 * Check if user is authenticated as admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSessionFromCookies();
  return session?.role === "admin";
}

/**
 * Check if user is authenticated (any role)
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSessionFromCookies();
  return session !== null;
}
