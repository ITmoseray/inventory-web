"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

async function processAndSaveImage(file: File, subDir: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Process image with Sharp
  const processedBuffer = await sharp(buffer)
    .resize(800, 800, { fit: "cover" }) // Auto-crop and resize
    .webp({ quality: 80 }) // Compress and convert to webp
    .toBuffer();

  const fileName = `${Date.now()}-${file.name.split('.')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webp`;
  
  // Robust directory detection
  let uploadDir = "";
  const rootPublic = path.join(process.cwd(), "public", "uploads", subDir);
  const webPublic = path.join(process.cwd(), "web", "public", "uploads", subDir);
  
  if (require('fs').existsSync(path.join(process.cwd(), "web", "public"))) {
    uploadDir = webPublic;
  } else {
    uploadDir = rootPublic;
  }
  
  console.log(`DEBUG: Uploading image. Target directory: ${uploadDir}`);
  
  // Ensure directory exists
  try {
    await mkdir(uploadDir, { recursive: true });
    console.log(`DEBUG: Directory ensured: ${uploadDir}`);
  } catch (error) {
    console.error(`CRITICAL: Failed to create directory ${uploadDir}:`, error);
  }

  const finalPath = path.join(uploadDir, fileName);
  await writeFile(finalPath, processedBuffer);
  console.log(`DEBUG: Image saved to: ${finalPath}`);

  return `/uploads/${subDir}/${fileName}`;
}

export async function uploadProductImage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) throw new Error("Invalid file type. Please upload an image (JPEG, PNG, WEBP, GIF).");

  // Validate size (5MB limit for more flexibility)
  if (file.size > 5 * 1024 * 1024) throw new Error("File too large (max 5MB)");

  return await processAndSaveImage(file, "products");
}

export async function uploadBusinessLogo(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) throw new Error("Invalid file type");

  if (file.size > 2 * 1024 * 1024) throw new Error("Logo too large (max 2MB)");

  return await processAndSaveImage(file, "logos");
}
