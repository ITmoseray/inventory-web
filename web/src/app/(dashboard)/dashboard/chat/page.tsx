"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { 
  MessageSquare, Send, Hash, User, Users, Plus, Search, 
  Circle, CheckCheck, Paperclip, Smile, MoreVertical, 
  Sparkles, RefreshCw, Shield, Bell, Phone, Mail, ChevronRight,
  Info, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { 
  getConversations, 
  getConversationMessages, 
  sendChatMessage, 
  getOrCreateDirectConversation, 
  getTeamDirectory, 
  createTeamChannel 
} from "@/lib/actions/team-chat";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function TeamChatPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // Conversations & Messages State
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [directory, setDirectory] = useState<any[]>([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  // Modals
  const [isNewDMOpen, setIsNewDMOpen] = useState(false);
  const [isNewChannelOpen, setIsNewChannelOpen] = useState(false);
  const [newChannelTitle, setNewChannelTitle] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [creatingChannel, setCreatingChannel] = useState(false);

  // Mobile View
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Load Conversations List
  const loadConversations = async (silent = false) => {
    try {
      if (!silent) setLoadingConversations(true);
      const res = await getConversations();
      if (res.conversations) {
        setConversations(res.conversations);
        // Default select the first channel if none selected
        if (!activeConversationId && res.conversations.length > 0) {
          setActiveConversationId(res.conversations[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  };

  // 2. Load Messages for Active Conversation
  const loadMessages = async (conversationId: string, silent = false) => {
    try {
      if (!silent) setLoadingMessages(true);
      const res = await getConversationMessages(conversationId);
      if (res.messages) {
        setMessages(res.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // 3. Load Staff Directory for New DM Modal
  const loadDirectory = async () => {
    try {
      setLoadingDirectory(true);
      const res = await getTeamDirectory();
      if (res.members) {
        setDirectory(res.members);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDirectory(false);
    }
  };

  useEffect(() => {
    loadConversations();
    loadDirectory();
  }, []);

  // When active conversation changes, fetch its messages
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time polling every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations(true);
      if (activeConversationId) {
        loadMessages(activeConversationId, true);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeConversationId]);

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversationId || sending) return;

    const content = inputText.trim();
    setInputText("");
    setSending(true);

    // Optimistic message append
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      conversationId: activeConversationId,
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
        conversationId: activeConversationId,
        content
      });

      if (res.success && res.message) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? res.message : m)));
        loadConversations(true);
      } else {
        toast.error(res.error || "Failed to deliver message");
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  // Start Direct Message with Staff
  const handleStartDM = async (targetUserId: string) => {
    try {
      const res = await getOrCreateDirectConversation(targetUserId);
      if (res.conversationId) {
        setActiveConversationId(res.conversationId);
        setIsNewDMOpen(false);
        setMobileShowChat(true);
        loadConversations();
      } else {
        toast.error(res.error || "Could not open direct chat.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to open conversation.");
    }
  };

  // Create Channel
  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelTitle.trim()) {
      toast.error("Please enter a channel name.");
      return;
    }

    try {
      setCreatingChannel(true);
      const res = await createTeamChannel({
        title: newChannelTitle,
        description: newChannelDesc
      });

      if (res.success && res.channelId) {
        toast.success("Channel created successfully!");
        setNewChannelTitle("");
        setNewChannelDesc("");
        setIsNewChannelOpen(false);
        setActiveConversationId(res.channelId);
        setMobileShowChat(true);
        loadConversations();
      } else {
        toast.error(res.error || "Failed to create channel.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create channel.");
    } finally {
      setCreatingChannel(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const channels = conversations.filter((c) => c.type === "CHANNEL");
  const directMessages = conversations.filter((c) => c.type === "DIRECT");

  const filteredChannels = channels.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDMs = directMessages.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col p-2 sm:p-4 md:p-6 max-w-[1600px] mx-auto w-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                Team &amp; Staff Messenger
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  LIVE REAL-TIME
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct communication, shift coordination, and business announcements
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNewChannelOpen(true)}
            className="rounded-xl font-bold text-xs border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> New Channel
          </Button>

          <Button
            size="sm"
            onClick={() => setIsNewDMOpen(true)}
            className="rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
          >
            <User className="h-3.5 w-3.5 mr-1" /> Message Staff
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden mt-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl">
        
        {/* Left Conversations Sidebar */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 shrink-0",
            mobileShowChat ? "hidden md:flex" : "flex"
          )}
        >
          {/* Search Box */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search channels or staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs font-medium"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
            {/* Channels Group */}
            <div>
              <div className="flex items-center justify-between px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <span>Channels</span>
                <span className="text-[9px] text-slate-400">({channels.length})</span>
              </div>
              <div className="space-y-1">
                {filteredChannels.map((c) => {
                  const isActive = c.id === activeConversationId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveConversationId(c.id);
                        setMobileShowChat(true);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all",
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "hover:bg-slate-200/60 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 font-bold",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                          )}
                        >
                          <Hash className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs truncate">{c.title}</span>
                            <span
                              className={cn(
                                "text-[9px]",
                                isActive ? "text-indigo-200" : "text-slate-400"
                              )}
                            >
                              {format(new Date(c.lastMessageAt), "h:mm a")}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "text-[11px] truncate mt-0.5",
                              isActive ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"
                            )}
                          >
                            {c.lastMessagePreview || "No messages yet"}
                          </p>
                        </div>
                      </div>
                      {c.unreadCount > 0 && !isActive && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black shrink-0">
                          {c.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct Messages Group */}
            <div>
              <div className="flex items-center justify-between px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <span>Direct Messages</span>
                <span className="text-[9px] text-slate-400">({directMessages.length})</span>
              </div>
              <div className="space-y-1">
                {filteredDMs.map((c) => {
                  const isActive = c.id === activeConversationId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveConversationId(c.id);
                        setMobileShowChat(true);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all",
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          : "hover:bg-slate-200/60 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="relative shrink-0">
                          <div
                            className={cn(
                              "h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs uppercase overflow-hidden",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            )}
                          >
                            {c.displayAvatar ? (
                              <img
                                src={c.displayAvatar}
                                alt="avatar"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              c.title.charAt(0)
                            )}
                          </div>
                          <span
                            className={cn(
                              "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-950",
                              c.isPartnerOnline ? "bg-emerald-500" : "bg-slate-400"
                            )}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs truncate">{c.title}</span>
                            <span
                              className={cn(
                                "text-[9px]",
                                isActive ? "text-indigo-200" : "text-slate-400"
                              )}
                            >
                              {format(new Date(c.lastMessageAt), "h:mm a")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={cn(
                                "text-[8px] font-black uppercase px-1 rounded",
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                              )}
                            >
                              {c.partnerRole}
                            </span>
                            <p
                              className={cn(
                                "text-[11px] truncate flex-1",
                                isActive ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"
                              )}
                            >
                              {c.lastMessagePreview || "Start chatting..."}
                            </p>
                          </div>
                        </div>
                      </div>
                      {c.unreadCount > 0 && !isActive && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black shrink-0">
                          {c.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Chat Message Area */}
        <div
          className={cn(
            "flex-1 flex flex-col bg-white dark:bg-slate-950 min-w-0",
            !mobileShowChat ? "hidden md:flex" : "flex"
          )}
        >
          {activeConv ? (
            <>
              {/* Conversation Top Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden h-8 w-8 p-0 rounded-xl"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>

                  <div className="relative">
                    <div className="h-9 w-9 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold overflow-hidden">
                      {activeConv.type === "CHANNEL" ? (
                        <Hash className="h-5 w-5" />
                      ) : activeConv.displayAvatar ? (
                        <img
                          src={activeConv.displayAvatar}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        activeConv.title.charAt(0)
                      )}
                    </div>
                    {activeConv.type === "DIRECT" && (
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-950",
                          activeConv.isPartnerOnline ? "bg-emerald-500" : "bg-slate-400"
                        )}
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-black text-sm text-slate-900 dark:text-white truncate">
                        {activeConv.title}
                      </h2>
                      {activeConv.type === "DIRECT" && (
                        <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold uppercase">
                          {activeConv.partnerRole}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {activeConv.type === "CHANNEL"
                        ? `${activeConv.membersCount} members ${
                            activeConv.description ? "• " + activeConv.description : ""
                          }`
                        : activeConv.isPartnerOnline
                        ? "Active now on Protech Enterprise"
                        : "Offline"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadMessages(activeConv.id)}
                    className="h-8 w-8 p-0 rounded-xl border-slate-200 dark:border-slate-800"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", loadingMessages && "animate-spin")} />
                  </Button>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/10">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                    <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                    <p className="font-bold text-xs uppercase tracking-wider">No messages yet</p>
                    <p className="text-xs text-slate-400">Send the first message to start the conversation!</p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isMe = m.isMine;
                    return (
                      <div
                        key={m.id || idx}
                        className={cn(
                          "flex gap-2.5 max-w-[85%] sm:max-w-[75%]",
                          isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                      >
                        {/* Avatar */}
                        {!isMe && (
                          <div className="h-7 w-7 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-black shrink-0 overflow-hidden mt-1">
                            {m.sender?.imageUrl ? (
                              <img
                                src={m.sender.imageUrl}
                                alt="avatar"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              m.sender?.name?.charAt(0) || "U"
                            )}
                          </div>
                        )}

                        {/* Bubble */}
                        <div className="space-y-1">
                          {!isMe && (
                            <div className="flex items-center gap-1.5 px-1">
                              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                {m.sender?.name}
                              </span>
                              <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                                {m.sender?.role}
                              </span>
                            </div>
                          )}

                          <div
                            className={cn(
                              "p-3 rounded-2xl text-xs font-medium leading-relaxed break-words shadow-sm",
                              isMe
                                ? "bg-indigo-600 text-white rounded-br-none"
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none"
                            )}
                          >
                            <p className="whitespace-pre-wrap">{m.content}</p>
                            <div
                              className={cn(
                                "flex items-center justify-end gap-1 mt-1 text-[9px]",
                                isMe ? "text-indigo-200" : "text-slate-400"
                              )}
                            >
                              <span>{format(new Date(m.createdAt), "h:mm a")}</span>
                              {isMe && <CheckCheck className="h-3 w-3 inline" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Input
                    placeholder={`Message ${activeConv.title}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="h-11 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-medium focus-visible:ring-indigo-500"
                  />

                  <Button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="h-11 w-11 p-0 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-md shadow-indigo-600/20"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <div className="h-16 w-16 rounded-3xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Select a Conversation
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Choose a channel from the left or message a staff member to start communicating.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Direct Message Staff Selector Modal */}
      <Dialog open={isNewDMOpen} onOpenChange={setIsNewDMOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Message Team Member
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Select an Admin or Staff member to start a 1-on-1 direct conversation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar my-4">
            {directory.filter((m) => !m.isMe).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No other staff members found.</p>
            ) : (
              directory
                .filter((m) => !m.isMe)
                .map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => handleStartDM(staff.id)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                          {staff.imageUrl ? (
                            <img
                              src={staff.imageUrl}
                              alt="avatar"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            staff.name.charAt(0)
                          )}
                        </div>
                        <span
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-950",
                            staff.isOnline ? "bg-emerald-500" : "bg-slate-400"
                          )}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {staff.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span className="font-black uppercase px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {staff.role}
                          </span>
                          <span>{staff.email}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Channel Modal */}
      <Dialog open={isNewChannelOpen} onOpenChange={setIsNewChannelOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <Hash className="h-5 w-5 text-indigo-600" />
              Create Team Channel
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create a group channel for specific teams or store roles (e.g. #cashiers, #kitchen, #management).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateChannel} className="space-y-4 my-2">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Channel Name
              </label>
              <Input
                placeholder="e.g. cashiers, morning-shift, kitchen"
                value={newChannelTitle}
                onChange={(e) => setNewChannelTitle(e.target.value)}
                className="h-11 rounded-xl"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Description (Optional)
              </label>
              <Input
                placeholder="What is this channel for?"
                value={newChannelDesc}
                onChange={(e) => setNewChannelDesc(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={creatingChannel || !newChannelTitle.trim()}
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider"
              >
                {creatingChannel ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Create Channel"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
