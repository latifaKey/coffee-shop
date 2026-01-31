import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

// GET single class
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Use raw SQL to get class with totalSessions
    const classItems = await prisma.$queryRawUnsafe(
      `SELECT * FROM class WHERE id = $1`,
      parseInt(id)
    ) as Record<string, unknown>[];
    
    const classItem = Array.isArray(classItems) && classItems.length > 0 ? serializeClass(classItems[0]) : null;

    if (!classItem) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json(classItem);
  } catch (error) {
    console.error(`GET /api/classes/${(await params).id} error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}

// PATCH update class (partial update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin auth
    const cookies = request.cookies;
    const authToken = cookies.get("auth_token") || cookies.get("admin_token");
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Build update data with type conversions
    const updateData: Record<string, unknown> = { ...body };
    if (body.schedule) updateData.schedule = new Date(body.schedule);
    if (body.price) updateData.price = parseInt(body.price);
    if (body.maxParticipants) updateData.maxParticipants = parseInt(body.maxParticipants);
    // totalSessions will be added after Prisma client regeneration
    delete updateData.totalSessions;
    updateData.updatedAt = new Date();

    const classItem = await prisma.renamedclass.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json(classItem);
  } catch (error) {
    console.error(`PATCH /api/classes/${(await params).id} error:`, error);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}

// PUT update class (full update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin auth
    const cookies = request.cookies;
    const authToken = cookies.get("auth_token") || cookies.get("admin_token");
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      title, 
      description, 
      instructor, 
      schedule: _schedule, 
      price, 
      maxParticipants,
      image,
      duration,
      totalSessions,
      location,
      level,
      isActive 
    } = body;
    void _schedule; // Used in hasOwnProperty check below

    // Check if class exists
    const existingClass = await prisma.renamedclass.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Determine schedule update value: if schedule provided as empty string or null -> set to null, otherwise if undefined -> leave unchanged
    let scheduleToSave: Date | null | undefined = undefined;
    if (Object.prototype.hasOwnProperty.call(body, 'schedule')) {
      // If schedule is null, empty string, or falsy -> set to null
      scheduleToSave = body.schedule ? new Date(body.schedule) : null;
    }

    const updatedClass = await prisma.renamedclass.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        instructor,
        schedule: scheduleToSave === undefined ? existingClass.schedule : scheduleToSave,
        duration: duration || "02:00",
        // totalSessions is updated via raw SQL below
        location: location || "Barizta Coffee Shop",
        level: level || "Pemula",
        price: price !== undefined && price !== null ? parseInt(price.toString()) : existingClass.price,
        maxParticipants: maxParticipants !== undefined && maxParticipants !== null ? parseInt(maxParticipants?.toString() || '10') : existingClass.maxParticipants,
        status: isActive === false ? "inactive" : "active",
        isActive: isActive !== false,
        image: image || existingClass.image,
        updatedAt: new Date(),
      },
    });

    // Update totalSessions using raw SQL since Prisma client needs regeneration
    if (totalSessions !== undefined && totalSessions !== null) {
      await prisma.$executeRawUnsafe(
        `UPDATE class SET "totalSessions" = $1 WHERE id = $2`,
        parseInt(totalSessions.toString()),
        parseInt(id)
      );
    }

    // Fetch updated class with totalSessions
    const finalClass = await prisma.$queryRawUnsafe(
      `SELECT * FROM class WHERE id = $1`,
      parseInt(id)
    ) as Record<string, unknown>[];

    const result = Array.isArray(finalClass) && finalClass.length > 0 
      ? serializeClass(finalClass[0]) 
      : updatedClass;

    return NextResponse.json(result);
  } catch (error) {
    console.error(`PUT /api/classes/${(await params).id} error:`, error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to update class: ${message}` }, { status: 500 });
  }
}

// DELETE class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin auth
    const cookies = request.cookies;
    const authToken = cookies.get("auth_token") || cookies.get("admin_token");
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.renamedclass.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/classes/${(await params).id} error:`, error);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
