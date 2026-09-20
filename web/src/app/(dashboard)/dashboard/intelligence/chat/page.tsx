"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { 
  Send, Bot, User, RefreshCw, 
  Lightbulb, AlertCircle, CheckCircle2,
  Brain, TrendingUp, Package, Users, DollarSign, BarChart3, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatWithAI, checkOllamaStatus } from "@/lib/actions/ai";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSearchParams } from "next/navigation";
import { EnterpriseBadge } from "@/components/enterprise";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  { icon: TrendingUp, label: "Which products are selling fastest?", desc: "Velocity analysis over the last 30 days" },
  { icon: Package, label: "Which products are low in stock?", desc: "Check stock alerts and critical reorder items" },
  { icon: DollarSign, label: "What is my current profit this month?", desc: "Net profit, gross margins, and expense trends" },
  { icon: Users, label: "Which customers owe me money?", desc: "Outstanding credit balances and overdue days" },
  { icon: RefreshCw, label: "Which products should I reorder now?", desc: "AI stock forecast and replenishment recommendations" },
  { icon: BarChart3, label: "Show me my best-performing products", desc: "Top revenue drivers and margin leaders" },
];

const INSIGHT_CARDS = [
  { label: "Revenue Today", value: "Le 4,820", trend: "+8.2%", up: true },
  { label: "Stock Alerts", value: "14 items", trend: "Critical", up: false },
  { label: "Profit Margin", value: "40.8%", trend: "+2.1%", up: true },
  { label: "Credit Due", value: "Le 8,240", trend: "3 clients", up: false },
];

const AI_CAPABILITIES = [
  { label: "Stock Forecasting", color: "#2563EB" },
  { label: "Sales Analysis", color: "#10B981" },
  { label: "Financial Insights", color: "#8B5CF6" },
  { label: "Customer Intelligence", color: "#F59E0B" },
  { label: "Supplier Optimization", color: "#0EA5E9" },
];

