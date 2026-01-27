import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all team members
export async function GET() {
  try {
    // Optimized query with select
    const teamMembers = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        position: true,
        photo: true,
        bio: true,
        order: true,
        createdAt: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

// POST create new team member
export async function POST(request: NextRequest) {
  try {
    // Auth check - support both admin_token and auth_token
    const adminToken = request.cookies.get("admin_token")?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    if (!adminToken && !authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, position, photo, bio, order } = body;

    if (!name || !position || !bio) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const teamMember = await prisma.team.create({
      data: {
        name,
        position,
        photo: photo || "/images/default-avatar.jpg",
        bio,
        order: order || 0,
      },
    });

    return NextResponse.json(teamMember, { status: 201 });
  } catch (error) {
    console.error("Error creating team member:", error);
    return NextResponse.json(
      { error: "Failed to create team member" },
      { status: 500 }
    );
  }
}
