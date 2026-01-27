import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Default settings untuk halaman kolaborasi
const DEFAULT_SETTINGS = {
  // Hero Section
  hero_title_id: "Kolaborasi Bersama BARIZTA",
  hero_title_en: "Collaborate with BARIZTA",
  hero_description_id: "Mari berkolaborasi untuk menciptakan pengalaman kopi yang bermakna",
  hero_description_en: "Let's collaborate to create remarkable coffee experiences",
  
  // Intro Section
  intro_badge: "🤝 PARTNERSHIP",
  intro_heading_id: "Terbuka untuk Kolaborasi",
  intro_heading_en: "Open for Collaboration",
  intro_body_id: "BARIZTA percaya bahwa kolaborasi adalah kunci untuk pertumbuhan bersama. Kami membuka kesempatan kerjasama dengan brand, UMKM, dan komunitas yang memiliki visi sejalan dengan kami.",
  intro_body_en: "BARIZTA believes collaboration is the key to growing together. We welcome partnerships with brands, local SMEs, and communities that share our vision.",
  
  // Types Section Labels
  types_label_id: "JENIS KOLABORASI",
  types_label_en: "COLLABORATION TYPES",
  types_heading_id: "Bentuk Kerjasama",
  types_heading_en: "Ways to Partner",
  
  // Partners Section Labels
  partners_label_id: "MITRA KAMI",
  partners_label_en: "OUR PARTNERS",
  partners_heading_id: "Partner Kolaborasi",
  partners_heading_en: "Collaboration Partners",
  
  // CTA Section
  cta_heading_id: "Tertarik Berkolaborasi?",
  cta_heading_en: "Ready to Collaborate?",
  cta_description_id: "Hubungi kami untuk mendiskusikan ide kolaborasi Anda",
  cta_description_en: "Reach out to discuss your collaboration ideas",
  cta_button_id: "💬 Hubungi Kami untuk Kolaborasi",
  cta_button_en: "💬 Contact Us for Collaboration",
  
  // Contact
  whatsapp_number: "6281368236245",
  contact_message_id: "Halo Barizta! Saya tertarik untuk berkolaborasi. Mohon informasi lebih lanjut mengenai program kerjasama yang tersedia. Terima kasih!",
  contact_message_en: "Hi Barizta! I'm interested in collaborating. Please share more information about your partnership programs. Thank you!",
};

// GET all settings
export async function GET() {
  try {
    const settings = await prisma.kolaborasisetting.findMany();
    
    // Convert to key-value object
    const settingsObj: Record<string, string> = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    
    // Merge with defaults (use DB value if exists, otherwise default)
    const merged = { ...DEFAULT_SETTINGS };
    Object.keys(merged).forEach(key => {
      if (settingsObj[key] !== undefined) {
        merged[key as keyof typeof DEFAULT_SETTINGS] = settingsObj[key];
      }
    });
    
    return NextResponse.json(merged);
  } catch (error) {
    console.error("Error fetching kolaborasi settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST/PUT update settings
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const adminToken = request.cookies.get("admin_token")?.value;
    const authToken = request.cookies.get("auth_token")?.value;
    if (!adminToken && !authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Update each setting
    const updates = Object.entries(body).map(([key, value]) => 
      prisma.kolaborasisetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );
    
    await Promise.all(updates);
    
    return NextResponse.json({ success: true, message: "Settings updated" });
  } catch (error) {
    console.error("Error updating kolaborasi settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
