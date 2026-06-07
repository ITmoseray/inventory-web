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
    try {
      // For products, we try to create a clean 'floating' look
      const mask = await sharp(buffer)
        .threshold(245) 
        .negate()       
        .toBuffer();

      sharpPipeline = sharp(buffer)
        .ensureAlpha()
        .joinChannel(mask) 
        .trim();           
    } catch (err) {
      console.error("Advanced processing failed, falling back to standard:", err);
      sharpPipeline = sharp(buffer); // Fallback
    }
  }

  const processedBuffer = await sharpPipeline
    .resize(800, 800, { 
      fit: "contain",    // Don't crop the product
      background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
    })
    .webp({ quality: 85 })
    .toBuffer();

  const fileName = `${Date.now()}-${file.name.split('.')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webp`;
  
  // FORCE path to be within the web/public directory
  const rootDir = process.cwd();
  // Ensure we are in the inventory root, then look for web/public
  const publicPath = path.join(rootDir, "web", "public", "uploads", subDir);

  console.log(`DEBUG: Forcing upload path to: ${publicPath}`);
  
  // Ensure directory exists
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
    console.log(`DEBUG: Created DIR: ${publicPath}`);
  }

  const finalFilePath = path.join(publicPath, fileName);
  await writeFile(finalFilePath, processedBuffer);
  
  // Verify file was written
  if (fs.existsSync(finalFilePath)) {
    console.log(`DEBUG: SUCCESS! Image saved to: ${finalFilePath}`);
  } else {
    console.error(`DEBUG: FAILURE! File not found after write: ${finalFilePath}`);
  }

  // Next.js serves files from the public folder automatically, so the URL
  // should be /uploads/subDir/fileName.
  return `/uploads/${subDir}/${fileName}`;
}

export async function uploadProductImage(formData: FormData) {
  console.log("SERVER DEBUG: uploadProductImage HIT");
  const fs = require('fs');
  const path = require('path');
  try {
    fs.appendFileSync(path.join(process.cwd(), "hit.log"), `[${new Date().toISOString()}] HIT\n`);
  } catch(e) {}

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
