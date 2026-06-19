"use server";

import cloudinary from "@/lib/cloudinary";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function uploadToCloudinary(file: File, folder: string) {
  if (!file) throw new Error("No file provided");
  if (file.size > MAX_FILE_SIZE) throw new Error("File size exceeds 5MB limit");
  if (!ALLOWED_MIME_TYPES.includes(file.type)) throw new Error("Invalid file type");

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadOptions: any = {
      folder: `inventory/${folder}`,
      resource_type: "image",
      transformation: [
        { width: 800, height: 800, crop: "fill", gravity: "auto" },
        { fetch_format: "webp", quality: "auto:best" }
      ],
    };

    return await new Promise<string>((resolve, reject) => {
      cloudinary.uploader.upload(base64Image, uploadOptions, (error, result) => {
        if (error) reject(new Error(`Cloudinary upload failed: ${error.message}`));
        else if (!result?.secure_url) reject(new Error("Cloudinary upload returned no URL"));
        else resolve(result.secure_url);
      });
    });
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

export async function uploadProductImage(formData: FormData) {
  const file = formData.get("file") as File;
  return await uploadToCloudinary(file, "products");
}

export async function uploadBusinessLogo(formData: FormData) {
  const file = formData.get("file") as File;
  return await uploadToCloudinary(file, "logos");
}
