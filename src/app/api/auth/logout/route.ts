import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Cek apakah logout dari admin atau member
  const { logoutType } = await request.json().catch(() => ({}));
  
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil",
  });

  // Clear semua auth cookies (JWT tokens)
  // Path harus "/" untuk menghapus dari semua routes
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  response.cookies.set("member_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
