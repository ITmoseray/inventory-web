import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  LayoutDashboard,
  Link2,
  FileText,
  DollarSign,
  Wallet,
  ShieldCheck,
  AlertCircle,
  Clock,
  LogOut,
  ExternalLink,
  Award,
} from "lucide-react";

export default async function AffiliatePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/affiliate/dashboard");
  }

  // Fetch affiliate profile
  const affiliate = await prisma.affiliate.findUnique({
    where: { userId: session.user.id },
  });

  const isSuperAdmin =
    session.user.role === "SUPERADMIN" ||
    (session.user as any)?.originalRole === "SUPERADMIN";

  // If user is not an affiliate and not super admin, redirect to general dashboard
  if (!affiliate && !isSuperAdmin) {
    redirect("/dashboard");
  }

  const status = affiliate?.status || "APPROVED";
  const code = affiliate?.affiliateCode || "PA-ADMIN";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Notification Banner for non-approved states */}
      {status === "PENDING" && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-300 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Application Under Review:</strong> Your affiliate profile is pending verification by ProTech Assist administration. Tracking links and payout requests activate once approved.
          </span>
        </div>
      )}

      {status === "SUSPENDED" && (
        <div className="bg-rose-500/15 border-b border-rose-500/30 px-4 py-2.5 text-xs text-rose-300 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>Account Suspended:</strong> Your affiliate privileges are temporarily paused. Reason: {affiliate?.rejectionReason || "Under administrative review"}. Please contact ProTech support.
          </span>
        </div>
      )}

      {/* Main Top Navigation */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & ID */}
          <div className="flex items-center gap-3">
            <Link href="/affiliate/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-950">
                PA
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight block">
                  ProTech <span className="text-emerald-400">Affiliate</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1">
                  Empowering Businesses Through Technology
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-slate-800 border border-slate-700 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {code}
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/affiliate/dashboard"
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
            </Link>
            <Link
              href="/affiliate/links"
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <Link2 className="w-4 h-4 text-slate-400" /> Referral Links
            </Link>
            <Link
              href="/affiliate/marketing"
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-slate-400" /> Marketing Resources
            </Link>
            <Link
              href="/affiliate/commissions"
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4 text-slate-400" /> Commissions
            </Link>
            <Link
              href="/affiliate/payouts"
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <Wallet className="w-4 h-4 text-slate-400" /> Payouts
            </Link>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">{affiliate?.fullName || session.user.name}</p>
              <p className="text-[10px] text-slate-400">{affiliate?.email || session.user.email}</p>
            </div>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                title="Sign out"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden border-t border-slate-800/80 bg-slate-900/90 px-2 py-2 flex items-center justify-around text-xs">
          <Link href="/affiliate/dashboard" className="p-2 text-slate-300 hover:text-white flex flex-col items-center gap-1">
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px]">Overview</span>
          </Link>
          <Link href="/affiliate/links" className="p-2 text-slate-300 hover:text-white flex flex-col items-center gap-1">
            <Link2 className="w-4 h-4" />
            <span className="text-[10px]">Links</span>
          </Link>
          <Link href="/affiliate/marketing" className="p-2 text-slate-300 hover:text-white flex flex-col items-center gap-1">
            <FileText className="w-4 h-4" />
            <span className="text-[10px]">Promo</span>
          </Link>
          <Link href="/affiliate/commissions" className="p-2 text-slate-300 hover:text-white flex flex-col items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-[10px]">Earnings</span>
          </Link>
          <Link href="/affiliate/payouts" className="p-2 text-slate-300 hover:text-white flex flex-col items-center gap-1">
            <Wallet className="w-4 h-4" />
            <span className="text-[10px]">Payouts</span>
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} ProTech Assist SL Limited. All rights reserved.</span>
          <div className="flex gap-4 text-slate-400">
            <Link href="/affiliate/terms" className="hover:text-slate-200 transition">
              Affiliate Agreement
            </Link>
            <Link href="/" target="_blank" className="hover:text-slate-200 transition flex items-center gap-1">
              Main Website <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
