import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReplyEmail } from "@/lib/email";

// Helper to check admin authentication
function isAdminAuthenticated(request: NextRequest): boolean {
  const cookies = request.cookies;
  const adminToken = cookies.get("admin_token");
  const authToken = cookies.get("auth_token");
  return !!(adminToken || authToken);
}

// GET single message
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin auth
    if (!isAdminAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const message = await prisma.message.findUnique({
      where: { id: parseInt(id) },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error(`GET /api/messages/${(await params).id} error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}

// PATCH update message (mark as read, reply, etc)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin auth
    if (!isAdminAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Get the original message first (for sending email)
    const originalMessage = await prisma.message.findUnique({
      where: { id: parseInt(id) },
    });

    if (!originalMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Build update data dynamically
    const updateData: Record<string, unknown> = {};
    if (body.isRead !== undefined) updateData.isRead = body.isRead;
    
    let emailResult = null;
    
    if (body.reply) {
      updateData.reply = body.reply;
      updateData.replyDate = new Date();
      updateData.isRead = true;

      // Send email notification to the customer
      emailResult = await sendReplyEmail({
        to: originalMessage.email,
        customerName: originalMessage.name,
        originalSubject: originalMessage.subject,
        originalMessage: originalMessage.message,
        replyMessage: body.reply,
      });
      
      if (emailResult.success) {
        console.log(`Email sent to ${originalMessage.email}`);
      } else {
        console.log(`Email not sent: ${emailResult.error}`);
      }
    }

    const message = await prisma.message.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // Include email status in response
    return NextResponse.json({
      ...message,
      emailSent: emailResult?.success || false,
      emailError: emailResult?.error || null,
    });
  } catch (error) {
    console.error(`PATCH /api/messages/${(await params).id} error:`, error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// DELETE message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin auth
    if (!isAdminAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.message.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/messages/${(await params).id} error:`, error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
