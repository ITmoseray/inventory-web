"use client";

import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Send, Bot, User, Cpu, Sparkles, RefreshCw, 
  Terminal, ArrowLeft, Lightbulb, Zap, HelpCircle, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatWithAI, checkOllamaStatus } from "@/lib/actions/ai";
import { cn, getIndustryColor } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  { label: "Which items are low in stock?", desc: "Check stock alerts and critical inventory" },
  { label: "Give me a quick business audit", desc: "Summarize revenue and transaction velocity" },
  { label: "Suggest 3 growth strategies", desc: "Tactical simulations for the next 7 days" },
  { label: "What is my total revenue today?", desc: "Analyze daily sales performance" }
];

export default function NeuralChatPage() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "CHECKING" | "ACTIVE" | "OFFLINE">("CHECKING");
  const [version, setVersion] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    checkConnection();
  }, []);

  const businessType = session?.user?.businessType || "SHOP";
  const colors = getIndustryColor(businessType);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!mounted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50/30 dark:bg-slate-950/30">
         <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  async function checkConnection() {
    try {
      setStatus("CHECKING");
      const result = await checkOllamaStatus();
      setStatus(result.active ? "ACTIVE" : "OFFLINE");
      setVersion(result.version);
    } catch (e) {
      setStatus("OFFLINE");
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    if (status === "OFFLINE") {
      toast.error("AI Assistant Offline", {
        description: "Ensure your GEMINI_API_KEY is set or Ollama is running."
      });
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Build conversation history format expected by chatWithAI server action
      const history = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const reply = await chatWithAI(history);

      const assistantMessage: Message = {
        role: "assistant",
        content: reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error("Failed to transmit query", {
        description: error.message || "Establishing neural link failed."
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col p-4 md:p-8 bg-slate-50/30 dark:bg-slate-950/30 font-sans selection:bg-indigo-600/10 selection:text-indigo-600 overflow-hidden">
      {/* Decorative Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-emerald-500/5 to-indigo-500/5 blur-[100px] pointer-events-none" />

      {/* Main Chat Hub Container */}
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col space-y-6 relative z-10">
        
        {/* HEADER & CONNECTION STATE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2.5">
                <div className={cn("p-1.5 rounded-lg text-white shadow-lg", colors.primary)}>
                   <MessageSquare className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-450 dark:text-slate-500">
                  African Trade Intelligence
                </span>
             </div>
             <h1 className="text-3xl md:text-4xl font-[1000] text-slate-900 dark:text-white tracking-tight uppercase italic flex items-center gap-2">
               Neural <span className="text-indigo-600 dark:text-indigo-400">Chat Node</span>
             </h1>
          </div>

          <div className="flex items-center gap-3">
             <div className={cn(
               "px-3.5 py-1.5 rounded-full flex items-center gap-2 border text-[10px] font-black uppercase tracking-widest transition-all",
               status === "ACTIVE" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500" :
               status === "OFFLINE" ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-500" : "bg-slate-800 border-slate-700 text-slate-500"
             )}>
                <div className={cn("h-1.5 w-1.5 rounded-full", 
                  status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : 
                  status === "OFFLINE" ? "bg-rose-500" : "bg-slate-650"
                )} />
                <span>
                   {status === "ACTIVE" ? `${version || "Active"}` : status}
                </span>
             </div>
             <Button 
               variant="outline" 
               size="icon" 
               onClick={checkConnection}
               className="h-10 w-10 rounded-xl border-slate-200 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50"
             >
                <RefreshCw className={cn("h-4 w-4 text-slate-450", status === "CHECKING" && "animate-spin")} />
             </Button>
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="flex-1 min-h-[400px] grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* CHAT LOG STREAM */}
          <Card className="lg:col-span-3 border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm flex flex-col overflow-hidden">
             
             {/* CHAT CONTAINER */}
             <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[50vh] md:max-h-[55vh]">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                     <div className="h-16 w-16 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                        <Bot size={32} className="animate-bounce" />
                     </div>
                     <div className="space-y-2 max-w-sm">
                        <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Neural Link Establised</h3>
                        <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed">
                          Welcome, Partner. Ask me anything about your current inventory levels, trade revenue, or low stock warnings.
                        </p>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                     {messages.map((msg, idx) => {
                       const isUser = msg.role === "user";
                       return (
                         <div 
                           key={idx} 
                           className={cn(
                             "flex gap-4 items-start w-fit max-w-[85%] rounded-3xl p-4 transition-all duration-350",
                             isUser 
                               ? "ml-auto bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-500/10" 
                               : "bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                           )}
                         >
                            <div className={cn(
                              "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                              isUser ? "bg-white/20 text-white" : "bg-indigo-500/10 text-indigo-500"
                            )}>
                               {isUser ? <User size={14} /> : <Bot size={14} />}
                            </div>
                             <div className="space-y-2">
                                <div className={cn(
                                  "text-sm leading-relaxed select-text",
                                  isUser ? "font-bold whitespace-pre-line" : "text-slate-700 dark:text-slate-300"
                                )}>
                                  {isUser ? (
                                    <p>{msg.content}</p>
                                  ) : (
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-slate-100" {...props} />,
                                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-4 mb-2 text-slate-900 dark:text-slate-100" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-base font-bold mt-4 mb-2 text-slate-900 dark:text-slate-100" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-3 mb-2 text-slate-900 dark:text-slate-100" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-5 my-3 space-y-1" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-3 space-y-1" {...props} />,
                                        li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                                        p: ({node, ...props}) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
                                        a: ({node, ...props}) => <a className="text-indigo-600 dark:text-indigo-400 font-medium underline underline-offset-2 hover:text-indigo-800 dark:hover:text-indigo-300" {...props} />,
                                        code: ({node, inline, ...props}: any) => 
                                          inline ? (
                                            <code className="bg-slate-200/50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded-md text-xs font-mono text-indigo-600 dark:text-indigo-400" {...props} />
                                          ) : (
                                            <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl overflow-x-auto my-4 text-xs font-mono shadow-sm"><code {...props} /></pre>
                                          ),
                                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500/30 pl-4 py-1 my-3 italic text-slate-600 dark:text-slate-400" {...props} />
                                      }}
                                    >
                                      {msg.content}
                                    </ReactMarkdown>
                                  )}
                                </div>
                                <span className={cn(
                                  "text-[9px] font-black uppercase tracking-widest block text-right mt-1",
                                  isUser ? "text-white/70" : "text-slate-400"
                                )}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                             </div>
                         </div>
                       );
                     })}

                     {isTyping && (
                       <div className="flex gap-4 items-start w-fit bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 rounded-tl-none animate-pulse">
                          <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                             <Bot size={14} className="animate-spin" />
                          </div>
                          <div className="flex items-center gap-1 h-8 px-2">
                             <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                             <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                             <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-300" />
                          </div>
                       </div>
                     )}
                     <div ref={messagesEndRef} />
                  </div>
                )}
             </div>

             {/* CHAT INPUT AREA */}
             <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-3">
                   <Input 
                     placeholder="Ask anything about your business..." 
                     className="flex-1 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-white px-4 text-xs font-bold focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:bg-white dark:focus-visible:bg-slate-900 transition-all"
                     value={inputMessage}
                     onChange={(e) => setInputMessage(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === "Enter") handleSendMessage(inputMessage);
                     }}
                   />
                   <Button 
                     onClick={() => handleSendMessage(inputMessage)}
                     disabled={!inputMessage.trim() || isTyping || status !== "ACTIVE"}
                     className={cn(
                       "h-12 px-6 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2",
                       status === "ACTIVE" ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20" : "bg-slate-350 dark:bg-slate-800 cursor-not-allowed"
                     )}
                   >
                      <Send className="h-3.5 w-3.5" /> Send
                   </Button>
                </div>
             </div>

          </Card>

          {/* SUGGESTIONS & DIAGNOSTICS */}
          <div className="space-y-6 flex flex-col justify-between">
             
             {/* SUGGESTION BOX */}
             <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-450 dark:text-slate-500 flex items-center gap-2 pl-2">
                   <Lightbulb size={12} className="text-amber-500 animate-pulse" /> Suggested Queries
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                   {SUGGESTIONS.map((sug, idx) => (
                     <button
                       key={idx}
                       onClick={() => handleSendMessage(sug.label)}
                       disabled={status !== "ACTIVE" || isTyping}
                       className="w-full text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-650 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all hover:translate-x-1 group"
                     >
                        <p className="font-black text-xs tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{sug.label}</p>
                        <p className="text-[9px] font-medium text-slate-400 dark:text-slate-550 uppercase tracking-tight mt-1 leading-none">{sug.desc}</p>
                     </button>
                   ))}
                </div>
             </div>

             {/* OFFLINE STATUS DETAILS */}
             {status === "OFFLINE" && (
               <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-rose-500">
                     <Zap size={14} className="animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Offline Link</span>
                  </div>
                  <p className="text-[10px] text-rose-550 dark:text-rose-400 font-medium leading-relaxed uppercase">
                     Cloud AI (Gemini) or local AI (Ollama) is currently unreachable.
                  </p>
                  <p className="text-[9px] text-rose-500/70 font-bold uppercase leading-relaxed">
                     Please configure `GEMINI_API_KEY` in `web/.env` to enable instant cloud AI diagnostics.
                  </p>
               </div>
             )}

             {status === "ACTIVE" && (
               <div className="p-5 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-500">
                     <CheckCircle2 size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Neural Sync Online</span>
                  </div>
                  <p className="text-[9px] text-slate-500 dark:text-slate-450 font-bold uppercase leading-relaxed">
                     Live business contexts are automatically injected into each diagnostic query.
                  </p>
               </div>
             )}
             
          </div>

        </div>

      </div>
    </div>
  );
}
