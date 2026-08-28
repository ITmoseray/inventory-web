"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { 
  MessageSquare, X, Send, Hash, User, RefreshCw, 
  CheckCheck, Maximize2, ChevronDown, Plus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  getConversations, 
  getConversationMessages, 
  sendChatMessage, 
  getUnreadChatCount 
} from "@/lib/actions/team-chat";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/store/use-chat-store";

export function TeamChatWidget() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const currentUserId = session?.user?.id;
  const { isChatOpen, setChatOpen, toggleChat } = useChatStore();

  // Do not render on super-admin or public auth pages
  const isSuperAdmin = pathname?.startsWith("/super-admin");
  const isPublic = pathname === "/login" || pathname === "/register" || pathname === "/" || pathname?.startsWith("/receipt/");
  const isChatPage = pathname === "/dashboard/chat";

  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll unread count
  const checkUnreads = async () => {
    try {
      const res = await getUnreadChatCount();
      setUnreadCount(res.count || 0);
    } catch (e) {}
  };

  const loadConvList = async () => {
    try {
      const res = await getConversations();
      if (res.conversations) {
        setConversations(res.conversations);
        if (!activeConvId && res.conversations.length > 0) {
          setActiveConvId(res.conversations[0].id);
        }
      }
    } catch (e) {}
  };

  const loadMsgList = async (convId: string, silent = false) => {
    try {
      if (!silent) setLoadingMessages(true);
      const res = await getConversationMessages(convId);
      if (res.messages) {
        setMessages(res.messages);
      }
    } catch (e) {} finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id && !isSuperAdmin && !isPublic) {
      checkUnreads();
      const interval = setInterval(() => {
        checkUnreads();
        if (isChatOpen) {
          loadConvList();
          if (activeConvId) loadMsgList(activeConvId, true);
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [session, isChatOpen, activeConvId, isSuperAdmin, isPublic]);

  useEffect(() => {
    if (isChatOpen) {
      loadConvList();
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (isChatOpen && activeConvId) {
      loadMsgList(activeConvId);
    }
  }, [isChatOpen, activeConvId]);

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConvId || sending) return;

    const content = inputText.trim();
    setInputText("");
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      conversationId: activeConvId,
      content,
      createdAt: new Date().toISOString(),
      isMine: true,
      sender: {
        id: currentUserId || "me",
        name: session?.user?.name || "You",
        email: session?.user?.email,
        role: (session?.user as any)?.role?.name || session?.user?.role || "Staff",
        imageUrl: session?.user?.image
      }
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await sendChatMessage({
        conversationId: activeConvId,
        content
      });

      if (res.success && res.message) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? res.message : m)));
        checkUnreads();
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  if (!session?.user?.id || isSuperAdmin || isPublic || isChatPage) {
    return null;
  }

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <>
      {/* Floating Trigger Button on Bottom-Right */}
      <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 print:hidden">
        <Button
          onClick={toggleChat}
          className={cn(
            "h-12 px-4 sm:h-13 sm:px-5 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2.5 font-black uppercase text-xs tracking-wider",
            isChatOpen
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-indigo-600/30 hover:scale-105"
          )}
        >
          {isChatOpen ? (
            <>
              <X className="h-4 w-4 sm:h-5 sm:w-5" /> Close
            </>
          ) : (
            <>
              <div className="relative">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden xs:inline sm:inline">Staff Chat</span>
            </>
          )}
        </Button>
      </div>

      {/* Slide-over Mini Chat Drawer */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-18 sm:bottom-20 right-3 sm:right-5 z-50 w-[calc(100vw-1.5rem)] sm:w-[400px] h-[520px] max-h-[calc(100vh-6rem)] rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden print:hidden"
          >
            {/* Drawer Header */}
            <div className="p-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-black text-xs uppercase tracking-wider truncate">
                    {activeConv?.title || "Team Messenger"}
                  </div>
                  <div className="text-[10px] text-indigo-200 truncate">
                    Protech Assist Live Chat
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Link href="/dashboard/chat">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-xl hover:bg-white/20 text-white"
                    title="Open Full Messenger"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </Link>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setChatOpen(false)}
                  className="h-8 w-8 p-0 rounded-xl hover:bg-white/20 text-white"
                  title="Close Chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Conversation Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar shrink-0">
              {conversations.slice(0, 5).map((c) => {
                const isActive = c.id === activeConvId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all",
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    )}
                  >
                    {c.type === "CHANNEL" ? <Hash className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    <span className="truncate max-w-[90px]">{c.title}</span>
                    {c.unreadCount > 0 && (
                      <span className="h-3.5 min-w-[14px] px-0.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
              <Link href="/dashboard/chat">
                <button className="px-2 py-1 rounded-xl text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 shrink-0">
                  + All
                </button>
              </Link>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/40 dark:bg-slate-900/10 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-1 py-8">
                  <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                  <p className="text-[11px] font-bold uppercase">No messages yet</p>
                  <p className="text-[10px]">Type below to start chatting!</p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMe = m.isMine;
                  return (
                    <div
                      key={m.id || idx}
                      className={cn(
                        "flex flex-col max-w-[85%]",
                        isMe ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      {!isMe && (
                        <div className="text-[9px] font-bold text-slate-500 px-1 mb-0.5">
                          {m.sender?.name} • <span className="uppercase">{m.sender?.role}</span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "p-2.5 rounded-2xl text-xs font-medium leading-relaxed break-words shadow-sm",
                          isMe
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <div
                          className={cn(
                            "flex items-center justify-end gap-1 mt-0.5 text-[8px]",
                            isMe ? "text-indigo-200" : "text-slate-400"
                          )}
                        >
                          <span>{format(new Date(m.createdAt), "h:mm a")}</span>
                          {isMe && <CheckCheck className="h-2.5 w-2.5 inline" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <form onSubmit={handleSend} className="flex items-center gap-1.5">
                <Input
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="h-9 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs"
                />
                <Button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  size="sm"
                  className="h-9 w-9 p-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-md"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
