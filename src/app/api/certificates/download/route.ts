import { NextRequest } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import fs from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';

function sanitizeFilePart(value: string) {
  const cleaned = value
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  return cleaned || 'sertifikat';
}

function normalizeCertificatePath(src: string) {
  // Accept only assets under /certificates to prevent path traversal.
  if (!src.startsWith('/certificates/')) return null;
  if (src.includes('..')) return null;
  return src;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const srcParam = searchParams.get('src') || '';
  const nameParam = searchParams.get('name') || 'sertifikat';

  const src = normalizeCertificatePath(srcParam);
  if (!src) {
    return new Response('Invalid src', { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'public', src.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) {
    return new Response('Not found', { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  // Only support PNG/JPEG
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
    return new Response('Unsupported image format for PDF. Use PNG or JPEG.', { status: 400 });
  }

  try {
    const imageBuffer = fs.readFileSync(filePath);
    
    // Create PDF document with pdf-lib
    const pdfDoc = await PDFDocument.create();
    
    // Embed image based on type
    let image;
    if (ext === '.png') {
      image = await pdfDoc.embedPng(imageBuffer);
    } else {
      image = await pdfDoc.embedJpg(imageBuffer);
    }
    
    // Get image dimensions
    const imgWidth = image.width;
    const imgHeight = image.height;
    
    // A4 landscape dimensions in points (72 dpi)
    const pageWidth = 842;
    const pageHeight = 595;
    
    // Calculate scaling to fit page
    const scaleX = pageWidth / imgWidth;
    const scaleY = pageHeight / imgHeight;
    const scale = Math.min(scaleX, scaleY);
    const displayWidth = imgWidth * scale;
    const displayHeight = imgHeight * scale;
    const offsetX = (pageWidth - displayWidth) / 2;
    const offsetY = (pageHeight - displayHeight) / 2;
    
    // Add page with A4 landscape size
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    // Draw image centered on page
    page.drawImage(image, {
      x: offsetX,
      y: offsetY,
      width: displayWidth,
      height: displayHeight,
    });
    
    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    
    const filename = `Sertifikat_${sanitizeFilePart(nameParam)}.pdf`;

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to generate certificate PDF:', error);
    return new Response('Failed to generate PDF', { status: 500 });
  }
}
