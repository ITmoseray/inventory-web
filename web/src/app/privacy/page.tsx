import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
          <h1>Privacy Policy</h1>
          <p className="lead text-slate-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
            <section>
              <h2>1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as your name, email address, phone number, and business details when you register for an account. We also collect data about your inventory, sales, and customers as you use our point-of-sale system.</p>
            </section>

            <section>
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to operate, maintain, and provide the features and functionality of Protech Assist. This includes processing transactions, providing customer support, and sending administrative communications.</p>
            </section>

            <section>
              <h2>3. Data Security</h2>
              <p>We implement industry-standard security measures designed to protect your data from unauthorized access, disclosure, or destruction. However, no internet transmission is entirely secure.</p>
            </section>

            <section>
              <h2>4. Sharing of Information</h2>
              <p>We do not sell your personal information. We may share your information with third-party vendors and service providers that perform services on our behalf, such as payment processing and hosting.</p>
            </section>

            <section>
              <h2>5. Your Rights</h2>
              <p>Depending on your location, you may have the right to access, correct, or delete your personal data. Contact us to exercise these rights.</p>
            </section>

            <section>
              <h2>6. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
