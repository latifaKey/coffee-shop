import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all kolaborasi types
export async function GET() {
  try {
    const types = await prisma.kolaborasitype.findMany({
      orderBy: { order: "asc" },
    });
    
    return NextResponse.json(types);
  } catch (error) {
    console.error("Error fetching kolaborasi types:", error);
    return NextResponse.json(
      { error: "Failed to fetch types" },
      { status: 500 }
    );
  }
}

// POST create new type
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const adminToken = request.cookies.get("admin_token")?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    if (!adminToken && !authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { icon, title, titleEn, type, description, descriptionEn, image, order, isActive } = body;

    if (!title || !type || !description) {
      return NextResponse.json(
        { error: "Title, type, and description are required" },
        { status: 400 }
      );
    }

    const newType = await prisma.kolaborasitype.create({
      data: {
        icon: icon || "🤝",
        title,
        titleEn: titleEn || title,
        type,
        description,
        descriptionEn: descriptionEn || description,
        image: image || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(newType, { status: 201 });
  } catch (error) {
    console.error("Error creating kolaborasi type:", error);
    return NextResponse.json(
      { error: "Failed to create type" },
      { status: 500 }
    );
  }
}
