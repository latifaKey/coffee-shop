import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";
import { uploadFile, uploadBase64 } from "@/lib/upload-utils";

export const runtime = "nodejs";

// GET member's class registrations
export async function GET(request: NextRequest) {
  try {
    const cookies = request.cookies;
    const memberToken = cookies.get("member_token")?.value;
    const authToken = cookies.get("auth_token")?.value;
    const token = memberToken || authToken;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session || session.role !== 'member' || !session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = session.userId;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type"); // 'active' or 'history'

    // Build where clause
    const where: Record<string, unknown> = {
      userId
    };

    if (type === 'history') {
      // History: completed registrations
      where.status = 'completed';
    } else if (type === 'active') {
      // Active: not completed
      where.status = { not: 'completed' };
    } else if (status && status !== 'all') {
      where.status = status;
    }

    // Optimized query - exclude binary paymentProof, use select
    const registrations = await prisma.classregistration.findMany({
      where,
      select: {
        id: true,
        userId: true,
        programId: true,
        programName: true,
        fullName: true,
        birthDate: true,
        gender: true,
        address: true,
        whatsapp: true,
        email: true,
        selectedPackages: true,
        schedulePreference: true,
        experience: true,
        previousTraining: true,
        trainingDetails: true,
        status: true,
        adminNotes: true,
        certificateUrl: true,
        createdAt: true,
        updatedAt: true,
        paymentProof: true, // Now it's a String URL
        paymentStatus: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("GET /api/member/class-registrations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

// POST new class registration
export async function POST(request: NextRequest) {
  try {
    const cookies = request.cookies;
    const memberToken = cookies.get("member_token")?.value;
    const authToken = cookies.get("auth_token")?.value;
    const token = memberToken || authToken;
    
    if (!token) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session || session.role !== 'member' || !session.userId) {
      return NextResponse.json({ error: "Hanya member yang dapat mendaftar kelas" }, { status: 403 });
    }

    const userId = session.userId;

    // Check content type and parse accordingly
    const contentType = request.headers.get('content-type') || '';
    let formData: any = {};
    let paymentProofFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart/form-data (file upload)
      const data = await request.formData();
      
      // Extract form fields
      formData = {
        programId: data.get('programId') as string,
        programName: data.get('programName') as string,
        fullName: data.get('fullName') as string,
        birthDate: data.get('birthDate') as string,
        gender: data.get('gender') as string,
        address: data.get('address') as string,
        whatsapp: data.get('whatsapp') as string,
        email: data.get('email') as string || null,
        selectedPackages: data.get('selectedPackages') as string,
        schedulePreference: data.get('schedulePreference') as string,
        experience: data.get('experience') as string,
        previousTraining: data.get('previousTraining') === 'true',
        trainingDetails: data.get('trainingDetails') as string || null,
      };

      // Get file
      paymentProofFile = data.get('paymentProof') as File;
    } else {
      // Handle JSON (backward compatibility with base64)
      formData = await request.json();
    }

    const {
      programId,
      programName,
      fullName,
      birthDate,
      gender,
      address,
      whatsapp,
      email,
      selectedPackages,
      schedulePreference,
      experience,
      previousTraining,
      trainingDetails,
      paymentProof // base64 string (for backward compatibility)
    } = formData;

    // Validation
    if (!programId || !programName || !fullName || !birthDate || !gender || !address || !whatsapp) {
      return NextResponse.json(
        { error: "Semua field wajib harus diisi" },
        { status: 400 }
      );
    }

    // Parse selectedPackages if it's a string
    let packages = selectedPackages;
    if (typeof selectedPackages === 'string') {
      try {
        packages = JSON.parse(selectedPackages);
      } catch {
        packages = selectedPackages;
      }
    }

    if (!packages || (Array.isArray(packages) && packages.length === 0)) {
      return NextResponse.json(
        { error: "Pilih minimal satu paket pelatihan" },
        { status: 400 }
      );
    }

    if (!schedulePreference) {
      return NextResponse.json(
        { error: "Pilih jadwal pelatihan" },
        { status: 400 }
      );
    }

    if (!experience) {
      return NextResponse.json(
        { error: "Pilih pengalaman barista" },
        { status: 400 }
      );
    }

    // Check if user already registered for this program and still active
    const existingRegistration = await prisma.classregistration.findFirst({
      where: {
        userId,
        programId,
        status: { notIn: ['rejected', 'completed'] }
      }
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "Anda sudah mendaftar untuk program ini dan masih dalam proses" },
        { status: 400 }
      );
    }

    // Handle payment proof upload
    let paymentProofUrl: string | null = null;

    if (paymentProofFile) {
      // Upload file from multipart/form-data
      const uploadResult = await uploadFile(paymentProofFile, 'uploads/proofs');
      
      if (!uploadResult.success) {
        return NextResponse.json(
          { error: uploadResult.error || "Gagal mengunggah bukti pembayaran" },
          { status: 400 }
        );
      }

      paymentProofUrl = uploadResult.url!;
    } else if (paymentProof) {
      // Upload from base64 (backward compatibility)
      const uploadResult = await uploadBase64(paymentProof, 'uploads/proofs');
      
      if (!uploadResult.success) {
        return NextResponse.json(
          { error: uploadResult.error || "Gagal mengunggah bukti pembayaran" },
          { status: 400 }
        );
      }

      paymentProofUrl = uploadResult.url!;
    } else {
      return NextResponse.json(
        { error: "Bukti pembayaran wajib diunggah" },
        { status: 400 }
      );
    }

    // Create registration
    const registration = await prisma.classregistration.create({
      data: {
        userId,
        programId,
        programName,
        fullName,
        birthDate: new Date(birthDate),
        gender,
        address,
        whatsapp,
        email: email || null,
        selectedPackages: typeof packages === 'string' ? packages : JSON.stringify(packages),
        schedulePreference,
        experience,
        previousTraining: previousTraining || false,
        trainingDetails: trainingDetails || null,
        paymentProof: paymentProofUrl,
        status: 'waiting',
        paymentStatus: 'pending'
      }
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        target: 'admin',
        title: 'Pendaftaran Kelas Baru',
        message: `${fullName} mendaftar untuk kelas "${programName}"`,
        type: 'info',
        isRead: false,
      }
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error("POST /api/member/class-registrations error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: "Gagal mendaftar kelas. Silakan coba lagi.", details: errorMessage },
      { status: 500 }
    );
  }
}
