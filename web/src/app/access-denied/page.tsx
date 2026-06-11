export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="rounded-full bg-rose-100 p-6 mb-6">
        <ShieldAlert className="h-12 w-12 text-rose-600" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">Access Restricted</h1>
      <p className="text-slate-500 font-medium max-w-sm mb-8">
        You do not have the necessary permissions to access this module. Please contact your administrator if you believe this is an error.
      </p>
      <div className="flex gap-4">
        <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors border border-slate-200 bg-white hover:bg-slate-100 text-slate-900">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
