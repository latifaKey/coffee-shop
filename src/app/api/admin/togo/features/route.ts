import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Ambil semua features
export async function GET() {
  try {
    const features = await prisma.togofeature.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(features);
  } catch (error) {
    console.error("Error fetching features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 }
    );
  }
}

// POST - Tambah feature baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, order, isActive } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const feature = await prisma.togofeature.create({
      data: {
        text,
        order: order || 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(feature, { status: 201 });
  } catch (error) {
    console.error("Error creating feature:", error);
    return NextResponse.json(
      { error: "Failed to create feature" },
      { status: 500 }
    );
  }
}

// PUT - Update feature
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, text, order, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const feature = await prisma.togofeature.update({
      where: { id: parseInt(id) },
      data: {
        text,
        order,
        isActive,
      },
    });

    return NextResponse.json(feature);
  } catch (error) {
    console.error("Error updating feature:", error);
    return NextResponse.json(
      { error: "Failed to update feature" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus feature
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.togofeature.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Feature deleted successfully" });
  } catch (error) {
    console.error("Error deleting feature:", error);
    return NextResponse.json(
      { error: "Failed to delete feature" },
      { status: 500 }
    );
  }
}
