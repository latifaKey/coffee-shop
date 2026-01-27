import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Helper to get session from token
function getSessionFromToken(authToken: string): { role?: string; userId?: number; email?: string } | null {
  try {
    const sessionData = JSON.parse(
      Buffer.from(authToken, 'base64').toString('utf-8')
    );
    return sessionData;
  } catch {
    return null;
  }
}

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

    const session = getSessionFromToken(token);
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
        // Exclude paymentProof binary - check existence with raw query
      },
      orderBy: { createdAt: "desc" },
    });

    // Check payment proof existence efficiently
    const regIds = registrations.map(r => r.id);
    const paymentProofCheck = regIds.length > 0 
      ? await prisma.$queryRaw<{id: number}[]>`
          SELECT id FROM classregistration 
          WHERE id IN (${regIds.join(',')}) AND paymentProof IS NOT NULL
        `.catch(() => [])
      : [];
    const hasPaymentProofSet = new Set(paymentProofCheck.map(p => p.id));

    // Transform registrations to include payment proof URL
    const transformedRegistrations = registrations.map(reg => ({
      ...reg,
      paymentProof: hasPaymentProofSet.has(reg.id) ? `/api/payment-proof/${reg.id}` : null,
      _hasPaymentProof: hasPaymentProofSet.has(reg.id)
    }));

    return NextResponse.json(transformedRegistrations);
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

    const session = getSessionFromToken(token);
    if (!session || session.role !== 'member' || !session.userId) {
      return NextResponse.json({ error: "Hanya member yang dapat mendaftar kelas" }, { status: 403 });
    }

    const userId = session.userId;

    const body = await request.json();
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
      paymentProof
    } = body;

    // Validation
    if (!programId || !programName || !fullName || !birthDate || !gender || !address || !whatsapp) {
      return NextResponse.json(
        { error: "Semua field wajib harus diisi" },
        { status: 400 }
      );
    }

    if (!selectedPackages || selectedPackages.length === 0) {
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

    // Validate payment proof (base64 data URL)
    if (!paymentProof || typeof paymentProof !== 'string' || !paymentProof.trim()) {
      console.error('Payment proof validation failed: empty or invalid type');
      return NextResponse.json(
        { error: "Bukti pembayaran wajib diunggah" },
        { status: 400 }
      );
    }

    // Convert base64 data URL to binary Buffer
    let paymentProofBuffer: Buffer | null = null;
    try {
      const base64Match = paymentProof.match(/^data:image\/[a-z]+;base64,(.+)$/);
      if (!base64Match) {
        throw new Error('Invalid data URL format');
      }
      const base64Data = base64Match[1];
      paymentProofBuffer = Buffer.from(base64Data, 'base64');
      console.log('Payment proof converted to binary:', paymentProofBuffer.length, 'bytes');
    } catch (err) {
      console.error('Failed to convert payment proof:', err);
      return NextResponse.json(
        { error: "Format bukti pembayaran tidak valid" },
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
        selectedPackages: JSON.stringify(selectedPackages),
        schedulePreference,
        experience,
        previousTraining: previousTraining || false,
        trainingDetails: trainingDetails || null,
        paymentProof: paymentProofBuffer,
        status: 'waiting'
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
