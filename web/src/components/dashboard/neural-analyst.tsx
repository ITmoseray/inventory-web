"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShieldAlert, Cpu, Activity, Sparkles, Terminal, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { checkOllamaStatus, getNeuralAnalysis } from "@/lib/actions/ai";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function NeuralAnalyst() {
  const [status, setStatus] = useState<"IDLE" | "CHECKING" | "ACTIVE" | "OFFLINE">("CHECKING");
  const [version, setVersion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (analysis && displayedText.length < analysis.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(analysis.substring(0, displayedText.length + 3));
      }, 5);
      return () => clearTimeout(timeout);
    }
  }, [analysis, displayedText]);

  async function checkConnection() {
    setStatus("CHECKING");
    const result = await checkOllamaStatus();
    setStatus(result.active ? "ACTIVE" : "OFFLINE");
    setVersion(result.version);
  }

  async function startAnalysis() {
    if (status !== "ACTIVE") {
      toast.error("Neural Node Offline", {
        description: "Ensure Ollama is running locally with 'llama3' pulled."
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysis(null);
      setDisplayedText("");
      const result = await getNeuralAnalysis();
      setAnalysis(result);
    } catch (error: any) {
      toast.error("Neural Link Fractured", {
        description: error.message
      });
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <Card className="border-none bg-slate-900 text-white rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
      {/* Cybernetic Grid Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <CardHeader className="p-8 pb-4 relative z-10">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-xl transition-all duration-500",
                status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" : 
                status === "OFFLINE" ? "bg-rose-500/20 text-rose-400" : "bg-slate-800 text-slate-400"
              )}>
                 <Cpu className={cn("h-5 w-5", status === "ACTIVE" && "animate-pulse")} />
              </div>
              <div>
                 <CardTitle className="text-xl font-[1000] tracking-tight uppercase italic flex items-center gap-2">
                    Neural <span className="text-indigo-400">Analyst</span>
                    {status === "ACTIVE" && <Sparkles className="h-4 w-4 text-amber-400 animate-bounce" />}
                 </CardTitle>
                 <CardDescription className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                    Local Intelligence Node {version ? `v${version}` : "v1.0"}
                 </CardDescription>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <div className={cn(
                "px-3 py-1 rounded-full flex items-center gap-2 border transition-all",
                status === "ACTIVE" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                status === "OFFLINE" ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-slate-800 border-slate-700 text-slate-500"
              )}>
                 <div className={cn("h-1.5 w-1.5 rounded-full", 
                   status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : 
                   status === "OFFLINE" ? "bg-rose-500" : "bg-slate-600"
                 )} />
                 <span className="text-[9px] font-black uppercase tracking-widest">
                    {status} {version && `(${version})`}
                 </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={checkConnection}
                className="h-8 w-8 rounded-lg hover:bg-slate-800 text-slate-500"
              >
                 <RefreshCw className={cn("h-4 w-4", status === "CHECKING" && "animate-spin")} />
              </Button>
           </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-4 space-y-6 relative z-10">
        {!analysis && !isAnalyzing ? (
          <div className="h-48 rounded-3xl bg-slate-950/50 border border-slate-800 flex flex-col items-center justify-center text-center p-6 space-y-4">
             <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-indigo-400" />
             </div>
             <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-slate-300">Awaiting Deployment</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase max-w-[200px]">Synchronize local trade nodes for neural diagnostic output.</p>
             </div>
             <Button 
               onClick={startAnalysis}
               disabled={status !== "ACTIVE"}
               className="h-10 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
             >
                Initialize Diagnostics
             </Button>
          </div>
        ) : isAnalyzing ? (
          <div className="h-48 rounded-3xl bg-slate-950/50 border border-slate-800 flex flex-col items-center justify-center space-y-4">
             <div className="relative">
                <div className="h-16 w-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Zap className="h-6 w-6 text-indigo-400 animate-pulse" />
                </div>
             </div>
             <div className="space-y-1 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 animate-pulse">Establishing Neural Link...</p>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Accessing Local Trade Vault</p>
             </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 min-h-[200px] font-mono text-xs relative overflow-hidden group"
          >
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500 opacity-50" />
             
             <div className="flex items-center gap-2 mb-4 text-emerald-400/60">
                <Terminal className="h-3 w-3" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em]">Diagnostic Stream Output</span>
             </div>

             <div className="whitespace-pre-wrap leading-relaxed text-slate-300">
                {displayedText}
                {displayedText.length < (analysis?.length || 0) && (
                  <span className="inline-block w-1.5 h-4 bg-emerald-500 ml-1 animate-pulse align-middle" />
                )}
             </div>

             <div className="mt-6 flex justify-end">
                <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={startAnalysis}
                   className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-800 hover:text-indigo-400"
                >
                   Re-Run Diagnostics
                </Button>
             </div>
          </motion.div>
        )}

        {status === "OFFLINE" && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
             <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
             <div className="space-y-1">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Neural Sync Failed</p>
                <p className="text-[9px] text-rose-500/70 font-bold uppercase leading-relaxed">
                   Local AI engine (Ollama) not detected. Ensure service is active and 'llama3' is pulled.
                </p>
             </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
