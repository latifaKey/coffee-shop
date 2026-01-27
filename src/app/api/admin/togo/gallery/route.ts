import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET - Ambil semua gallery
export async function GET() {
  try {
    const gallery = await prisma.togogallery.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(gallery);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}

// POST - Tambah gallery baru
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const caption = formData.get("caption") as string;
    const isLarge = formData.get("isLarge") === "true";
    const order = parseInt(formData.get("order") as string) || 0;
    const isActive = formData.get("isActive") !== "false";
    const imageFile = formData.get("image") as File | null;

    let imagePath = "";

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = path.join(process.cwd(), "public", "uploads", "togo");
      await mkdir(uploadDir, { recursive: true });
      
      const filename = `gallery-${Date.now()}-${imageFile.name.replace(/\s/g, "-")}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      imagePath = `/uploads/togo/${filename}`;
    }

    if (!imagePath) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    const gallery = await prisma.togogallery.create({
      data: {
        image: imagePath,
        caption: caption || null,
        isLarge,
        order,
        isActive,
      },
    });

    return NextResponse.json(gallery, { status: 201 });
  } catch (error) {
    console.error("Error creating gallery:", error);
    return NextResponse.json(
      { error: "Failed to create gallery" },
      { status: 500 }
    );
  }
}

// PUT - Update gallery
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = parseInt(formData.get("id") as string);
    const caption = formData.get("caption") as string;
    const isLarge = formData.get("isLarge") === "true";
    const order = parseInt(formData.get("order") as string) || 0;
    const isActive = formData.get("isActive") !== "false";
    const imageFile = formData.get("image") as File | null;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    let imagePath: string | undefined;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = path.join(process.cwd(), "public", "uploads", "togo");
      await mkdir(uploadDir, { recursive: true });
      
      const filename = `gallery-${Date.now()}-${imageFile.name.replace(/\s/g, "-")}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      imagePath = `/uploads/togo/${filename}`;
    }

    const gallery = await prisma.togogallery.update({
      where: { id },
      data: {
        ...(imagePath && { image: imagePath }),
        caption: caption || null,
        isLarge,
        order,
        isActive,
      },
    });

    return NextResponse.json(gallery);
  } catch (error) {
    console.error("Error updating gallery:", error);
    return NextResponse.json(
      { error: "Failed to update gallery" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus gallery
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.togogallery.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Gallery deleted successfully" });
  } catch (error) {
    console.error("Error deleting gallery:", error);
    return NextResponse.json(
      { error: "Failed to delete gallery" },
      { status: 500 }
    );
  }
}
