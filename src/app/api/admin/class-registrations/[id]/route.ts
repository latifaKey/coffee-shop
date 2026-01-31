import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";

export const runtime = "nodejs";

// GET single registration by ID (Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookies = request.cookies;
    const adminToken = cookies.get("admin_token")?.value;
    const authToken = cookies.get("auth_token")?.value;
    const token = adminToken || authToken;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const registration = await prisma.classregistration.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!registration) {
      return NextResponse.json({ success: false, error: "Pendaftaran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      registration
    });
  } catch (error) {
    console.error("GET /api/admin/class-registrations/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch registration" },
      { status: 500 }
    );
  }
}

// PUT update registration status (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookies = request.cookies;
    const adminToken = cookies.get("admin_token")?.value;
    const authToken = cookies.get("auth_token")?.value;
    const token = adminToken || authToken;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status, adminNotes, certificateUrl, completedDate } = body;

    // Check if registration exists
    const existingRegistration = await prisma.classregistration.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRegistration) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (certificateUrl !== undefined) updateData.certificateUrl = certificateUrl;
    if (completedDate) updateData.completedDate = new Date(completedDate);

    const registration = await prisma.classregistration.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      registration
    });
  } catch (error) {
    console.error("PUT /api/admin/class-registrations/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update registration" },
      { status: 500 }
    );
  }
}

// PATCH update registration status (Admin only) - Same as PUT
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookies = request.cookies;
    const adminToken = cookies.get("admin_token")?.value;
    const authToken = cookies.get("auth_token")?.value;
    const token = adminToken || authToken;
    
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status, adminNotes, notes, certificateUrl } = body;

    // Check if registration exists
    const existingRegistration = await prisma.classregistration.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRegistration) {
      return NextResponse.json({ success: false, error: "Pendaftaran tidak ditemukan" }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (status) {
      updateData.status = status;
    }
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (notes !== undefined) updateData.adminNotes = notes;
    if (certificateUrl !== undefined) updateData.certificateUrl = certificateUrl;

    const registration = await prisma.classregistration.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create notification for member when status changes
    if (status && registration.userId) {
      let notificationTitle = '';
      let notificationMessage = '';
      let notificationType = 'info';

      if (status === 'approved') {
        notificationTitle = 'Pendaftaran Disetujui';
        notificationMessage = `Selamat! Pendaftaran Anda untuk kelas "${registration.programName}" telah disetujui.`;
        notificationType = 'success';
      } else if (status === 'rejected') {
        notificationTitle = 'Pendaftaran Ditolak';
        notificationMessage = `Mohon maaf, pendaftaran Anda untuk kelas "${registration.programName}" ditolak.`;
        notificationType = 'error';
      } else if (status === 'completed') {
        notificationTitle = 'Kelas Selesai';
        notificationMessage = `Kelas "${registration.programName}" telah selesai. Terima kasih atas partisipasinya!`;
        notificationType = 'success';
      }

      if (notificationTitle) {
        await prisma.notification.create({
          data: {
            userId: registration.userId,
            target: 'member',
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
            isRead: false,
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      registration
    });
  } catch (error) {
    console.error("PATCH /api/admin/class-registrations/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update registration" },
      { status: 500 }
    );
  }
}

// DELETE registration (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookies = request.cookies;
    const adminToken = cookies.get("admin_token")?.value;
    const authToken = cookies.get("auth_token")?.value;
    const token = adminToken || authToken;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if registration exists
    const existingRegistration = await prisma.classregistration.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRegistration) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 });
    }

    await prisma.classregistration.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true, message: "Pendaftaran berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/admin/class-registrations/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete registration" },
      { status: 500 }
    );
  }
}