function NeuralChatContent() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "CHECKING" | "ACTIVE" | "OFFLINE">("CHECKING");
  const [version, setVersion] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [initialQuerySent, setInitialQuerySent] = useState(false);

  const handleSendMessage = useCallback(async (textToSend: string) => {
    if (!textToSend.trim()) return;
    if (status === "OFFLINE") {
      toast.error("AI Assistant Offline", {
        description: "Ensure your GEMINI_API_KEY is configured in web/.env or Ollama is running."
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
  }, [status, messages]);

  useEffect(() => {
    setMounted(true);
    checkConnection();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (status === "ACTIVE" && query && !initialQuerySent) {
      const prompt = query === 'generate_report'
        ? "Please generate a full business report detailing revenue, transactions, and performance metrics, and suggest 3 strategic growth recommendations."
        : query;
      handleSendMessage(prompt);
      setInitialQuerySent(true);
    }
  }, [status, query, initialQuerySent, handleSendMessage]);

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

  if (!mounted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/50">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "ME";

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-50/30 dark:bg-slate-950/30 font-sans">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              ProTech AI Assistant
              <EnterpriseBadge 
                variant={status === "ACTIVE" ? "success" : status === "OFFLINE" ? "danger" : "neutral"} 
                size="sm" 
                dot 
                pulse={status === "ACTIVE"}
              >
                {status === "ACTIVE" ? `${version || "Online"}` : status === "OFFLINE" ? "Offline" : "Checking..."}
              </EnterpriseBadge>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                )} />
                {status === "ACTIVE" ? "Powered by ProTech AI Copilot" : "Engine disconnected"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
            Business Intelligence
          </span>
          <span className="hidden sm:inline-flex bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-xs font-semibold px-3 py-1 rounded-full border border-purple-100 dark:border-purple-900/50">
            AI Forecasting
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={checkConnection}
            className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium gap-1.5 hover:border-primary"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-slate-400", status === "CHECKING" && "animate-spin")} />
            <span className="hidden sm:inline">Sync Link</span>
          </Button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left / Center — Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Brain className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    ProTech AI Assistant
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Your intelligent business partner. Ask anything about current stock levels, trade revenue, debtor balances, or growth forecasting.
                  </p>
                </div>

                {/* Quick start suggestion cards */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
                  {SUGGESTIONS.slice(0, 4).map((sug, idx) => {
                    const SugIcon = sug.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug.label)}
                        disabled={status !== "ACTIVE" || isTyping}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-left transition-all group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <SugIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {sug.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
                          {sug.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl mx-auto w-full">
                {messages.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex gap-3 items-start",
                        isUser ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {/* Avatar */}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-sm",
                        isUser
                          ? "bg-gradient-to-br from-[#1B3F6E] to-[#2563EB] text-white"
                          : "bg-gradient-to-br from-purple-600 to-blue-600 text-white"
                      )}>
                        {isUser ? userInitials : <Brain className="h-4 w-4" />}
                      </div>

                      {/* Bubble */}
                      <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
                        <div className={cn(
                          "rounded-2xl p-4 text-xs sm:text-sm leading-relaxed",
                          isUser
                            ? "bg-[#2563EB] text-white rounded-tr-none shadow-sm"
                            : "bg-[#0B1629] text-white dark:bg-slate-900 dark:border dark:border-slate-800 rounded-tl-none shadow-sm"
                        )}>
                          {isUser ? (
                            <p className="whitespace-pre-line font-medium">{msg.content}</p>
                          ) : (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                                h1: ({node, ...props}) => <h1 className="text-base font-bold mt-4 mb-2 text-white border-b border-white/10 pb-1" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-sm font-bold mt-3 mb-1.5 text-white" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-xs font-bold mt-2 mb-1 text-white" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
                                li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                                p: ({node, ...props}) => <p className="mb-2.5 last:mb-0 leading-relaxed" {...props} />,
                                a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline underline-offset-2 font-medium" {...props} />,
                                table: ({node, ...props}) => (
                                  <div className="overflow-x-auto my-3 rounded-lg border border-white/10">
                                    <table className="w-full text-left text-xs border-collapse" {...props} />
                                  </div>
                                ),
                                th: ({node, ...props}) => <th className="bg-white/5 px-3 py-2 text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-white/10" {...props} />,
                                td: ({node, ...props}) => <td className="px-3 py-2 border-b border-white/5 text-slate-200" {...props} />,
                                code: ({node, inline, ...props}: any) => 
                                  inline ? (
                                    <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-purple-300" {...props} />
                                  ) : (
                                    <pre className="bg-black/40 text-slate-200 p-3 rounded-lg overflow-x-auto my-3 text-xs font-mono border border-white/5"><code {...props} /></pre>
                                  ),
                                blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-purple-500/50 pl-3 py-1 my-2 italic text-slate-300" {...props} />
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          )}
                        </div>
                        <div className={cn(
                          "text-[10px] text-slate-400 px-1",
                          isUser ? "text-right" : "text-left"
                        )}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center shrink-0">
                      <Brain className="h-4 w-4 animate-pulse" />
                    </div>
                    <div className="bg-[#0B1629] text-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Quick Suggestions Horizontal Strip */}
          {messages.length > 0 && (
            <div className="px-4 sm:px-6 py-2 border-t border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 overflow-x-auto flex gap-2 shrink-0">
              {SUGGESTIONS.map((sug, idx) => {
                const SugIcon = sug.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sug.label)}
                    disabled={status !== "ACTIVE" || isTyping}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 whitespace-nowrap transition-all"
                  >
                    <SugIcon className="h-3 w-3" />
                    <span>{sug.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-4 sm:p-6 border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
            <div className="max-w-4xl mx-auto flex gap-2">
              <Input
                placeholder="Ask me anything about your business..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputMessage);
                  }
                }}
                disabled={status !== "ACTIVE" || isTyping}
                className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-4 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-blue-500/20"
              />
              <Button
                onClick={() => handleSendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isTyping || status !== "ACTIVE"}
                className={cn(
                  "h-12 px-5 rounded-xl text-white font-semibold text-xs tracking-wide shadow-md transition-all shrink-0 flex items-center gap-2",
                  status === "ACTIVE"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-indigo-500/20"
                    : "bg-slate-300 dark:bg-slate-800 cursor-not-allowed"
                )}
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>
          </div>

        </div>

        {/* Right Sidebar — Live Insights & Capabilities (Figma Make Specification) */}
        <div className="w-80 border-l border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-5 overflow-y-auto hidden lg:flex flex-col gap-6 shrink-0">
          
          {/* Live Insights Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="font-display font-bold text-sm text-slate-900 dark:text-white">
                Live Insights
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {INSIGHT_CARDS.map(card => (
                <div 
                  key={card.label}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 shadow-xs"
                >
                  <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1">
                    {card.label}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                      {card.value}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      card.up
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                    )}>
                      {card.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Capabilities List */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              AI Capabilities
            </div>
            <div className="space-y-1 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {AI_CAPABILITIES.map(cap => (
                <div key={cap.label} className="flex items-center gap-2.5 py-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cap.color }} />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{cap.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Connection Diagnostic */}
          {status === "OFFLINE" ? (
            <div className="mt-auto p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Offline</span>
              </div>
              <p className="text-[11px] text-rose-600/90 dark:text-rose-400 leading-relaxed">
                Cloud AI (Gemini) or local AI (Ollama) is unreachable. Please set <code className="bg-white/50 dark:bg-black/30 px-1 py-0.5 rounded text-[10px]">GEMINI_API_KEY</code> in <code className="bg-white/50 dark:bg-black/30 px-1 py-0.5 rounded text-[10px]">web/.env</code>.
              </p>
            </div>
          ) : (
            <div className="mt-auto p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Neural Link Online</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Real-time database context is automatically injected into every query response.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/50">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <NeuralChatContent />
    </Suspense>
  );
}
