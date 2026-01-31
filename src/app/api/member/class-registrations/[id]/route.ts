import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";
import { uploadFile, uploadBase64 } from "@/lib/upload-utils";

export const runtime = "nodejs";

// GET single registration by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const registration = await prisma.classregistration.findFirst({
      where: {
        id: parseInt(id),
        userId: session.userId
      }
    });

    if (!registration) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(registration);
  } catch (error) {
    console.error("GET /api/member/class-registrations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch registration" },
      { status: 500 }
    );
  }
}

// PUT update registration (only for updating payment proof)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if registration exists and belongs to user
    const existingRegistration = await prisma.classregistration.findFirst({
      where: {
        id: parseInt(id),
        userId: session.userId
      }
    });

    if (!existingRegistration) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 });
    }

    // Only allow update if status is waiting
    if (existingRegistration.status !== 'waiting') {
      return NextResponse.json({ error: "Pendaftaran tidak dapat diubah" }, { status: 400 });
    }

    // Check content type and parse accordingly
    const contentType = request.headers.get('content-type') || '';
    let paymentProofUrl: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart/form-data (file upload)
      const formData = await request.formData();
      const paymentProofFile = formData.get('paymentProof') as File;

      if (!paymentProofFile) {
        return NextResponse.json(
          { error: "Bukti pembayaran tidak valid" },
          { status: 400 }
        );
      }

      const uploadResult = await uploadFile(paymentProofFile, 'uploads/proofs');
      
      if (!uploadResult.success) {
        return NextResponse.json(
          { error: uploadResult.error || "Gagal mengunggah bukti pembayaran" },
          { status: 400 }
        );
      }

      paymentProofUrl = uploadResult.url!;
    } else {
      // Handle JSON (backward compatibility with base64)
      const body = await request.json();
      const { paymentProof } = body;

      if (!paymentProof || typeof paymentProof !== 'string') {
        return NextResponse.json(
          { error: "Bukti pembayaran tidak valid" },
          { status: 400 }
        );
      }

      const uploadResult = await uploadBase64(paymentProof, 'uploads/proofs');
      
      if (!uploadResult.success) {
        return NextResponse.json(
          { error: uploadResult.error || "Gagal mengunggah bukti pembayaran" },
          { status: 400 }
        );
      }

      paymentProofUrl = uploadResult.url!;
    }

    const updatedRegistration = await prisma.classregistration.update({
      where: { id: parseInt(id) },
      data: {
        paymentProof: paymentProofUrl
      }
    });

    return NextResponse.json(updatedRegistration);
  } catch (error) {
    console.error("PUT /api/member/class-registrations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update registration" },
      { status: 500 }
    );
  }
}

// DELETE cancel registration
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if registration exists and belongs to user
    const existingRegistration = await prisma.classregistration.findFirst({
      where: {
        id: parseInt(id),
        userId: session.userId
      }
    });

    if (!existingRegistration) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 });
    }

    // Only allow delete if status is waiting
    if (existingRegistration.status !== 'waiting') {
      return NextResponse.json({ error: "Pendaftaran tidak dapat dibatalkan" }, { status: 400 });
    }

    await prisma.classregistration.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: "Pendaftaran berhasil dibatalkan" });
  } catch (error) {
    console.error("DELETE /api/member/class-registrations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    );
  }
}

// PATCH update registration data
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if registration exists and belongs to user
    const existingRegistration = await prisma.classregistration.findFirst({
      where: {
        id: parseInt(id),
        userId: session.userId
      }
    });

    if (!existingRegistration) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 });
    }

    // Only allow edit if status is waiting
    if (existingRegistration.status !== 'waiting') {
      return NextResponse.json({ error: "Pendaftaran tidak dapat diubah karena sudah diproses" }, { status: 400 });
    }

    const body = await request.json();
    console.log("PATCH body received:", JSON.stringify(body, null, 2));
    
    const {
      fullName,
      birthDate,
      gender,
      address,
      whatsapp,
      email,
      schedulePreference,
      experience,
      previousTraining,
      trainingDetails
    } = body;

    // Validate required fields (email is optional)
    if (!fullName || !birthDate || !gender || !address || !whatsapp || !schedulePreference || !experience) {
      console.log("Validation failed - missing fields:", { fullName, birthDate, gender, address, whatsapp, schedulePreference, experience });
      return NextResponse.json(
        { error: "Semua field wajib harus diisi" },
        { status: 400 }
      );
    }

    const updatedRegistration = await prisma.classregistration.update({
      where: { id: parseInt(id) },
      data: {
        fullName,
        birthDate: new Date(birthDate),
        gender,
        address,
        whatsapp,
        email: email || null,
        schedulePreference,
        experience,
        previousTraining: previousTraining || false,
        trainingDetails: trainingDetails || null
      }
    });

    console.log("Registration updated successfully:", updatedRegistration.id);
    return NextResponse.json(updatedRegistration);
  } catch (error) {
    console.error("PATCH /api/member/class-registrations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update registration" },
      { status: 500 }
    );
  }
}
