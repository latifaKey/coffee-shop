import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  try {
    // Get first category or create one
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: "Kopi",
          slug: "kopi",
          type: "MINUMAN",
        },
      });
    }

    const created = await prisma.product.create({
      data: {
        name: "Sample Product (dev)",
        slug: "sample-product-dev-" + Date.now(),
        description: "Contoh produk yang dibuat otomatis untuk pengujian",
        price: 18000,
        categoryId: category.id,
        image: "https://placehold.co/600x400",
        isAvailable: true,
      },
    });
    return NextResponse.json({ ok: true, product: created });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
