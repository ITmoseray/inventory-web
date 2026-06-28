import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <Link href="/register" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Registration
        </Link>
        
        <div className="flex items-center gap-4 mb-12">
           <div className="h-16 w-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-indigo-600/40">
              <Package className="h-8 w-8 text-white" />
           </div>
           <div className="flex flex-col">
              <span className="font-black text-4xl tracking-tighter leading-none dark:text-white">PROTECH <span className="text-indigo-600 italic">ASSIST</span></span>
           </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none prose-h1:font-black prose-h1:tracking-tighter prose-h2:font-bold prose-h2:tracking-tight">
          <h1>Terms of Service</h1>
          <p className="lead text-slate-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing and using Protech Assist, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </section>

            <section>
              <h2>2. Description of Service</h2>
              <p>Protech Assist provides an enterprise inventory operating system and point-of-sale solution. We reserve the right to modify, suspend, or discontinue any part of the service at any time.</p>
            </section>

            <section>
              <h2>3. User Account Responsibilities</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
            </section>

            <section>
              <h2>4. Subscription and Billing</h2>
              <p>Certain features of Protech Assist are provided on a subscription basis. You agree to pay all applicable fees associated with your chosen plan. Refunds are processed according to our refund policy.</p>
            </section>

            <section>
              <h2>5. Data and Privacy</h2>
              <p>Your use of the service is also governed by our Privacy Policy. You retain all rights to your business data, but you grant us a license to host, copy, and use it to provide the service to you.</p>
            </section>

            <section>
              <h2>6. Limitation of Liability</h2>
              <p>Protech Assist shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
