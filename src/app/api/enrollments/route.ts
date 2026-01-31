import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";

// GET all enrollments (optionally filter by classId) - Admin only
export async function GET(request: NextRequest) {
  try {
    // Check admin auth - support both admin_token and auth_token
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

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    const where: Record<string, unknown> = {};
    if (classId) where.classId = parseInt(classId);

    // Optimized query with select and pagination
    const [total, enrollments] = await Promise.all([
      prisma.enrollment.count({ where }),
      prisma.enrollment.findMany({
        where,
        select: {
          id: true,
          classId: true,
          userId: true,
          studentName: true,
          email: true,
          phone: true,
          certificateUrl: true,
          createdAt: true,
          Renamedclass: {
            select: {
              id: true,
              title: true,
              instructor: true,
              schedule: true,
              status: true,
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      })
    ]);

    // Map Renamedclass to class for frontend compatibility
    const mappedEnrollments = enrollments.map(e => ({
      ...e,
      class: e.Renamedclass,
      member: e.user,
      Renamedclass: undefined,
    }));

    return NextResponse.json({
      data: mappedEnrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("GET /api/enrollments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

// POST new enrollment - Members only
export async function POST(request: NextRequest) {
  try {
    // Check member auth
    const cookies = request.cookies;
    const authToken = cookies.get("auth_token")?.value;
    
    if (!authToken) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const session = await verifyToken(authToken);
    if (!session || session.role !== 'member') {
      return NextResponse.json({ error: "Hanya member yang dapat mendaftar kelas" }, { status: 403 });
    }

    const body = await request.json();
    const { classId, studentName, email, phone } = body;

    if (!classId || !studentName || !email || !phone) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // Check if class exists and is available
    const classItem = await prisma.renamedclass.findUnique({
      where: { id: parseInt(classId) },
    });

    if (!classItem) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    if (classItem.status !== 'active') {
      return NextResponse.json({ error: "Kelas tidak aktif" }, { status: 400 });
    }

    if (classItem.enrolledCount >= classItem.maxParticipants) {
      return NextResponse.json({ error: "Kelas sudah penuh" }, { status: 400 });
    }

    // Check if user already enrolled in this class
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        classId: parseInt(classId),
        email: email
      }
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: "Anda sudah terdaftar di kelas ini" }, { status: 400 });
    }

    // Create enrollment with userId from session
    const enrollment = await prisma.enrollment.create({
      data: {
        classId: parseInt(classId),
        userId: session.userId || null,
        studentName,
        email,
        phone,
      },
    });

    // Update enrolled count
    await prisma.renamedclass.update({
      where: { id: parseInt(classId) },
      data: { 
        enrolledCount: classItem.enrolledCount + 1,
        status: classItem.enrolledCount + 1 >= classItem.maxParticipants ? "full" : classItem.status,
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("POST /api/enrollments error:", error);
    return NextResponse.json(
      { error: "Gagal mendaftar kelas" },
      { status: 500 }
    );
  }
}
