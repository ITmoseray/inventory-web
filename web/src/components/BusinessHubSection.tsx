import Link from "next/link";
import { 
  Building2, 
  Store, 
  Database, 
  Users, 
  TrendingUp, 
  ShoppingCart, 
  ArrowRight,
  CheckCircle2,
  Rocket
} from "lucide-react";

const features = [
  { icon: Building2, title: "Business Profiles", description: "Create a professional online business profile." },
  { icon: Store, title: "Online Marketplace", description: "Upload and sell products online." },
  { icon: Database, title: "Inventory Integration", description: "Manage inventory in real time." },
  { icon: TrendingUp, title: "Sales Analytics", description: "Track sales and customer activity." },
  { icon: ShoppingCart, title: "Order Management", description: "Receive and manage customer orders." },
  { icon: Users, title: "Business Growth", description: "Grow business digitally." },
];

const comingSoon = [
  "Online storefronts",
  "Product marketplace",
  "Customer management (CRM)",
  "Sales analytics dashboard",
  "Digital payments (Mobile Money + Cards)",
  "Business growth tools"
];

export function BusinessHubSection() {
  return (
    <section className="relative py-24 bg-slate-50 overflow-hidden">
      {/* Subtle Gradient Background */}
      <div className="absolute top-0 left-1/2 w-full h-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-slate-50 to-slate-50 -z-10" />

      <div className="container px-6 mx-auto">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-[0.2em] mb-4">
            Introducing Protech Business Hub
          </h2>
          <h3 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            Your Digital Marketplace for Business Growth
          </h3>
          <p className="text-xl text-slate-600 leading-relaxed">
            Connect your business, sell online, manage inventory, and reach more customers — all from one powerful platform built for modern commerce in Sierra Leone.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, i) => (
            <div key={i} className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h4>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Local Positioning & Coming Soon */}
        <div className="grid lg:grid-cols-2 gap-12 items-center bg-white p-12 rounded-3xl border border-slate-100 shadow-lg">
          <div>
            <h4 className="text-2xl font-extrabold text-slate-900 mb-4">
              Built for Sierra Leone Businesses
            </h4>
            <p className="text-slate-600 mb-8 leading-relaxed">
              From small shops to growing enterprises, we're helping you transition into modern digital commerce with ease and efficiency.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold">
              <Rocket className="h-4 w-4" />
              New Features Arriving Soon
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {comingSoon.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link 
            href="/business-hub" 
            className="inline-flex items-center gap-2 h-14 px-10 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold transition-all hover:-translate-y-1 shadow-lg"
          >
            Visit Protech Business Hub <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
