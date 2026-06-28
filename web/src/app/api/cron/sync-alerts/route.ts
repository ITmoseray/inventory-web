import { NextResponse } from "next/server";
import { runAutomatedSystemChecks } from "@/lib/actions/cron-checks";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  
  // Basic query token checking if CRON_SECRET is configured
  if (process.env.CRON_SECRET && token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runAutomatedSystemChecks();
  
  if (result.success) {
    return NextResponse.json({ 
      message: "Automated ecosystem alerts scanned and pushed.", 
      details: result 
    });
  } else {
    return NextResponse.json({ 
      error: "Automated scan failed", 
      details: result 
    }, { status: 500 });
  }
}
