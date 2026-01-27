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

// GET payment proof image by registration ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const registrationId = parseInt(id);

    if (isNaN(registrationId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Get session to check authorization
    const cookies = request.cookies;
    const adminToken = cookies.get("admin_token")?.value;
    const memberToken = cookies.get("member_token")?.value;
    const authToken = cookies.get("auth_token")?.value;
    const token = adminToken || memberToken || authToken;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = getSessionFromToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get registration with payment proof
    const registration = await prisma.classregistration.findUnique({
      where: { id: registrationId },
      select: {
        id: true,
        userId: true,
        paymentProof: true
      }
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // Check authorization: admin can see all, member can only see their own
    if (session.role !== 'admin' && session.userId !== registration.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!registration.paymentProof) {
      return NextResponse.json({ error: "No payment proof found" }, { status: 404 });
    }

    // Convert Prisma Bytes to Uint8Array for NextResponse
    const imageData = new Uint8Array(registration.paymentProof);

    // Return image as blob
    return new NextResponse(imageData, {
      status: 200,
      headers: {
        'Content-Type': 'image/png', // Default to PNG, could be detected from file signature
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="payment-proof-${registrationId}.png"`
      }
    });
  } catch (error) {
    console.error("GET payment proof error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment proof" },
      { status: 500 }
    );
  }
}
