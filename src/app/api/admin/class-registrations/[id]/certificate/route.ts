import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Helper to get session from token
function getSessionFromToken(authToken: string): { role?: string; userId?: number; email?: string } | null {
  try {
    const sessionData = JSON.parse(
      Buffer.from(authToken, 'base64').toString('utf-8')
    );
    return sessionData;
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const cookies = request.cookies;
    const adminToken = cookies.get("admin_token")?.value;
    const authToken = cookies.get("auth_token")?.value;
    const token = adminToken || authToken;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = getSessionFromToken(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    // Validate registration exists and is approved
    const registration = await prisma.classregistration.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Pendaftaran tidak ditemukan' },
        { status: 404 }
      );
    }

    if (registration.status !== 'approved') {
      return NextResponse.json(
        { error: 'Sertifikat hanya dapat digenerate untuk peserta yang sudah disetujui (approved)' },
        { status: 400 }
      );
    }

    // Generate certificate filename
    const certificateNumber = `BARIZTA-${Date.now()}-${id}`;
    const certificateFileName = `${certificateNumber}.pdf`;
    
    // Ensure certificates directory exists
    const certificatesDir = path.join(process.cwd(), 'public', 'certificates');
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }
    
    const certificatePath = path.join(certificatesDir, certificateFileName);
    const certificateUrl = `/certificates/${certificateFileName}`;

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 72, right: 72 }
    });

    // Pipe PDF to file
    const writeStream = fs.createWriteStream(certificatePath);
    doc.pipe(writeStream);

    // Certificate design
    // Background color
    doc.rect(0, 0, doc.page.width, doc.page.height)
       .fill('#FFF8F0');

    // Border
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
       .lineWidth(3)
       .stroke('#6B4423');

    doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
       .lineWidth(1)
       .stroke('#8B6F47');

    // Title
    doc.fillColor('#6B4423')
       .fontSize(48)
       .font('Helvetica-Bold')
       .text('SERTIFIKAT', 0, 100, { align: 'center' });

    doc.fontSize(24)
       .font('Helvetica')
       .text('Certificate of Completion', 0, 160, { align: 'center' });

    // Content
    doc.fontSize(16)
       .fillColor('#4A4A4A')
       .text('Diberikan kepada / This is to certify that', 0, 220, { align: 'center' });

    doc.fontSize(32)
       .fillColor('#6B4423')
       .font('Helvetica-Bold')
       .text(registration.fullName, 0, 260, { align: 'center' });

    // Underline for name
    const nameWidth = doc.widthOfString(registration.fullName);
    const centerX = (doc.page.width - nameWidth) / 2;
    doc.moveTo(centerX, 300)
       .lineTo(centerX + nameWidth, 300)
       .lineWidth(2)
       .stroke('#6B4423');

    doc.fontSize(16)
       .fillColor('#4A4A4A')
       .font('Helvetica')
       .text('Telah berhasil menyelesaikan pelatihan', 0, 330, { align: 'center' });

    doc.fontSize(24)
       .fillColor('#6B4423')
       .font('Helvetica-Bold')
       .text(registration.programName, 0, 370, { align: 'center' });

    doc.fontSize(14)
       .fillColor('#4A4A4A')
       .font('Helvetica')
       .text('di Barizta Coffee Shop', 0, 410, { align: 'center' });

    // Date
    const certificateDate = new Date();
    const dateStr = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(certificateDate);

    doc.fontSize(12)
       .text(`Tanggal: ${dateStr}`, 0, 460, { align: 'center' });

    // Certificate number
    doc.fontSize(10)
       .fillColor('#888888')
       .text(`No. Sertifikat: ${certificateNumber}`, 0, doc.page.height - 80, { align: 'center' });

    // Signature area
    const signatureY = doc.page.height - 160;
    const leftSignX = 150;
    const rightSignX = doc.page.width - 250;

    // Left signature (Instructor)
    doc.fontSize(12)
       .fillColor('#4A4A4A')
       .text('_____________________', leftSignX, signatureY, { width: 200, align: 'center' });
    doc.fontSize(10)
       .text('Instruktur', leftSignX, signatureY + 25, { width: 200, align: 'center' });

    // Right signature (Director)
    doc.text('_____________________', rightSignX, signatureY, { width: 200, align: 'center' });
    doc.text('Direktur Barizta', rightSignX, signatureY + 25, { width: 200, align: 'center' });

    // Finalize PDF
    doc.end();

    // Wait for PDF to be written
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Update registration with certificate URL
    const updated = await prisma.classregistration.update({
      where: { id: parseInt(id) },
      data: {
        certificateUrl
      }
    });

    return NextResponse.json({
      success: true,
      certificateUrl,
      certificateNumber,
      registration: updated,
      message: 'Sertifikat berhasil digenerate'
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json(
      { error: 'Gagal membuat sertifikat' },
      { status: 500 }
    );
  }
}
