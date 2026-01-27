import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET single type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const typeData = await prisma.kolaborasitype.findUnique({
      where: { id: parseInt(id) },
    });

    if (!typeData) {
      return NextResponse.json({ error: "Type not found" }, { status: 404 });
    }

    return NextResponse.json(typeData);
  } catch (error) {
    console.error("Error fetching type:", error);
    return NextResponse.json(
      { error: "Failed to fetch type" },
      { status: 500 }
    );
  }
}

// PATCH update type
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const adminToken = request.cookies.get("admin_token")?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    if (!adminToken && !authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.kolaborasitype.update({
      where: { id: parseInt(id) },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating type:", error);
    return NextResponse.json(
      { error: "Failed to update type" },
      { status: 500 }
    );
  }
}

// DELETE type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const adminToken = request.cookies.get("admin_token")?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    if (!adminToken && !authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.kolaborasitype.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true, message: "Type deleted" });
  } catch (error) {
    console.error("Error deleting type:", error);
    return NextResponse.json(
      { error: "Failed to delete type" },
      { status: 500 }
    );
  }
}
