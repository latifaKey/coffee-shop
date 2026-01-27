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

// GET all class registrations (Admin only)
export async function GET(request: NextRequest) {
  try {
    const cookies = request.cookies;
    const adminToken = cookies.get("admin_token")?.value;
    const authToken = cookies.get("auth_token")?.value;
    const token = adminToken || authToken;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = getSessionFromToken(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const programId = searchParams.get("programId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (programId && programId !== 'all') {
      where.programId = programId;
    }

    // Optimized query - exclude binary paymentProof, use select with pagination
    const [total, registrations] = await Promise.all([
      prisma.classregistration.count({ where }),
      prisma.classregistration.findMany({
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
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
          // Exclude paymentProof binary data
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      })
    ]);

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

    return NextResponse.json({ 
      success: true, 
      registrations: transformedRegistrations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("GET /api/admin/class-registrations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
