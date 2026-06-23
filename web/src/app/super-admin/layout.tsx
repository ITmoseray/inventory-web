import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "SUPERADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-200 transition-colors duration-300">
      {/* Shared Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-500/10 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-5 dark:opacity-10" />
      </div>

      {/* Page Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
