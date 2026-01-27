import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH update enrollment (payment status, certificate, etc)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin auth
    const cookies = request.cookies;
    const authToken = cookies.get("auth_token");
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const enrollment = await prisma.enrollment.update({
      where: { id: parseInt(id) },
      data: body,
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error(`PATCH /api/enrollments/${(await params).id} error:`, error);
    return NextResponse.json(
      { error: "Failed to update enrollment" },
      { status: 500 }
    );
  }
}

// DELETE enrollment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin auth
    const cookies = request.cookies;
    const authToken = cookies.get("auth_token");
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Get enrollment to update class count
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(id) },
    });

    if (enrollment) {
      await prisma.enrollment.delete({
        where: { id: parseInt(id) },
      });

      // Decrement enrolled count
      const classItem = await prisma.renamedclass.findUnique({
        where: { id: enrollment.classId },
      });

      if (classItem) {
        await prisma.renamedclass.update({
          where: { id: enrollment.classId },
          data: { 
            enrolledCount: Math.max(0, classItem.enrolledCount - 1),
            status: classItem.enrolledCount - 1 < classItem.maxParticipants && classItem.status === "full" 
              ? "active" 
              : classItem.status,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/enrollments/${(await params).id} error:`, error);
    return NextResponse.json(
      { error: "Failed to delete enrollment" },
      { status: 500 }
    );
  }
}
