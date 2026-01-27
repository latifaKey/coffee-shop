import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const normalizeWhatsapp = (value: string): string => {
  if (!value) return "";
  const digitsOnly = value.replace(/[^0-9+]/g, "");
  const withoutPlus = digitsOnly.startsWith("+") ? digitsOnly.slice(1) : digitsOnly;

  if (withoutPlus.startsWith("62")) return withoutPlus;
  if (withoutPlus.startsWith("0")) return `62${withoutPlus.slice(1)}`;
  if (withoutPlus.startsWith("8")) return `62${withoutPlus}`;
  return withoutPlus;
};

// GET single schedule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schedule = await prisma.schedule.findUnique({
      where: { id: parseInt(id) },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}

// PATCH update schedule
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication - support both admin_token and auth_token
    const adminToken = request.cookies.get("admin_token")?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    if (!adminToken && !authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { date, location, startTime, endTime, status, notes, contactWhatsapp, coordinator, statusStay, mapsUrl } = body;

    const updateData: Record<string, unknown> = {};
    if (date !== undefined) updateData.date = new Date(date);
    if (location !== undefined) updateData.location = location;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const contact = contactWhatsapp ?? coordinator;
    if (contact !== undefined) {
      const normalized = normalizeWhatsapp(String(contact));
      if (!normalized) {
        return NextResponse.json(
          { error: "Nomor WhatsApp tidak valid" },
          { status: 400 }
        );
      }
      updateData.contactWhatsapp = normalized;
    }

    if (statusStay !== undefined) updateData.statusStay = statusStay;
    if (mapsUrl !== undefined) updateData.mapsUrl = mapsUrl;

    const schedule = await prisma.schedule.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

// DELETE schedule
// DELETE schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication - support both admin_token and auth_token
    const adminToken = request.cookies.get("admin_token")?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    if (!adminToken && !authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.schedule.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
