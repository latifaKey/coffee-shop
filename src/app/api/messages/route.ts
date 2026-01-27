import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all messages
export async function GET(request: NextRequest) {
  try {
    // Check admin auth - support both admin_token and auth_token
    const cookies = request.cookies;
    const adminToken = cookies.get("admin_token");
    const authToken = cookies.get("auth_token");
    
    if (!adminToken && !authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    const where: Record<string, unknown> = {};
    if (status === "unread") where.isRead = false;
    else if (status === "read") where.isRead = true;
    else if (status === "replied") where.reply = { not: null };

    // Optimized query with select and pagination
    const [total, messages] = await Promise.all([
      prisma.message.count({ where }),
      prisma.message.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          message: true,
          isRead: true,
          reply: true,
          replyDate: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      })
    ]);

    return NextResponse.json({
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST new message (from contact form)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const newMessage = await prisma.message.create({
      data: {
        name,
        email,
        subject,
        message,
        isRead: false,
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
