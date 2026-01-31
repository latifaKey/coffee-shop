import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";

// Helper to convert BigInt to Number for JSON serialization
function serializeClass(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'bigint') {
      result[key] = Number(value);
    } else if (value instanceof Date) {
      result[key] = value.toISOString();
    } else {
      result[key] = value;
    }
  }
  return result;
}

// GET all classes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    
    // Validate status to prevent SQL injection - only allow specific values
    const allowedStatuses = ["active", "inactive", "all", null];
    const sanitizedStatus = allowedStatuses.includes(status) ? status : null;
    
    // Use Prisma ORM for safe queries with proper relations
    const whereClause = sanitizedStatus && sanitizedStatus !== "all" 
      ? { status: sanitizedStatus } 
      : {};
    
    // Optimized query with select and efficient _count
    const classes = await prisma.renamedclass.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        instructor: true,
        schedule: true,
        duration: true,
        totalSessions: true,
        location: true,
        level: true,
        price: true,
        maxParticipants: true,
        enrolledCount: true,
        status: true,
        isActive: true,
        image: true,
        createdAt: true,
        _count: {
          select: { enrollment: true }
        }
      },
      orderBy: { schedule: 'asc' }
    });
    
    // Transform to include enrollmentCount for backward compatibility
    const transformedClasses = classes.map(c => ({
      ...c,
      enrollmentCount: c._count.enrollment,
      _count: undefined
    }));

    return NextResponse.json(transformedClasses);
  } catch (error) {
    console.error("GET /api/classes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

// Helper function to verify admin role from token
async function verifyAdminRole(request: NextRequest): Promise<boolean> {
  const adminToken = request.cookies.get("admin_token")?.value;
  const authToken = request.cookies.get("auth_token")?.value;
  const tokenToUse = adminToken || authToken;
  
  if (!tokenToUse) return false;
  
  const session = await verifyToken(tokenToUse);
  return session?.role === "admin";
}

// POST new class
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication and role
    if (!(await verifyAdminRole(request))) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      instructor, 
      schedule, 
      price, 
      maxParticipants,
      image,
      duration,
      totalSessions,
      location,
      level,
      isActive 
    } = body;

    // Validation - schedule is optional
    if (!title || !description || !instructor || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const classItem = await prisma.renamedclass.create({
      data: {
        title,
        description,
        instructor,
        schedule: schedule ? new Date(schedule) : null,
        duration: duration || "02:00",
        // totalSessions is set via raw SQL below
        location: location || "Barizta Coffee Shop",
        level: level || "Pemula",
        price: price !== undefined && price !== null ? parseInt(price.toString()) : 0,
        maxParticipants: maxParticipants !== undefined && maxParticipants !== null ? parseInt(maxParticipants?.toString() || '10') : 10,
        enrolledCount: 0,
        status: isActive === false ? "inactive" : "active",
        isActive: isActive !== false,
        image: image || "/images/menu/default.jpg",
        updatedAt: new Date(),
      },
    });

    // Set totalSessions using raw SQL since Prisma client needs regeneration
    const sessionsValue = totalSessions !== undefined && totalSessions !== null ? parseInt(totalSessions.toString()) : 4;
    await prisma.$executeRawUnsafe(
      `UPDATE class SET "totalSessions" = $1 WHERE id = $2`,
      sessionsValue,
      classItem.id
    );

    return NextResponse.json({ ...classItem, totalSessions: sessionsValue }, { status: 201 });
  } catch (error) {
    console.error("POST /api/classes error:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}
