"use server";

import { writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import fs from "fs";

async function processAndSaveImage(file: File, subDir: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Advanced Processing with Sharp
  // 1. We create a high-quality product image
  // 2. We attempt to remove very light backgrounds (studio style) if it's a product
  
  let sharpPipeline = sharp(buffer);
  
  if (subDir === "products") {
    // For products, we try to create a clean 'floating' look
    const metadata = await sharpPipeline.metadata();
    
    // We create a mask for pixels that are close to white (common in product photography)
    // This isn't perfect for all images but works well for studio shots
    const mask = await sharp(buffer)
      .threshold(245) // Pixels > 245 become white, others black
      .negate()       // Invert: light becomes black (transparent), dark becomes white (opaque)
      .toBuffer();

    sharpPipeline = sharp(buffer)
      .ensureAlpha()
      .joinChannel(mask) // Apply the mask as the alpha channel
      .trim();           // Remove the resulting transparent padding
  }

  const processedBuffer = await sharpPipeline
    .resize(800, 800, { 
      fit: "contain",    // Don't crop the product
      background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
    })
    .webp({ quality: 85 })
    .toBuffer();

  const fileName = `${Date.now()}-${file.name.split('.')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webp`;
  
  let baseDir = process.cwd();
  let publicPath = "";
  
  // Check common project structures
  if (fs.existsSync(path.join(baseDir, "web", "public"))) {
    publicPath = path.join(baseDir, "web", "public", "uploads", subDir);
  } else if (fs.existsSync(path.join(baseDir, "public"))) {
    publicPath = path.join(baseDir, "public", "uploads", subDir);
  } else if (baseDir.endsWith('web')) {
     publicPath = path.join(baseDir, "public", "uploads", subDir);
  } else {
    // Ultimate fallback
    publicPath = path.join(baseDir, "public", "uploads", subDir);
  }

  console.log(`DEBUG: Target Path: ${publicPath}`);
  
  // Ensure directory exists
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
    console.log(`DEBUG: Created DIR: ${publicPath}`);
  }

  const finalFilePath = path.join(publicPath, fileName);
  await writeFile(finalFilePath, processedBuffer);
  
  console.log(`DEBUG: Saved to: ${finalFilePath}`);

  return `/uploads/${subDir}/${fileName}`;
}

export async function uploadProductImage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) throw new Error("Invalid file type.");

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
