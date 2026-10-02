import Link from "next/link";
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Scale } from "lucide-react";

export const metadata = {
  title: "Affiliate Program Terms & Agreement | ProTech Assist SL Limited",
  description: "Official terms and conditions for independent affiliates and referral partners of ProTech Assist SL Limited.",
};

export default function AffiliateTermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/affiliate/register"
            className="inline-flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Affiliate Registration
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-8 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Official Agreement
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Affiliate & Referral Partner Agreement
              </h1>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ProTech Assist SL Limited &bull; Tagline: <em>Empowering Businesses Through Technology</em> &bull; Last Revised: October 2026
          </p>
        </div>

        {/* Key Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-1">
              <CheckCircle2 className="w-4 h-4" /> Single-Level Program
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Strictly single-tier referral rewards. Zero multi-level, network, or pyramid scheme structures.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-1">
              <ShieldCheck className="w-4 h-4" /> Verified Conversions
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Commissions are paid on actual, verified customer transactions. No payouts for raw clicks or bot traffic.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm mb-1">
              <AlertTriangle className="w-4 h-4" /> Zero Self-Referral
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Purchasing via your own affiliate link to discount personal subscriptions is strictly prohibited.
            </p>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              1. Purpose & Relationship
            </h2>
            <p>
              This Agreement governs your participation as an independent marketing affiliate for <strong>ProTech Assist SL Limited</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). You are engaging as an independent contractor. Nothing in this agreement creates a partnership, joint venture, agency, franchise, sales representative, or employment relationship between you and ProTech Assist SL Limited. You have no authority to make or accept any offers or representations on our behalf.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              2. Application, Approval & Account Status
            </h2>
            <p>
              Submission of the Affiliate Registration Form initiates an evaluation period during which your application status will be <strong>Pending</strong>. ProTech Assist reserves the right to approve, reject, or request additional information for any application at our sole discretion. Only affiliates with <strong>Approved</strong> status are permitted to generate referral links and earn commissions. If an account is found in violation of our guidelines, it may be <strong>Suspended</strong> or <strong>Deactivated</strong> immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              3. Referral Tracking & Attribution Window
            </h2>
            <p>
              Each approved affiliate is issued a unique Affiliate Code (e.g., <code>PA-AFF-00001</code>) and customized tracking URLs. When a visitor clicks your referral link, our server sets a secure, privacy-compliant attribution tracking identifier with a default attribution window of <strong>30 calendar days</strong>. If the referred visitor registers and completes an eligible payment within this window, the transaction will be attributed to your affiliate account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              4. Commission Structure & Eligible Products
            </h2>
            <p className="mb-2">
              Commissions are calculated as either a percentage of the qualifying order or a fixed bonus as configured in the ProTech Commission Catalog:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 mb-2">
              <li><strong>Enterprise OS / Inventory Management Subscriptions:</strong> Standard 10% commission on recurring plan revenue.</li>
              <li><strong>Software Engineering & Full-Stack Development Cohorts:</strong> Up to 15% commission per verified enrolled student.</li>
              <li><strong>ProTech AI Masterclass & Prompt Engineering:</strong> 15% commission per verified registration.</li>
              <li><strong>Custom Website & Mobile Application Projects:</strong> Configurable 5% - 10% milestone commission upon contract completion.</li>
              <li><strong>Microsoft Office Training:</strong> Fixed bonus (e.g., NLe 100) per enrolled corporate or private student.</li>
            </ul>
            <p>
              Commissions are calculated on the net invoice amount paid by the customer, excluding taxes, bank transaction surcharges, or statutory fees.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              5. Qualifying Transactions vs. Clicks
            </h2>
            <p>
              <strong>Clicks do not generate commissions.</strong> To earn a commission, the referred party must be a bona fide customer who completes a real, verifiable financial transaction with ProTech Assist SL Limited. Free trials, cancelled invoices, reversed payments, or fraudulent card submissions do not qualify for commission payments.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              6. Anti-Fraud & Self-Referral Policy
            </h2>
            <p>
              Affiliates are strictly prohibited from using their own referral links to purchase subscriptions, software, or courses for their own business or personal use in order to obtain a discount or rebate. Any commission generated through self-referral, automated bots, click farms, fictitious customer registrations, or identity spoofing will be cancelled, and the offending affiliate account will be terminated with forfeiture of all accrued earnings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              7. Code of Conduct & Prohibited Marketing Practices
            </h2>
            <p className="mb-2">As a ProTech Assist affiliate, you agree NOT to:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li>Engage in unsolicited bulk messaging (Spam) on WhatsApp, SMS, Telegram, or Email.</li>
              <li>Make false, inflated, or deceptive claims regarding ProTech software features or career outcomes.</li>
              <li>Bid on &ldquo;ProTech Assist&rdquo;, &ldquo;ProTech Assist SL&rdquo;, or related trademarked keywords in search engine pay-per-click advertising without prior written consent.</li>
              <li>Impersonate ProTech Assist executive staff, official customer support, or billing personnel.</li>
              <li>Promote ProTech Assist links on websites containing defamatory, illicit, or offensive content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              8. Commission Approval & Payout Terms
            </h2>
            <p className="mb-2">
              Upon customer payment, commissions enter a <strong>Pending</strong> holding period (standard 14 days) to account for payment clearances and course refund windows. Once verified, commissions transition to <strong>Approved</strong> status.
            </p>
            <p>
              Affiliates may request a payout once their available approved balance reaches the minimum payout threshold of <strong>NLe 100.00</strong>. Payouts are disbursed via:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 mt-2">
              <li><strong>Orange Money Sierra Leone</strong> (Direct mobile wallet transfer)</li>
              <li><strong>Afrimoney Sierra Leone</strong> (Direct mobile wallet transfer)</li>
              <li><strong>Local Commercial Bank Transfer</strong> (Rokel Commercial Bank, Sierra Leone Commercial Bank, Ecobank, UBA, Zenith, GTBank)</li>
              <li><strong>Cash Payout</strong> (In-person collection at ProTech Assist Head Office in Freetown)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              9. Term & Termination
            </h2>
            <p>
              Either party may terminate this agreement at any time, with or without cause, upon written notice. Upon termination, all rights to use ProTech marketing resources and earn commissions on future referrals cease immediately. Unpaid approved commissions lawfully earned prior to termination will be settled in accordance with our normal payout schedule, provided no fraud or material breach has occurred.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              10. Governing Law
            </h2>
            <p>
              This Agreement is governed by and construed in accordance with the laws of the Republic of Sierra Leone. Any dispute arising under or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts of Sierra Leone.
            </p>
          </section>
        </div>

        {/* Action Button */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <Link
            href="/affiliate/register"
            className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all"
          >
            Agree & Proceed to Registration
          </Link>
          <span className="text-xs text-slate-500">ProTech Assist SL Limited &bull; Legal Compliance</span>
        </div>
      </div>
    </div>
  );
}
