import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Ambil semua settings
export async function GET() {
  try {
    const settings = await prisma.togosetting.findMany();
    
    // Convert to object for easier use
    const settingsObj: Record<string, string> = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });
    
    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST/PUT - Update settings (upsert)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // body is an object like { whatsapp: "628xxx", operationalHours: "09:00-18:00", ... }
    const updates = Object.entries(body).map(([key, value]) => 
      prisma.togosetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
