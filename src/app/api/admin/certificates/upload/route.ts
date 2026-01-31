import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { verifyToken } from "@/lib/auth-utils";

export const runtime = "nodejs";

// POST - Upload certificate image
export async function POST(request: NextRequest) {
  try {
    const cookies = request.cookies;
    const authToken = cookies.get("auth_token")?.value;
    const adminToken = cookies.get("admin_token")?.value;
    const token = authToken || adminToken;
    
    console.log("Certificate upload - cookies:", { authToken: !!authToken, adminToken: !!adminToken });
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized - No token found" }, { status: 401 });
    }

    const session = await verifyToken(token);
    console.log("Certificate upload - session:", session);
    
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("certificate") as File | null;
    const registrationId = formData.get("registrationId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File sertifikat tidak ditemukan" }, { status: 400 });
    }

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID tidak ditemukan" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP" },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5MB" },
        { status: 400 }
      );
    }

    // Check if registration exists
    const registration = await prisma.classregistration.findUnique({
      where: { id: parseInt(registrationId) },
      include: { user: true }
    });

    if (!registration) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 });
    }

    if (registration.status !== "approved") {
      return NextResponse.json(
        { error: "Sertifikat hanya dapat diupload untuk peserta yang sudah disetujui" },
        { status: 400 }
      );
    }

    // Create certificates directory if not exists
    const uploadDir = path.join(process.cwd(), "public", "certificates");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `cert_${registrationId}_${timestamp}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update database with certificate URL
    const certificateUrl = `/certificates/${fileName}`;
    
    await prisma.classregistration.update({
      where: { id: parseInt(registrationId) },
      data: { certificateUrl }
    });

    // Create notification for member
    if (registration.userId) {
      await prisma.notification.create({
        data: {
          title: "🎓 Sertifikat Tersedia!",
          message: `Sertifikat untuk kelas "${registration.programName}" sudah tersedia. Silakan download di menu Kelas Saya.`,
          type: "success",
          target: "member",
          userId: registration.userId
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Sertifikat berhasil diupload",
      certificateUrl
    });

  } catch (error) {
    console.error("Error uploading certificate:", error);
    return NextResponse.json(
      { error: "Gagal mengupload sertifikat" },
      { status: 500 }
    );
  }
}
