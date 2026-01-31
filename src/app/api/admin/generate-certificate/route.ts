import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCanvas, loadImage } from "canvas";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";
import { verifyToken } from "@/lib/auth-utils";

export const runtime = "nodejs";

// Generate unique certificate code
function generateCertificateCode(registrationId: number, programId: string): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const programCode = programId.toUpperCase().substring(0, 3);
  const uniqueId = String(registrationId).padStart(4, '0');
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `BRZ-${programCode}-${year}${month}-${uniqueId}-${randomSuffix}`;
}

// Get skill name based on program
function getSkillName(programId: string, programName: string): string {
  const skillMap: Record<string, string> = {
    'basic': 'Basic Barista Skill',
    'latte': 'Latte Art Skill',
    'manual': 'Manual Brewing Skill',
    'workshop': 'Coffee Workshop Skill',
    'advanced': 'Advanced Barista Skill',
    'roasting': 'Coffee Roasting Skill'
  };
  
  return skillMap[programId.toLowerCase()] || programName;
}

// Format date to Indonesian format
function formatDateIndonesian(date: Date): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

// POST generate certificate for a registration
export async function POST(request: NextRequest) {
  try {
    const cookies = request.cookies;
    const adminToken = cookies.get("admin_token")?.value;
    const authToken = cookies.get("auth_token")?.value;
    const token = adminToken || authToken;
    
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { 
      registrationId, 
      completionDate,
      skillName: customSkillName,      // Field manual untuk skill
      directorName: customDirectorName, // Field manual untuk nama direktur
      instructorName: customInstructorName, // Field manual untuk nama instruktur
      directorSignature: directorSignatureBase64, // Base64 tanda tangan direktur
      instructorSignature: instructorSignatureBase64 // Base64 tanda tangan instruktur
    } = body;

    if (!registrationId) {
      return NextResponse.json({ success: false, error: "Registration ID diperlukan" }, { status: 400 });
    }

    // Get registration data
    const registration = await prisma.classregistration.findUnique({
      where: { id: parseInt(registrationId) },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!registration) {
      return NextResponse.json({ success: false, error: "Pendaftaran tidak ditemukan" }, { status: 404 });
    }

    // Check if status is approved
    if (registration.status !== 'approved' && registration.status !== 'completed') {
      return NextResponse.json({ 
        success: false, 
        error: "Hanya peserta dengan status disetujui yang dapat digenerate sertifikatnya" 
      }, { status: 400 });
    }

    // Generate certificate code
    const certificateCode = generateCertificateCode(registration.id, registration.programId);
    
    // Format completion date
    const completionDateObj = completionDate ? new Date(completionDate) : new Date();
    const formattedDate = formatDateIndonesian(completionDateObj);
    
    // Use custom skill name if provided, otherwise use default mapping
    const skillName = customSkillName || getSkillName(registration.programId, registration.programName);
    
    // Use custom names if provided, otherwise use defaults
    const directorName = customDirectorName || 'RINA TUPON PANGUDI LUHUR, M.PD';
    const instructorName = customInstructorName || 'M RIZAL NOVIANTO';

    // Load template image
    const templatePath = path.join(process.cwd(), 'public', 'certificates', 'serti.png');
    
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ 
        success: false, 
        error: "Template sertifikat tidak ditemukan. Pastikan file serti.png ada di folder public/certificates/" 
      }, { status: 500 });
    }

    const templateImage = await loadImage(templatePath);
    
    // ============================================
    // HD CANVAS - 2x resolusi untuk teks tajam
    // ============================================
    const scale = 2;
    const baseWidth = templateImage.width;
    const baseHeight = templateImage.height;
    
    const canvas = createCanvas(baseWidth * scale, baseHeight * scale);
    const ctx = canvas.getContext('2d');
    
    // Scale untuk HD rendering
    ctx.scale(scale, scale);
    
    // Draw template
    ctx.drawImage(templateImage, 0, 0, baseWidth, baseHeight);
    
    const width = baseWidth;
    const height = baseHeight;
    const centerX = width / 2;

    // ============================================
    // 1. JUDUL "CERTIFICATE"
    // Font: Times New Roman, Semi-Bold Italic
    // Size: 110px, Letter-spacing: 12px
    // Posisi: 8% dari atas, Warna: #333
    // ============================================
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#333333';
    
    const certText = 'CERTIFICATE';
    const certFontSize = 110;
    const certLetterSpacing = 12;
    ctx.font = `italic 600 ${certFontSize}px "Times New Roman", serif`;
    
    // Manual letter-spacing
    let totalCertWidth = 0;
    for (let i = 0; i < certText.length; i++) {
      totalCertWidth += ctx.measureText(certText[i]).width;
      if (i < certText.length - 1) totalCertWidth += certLetterSpacing;
    }
    
    let certStartX = centerX - totalCertWidth / 2;
    const certY = height * 0.18;
    ctx.textAlign = 'left';
    for (let i = 0; i < certText.length; i++) {
      ctx.fillText(certText[i], certStartX, certY);
      certStartX += ctx.measureText(certText[i]).width + certLetterSpacing;
    }

    // ============================================
    // 2. "Proudly Presented to"
    // Font: Arial/Helvetica, Light 300
    // Size: 30px, Warna: #333
    // Posisi: 29% dari atas
    // ============================================
    ctx.textAlign = 'center';
    ctx.font = '300 30px Arial, Helvetica, sans-serif';
    ctx.fillStyle = '#333333';
    ctx.fillText('Proudly Presented to', centerX, height * 0.29);

    // ============================================
    // 4. GARIS NAMA
    // Panjang: 480px, Stroke: 2px, Warna: #000
    // Posisi: 44% dari atas
    // ============================================
    const lineY = height * 0.44;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 240, lineY);
    ctx.lineTo(centerX + 240, lineY);
    ctx.stroke();

    // ============================================
    // 3. NAMA PESERTA
    // Font: Times New Roman Bold
    // Size: 55px (auto-resize jika panjang)
    // Posisi: tepat di atas garis (~31%)
    // ============================================
    const participantName = registration.fullName;
    let nameFontSize = 55;
    const maxNameWidth = 450;
    
    ctx.font = `bold ${nameFontSize}px "Times New Roman", serif`;
    let nameWidth = ctx.measureText(participantName).width;
    
    while (nameWidth > maxNameWidth && nameFontSize > 32) {
      nameFontSize -= 3;
      ctx.font = `bold ${nameFontSize}px "Times New Roman", serif`;
      nameWidth = ctx.measureText(participantName).width;
    }
    
    ctx.fillStyle = '#000000';
    ctx.fillText(participantName, centerX, height * 0.41);

    // ============================================
    // 5. PARAGRAF DESKRIPSI
    // Font: Arial/Helvetica Bold 600, 30px
    // Line-height: ~7% spacing
    // Warna: #333, Posisi: 52% dan 59%
    // ============================================
    ctx.font = '600 30px Arial, Helvetica, sans-serif';
    ctx.fillStyle = '#333333';
    ctx.fillText("This barista course certificate is a recognition of your", centerX, height * 0.52);
    ctx.fillText("skills. We're happy to be part of your journey.", centerX, height * 0.59);

    // ============================================
    // 6. SKILL NAME
    // Bold Italic, 32px
    // Posisi: 67% dari atas (tepat di bawah paragraf)
    // ============================================
    ctx.font = 'italic bold 32px "Times New Roman", serif';
    ctx.fillStyle = '#333333';
    ctx.fillText(`(${skillName})`, centerX, height * 0.67);

    // ============================================
    // 7. AREA TANDA TANGAN
    // Posisi Y: 86% dari atas (naik ~25px)
    // Direktur: 25% dari kiri, garis 220px
    // Instruktur: 75% dari kiri, garis 200px
    // ============================================
    const sigY = height * 0.86;
    const dirX = width * 0.25;
    const instrX = width * 0.75;
    
    // ============================================
    // TANDA TANGAN GAMBAR (jika ada)
    // Posisi: di atas garis tanda tangan
    // Ukuran: max 440x180px (2x lebih besar), centered
    // ============================================
    const signatureMaxWidth = 440;
    const signatureMaxHeight = 180;
    
    // Gambar tanda tangan direktur jika ada
    if (directorSignatureBase64) {
      try {
        const dirSigImage = await loadImage(directorSignatureBase64);
        const sigAspect = dirSigImage.width / dirSigImage.height;
        let sigWidth = signatureMaxWidth;
        let sigHeight = sigWidth / sigAspect;
        
        if (sigHeight > signatureMaxHeight) {
          sigHeight = signatureMaxHeight;
          sigWidth = sigHeight * sigAspect;
        }
        
        const dirSigX = dirX - sigWidth / 2;
        const dirSigY = sigY - sigHeight - 12; // sedikit naik agar proporsional
        ctx.drawImage(dirSigImage, dirSigX, dirSigY, sigWidth, sigHeight);
      } catch (err) {
        console.error('Error loading director signature:', err);
      }
    }
    
    // Gambar tanda tangan instruktur jika ada
    if (instructorSignatureBase64) {
      try {
        const instrSigImage = await loadImage(instructorSignatureBase64);
        const sigAspect = instrSigImage.width / instrSigImage.height;
        let sigWidth = signatureMaxWidth;
        let sigHeight = sigWidth / sigAspect;
        
        if (sigHeight > signatureMaxHeight) {
          sigHeight = signatureMaxHeight;
          sigWidth = sigHeight * sigAspect;
        }
        
        const instrSigX = instrX - sigWidth / 2;
        const instrSigY = sigY - sigHeight - 12; // sedikit naik agar proporsional
        ctx.drawImage(instrSigImage, instrSigX, instrSigY, sigWidth, sigHeight);
      } catch (err) {
        console.error('Error loading instructor signature:', err);
      }
    }
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    
    // Garis Direktur (220px - diperpanjang)
    ctx.beginPath();
    ctx.moveTo(dirX - 110, sigY);
    ctx.lineTo(dirX + 110, sigY);
    ctx.stroke();
    
    // Garis Instruktur (200px - diperpanjang)
    ctx.beginPath();
    ctx.moveTo(instrX - 100, sigY);
    ctx.lineTo(instrX + 100, sigY);
    ctx.stroke();
    
    // Nama Direktur (ukuran diperbesar 20px → 23px)
    ctx.textAlign = 'center';
    ctx.font = 'bold 23px "Times New Roman", serif';
    ctx.fillStyle = '#222222';
    ctx.fillText(directorName, dirX, sigY + 26);
    
    // Jabatan Direktur (bold, jarak 24px dari nama)
    ctx.font = 'bold 18px Arial, Helvetica, sans-serif';
    ctx.fillStyle = '#333333';
    ctx.fillText('Direktur', dirX, sigY + 50);
    
    // Nama Instruktur (ukuran diperbesar 20px → 23px)
    ctx.font = 'bold 23px "Times New Roman", serif';
    ctx.fillStyle = '#222222';
    ctx.fillText(instructorName, instrX, sigY + 26);
    
    // Jabatan Instruktur (bold, jarak 24px dari nama)
    ctx.font = 'bold 18px Arial, Helvetica, sans-serif';
    ctx.fillStyle = '#333333';
    ctx.fillText('Instruktur', instrX, sigY + 50);

    // Create output directory if not exists
    const outputDir = path.join(process.cwd(), 'public', 'certificates', 'generated');
    try {
      await mkdir(outputDir, { recursive: true });
    } catch {
      // Directory might already exist
    }

    // Save certificate as PNG (HD quality)
    const fileName = `cert_${certificateCode}.png`;
    const outputPath = path.join(outputDir, fileName);
    const buffer = canvas.toBuffer('image/png');
    await writeFile(outputPath, buffer);

    // Certificate URL
    const certificateUrl = `/certificates/generated/${fileName}`;

    // Update registration with certificate info
    await prisma.classregistration.update({
      where: { id: parseInt(registrationId) },
      data: {
        certificateUrl: certificateUrl,
        status: 'completed'
      }
    });

    // Create notification for member
    if (registration.userId) {
      await prisma.notification.create({
        data: {
          title: "🎓 Sertifikat Anda Sudah Siap!",
          message: `Selamat! Sertifikat untuk program "${registration.programName}" sudah tersedia. Silakan download di halaman Kelas Saya.`,
          type: "success",
          target: "member",
          userId: registration.userId
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Sertifikat berhasil digenerate!",
      certificate: {
        code: certificateCode,
        url: certificateUrl,
        recipientName: registration.fullName,
        programName: registration.programName,
        skillName: skillName,
        completionDate: formattedDate
      }
    });

  } catch (error) {
    console.error("POST /api/admin/generate-certificate error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal generate sertifikat: " + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// GET verify certificate by code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ success: false, error: "Kode sertifikat diperlukan" }, { status: 400 });
    }

    // Find registration by certificate URL containing the code
    const registration = await prisma.classregistration.findFirst({
      where: {
        certificateUrl: { contains: code }
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!registration) {
      return NextResponse.json({ 
        success: false, 
        error: "Sertifikat tidak ditemukan atau tidak valid" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      certificate: {
        code: code,
        recipientName: registration.fullName,
        programName: registration.programName,
        issuedBy: "PT. BARIZTA RUANG KREATIF"
      }
    });

  } catch (error) {
    console.error("GET /api/admin/generate-certificate error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal verifikasi sertifikat" },
      { status: 500 }
    );
  }
}
