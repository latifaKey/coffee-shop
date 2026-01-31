import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

// Secret key untuk signing JWT - HARUS ada di .env
const getJWTSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return new TextEncoder().encode(secret);
};

type SessionData = {
  userId: number;
  name: string;
  email: string;
  role: "admin" | "member";
  timestamp: number;
};

/**
 * Sign JWT token dengan expiration time
 * @param payload - Data yang akan di-encode ke dalam JWT
 * @param expiresIn - Durasi expiration dalam detik (default: 7 days)
 */
export async function signToken(
  payload: SessionData,
  expiresIn: number = 60 * 60 * 24 * 7 // 7 days
): Promise<string> {
  const secret = getJWTSecret();
  
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(secret);
    
  return token;
}

/**
 * Verify dan decode JWT token
 * @param token - JWT token string
 * @returns SessionData jika valid, null jika invalid atau expired
 */
export async function verifyToken(token: string): Promise<SessionData | null> {
  try {
    const secret = getJWTSecret();
    const { payload } = await jwtVerify(token, secret);
    
    return {
      userId: payload.userId as number,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as "admin" | "member",
      timestamp: payload.timestamp as number,
    };
  } catch (error) {
    // Token invalid, expired, atau signature tidak cocok
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Helper untuk mendapatkan session dari cookies (Server Component)
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
  
  // Verify JWT token
  return await verifyToken(tokenToUse);
}

/**
 * Helper untuk mendapatkan session dari request cookies (untuk route handlers)
 */
export async function getSessionFromRequest(request: Request): Promise<SessionData | null> {
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
  
  // Verify JWT token
  return await verifyToken(tokenToUse);
}

/**
 * Helper untuk mendapatkan session dari NextRequest (untuk middleware)
 */
export async function getSessionFromNextRequest(request: NextRequest): Promise<SessionData | null> {
  const adminToken = request.cookies.get("admin_token")?.value;
  const memberToken = request.cookies.get("member_token")?.value;
  const authToken = request.cookies.get("auth_token")?.value;
  const tokenToUse = adminToken || memberToken || authToken;
  
  if (!tokenToUse) return null;
  
  // Verify JWT token
  return await verifyToken(tokenToUse);
}

/**
 * Verify if request is from authenticated admin
 */
export async function verifyAdminFromRequest(request: NextRequest): Promise<boolean> {
  const session = await getSessionFromNextRequest(request);
  return session?.role === "admin";
}

/**
 * Verify if request is from authenticated member
 */
export async function verifyMemberFromRequest(request: NextRequest): Promise<boolean> {
  const session = await getSessionFromNextRequest(request);
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
