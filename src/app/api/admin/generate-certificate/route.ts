import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Generate unique certificate code
function generateCertificateCode(registrationId: number, programId: string): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const programCode = programId.toUpperCase().substring(0, 3);
  const uniqueId = String(registrationId).padStart(4, '0');
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `BRZ-${programCode}-${year}${month}-${uniqueId}-${randomSuffix}`;
}

// POST - Generate certificate (simplified - no canvas for serverless compatibility)
export async function POST(request: NextRequest) {
  try {
    const cookies = request.cookies;
    const authToken = cookies.get("auth_token")?.value;
    const adminToken = cookies.get("admin_token")?.value;
    const token = authToken || adminToken;

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { registrationId, completionDate, customSkillName, customDirectorName, customInstructorName } = body;

    if (!registrationId) {
      return NextResponse.json({ success: false, error: "Registration ID diperlukan" }, { status: 400 });
    }

    // Find registration
    const registration = await prisma.classregistration.findUnique({
      where: { id: parseInt(registrationId) },
      include: { user: true }
    });

    if (!registration) {
      return NextResponse.json({ success: false, error: "Pendaftaran tidak ditemukan" }, { status: 404 });
    }

    if (registration.status !== "approved") {
      return NextResponse.json({ 
        success: false, 
        error: "Hanya peserta dengan status disetujui yang dapat digenerate sertifikatnya" 
      }, { status: 400 });
    }

    // Generate certificate code
    const certificateCode = generateCertificateCode(registration.id, registration.programId);
    
    // Format completion date
    const completionDateObj = completionDate ? new Date(completionDate) : new Date();
    
    // Update registration with certificate info (using certificateUrl to store the code)
    await prisma.classregistration.update({
      where: { id: registration.id },
      data: {
        certificateUrl: certificateCode,
        status: "completed"
      }
    });

    // Return success with certificate code (image generation disabled for serverless)
    return NextResponse.json({
      success: true,
      certificateCode,
      message: "Sertifikat berhasil digenerate. Silakan upload gambar sertifikat secara manual.",
      data: {
        registrationId: registration.id,
        userName: registration.user.name,
        programName: registration.programName,
        certificateCode,
        completionDate: completionDateObj.toISOString(),
        skillName: customSkillName || registration.programName,
        directorName: customDirectorName || 'RINA TUPON PANGUDI LUHUR, M.PD',
        instructorName: customInstructorName || 'M RIZAL NOVIANTO'
      }
    });

  } catch (error) {
    console.error("Generate certificate error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to generate certificate" 
    }, { status: 500 });
  }
}
