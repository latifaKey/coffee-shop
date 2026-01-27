import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const categoryType = searchParams.get("type") || undefined; // MINUMAN or MAKANAN
  const available = searchParams.get("available");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const skip = (page - 1) * limit;

  const where: Prisma.productWhereInput = {} as Prisma.productWhereInput;
  
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } }
    ];
  }
  if (categoryId) where.categoryId = parseInt(categoryId);
  if (categoryType) {
    where.category = {
      type: categoryType
    };
  }
  if (available != null) where.isAvailable = available === "true";

  // Optimized: Run count and findMany in parallel
  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        image: true,
        isAvailable: true,
        categoryId: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
          }
        }
      },
      orderBy: [
        { category: { type: "desc" } },
        { category: { name: "asc" } },
        { name: "asc" }
      ],
      skip,
      take: limit,
    })
  ]);

  return NextResponse.json({
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { name, description, price, categoryId, image, isAvailable = true } = body || {};

    if (!name || !price || !image) {
      return NextResponse.json({ error: "Nama, harga, dan gambar harus diisi" }, { status: 400 });
    }

    const slug = (name as string)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    // Check if slug exists
    const existing = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const created = await prisma.product.create({
      data: { 
        name, 
        description: description || "", 
        price: Number(price), 
        categoryId: categoryId ? parseInt(categoryId) : null,
        image, 
        isAvailable, 
        slug: finalSlug 
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    console.error("POST /api/products error:", e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
