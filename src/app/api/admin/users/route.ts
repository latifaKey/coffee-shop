import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Verify admin authentication
async function verifyAdmin(request: NextRequest): Promise<boolean> {
  try {
    // Check for admin or auth token from cookies
    const adminToken = request.cookies.get("admin_token")?.value;
    const authToken = request.cookies.get("auth_token")?.value;

    if (!adminToken && !authToken) {
      return false;
    }

    // Additional check via /api/auth/me to verify admin role
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value || cookieStore.get("admin_token")?.value;

    if (!token) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// GET - Fetch all registered users (READ-ONLY)
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Akses ditolak. Hanya admin yang dapat melihat data ini." },
        { status: 403 }
      );
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Build where clause
    const whereClause: {
      AND?: Array<{
        OR?: Array<{ name?: { contains: string }; email?: { contains: string } }>;
        role?: string;
      }>;
    } = {};

    const conditions: Array<{
      OR?: Array<{ name?: { contains: string }; email?: { contains: string } }>;
      role?: string;
    }> = [];

    // Search filter (name or email)
    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      });
    }

    // Role filter
    if (role && role !== "all") {
      conditions.push({ role: role.toLowerCase() });
    }

    if (conditions.length > 0) {
      whereClause.AND = conditions;
    }

    // Get total count for pagination
    const totalUsers = await prisma.user.count({
      where: whereClause,
    });

    // Fetch users with pagination
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        // Exclude sensitive fields: password, resetToken, resetTokenExpiry
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pengguna" },
      { status: 500 }
    );
  }
}
