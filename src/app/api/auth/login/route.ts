import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth-utils";
import { z } from "zod";

// ============================================
// RATE LIMITING - Prevent Brute Force Attacks
// ============================================
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of loginAttempts.entries()) {
      if (data.resetAt < now) {
        loginAttempts.delete(ip);
      }
    }
  }, 300000);
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  
  if (record) {
    if (record.resetAt < now) {
      loginAttempts.set(ip, { count: 1, resetAt: now + 60000 }); // 1 minute window
      return true;
    }
    if (record.count >= 5) { // Max 5 attempts per minute
      return false;
    }
    record.count++;
    return true;
  } else {
    loginAttempts.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
}

// ============================================
// INPUT VALIDATION SCHEMA
// ============================================
const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung huruf besar")
    .regex(/[a-z]/, "Password harus mengandung huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung angka"),
  loginType: z.enum(["admin", "member"]).optional(),
});

export async function POST(request: Request) {
  try {
    // Rate limiting check
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan login. Coba lagi dalam 1 menit." },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate input with Zod
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Input tidak valid", 
          details: validationResult.error.issues[0].message 
        },
        { status: 400 }
      );
    }
    
    const { email, password, loginType } = validationResult.data;

    // Cari user di database
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

    // Buat session data untuk JWT payload
    const sessionData = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "member",
      timestamp: Date.now(),
    };

    // Generate JWT token dengan signature
    const jwtToken = await signToken(sessionData, 60 * 60 * 24 * 7); // 7 days

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

    // Set JWT token ke HTTP-only cookie
    response.cookies.set(cookieName, jwtToken, {
      httpOnly: true, // Tidak bisa diakses dari JavaScript client-side
      secure: process.env.NODE_ENV === "production", // HTTPS only di production
      sameSite: "lax", // CSRF protection
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/', // Available di semua routes
    });

    // Clear cookie dari role yang berbeda untuk menghindari konflik
    if (user.role === 'admin') {
      // Admin login - hapus member cookies
      response.cookies.set("member_token", "", { maxAge: 0, path: "/" });
      response.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
    } else {
      // Member login - hapus admin cookie dan set auth_token untuk backward compatibility
      response.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
      response.cookies.set("auth_token", jwtToken, {
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
