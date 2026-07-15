'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, MapPin, HeartPulse, ShieldAlert, GraduationCap, Calendar, Activity } from 'lucide-react';
import Image from 'next/image';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: any | null;
}

export default function StudentDetailsModal({ isOpen, onClose, student }: Props) {
  if (!isOpen || !student) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
          >
            {/* Header / Banner */}
            <div className="relative h-32 sm:h-40 bg-gradient-to-r from-violet-600 to-indigo-600 shrink-0">
               <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
               <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
               <div className="px-6 sm:px-10 pb-10">
                  
                  {/* Profile Header section */}
                  <div className="relative flex flex-col sm:flex-row gap-6 sm:items-end -mt-16 sm:-mt-20 mb-10">
                     <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-xl shrink-0">
                        {student.photoPath ? (
                           <Image src={student.photoPath} alt={student.firstName} fill className="object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                              <User className="w-16 h-16" />
                           </div>
                        )}
                     </div>
                     <div className="flex-1 space-y-2 pt-2 sm:pt-0">
                        <div className="flex items-center gap-3">
                           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                              {student.firstName} {student.lastName}
                           </h1>
                           <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${student.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                              {student.status}
                           </span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                           <GraduationCap className="w-4 h-4" /> 
                           ID: {student.studentId} • {student.currentLevel || 'Unassigned Level'}
                        </p>
                     </div>
                  </div>

                  {/* Information Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     
                     {/* Left Column */}
                     <div className="space-y-8">
                        {/* Personal Details */}
                        <section className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                           <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                              <User className="w-4 h-4" /> Personal Details
                           </h3>
                           <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    <Phone className="w-4 h-4 text-slate-500" />
                                 </div>
                                 <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Phone Number</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{student.phone || 'N/A'}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                 </div>
                                 <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Email Address</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{student.email || 'N/A'}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                 </div>
                                 <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Date of Birth</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                       {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'} 
                                       <span className="text-slate-400 ml-1 font-normal">({student.gender})</span>
                                    </p>
                                 </div>
                              </div>
                              <div className="flex gap-3">
                                 <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4 text-slate-500" />
                                 </div>
                                 <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Home Address</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{student.address || 'N/A'}</p>
                                 </div>
                              </div>
                           </div>
                        </section>

                        {/* Medical Information */}
                        <section className="bg-rose-50 dark:bg-rose-950/20 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                           <h3 className="text-xs font-black uppercase tracking-widest text-rose-500 mb-6 flex items-center gap-2">
                              <HeartPulse className="w-4 h-4" /> Medical Information
                           </h3>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-100 dark:border-rose-900/50">
                                 <p className="text-xs text-slate-500 dark:text-slate-400">Blood Group</p>
                                 <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{student.bloodGroup || '?'}</p>
                              </div>
                              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-100 dark:border-rose-900/50">
                                 <p className="text-xs text-slate-500 dark:text-slate-400">Medical Alerts</p>
                                 <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 line-clamp-2">
                                    {student.medicalConditions || 'None reported'}
                                 </p>
                              </div>
                           </div>
                        </section>
                     </div>

                     {/* Right Column */}
                     <div className="space-y-8">
                        {/* Emergency Contact */}
                        <section className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                           <h3 className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-6 flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4" /> Emergency Contact
                           </h3>
                           <div className="space-y-4">
                              <div>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">Guardian Name & Relation</p>
                                 <p className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                                    {student.guardianName || 'Not Provided'} 
                                    {student.guardianRelation && <span className="text-slate-400 font-normal ml-2">({student.guardianRelation})</span>}
                                 </p>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-4">
                                 <a href={`tel:${student.guardianPhone}`} className="flex-1 bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-100 dark:border-amber-900/50 flex items-center gap-3 hover:border-amber-300 transition-colors">
                                    <Phone className="w-4 h-4 text-amber-600" />
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{student.guardianPhone || 'No Phone'}</span>
                                 </a>
                                 <a href={`mailto:${student.guardianEmail}`} className="flex-1 bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-100 dark:border-amber-900/50 flex items-center gap-3 hover:border-amber-300 transition-colors">
                                    <Mail className="w-4 h-4 text-amber-600" />
                                    <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{student.guardianEmail || 'No Email'}</span>
                                 </a>
                              </div>
                           </div>
                        </section>

                        {/* Institutional Records Overview (Placeholder for future data) */}
                        <section className="bg-indigo-50 dark:bg-indigo-950/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                           <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-6 flex items-center gap-2">
                              <Activity className="w-4 h-4" /> Academic Snapshot
                           </h3>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-center">
                                 <p className="text-2xl font-black text-slate-900 dark:text-white">0</p>
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Absences</p>
                              </div>
                              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-center">
                                 <p className="text-2xl font-black text-slate-900 dark:text-white">--</p>
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Current GPA</p>
                              </div>
                              <div className="col-span-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-center">
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Enrollment Date</p>
                                 <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {new Date(student.enrollmentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                 </p>
                              </div>
                           </div>
                        </section>
                     </div>

                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
