"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, Camera, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  uploadAction: (formData: FormData) => Promise<string>;
  label?: string;
}

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export function ImageUploader({ value, onChange, uploadAction, label = "Product Imagery" }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [loading, setLoading] = useState(false);
  const [uploadSource, setUploadSource] = useState<"file" | "camera" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync preview when external value prop changes (e.g. editing existing product)
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Invalid file type. Please upload a JPEG, PNG, WebP, GIF, or AVIF image.`;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      return `File too large (${sizeMB.toFixed(1)} MB). Maximum size is ${MAX_FILE_SIZE_MB} MB.`;
    }
    return null;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, source: "file" | "camera") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate before uploading
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      // Reset the input so the same file can be re-selected after fixing
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      return;
    }

    setError(null);
    setLoading(true);
    setUploadSource(source);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const imageUrl = await uploadAction(formData);

      if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("http")) {
        throw new Error("Server returned an invalid image URL. Please check your Cloudinary configuration.");
      }

      setPreview(imageUrl);
      onChange(imageUrl);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      const message = err?.message || "Failed to upload image. Please try again.";
      setError(message);
      toast.error(message);
      console.error("[ImageUploader] Upload failed:", err);
    } finally {
      setLoading(false);
      setUploadSource(null);
      // Always reset inputs so user can re-select the same file
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    setPreview(null);
    setError(null);
    onChange("");
  };

  const triggerUpload = () => {
    if (loading) return;
    setError(null);
    fileInputRef.current?.click();
  };

  const triggerCamera = () => {
    if (loading) return;
    setError(null);
    cameraInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative group w-full aspect-square max-w-[200px] mx-auto overflow-hidden rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900">
          <Image
            src={preview}
            alt="Product Preview"
            fill
            className="object-cover transition-transform group-hover:scale-105"
            unoptimized
            onError={() => {
              setError("Failed to load image preview.");
              setPreview(null);
              onChange("");
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="destructive"
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg"
              onClick={handleRemove}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Upload from Device */}
          <button
            type="button"
            disabled={loading}
            onClick={triggerUpload}
            aria-label="Upload image from device"
            className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
          >
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 group-hover:bg-primary/10 transition-colors">
              {loading && uploadSource === "file" ? (
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              ) : (
                <ImageIcon className="h-6 w-6 text-slate-400 group-hover:text-primary" />
              )}
            </div>
            <div className="text-center">
              <span className="block text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                {loading && uploadSource === "file" ? "Uploading..." : "Upload"}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">From Device</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={ACCEPTED_TYPES.join(",")}
              onChange={(e) => handleUpload(e, "file")}
            />
          </button>

          {/* Camera Capture */}
          <button
            type="button"
            disabled={loading}
            onClick={triggerCamera}
            aria-label="Take photo with camera"
            className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-500/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
          >
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 group-hover:bg-indigo-500/10 transition-colors">
              {loading && uploadSource === "camera" ? (
                <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-slate-400 group-hover:text-indigo-500" />
              )}
            </div>
            <div className="text-center">
              <span className="block text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                {loading && uploadSource === "camera" ? "Processing..." : "Camera"}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Take Photo</span>
            </div>
            {/* environment = rear camera (default for product photos) */}
            <input
              ref={cameraInputRef}
              type="file"
              className="hidden"
              accept={ACCEPTED_TYPES.join(",")}
              capture="environment"
              onChange={(e) => handleUpload(e, "camera")}
            />
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
          <Loader2 className="h-3 w-3 animate-spin" />
          {uploadSource === "camera" ? "Processing camera capture..." : "Uploading to cloud..."}
        </div>
      )}

      {/* Error display */}
      {error && !loading && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 leading-relaxed">{error}</p>
        </div>
      )}

      {/* File constraints hint */}
      {!preview && !loading && (
        <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest">
          JPG · PNG · WebP · GIF · AVIF &nbsp;·&nbsp; Max {MAX_FILE_SIZE_MB} MB
        </p>
      )}
    </div>
  );
}
