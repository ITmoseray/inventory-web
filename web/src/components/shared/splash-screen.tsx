"use client";
import Image from "next/image";

export const SplashScreen = () => {
    return (
        <div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
        >
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div 
                className="relative z-10 flex flex-col items-center"
            >
                <div className="relative w-32 h-32 sm:w-48 sm:h-48 mb-8 group bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl p-2">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <Image 
                        src="/images/logo2.jpeg" 
                        alt="Logo" 
                        fill 
                        priority
                        sizes="(max-width: 640px) 128px, 192px"
                        className="object-contain relative z-10 drop-shadow-[0_0_15px_rgba(79,70,229,0.3)]" 
                    />
                </div>
                
                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center">
                        <h1 
                            className="text-white text-xl sm:text-2xl font-black tracking-tighter uppercase text-center"
                        >
                            Protech <span className="text-indigo-500">Super Control</span>
                        </h1>
                        <div 
                            className="h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mt-2 w-48"
                        />
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="relative h-1 w-48 sm:w-64 bg-slate-900 rounded-full overflow-hidden">
                            <div 
                                className="absolute inset-0 bg-indigo-600 animate-[shimmer_1.5s_infinite_linear]"
                                style={{
                                    backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                                    backgroundSize: "200% 100%"
                                }}
                            />
                        </div>
                        <p className="text-slate-400 font-bold tracking-[0.3em] uppercase text-[9px] sm:text-[10px] text-center">
                            Initializing Enterprise Systems
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Footer Info */}
            <div 
                className="absolute bottom-10 text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] z-10"
            >
                Premium Intelligence • v2.0.4
            </div>
        </div>
    );
};
