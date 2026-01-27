import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to verify authentication and get session
function getSession(request: NextRequest): { userId: number; role: string } | null {
  const adminToken = request.cookies.get("admin_token")?.value;
  const memberToken = request.cookies.get("member_token")?.value;
  const authToken = request.cookies.get("auth_token")?.value;
  const tokenToUse = adminToken || memberToken || authToken;
  
  if (!tokenToUse) return null;
  
  try {
    const session = JSON.parse(Buffer.from(tokenToUse, "base64").toString("utf-8"));
    return { userId: session.userId, role: session.role };
  } catch {
    return null;
  }
}

// GET notifications - for admin or specific member
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const target = searchParams.get("target"); // 'admin' or 'member'
    const userId = searchParams.get("userId");
    const filter = searchParams.get("filter"); // "all" | "unread"
    const limitParam = searchParams.get("limit");

    const where: Record<string, unknown> = {};

    if (target === "admin") {
      // Only admins can access admin notifications
      if (session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      where.target = "admin";
    } else if (target === "member" && userId) {
      // Members can only access their own notifications
      const requestedUserId = parseInt(userId);
      if (session.role !== "admin" && session.userId !== requestedUserId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      where.target = "member";
      where.userId = requestedUserId;
    } else if (!target) {
      // Default behavior based on role
      if (session.role === "admin") {
        where.target = "admin";
      } else {
        where.target = "member";
        where.userId = session.userId;
      }
    } else {
      return NextResponse.json(
        { error: "Invalid target or missing userId" },
        { status: 400 }
      );
    }

    if (filter === "unread") {
      where.isRead = false;
    }

    // Optimized query with select and configurable limit
    const notifications = await prisma.notification.findMany({
      where,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        createdAt: true,
        target: true,
        url: true,
        userId: true,
      },
      orderBy: { createdAt: "desc" },
      take: limitParam ? parseInt(limitParam) : 50,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST - Create new notification (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = getSession(request);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const body = await request.json();
    const { target, title, message, type } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        target: target || "admin",
        title,
        message,
        type: type || "info",
        isRead: false,
      }
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// PATCH - Mark all as read
export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const session = getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build where clause based on user role
    const whereClause = session.role === "admin" 
      ? { isRead: false, target: "admin" }
      : { isRead: false, target: "member", userId: session.userId };

    await prisma.notification.updateMany({
      where: whereClause,
      data: { isRead: true },
    });

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
