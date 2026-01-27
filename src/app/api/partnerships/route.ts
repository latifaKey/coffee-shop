import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all partnerships with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where: { type?: string; status?: string } = {};
    if (type && type !== "all") where.type = type;
    if (status && status !== "all") where.status = status;

    // Optimized query with select and pagination
    const [total, partnerships] = await Promise.all([
      prisma.partnership.count({ where }),
      prisma.partnership.findMany({
        where,
        select: {
          id: true,
          name: true,
          type: true,
          contactPerson: true,
          email: true,
          phone: true,
          address: true,
          status: true,
          startDate: true,
          description: true,
          logo: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      })
    ]);

    return NextResponse.json({
      data: partnerships,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching partnerships:", error);
    return NextResponse.json(
      { error: "Failed to fetch partnerships" },
      { status: 500 }
    );
  }
}

// POST create new partnership
export async function POST(request: NextRequest) {
  try {
    // Auth check - support both admin_token and auth_token
    const adminToken = request.cookies.get("admin_token")?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    if (!adminToken && !authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, contactPerson, email, phone, address, status, startDate, description, logo } = body;

    if (!name || !type || !contactPerson || !email || !phone || !address || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const partnership = await prisma.partnership.create({
      data: {
        name,
        type,
        contactPerson,
        email,
        phone,
        address,
        status: status || "active",
        startDate: new Date(startDate),
        description: description || "",
        logo: logo || "",
      },
    });

    return NextResponse.json(partnership, { status: 201 });
  } catch (error) {
    console.error("Error creating partnership:", error);
    return NextResponse.json(
      { error: "Failed to create partnership" },
      { status: 500 }
    );
  }
}
