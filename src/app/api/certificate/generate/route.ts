import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// POST - Generate certificate for approved participant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationId } = body;

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      );
    }

    // Get registration details
    const registration = await prisma.classregistration.findUnique({
      where: { id: parseInt(registrationId) },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    if (registration.status !== "approved") {
      return NextResponse.json(
        { error: "Only approved participants can get certificates" },
        { status: 400 }
      );
    }

    // Create certificates directory if not exists
    const certificatesDir = path.join(process.cwd(), "public", "certificates");
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    // Generate unique filename
    const fileName = `certificate-${registration.id}-${Date.now()}.pdf`;
    const filePath = path.join(certificatesDir, fileName);

    // Create PDF
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Certificate design
    const brown = "#6B4423";
    const lightBrown = "#d4a574";

    // Border
    doc
      .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
      .lineWidth(3)
      .stroke(brown);

    doc
      .rect(50, 50, doc.page.width - 100, doc.page.height - 100)
      .lineWidth(1)
      .stroke(lightBrown);

    // Header
    doc
      .fontSize(36)
      .font("Helvetica-Bold")
      .fillColor(brown)
      .text("CERTIFICATE OF COMPLETION", 0, 120, {
        align: "center",
        width: doc.page.width,
      });

    // Decorative line
    doc
      .moveTo(doc.page.width / 2 - 150, 180)
      .lineTo(doc.page.width / 2 + 150, 180)
      .lineWidth(2)
      .stroke(lightBrown);

    // Presented to text
    doc
      .fontSize(16)
      .font("Helvetica")
      .fillColor("#333")
      .text("This certificate is proudly presented to", 0, 220, {
        align: "center",
        width: doc.page.width,
      });

    // Participant name
    doc
      .fontSize(42)
      .font("Helvetica-Bold")
      .fillColor(brown)
      .text(registration.fullName, 0, 270, {
        align: "center",
        width: doc.page.width,
      });

    // Underline for name
    doc
      .moveTo(doc.page.width / 2 - 200, 325)
      .lineTo(doc.page.width / 2 + 200, 325)
      .lineWidth(1)
      .stroke(lightBrown);

    // Program text
    doc
      .fontSize(14)
      .font("Helvetica")
      .fillColor("#555")
      .text("For successfully completing", 0, 350, {
        align: "center",
        width: doc.page.width,
      });

    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor(brown)
      .text(registration.programName, 0, 380, {
        align: "center",
        width: doc.page.width,
      });

    // Date
    const completionDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#555")
      .text(`Date of Completion: ${completionDate}`, 0, 430, {
        align: "center",
        width: doc.page.width,
      });

    // Footer - Barizta Coffee
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor(brown)
      .text("BARIZTA COFFEE SHOP", 0, 500, {
        align: "center",
        width: doc.page.width,
      });

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#777")
      .text("Premium Coffee Education & Training Center", 0, 525, {
        align: "center",
        width: doc.page.width,
      });

    // Certificate ID
    doc
      .fontSize(8)
      .fillColor("#999")
      .text(`Certificate ID: BARIZTA-${registration.id}-${Date.now()}`, 0, 560, {
        align: "center",
        width: doc.page.width,
      });

    doc.end();

    // Wait for PDF to be written
    await new Promise<void>((resolve, reject) => {
      stream.on("finish", () => resolve());
      stream.on("error", reject);
    });

    // Update registration with certificate URL
    const certificateUrl = `/certificates/${fileName}`;
    await prisma.classregistration.update({
      where: { id: parseInt(registrationId) },
      data: { certificateUrl },
    });

    // Create notification for member
    await prisma.notification.create({
      data: {
        userId: registration.userId,
        target: 'member',
        title: 'Sertifikat Siap',
        message: `Sertifikat untuk kelas "${registration.programName}" sudah tersedia untuk di-download.`,
        type: 'success',
        isRead: false,
      }
    });

    return NextResponse.json({
      success: true,
      certificateUrl,
      fileName,
    });
  } catch (error) {
    console.error("POST /api/certificate/generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
