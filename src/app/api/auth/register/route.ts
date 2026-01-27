import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json();

    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    const normalizedPhone = trimmedPhone.replace(/[^\d+]/g, "");

    // Validasi input
    if (!name || !email || !password || !normalizedPhone) {
      return NextResponse.json(
        { error: "Nama, email, nomor telepon, dan password harus diisi" },
        { status: 400 }
      );
    }

    if (normalizedPhone.length < 9) {
      return NextResponse.json(
        { error: "Nomor telepon tidak valid" },
        { status: 400 }
      );
    }

    // Cek email sudah terdaftar di MySQL
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Hash password dengan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru di MySQL (role default: member)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: normalizedPhone,
        role: "member", // Default role adalah member
        // Explain: include updatedAt to satisfy schemas that expect a non-null value
        updatedAt: new Date(),
      },
    });

    console.log("New user registered:", { email, role: newUser.role });

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil. Silakan login dengan akun Anda.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
