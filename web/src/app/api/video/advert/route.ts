import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const candidatePaths = [
      path.join(process.cwd(), "public", "videos", "protech-advert.mp4"),
      path.join(process.cwd(), "web", "public", "videos", "protech-advert.mp4"),
      path.join(__dirname, "../../../../../public/videos/protech-advert.mp4"),
      "C:\\Users\\ProTech\\OneDrive\\Desktop\\0902\\0902.mp4"
    ];

    let videoPath = "";
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        videoPath = p;
        break;
      }
    }

    if (!videoPath) {
      return new NextResponse("Video not found", { status: 404 });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.get("range");

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      
      const fileStream = fs.createReadStream(videoPath, { start, end });
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => controller.enqueue(chunk));
          fileStream.on("end", () => controller.close());
          fileStream.on("error", (err) => controller.error(err));
        }
      });

      return new NextResponse(stream as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize.toString(),
          "Content-Type": "video/mp4",
          "Cache-Control": "public, max-age=86400"
        }
      });
    } else {
      const fileStream = fs.createReadStream(videoPath);
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => controller.enqueue(chunk));
          fileStream.on("end", () => controller.close());
          fileStream.on("error", (err) => controller.error(err));
        }
      });

      return new NextResponse(stream as any, {
        status: 200,
        headers: {
          "Content-Length": fileSize.toString(),
          "Content-Type": "video/mp4",
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=86400"
        }
      });
    }
  } catch (error) {
    console.error("Video stream error:", error);
    return new NextResponse("Failed to stream video", { status: 500 });
  }
}
