import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const normalizeWhatsapp = (value: string): string => {
  if (!value) return "";
  const digitsOnly = value.replace(/[^0-9+]/g, "");
  const withoutPlus = digitsOnly.startsWith("+") ? digitsOnly.slice(1) : digitsOnly;

  if (withoutPlus.startsWith("62")) return withoutPlus;
  if (withoutPlus.startsWith("0")) return `62${withoutPlus.slice(1)}`;
  if (withoutPlus.startsWith("8")) return `62${withoutPlus}`;
  return withoutPlus;
};

// GET all schedules with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where: { status?: string } = {};
    if (status && status !== "all") {
      where.status = status;
    }

    // Optimized query with select and pagination
    const [total, schedules] = await Promise.all([
      prisma.schedule.count({ where }),
      prisma.schedule.findMany({
        where,
        select: {
          id: true,
          date: true,
          location: true,
          startTime: true,
          endTime: true,
          status: true,
          notes: true,
          contactWhatsapp: true,
          mapsUrl: true,
          statusStay: true,
          createdAt: true,
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      })
    ]);

    return NextResponse.json({
      data: schedules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

// POST create new schedule
export async function POST(request: NextRequest) {
  try {
    // Check authentication - support both admin_token and auth_token
    const adminToken = request.cookies.get("admin_token")?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    if (!adminToken && !authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, location, startTime, endTime, status, notes, contactWhatsapp, coordinator, statusStay, mapsUrl } = body;

    const contact = contactWhatsapp ?? coordinator;

    if (!date || !location || !startTime || !endTime || !contact) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedWhatsapp = normalizeWhatsapp(String(contact));
    if (!normalizedWhatsapp) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid" },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.create({
      data: {
        date: new Date(date),
        location,
        startTime,
        endTime,
        status: status || "scheduled",
        notes,
        contactWhatsapp: normalizedWhatsapp,
        statusStay: statusStay || "BELUM_STAY",
        mapsUrl: mapsUrl || null,
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
