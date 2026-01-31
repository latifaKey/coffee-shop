import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const runtime = "nodejs";

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

    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get registration with payment proof URL
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

    // Read file from disk
    const filePath = join(process.cwd(), 'public', registration.paymentProof);
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Payment proof file not found" }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);

    // Detect content type from file extension
    const ext = registration.paymentProof.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp'
    };
    const contentType = contentTypeMap[ext || ''] || 'image/jpeg';

    // Return image as blob
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="payment-proof-${registrationId}.${ext}"`
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
