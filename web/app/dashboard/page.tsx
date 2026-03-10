"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Phone, Video, Settings, Moon, Sun,
  Send, Paperclip, MoreVertical, Search, Bell,
  ChevronLeft, Zap, Award,
} from "lucide-react";
import { useTheme } from "next-themes";
import { VoiceRecorder } from "@/components/dashboard/VoiceRecorder";
import { AudioPlayer } from "@/components/dashboard/AudioPlayer";
import { LiveCallInterface } from "@/components/dashboard/LiveCallInterface";
import { RelationshipJourney } from "@/components/dashboard/RelationshipJourney";
import { UserButton, useUser } from "@clerk/nextjs";

/* ─────────────────── Types ─────────────────── */
type Modality = "chat" | "voice" | "video" | "relationship";
type MsgRole = "user" | "ai";
interface Message {
  id: string;
  role: MsgRole;
  content: string;
  timestamp: Date;
  isAction?: boolean;
  actions?: string[];
}

/* ─────────────────── Mock Data ────────────────── */
const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "ai",
    content:
      "Hey there! 💜 I'm Luna, your AI companion. I'm here to listen, support you, and help you take action whenever you're ready. How are you feeling today?",
    timestamp: new Date(Date.now() - 3 * 60000),
  },
  {
    id: "2",
    role: "user",
    content: "I've been feeling really overwhelmed with work lately. There's just so much to do and I don't know where to start.",
    timestamp: new Date(Date.now() - 2 * 60000),
  },
  {
    id: "3",
    role: "ai",
    content:
      "That sounds genuinely exhausting, and I really hear you. Feeling overwhelmed when your plate is overflowing is completely valid — it's not a sign of weakness, it's a sign that you care. 💙\n\nCan I ask — is it more about the sheer volume of tasks, or does it feel like you don't know which one to tackle first?",
    timestamp: new Date(Date.now() - 90000),
  },
  {
    id: "4",
    role: "user",
    content: "Both honestly. I have like 20 things on my list and they all feel equally urgent.",
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: "5",
    role: "ai",
    content:
      "I completely understand. When everything feels urgent, the brain enters a kind of analysis paralysis — it's your mind's way of protecting you from making the 'wrong' choice.\n\nWould it help if we built a simple prioritization framework together? I can help you sort through your tasks so you know exactly where to start.",
    timestamp: new Date(Date.now() - 30000),
    isAction: true,
    actions: [
      "List your top 5 most pressing tasks",
      "Categorize by: Urgent & Important vs. Important but not urgent",
      "Block 2-hour focus sessions for the top 3 tasks",
      "Schedule check-ins every evening to review progress",
    ],
  },
];

const QUICK_PROMPTS = [
  "I need to vent about something",
  "Help me make a plan",
  "I'm feeling anxious",
  "Motivate me",
];

