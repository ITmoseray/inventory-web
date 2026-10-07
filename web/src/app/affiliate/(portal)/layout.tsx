import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
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

  const navLinks = [
    { href: "/affiliate/dashboard", label: "Overview", Icon: LayoutDashboard },
    { href: "/affiliate/links",     label: "Links",    Icon: Link2 },
    { href: "/affiliate/marketing", label: "Promo",    Icon: FileText },
    { href: "/affiliate/commissions", label: "Earnings", Icon: DollarSign },
    { href: "/affiliate/payouts",   label: "Payouts",  Icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Notification Banner for non-approved states */}
      {status === "PENDING" && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-800 flex items-start sm:items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong>Application Under Review:</strong> Your partner profile is being verified by ProTech Assist administration. You will receive an approval email shortly.
          </span>
        </div>
      )}

      {status === "SUSPENDED" && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 text-xs text-rose-800 flex items-start sm:items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong>Account Suspended:</strong> Your affiliate privileges are temporarily paused. Reason: {affiliate?.rejectionReason || "Under administrative review"}. Please contact partner support.
          </span>
        </div>
      )}

      {/* Main Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & ID */}
          <div className="flex items-center gap-3">
            <Link href="/affiliate/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shadow-sm">
                <Image
                  src="/images/logo-192.png"
                  alt="ProTech Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-base tracking-tight block">
                  ProTech <span className="text-emerald-600">Partner</span>
                </span>
                <span className="text-[10px] text-slate-500 block -mt-1 hidden sm:block">
                  Affiliate Network &bull; SL
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {code}
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                <Icon className="w-4 h-4 text-slate-400" /> {label === "Promo" ? "Marketing Kit" : label === "Earnings" ? "Commissions" : label}
              </Link>
            ))}
          </nav>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{affiliate?.fullName || session.user.name}</p>
              <p className="text-[10px] text-slate-500">{affiliate?.email || session.user.email}</p>
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
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-rose-600 border border-slate-200 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="hidden md:block border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} ProTech Assist SL Limited. All rights reserved.</span>
          <div className="flex gap-4 text-slate-500">
            <Link href="/affiliate/terms" className="hover:text-slate-800 transition">
              Affiliate Agreement
            </Link>
            <Link href="/services" target="_blank" className="hover:text-slate-800 transition flex items-center gap-1">
              Solutions & Masterclasses <ExternalLink className="w-3 h-3" />
            </Link>
            <Link href="/" target="_blank" className="hover:text-slate-800 transition flex items-center gap-1">
              Main Website <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl safe-b">
        <div className="flex items-stretch justify-around">
          {navLinks.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 text-slate-500 hover:text-emerald-700 active:bg-slate-100 transition text-[10px] font-bold"
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
