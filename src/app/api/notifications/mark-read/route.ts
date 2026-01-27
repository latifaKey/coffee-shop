import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Mark notification(s) as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, notificationIds, markAll, target, userId } = body;

    if (markAll) {
      // Mark all notifications as read
      const where: Record<string, unknown> = {};
      if (target === "admin") {
        where.target = "admin";
      } else if (target === "member" && userId) {
        where.target = "member";
        where.userId = parseInt(userId);
      }

      await prisma.notification.updateMany({
        where,
        data: { isRead: true },
      });

      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark multiple notifications as read
      await prisma.notification.updateMany({
        where: { id: { in: notificationIds } },
        data: { isRead: true },
      });

      return NextResponse.json({ success: true, message: "Notifications marked as read" });
    } else if (notificationId) {
      // Mark single notification as read
      await prisma.notification.update({
        where: { id: parseInt(notificationId) },
        data: { isRead: true },
      });

      return NextResponse.json({ success: true, message: "Notification marked as read" });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/notifications/mark-read error:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
