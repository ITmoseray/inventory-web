import { getStaffAgreementById } from "@/lib/actions/staff-agreements";
import { StaffAgreementSignClient } from "./StaffAgreementSignClient";
import Link from "next/link";
import { ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Enterprise Staff Agreement & Digital Signature Portal",
  description: "Official staff onboarding, compliance declaration, and digital signature agreement."
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StaffAgreementPage({ params }: PageProps) {
  const { id } = await params;
  const agreement = await getStaffAgreementById(id);

  if (!agreement) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
          <div className="h-16 w-16 rounded-3xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-[1000] uppercase tracking-tight text-slate-900 dark:text-white">
              Agreement Not Found
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              This staff agreement record could not be located, has expired, or was revoked by Super Admin.
            </p>
          </div>
          <Link href="/login">
            <Button className="w-full h-12 rounded-xl font-black text-xs uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <ArrowLeft className="h-4 w-4" /> Return to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <StaffAgreementSignClient agreement={agreement} />;
}
