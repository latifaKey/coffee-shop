import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload file to local storage
 * @param file - File object from FormData
 * @param folder - Destination folder (relative to public/)
 * @returns UploadResult with success status and file URL
 */
export async function uploadFile(
  file: File,
  folder: string = 'uploads/proofs'
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file || !(file instanceof File)) {
      return { success: false, error: 'Invalid file object' };
    }

    // Validate file type (only images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        success: false, 
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' 
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { 
        success: false, 
        error: 'File too large. Maximum size is 5MB.' 
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `payment-proof-${timestamp}-${randomStr}.${ext}`;

    // Create full path
    const uploadDir = join(process.cwd(), 'public', folder);
    const filePath = join(uploadDir, filename);

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file to disk
    await writeFile(filePath, buffer);

    // Return public URL (without 'public' prefix)
    const publicUrl = `/${folder}/${filename}`;

    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file'
    };
  }
}

/**
 * Upload file from base64 string (for backward compatibility)
 * @param base64String - Base64 encoded image data
 * @param folder - Destination folder (relative to public/)
 * @returns UploadResult with success status and file URL
 */
export async function uploadBase64(
  base64String: string,
  folder: string = 'uploads/proofs'
): Promise<UploadResult> {
  try {
    // Validate base64 string
    if (!base64String || typeof base64String !== 'string') {
      return { success: false, error: 'Invalid base64 string' };
    }

    // Extract base64 data
    const base64Match = base64String.match(/^data:image\/([a-z]+);base64,(.+)$/);
    if (!base64Match) {
      return { success: false, error: 'Invalid data URL format' };
    }

    const ext = base64Match[1];
    const base64Data = base64Match[2];

    // Validate file type
    const allowedExts = ['jpeg', 'jpg', 'png', 'webp'];
    if (!allowedExts.includes(ext)) {
      return { 
        success: false, 
        error: 'Invalid image format. Only JPEG, PNG, and WebP are allowed.' 
      };
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (buffer.length > maxSize) {
      return { 
        success: false, 
        error: 'File too large. Maximum size is 5MB.' 
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `payment-proof-${timestamp}-${randomStr}.${ext}`;

    // Create full path
    const uploadDir = join(process.cwd(), 'public', folder);
    const filePath = join(uploadDir, filename);

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Write file to disk
    await writeFile(filePath, buffer);

    // Return public URL (without 'public' prefix)
    const publicUrl = `/${folder}/${filename}`;

    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('Upload base64 error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file'
    };
  }
}
