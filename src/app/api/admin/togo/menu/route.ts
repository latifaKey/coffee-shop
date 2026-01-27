import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Ambil semua menu
export async function GET() {
  try {
    const menus = await prisma.togomenu.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(menus);
  } catch (error) {
    console.error("Error fetching togo menus:", error);
    return NextResponse.json(
      { error: "Failed to fetch menus" },
      { status: 500 }
    );
  }
}

// POST - Tambah menu baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, description, icon, isActive, order } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    const menu = await prisma.togomenu.create({
      data: {
        name,
        price: parseInt(price),
        description: description || null,
        icon: icon || "☕",
        isActive: isActive ?? true,
        order: order || 0,
      },
    });

    return NextResponse.json(menu, { status: 201 });
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json(
      { error: "Failed to create menu" },
      { status: 500 }
    );
  }
}

// PUT - Update menu
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, price, description, icon, isActive, order } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const menu = await prisma.togomenu.update({
      where: { id: parseInt(id) },
      data: {
        name,
        price: price !== undefined ? parseInt(price) : undefined,
        description,
        icon,
        isActive,
        order,
      },
    });

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { error: "Failed to update menu" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus menu
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.togomenu.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return NextResponse.json(
      { error: "Failed to delete menu" },
      { status: 500 }
    );
  }
}
