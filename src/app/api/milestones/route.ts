import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all milestones
export async function GET() {
  try {
    // Optimized query with select
    const milestones = await prisma.milestone.findMany({
      select: {
        id: true,
        year: true,
        title: true,
        description: true,
        order: true,
        createdAt: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return NextResponse.json(
      { error: "Failed to fetch milestones" },
      { status: 500 }
    );
  }
}

// POST create new milestone
export async function POST(request: NextRequest) {
  try {
    // Auth check - support both admin_token and auth_token
    const adminToken = request.cookies.get("admin_token")?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    if (!adminToken && !authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { year, title, description, order } = body;

    if (!year || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const milestone = await prisma.milestone.create({
      data: {
        year,
        title,
        description,
        order: order || 0,
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json(
      { error: "Failed to create milestone" },
      { status: 500 }
    );
  }
}
