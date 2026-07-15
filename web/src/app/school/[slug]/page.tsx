import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Award, FileSignature, LogIn, BrainCircuit, Globe, Rocket, Users, FlaskConical } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import RegistrationModal from './RegistrationModal'; // We will create this client component

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const school = await prisma.business.findUnique({
    where: { slug: params.slug, type: 'SCHOOL' }
  });
  
  if (!school) return { title: 'School Not Found' };
  return { title: `${school.name} - Excellence in Education` };
}

export default async function SchoolTenantPage({ params }: { params: { slug: string } }) {
  const school = await prisma.business.findUnique({
    where: { slug: params.slug, type: 'SCHOOL' }
  });

  if (!school) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      
      {/* School Hero */}
      <section className="relative pt-32 pb-40 bg-[linear-gradient(135deg,#1e1b4b_0%,#4c1d95_50%,#7c3aed_100%)] text-center text-white rounded-b-[100px] -mt-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30 z-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-8 flex justify-center animate-in zoom-in duration-1000">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-full shadow-2xl border-4 border-white/30">
              {school.logoUrl ? (
                <Image src={school.logoUrl} alt={school.name} width={160} height={160} className="rounded-full object-cover w-40 h-40" />
              ) : (
                <div className="w-40 h-40 rounded-full bg-violet-600 flex items-center justify-center">
                  <span className="text-4xl font-bold">{school.name.substring(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold uppercase tracking-wider text-sm mb-8 shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200 fill-mode-both">
            <Award className="w-5 h-5 text-yellow-400" />
            Accredited Center of Excellence
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-400 fill-mode-both">
            Forge Your Future at <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">{school.name}</span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-xl text-blue-100 mb-12 leading-relaxed opacity-95 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-600 fill-mode-both">
            Advancing Knowledge, Transforming Lives through Innovative, Industry-Leading Education.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-800 fill-mode-both">
            {/* The Registration Modal component will contain the button and modal logic */}
            <RegistrationModal businessId={school.id} businessName={school.name} />
            
            <Link href="/login" className="px-8 py-4 rounded-2xl border-2 border-white/50 text-white font-bold uppercase tracking-wide hover:bg-white hover:text-violet-900 transition-all flex items-center justify-center gap-2">
              Student Gateway
              <LogIn className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 -mt-20 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="animate-in fade-in slide-in-from-bottom-10 delay-100 fill-mode-both">
              <div className="bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-white/10 rounded-3xl p-10 h-full flex flex-col items-start hover:-translate-y-3 hover:shadow-xl hover:border-violet-500 transition-all duration-400">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center mb-6">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Practical Mastery</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Our curriculum is 80% hands-on, ensuring you graduate with job-ready skills that employers demand.</p>
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-10 delay-200 fill-mode-both">
              <div className="bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-white/10 rounded-3xl p-10 h-full flex flex-col items-start hover:-translate-y-3 hover:shadow-xl hover:border-violet-500 transition-all duration-400">
                <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center mb-6">
                  <Globe className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Global Recognition</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Earn certifications recognized across industries, giving you a competitive edge in the global market.</p>
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-10 delay-300 fill-mode-both">
              <div className="bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-white/10 rounded-3xl p-10 h-full flex flex-col items-start hover:-translate-y-3 hover:shadow-xl hover:border-violet-500 transition-all duration-400">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center mb-6">
                  <Rocket className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Career Acceleration</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Dedicated mentorship and industry placements designed to launch your professional journey immediately.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <div className="w-full lg:w-5/12 animate-in slide-in-from-left-10 duration-1000 fill-mode-both">
              <h6 className="text-violet-600 dark:text-violet-400 font-bold uppercase tracking-widest mb-4">Academic Legacy</h6>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">Leading the Way in Modern Education</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                At {school.name}, we don't just teach; we inspire. Our mission is to transform Sierra Leone's educational landscape by blending traditional values with future-ready technology.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="bg-violet-600 text-white p-3 rounded-2xl shadow-lg shadow-violet-500/30 shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Expert Faculty</h5>
                    <p className="text-slate-500 dark:text-slate-400">Learn from seasoned industry professionals and academic leaders.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="bg-violet-600 text-white p-3 rounded-2xl shadow-lg shadow-violet-500/30 shrink-0">
                    <FlaskConical className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-xl font-bold text-slate-900 dark:text-white mb-2">State-of-the-Art Labs</h5>
                    <p className="text-slate-500 dark:text-slate-400">Access modern facilities equipped with latest industry technology.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-7/12 animate-in slide-in-from-right-10 duration-1000 fill-mode-both">
               <div className="rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border-8 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-800 min-h-[400px] flex items-center justify-center">
                 <p className="text-slate-500">Graduation slideshow component to be added.</p>
               </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
