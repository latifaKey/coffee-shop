import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all website settings
export async function GET() {
  try {
    const settings = await prisma.websitesetting.findMany();
    
    // Convert array to object for easier frontend usage
    const settingsObj: Record<string, string> = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    
    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error("Error fetching website settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// POST/PUT - Update website settings (upsert multiple)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Body should be an object with key-value pairs
    const updates = Object.entries(body).map(async ([key, value]) => {
      return prisma.websitesetting.upsert({
        where: { key },
        update: { value: String(value), updatedAt: new Date() },
        create: { key, value: String(value), updatedAt: new Date() }
      });
    });
    
    await Promise.all(updates);
    
    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating website settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
