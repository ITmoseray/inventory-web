"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export const SplashScreen = () => {
    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex flex-col items-center"
            >
                <div className="relative w-32 h-32 sm:w-48 sm:h-48 mb-8 group">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <Image 
                        src="/images/logo2.png" 
                        alt="Logo" 
                        fill 
                        className="object-contain relative z-10 drop-shadow-[0_0_15px_rgba(79,70,229,0.3)]" 
                    />
                </div>
                
                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center">
                        <motion.h1 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-white text-xl sm:text-2xl font-black tracking-tighter uppercase text-center"
                        >
                            Protech <span className="text-indigo-500">Super Control</span>
                        </motion.h1>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mt-2 w-48"
                        />
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="relative h-1 w-48 sm:w-64 bg-slate-900 rounded-full overflow-hidden">
                            <motion.div 
                                className="absolute inset-0 bg-indigo-600"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{ 
                                    repeat: Infinity, 
                                    duration: 1.5,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>
                        <p className="text-slate-400 font-bold tracking-[0.3em] uppercase text-[9px] sm:text-[10px] text-center">
                            Initializing Enterprise Systems
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Bottom Footer Info */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-10 text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] z-10"
            >
                Premium Intelligence • v2.0.4
            </motion.div>
        </motion.div>
    );
};
