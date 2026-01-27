import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all media
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;
    
    const where = folder ? { folder } : {};
    
    // Optimized query with select and pagination
    const [total, media] = await Promise.all([
      prisma.media.count({ where }),
      prisma.media.findMany({
        where,
        select: {
          id: true,
          name: true,
          path: true,
          type: true,
          folder: true,
          size: true,
          caption: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      })
    ]);
    
    return NextResponse.json({
      data: media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

// POST - Add new media record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, path, type = "image", folder = "gallery", size = 0, caption } = body;
    
    if (!name || !path) {
      return NextResponse.json({ error: "Name and path are required" }, { status: 400 });
    }
    
    const media = await prisma.media.create({
      data: { name, path, type, folder, size, caption }
    });
    
    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Error creating media:", error);
    return NextResponse.json({ error: "Failed to create media" }, { status: 500 });
  }
}
