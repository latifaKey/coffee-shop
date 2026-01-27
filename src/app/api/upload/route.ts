import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

// Konfigurasi untuk file - batasi ukuran maksimal 10MB untuk keamanan
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// Supported image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
// Allowed folders for upload - whitelist approach for security
const ALLOWED_FOLDERS = ['uploads', 'images', 'menu', 'news', 'team', 'about', 'payment-proofs', 'certificates'];
// Max file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Helper function to verify admin role from token
function verifyAdminRole(request: NextRequest): boolean {
  const adminToken = request.cookies.get("admin_token")?.value;
  const authToken = request.cookies.get("auth_token")?.value;
  const tokenToUse = adminToken || authToken;
  
  if (!tokenToUse) return false;
  
  try {
    const session = JSON.parse(Buffer.from(tokenToUse, "base64").toString("utf-8"));
    return session.role === "admin";
  } catch {
    return false;
  }
}

async function saveFile(file: File, destFolder: string) {
  const contentType = file.type;
  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new Error('Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF');
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Ukuran file terlalu besar. Maksimal 10MB');
  }
  
  // Determine extension
  const extMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
  };
  const ext = extMap[contentType] || '.jpg';
  
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2,9)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const destPath = path.join(destFolder, unique);
  await fs.promises.writeFile(destPath, buffer);
  return unique;
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication with role check
    if (!verifyAdminRole(req)) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    let folder = formData.get('folder') as string || 'uploads';
    
    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    // Sanitize folder name to prevent path traversal attacks
    // Remove any path separators and special characters
    folder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    
    // Validate folder against whitelist
    if (!ALLOWED_FOLDERS.includes(folder)) {
      folder = 'uploads'; // Default to uploads if invalid folder
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', folder);
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const savedFilename = await saveFile(file, uploadsDir);
    const filePath = `/${folder}/${savedFilename}`;
    
    return NextResponse.json({ 
      success: true,
      filename: savedFilename,        // lowercase for ImageUploader compatibility
      fileName: savedFilename,        // camelCase for other components
      filePath: filePath,
      message: 'File berhasil diupload'
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload gagal';
    console.error('Upload error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
