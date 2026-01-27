import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const product = await prisma.product.findUnique({ 
    where: { id },
    include: { category: true }
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  // Auth check - support both admin_token and auth_token
  const adminToken = req.cookies.get("admin_token")?.value;
  const authToken = req.cookies.get("auth_token")?.value;
  const token = adminToken || authToken;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const session = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { name, description, price, categoryId, image, isAvailable } = body || {};

  try {
    const data: Record<string, unknown> = {};
    if (name != null) {
      data.name = name;
      data.slug = (name as string)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    }
    if (description != null) data.description = description;
    if (price != null) data.price = Number(price);
    if (categoryId !== undefined) data.categoryId = categoryId ? parseInt(categoryId) : null;
    if (image != null) data.image = image;
    if (isAvailable != null) data.isAvailable = Boolean(isAvailable);

    const updated = await prisma.product.update({ 
      where: { id }, 
      data,
      include: { category: true }
    });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    console.error("PATCH /api/products/[id] error:", e);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    // Auth check - support both admin_token and auth_token
    const adminToken = req.cookies.get("admin_token")?.value;
    const authToken = req.cookies.get("auth_token")?.value;
    const token = adminToken || authToken;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
      const session = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
      if (session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error("DELETE /api/products/[id] error:", e);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

// PUT as alias for PATCH
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return PATCH(req, context);
}
