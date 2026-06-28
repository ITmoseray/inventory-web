import { NextResponse } from "next/server";
import { getSystemSettings } from "@/lib/actions/system-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json(
      { 
        banner: settings.announcementBanner || "",
        updatedAt: settings.announcementBannerUpdatedAt || "" 
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ banner: "", updatedAt: "" });
  }
}
