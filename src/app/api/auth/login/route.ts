import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password, loginType } = await request.json();

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    // Cari user di database MySQL
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Verifikasi password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Cek apakah login admin tapi user bukan admin
    if (loginType === 'admin' && user.role !== 'admin') {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses admin" },
        { status: 403 }
      );
    }

    // Buat session token dengan signing sederhana
    const sessionData = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      timestamp: Date.now(),
    };

    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString(
      "base64"
    );

    // Set cookie berdasarkan role
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Cookie name berbeda untuk admin dan member
    const cookieName = user.role === 'admin' ? 'admin_token' : 'member_token';
    // Path harus "/" agar cookie terkirim ke semua route termasuk /api
    const cookiePath = '/';

    response.cookies.set(cookieName, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: cookiePath,
    });

    // Clear cookie dari role yang berbeda untuk menghindari konflik
    if (user.role === 'admin') {
      // Admin login - hapus member cookies
      response.cookies.set("member_token", "", { maxAge: 0, path: "/" });
      response.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
    } else {
      // Member login - hapus admin cookie dan set auth_token
      response.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
      response.cookies.set("auth_token", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
