import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight, GraduationCap, School as SchoolIcon, ChevronRight, ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma'; // Assuming this is how prisma is imported in this app

export const metadata = {
  title: 'ProTech - Empowering Educational Excellence',
  description: 'Enterprise-grade school management system.',
};

async function getSchoolTenants() {
  try {
    // Fetch businesses that are of type SCHOOL
    const schools = await prisma.business.findMany({
      where: {
        type: 'SCHOOL',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
      }
    });
    return schools;
  } catch (error) {
    console.error("Failed to fetch schools:", error);
    return [];
  }
}

export default async function SchoolHubPage() {
  const tenants = await getSchoolTenants();

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-[radial-gradient(circle_at_50%_-20%,#4c1d95_0%,transparent_70%)] text-center">
        <div className="container mx-auto px-4 relative z-10">
          
          <div className="mb-8 flex justify-center animate-in fade-in slide-in-from-top-10 duration-1000">
            <div className="p-3 bg-white/10 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
               <div className="w-24 h-24 rounded-xl bg-violet-600 flex items-center justify-center">
                 <SchoolIcon className="w-12 h-12 text-white" />
               </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium text-sm mb-6 border border-indigo-200 dark:border-indigo-800/50 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200 fill-mode-both">
            <Sparkles className="w-4 h-4" />
            Academic Session 2026/2027
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-300 fill-mode-both">
            EASI Academy <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
              Shaping Leaders
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-500 fill-mode-both">
            Delivering a high-performance, mission-critical ecosystem for the next generation of leaders. Master admissions, academics, and enterprise-grade financials on our unified platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-700 fill-mode-both">
            <a href="#institutions" className="w-full sm:w-auto px-8 py-4 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-lg shadow-violet-500/30 transition-all flex items-center justify-center gap-2">
              Explore Network
              <ArrowRight className="w-5 h-5" />
            </a>
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border border-slate-200 dark:border-slate-700 hover:border-violet-500 transition-all shadow-sm flex items-center justify-center gap-2">
              Student Portal
              <GraduationCap className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Institutions Grid */}
      <section id="institutions" className="py-24 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Our Enterprise Network</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Select your institution below to access your dedicated academic and administrative portal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tenants.length > 0 ? tenants.map((school, i) => (
              <div key={school.id} className="animate-in fade-in slide-in-from-bottom-10" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
                <Link href={`/school/${school.slug}`} className="block h-full group">
                  <div className="bg-white/5 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-3xl p-8 h-full transition-all duration-300 flex flex-col items-center text-center hover:shadow-[0_0_25px_rgba(109,40,217,0.5)] hover:-translate-y-1">
                    <div className="w-24 h-24 mb-6 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300">
                      {school.logoUrl ? (
                        <Image src={school.logoUrl} alt={school.name} width={80} height={80} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <SchoolIcon className="w-10 h-10 text-slate-400" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{school.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 flex-grow">Advancing Knowledge, Transforming Lives.</p>
                    
                    <div className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-400 font-medium group-hover:bg-violet-600 group-hover:text-white flex items-center justify-center gap-2 transition-all">
                      Access Portal
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </div>
            )) : (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">No educational institutions found in the network yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Partner Section */}
      <section className="py-12 border-t border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-6">Powered By</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-violet-600" />
              ProTech Assist
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
