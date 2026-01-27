import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email diperlukan" },
        { status: 400 }
      );
    }

    console.log("Forgot password request for:", email);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      console.log("User not found:", email);
      return NextResponse.json({
        success: true,
        message: "Jika email terdaftar, instruksi reset akan dikirim.",
      });
    }

    console.log("User found:", user.name, user.email);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    console.log("Reset token saved for user:", user.id);

    // Send email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      resetToken,
      user.name
    );

    console.log("Email result:", emailResult);

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      // Still return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: "Jika email terdaftar, instruksi reset akan dikirim.",
        // For development: show reset link if email fails
        ...(process.env.NODE_ENV === "development" && {
          devResetLink: `http://localhost:3000/auth/reset-password?token=${resetToken}`,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Email reset password telah dikirim.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