/* ─────────────────── Sidebar Item ─────────────────── */
function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${
        active
          ? "bg-brand-500/20 text-brand-300 shadow-brand-sm"
          : "text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
      }`}
    >
      <Icon size={18} />
      <span className="absolute left-full ml-2 px-2 py-1 bg-[hsl(240,12%,12%)] border border-white/[0.08] rounded-md text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
        {label}
      </span>
    </button>
  );
}

/* ─────────────────── Message Bubble ─────────────────── */
function MessageBubble({ msg }: { msg: Message }) {
  const isAI = msg.role === "ai";
  return (
    <motion.div
      className={`flex gap-3 ${isAI ? "flex-row" : "flex-row-reverse"}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm ${
          isAI
            ? "bg-gradient-to-br from-brand-500/30 to-accent-500/30 border border-brand-500/30"
            : "bg-white/10 border border-white/[0.08]"
        }`}
      >
        {isAI ? "🦋" : "👤"}
      </div>

      <div className={`max-w-[75%] ${isAI ? "" : "items-end"} flex flex-col gap-1`}>
        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isAI
              ? "bg-white/[0.06] border border-white/[0.07] text-white/85 rounded-tl-sm prose-ai"
              : "bg-brand-500/25 border border-brand-500/30 text-white rounded-tr-sm"
          }`}
        >
          <p style={{ whiteSpace: "pre-line" }}>{msg.content}</p>
        </div>

        {/* Action steps */}
        {msg.isAction && msg.actions && (
          <motion.div
            className="w-full mt-2 glass rounded-xl border border-brand-500/20 overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 bg-brand-500/10 border-b border-brand-500/15">
              <Zap size={12} className="text-brand-300" />
              <span className="text-xs font-semibold text-brand-300 uppercase tracking-wide">Action Plan</span>
            </div>
            <div className="p-3 space-y-2">
              {msg.actions.map((action, i) => (
                <label key={i} className="flex items-start gap-2 cursor-pointer group">
                  <input type="checkbox" className="mt-0.5 accent-purple-500" />
                  <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors">
                    {action}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-white/25 px-1">
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
}

/* ─────────────────── Typing Indicator ─────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500/30 to-accent-500/30 border border-brand-500/30 flex items-center justify-center text-sm">
        🦋
      </div>
      <div className="px-4 py-3 glass rounded-2xl rounded-tl-sm border border-white/[0.07] flex items-center gap-1.5">
        <span className="typing-dot w-2 h-2 rounded-full bg-brand-400" />
        <span className="typing-dot w-2 h-2 rounded-full bg-brand-400" />
        <span className="typing-dot w-2 h-2 rounded-full bg-brand-400" />
      </div>
    </div>
  );
}

/* ─────────────────── Main Dashboard ─────────────────── */
export default function DashboardPage() {
  const [modality, setModality] = useState<Modality>("chat");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [latestAiResponse, setLatestAiResponse] = useState<string | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const { user } = useUser();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content) return;
    setInput("");
    setLatestAiResponse(null);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate AI response
    await new Promise((r) => setTimeout(r, 1800 + Math.random() * 800));
    setIsTyping(false);

    const aiMsg: Message = {
      id: crypto.randomUUID(),
      role: "ai",
      content:
        "Thank you for sharing that with me. 💙 It takes real courage to articulate what you're going through. I want you to know that whatever you're feeling is completely valid.\n\nLet's take this one step at a time. What feels like the heaviest thing on your mind right now?",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setLatestAiResponse(aiMsg.content);
  };

  return (
    <div className="flex h-screen bg-[var(--bg-base)] overflow-hidden text-[var(--text-primary)]">
      {/* ── Vertical Icon Sidebar ── */}
      <div className="flex flex-col items-center gap-2 w-16 border-r border-[var(--border)] py-4 flex-shrink-0">
        {/* Logo */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center mb-4 shadow-brand-sm">
          <span className="text-lg">✦</span>
        </div>

        {/* Nav */}
        <NavItem icon={MessageSquare} label="Chat" active={modality === "chat"} onClick={() => setModality("chat")} />
        <NavItem icon={Phone} label="Voice Call" active={modality === "voice"} onClick={() => setModality("voice")} />
        <NavItem icon={Video} label="Video Call" active={modality === "video"} onClick={() => setModality("video")} />
        <NavItem icon={Award} label="Bond" active={modality === "relationship"} onClick={() => setModality("relationship")} />

        <div className="flex-1" />

        {/* Bottom actions */}
        <NavItem
          icon={theme === "dark" ? Sun : Moon}
          label="Toggle Theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
        <NavItem icon={Settings} label="Settings" />
        <div className="mt-2 flex items-center justify-center">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 rounded-xl border border-white/[0.08] shadow-sm hover:border-white/[0.2] transition-colors",
              },
            }}
          />
        </div>
      </div>

      {/* ── Conversation List Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="w-64 border-r border-[var(--border)] flex flex-col flex-shrink-0 bg-[var(--bg-base)]"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="p-4 border-b border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-semibold text-[var(--text-primary)] text-sm">Conversations</h2>
                <button className="text-white/40 hover:text-white/70 transition-colors">
                  <Bell size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 glass rounded-xl border border-white/[0.06]">
                <Search size={12} className="text-white/30" />
                <input
                  className="bg-transparent text-xs text-white placeholder-white/25 focus:outline-none flex-1"
                  placeholder="Search conversations..."
                />
              </div>
            </div>

            {/* Companion card */}
            <div className="p-3">
              <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500/40 to-accent-500/40 border border-brand-500/30 flex items-center justify-center text-lg">
                    🦋
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">Luna</p>
                    <p className="text-xs text-white/40 truncate">Your AI Companion</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
                </div>
                <p className="text-xs text-white/40 line-clamp-2">
                  &ldquo;Thank you for sharing that with me...&rdquo;
                </p>
              </div>
            </div>

            <div className="px-4 py-2">
              <p className="text-[10px] text-white/25 uppercase tracking-widest font-medium">Recent</p>
            </div>

            {/* Past sessions */}
            {[
              { time: "Yesterday", preview: "Talked about work stress and boundaries", emoji: "😤" },
              { time: "Mon", preview: "Planning for the week ahead", emoji: "📋" },
              { time: "Sun", preview: "Processing a difficult conversation", emoji: "💬" },
            ].map((s, i) => (
              <div key={i} className="mx-3 mb-1 p-3 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors border border-transparent hover:border-white/[0.05] group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{s.emoji}</span>
                  <span className="text-xs text-white/35 ml-auto">{s.time}</span>
                </div>
                <p className="text-xs text-white/50 group-hover:text-white/65 transition-colors line-clamp-2">{s.preview}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-base)]">
        {/* Top Bar */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-[var(--border)] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            <ChevronLeft size={16} className={`transition-transform ${sidebarOpen ? "" : "rotate-180"}`} />
          </button>

          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500/40 to-accent-500/40 border border-brand-500/30 flex items-center justify-center">
              🦋
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Luna</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />
                <p className="text-xs text-white/40">Active now · Empathetic AI Companion</p>
              </div>
            </div>
          </div>

          {/* Audio Player Injection */}
          {modality === "chat" && latestAiResponse && (
             <AudioPlayer text={latestAiResponse} />
          )}

          {/* Modality switcher */}
          <div className="flex items-center gap-1 p-1 glass rounded-xl border border-white/[0.06]">
            {(["chat", "voice", "video"] as Modality[]).map((m) => {
              const Icon = m === "chat" ? MessageSquare : m === "voice" ? Phone : Video;
              return (
                <button
                  key={m}
                  onClick={() => setModality(m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 capitalize ${
                    modality === m
                      ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <Icon size={12} />
                  {m}
                </button>
              );
            })}
          </div>

          <button className="text-white/40 hover:text-white/70 transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>

        {/* ── Chat / Voice / Video Area ── */}
        {modality === "chat" && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto chat-scroll p-6 space-y-5">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-6 pb-2 flex gap-2 flex-wrap">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp}
                  onClick={() => sendMessage(qp)}
                  className="px-3 py-1.5 text-xs glass rounded-full border border-brand-500/20 text-brand-300 hover:bg-brand-500/15 transition-colors"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Input bar */}
            <div className="p-4 border-t border-white/[0.05] flex-shrink-0">
              <div className="flex items-end gap-3 glass rounded-2xl border border-white/[0.08] px-4 py-3">
                <button className="text-white/35 hover:text-white/60 transition-colors mb-0.5">
                  <Paperclip size={16} />
                </button>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Talk to Luna... (Shift+Enter for new line)"
                  rows={1}
                  className="flex-1 bg-transparent text-white placeholder-white/25 text-sm focus:outline-none resize-none leading-relaxed"
                  style={{ maxHeight: 120 }}
                />

                <div className="flex items-center gap-2 flex-shrink-0">
                  <VoiceRecorder 
                     onTranscribed={(transcript) => {
                       sendMessage(transcript);
                     }}
                  />
                  <motion.button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isTyping}
                    className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white shadow-brand-sm hover:shadow-brand transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    whileHover={input.trim() ? { scale: 1.1 } : {}}
                    whileTap={input.trim() ? { scale: 0.9 } : {}}
                  >
                    <Send size={13} />
                  </motion.button>
                </div>
              </div>
              <p className="text-center text-[10px] text-white/20 mt-2">
                EmpathAI can make mistakes. It is not a substitute for professional therapy.
              </p>
            </div>
          </>
        )}

        {/* ── Voice Call Modality ── */}
        {modality === "voice" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8 relative">
            {!isCalling ? (
              <>
                <div className="orb orb-brand absolute w-96 h-96 opacity-20 animate-pulse-slow" />
                <motion.div
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-500/30 to-accent-500/30 border-2 border-brand-500/40 flex items-center justify-center text-5xl shadow-brand relative"
                  animate={{ scale: [1, 1.04, 1], boxShadow: ["0 0 30px hsla(261,75%,55%,0.4)", "0 0 60px hsla(261,75%,55%,0.6)", "0 0 30px hsla(261,75%,55%,0.4)"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  🦋
                </motion.div>
                <div className="text-center">
                  <h3 className="font-display text-2xl font-bold text-white mb-1">Luna</h3>
                  <p className="text-white/40 text-sm">Real-time voice listening</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsCalling(true)}
                    className="px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 text-white font-bold shadow-glow hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Phone className="w-5 h-5 fill-current" />
                    Start Session
                  </button>
                </div>
              </>
            ) : (
                <LiveCallInterface 
                  roomName={`room-${user?.id || 'demo'}`}
                  identity={user?.firstName || 'User'}
                  type="voice"
                  onDisconnect={() => setIsCalling(false)}
                />
            )}
          </div>
        )}

        {/* ── Video Call Modality ── */}
        {modality === "video" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 relative">
            {!isCalling ? (
                <div className="w-full max-w-2xl aspect-video glass-card border border-brand-500/20 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                    <div className="orb orb-brand absolute w-80 h-80 opacity-30 animate-pulse-slow" />
                    <motion.div
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500/40 to-accent-500/40 border-2 border-brand-500/50 flex items-center justify-center text-4xl z-10"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        🦋
                    </motion.div>
                    <div className="z-10 text-center">
                        <p className="text-white font-display font-semibold text-xl mb-4">Luna Live Video</p>
                        <button
                            onClick={() => setIsCalling(true)}
                            className="btn-primary px-8 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white font-bold shadow-glow hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <Video className="w-5 h-5 fill-current" />
                            Launch Video Link
                        </button>
                    </div>
                </div>
            ) : (
                <LiveCallInterface 
                  roomName={`room-${user?.id || 'demo'}`}
                  identity={user?.firstName || 'User'}
                  type="video"
                  onDisconnect={() => setIsCalling(false)}
                />
            )}
          </div>
        )}

        {/* ── Relationship Journey Modality ── */}
        {modality === "relationship" && user && (
          <RelationshipJourney userId={user.id} />
        )}
      </div>
    </div>
  );
}
