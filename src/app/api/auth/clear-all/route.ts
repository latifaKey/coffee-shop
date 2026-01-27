import { NextResponse } from "next/server";

// Endpoint untuk clear SEMUA auth cookies
// Akses via: GET /api/auth/clear-all
export async function GET() {
  const response = NextResponse.json({
    success: true,
    message: "Semua cookies auth telah dihapus. Silakan login ulang.",
  });

  // Clear auth_token (legacy) dengan semua path yang mungkin
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  // Clear member_token
  response.cookies.set("member_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  // Clear admin_token
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/admin",
  });

  // Juga clear admin_token dengan path / untuk jaga-jaga
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
