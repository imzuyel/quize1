"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, Volume2, VolumeX, ShieldAlert, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";
import type { LiveChatMessage } from "@/lib/quiz-settings";

interface LiveSessionChatProps {
  pin: string;
  messages: LiveChatMessage[];
  chatEnabled: boolean;
  isHost: boolean;
  currentUserId?: number;
  currentUserName: string;
  currentUserAvatar?: string;
  onSendMessage: (text: string) => Promise<unknown>;
  onToggleChat?: (enabled: boolean) => Promise<unknown>;
  variant?: "lobby-card" | "floating" | "compact";
  className?: string;
}

const STUDENT_QUICK_CHIPS = [
  "👋 আসসালামু আলাইকুম!",
  "🚀 কুইজের জন্য প্রস্তুত!",
  "🔥 আজ সেরা হব ইনশাল্লাহ!",
  "⏱️ একটু সময় বাড়াবেন স্যার?",
  "👍 সব ঠিক আছে!",
  "🎉 সবাইকে শুভকামনা!",
];

const HOST_QUICK_CHIPS = [
  "📢 সবাই দ্রুত যুক্ত হও, এখনই শুরু করছি!",
  "⏱️ আর ৩০ সেকেন্ড পর প্রথম প্রশ্ন আসবে।",
  "🤫 মনোযোগ দিয়ে প্রশ্ন পড়ে উত্তর দাও!",
  "👏 চমৎকার পারফরম্যান্স সবার!",
  "💡 দ্রুত ও নির্ভুল উত্তরে বেশি পয়েন্ট!",
];

/** Play gentle notification pop when a new chat arrives */
function playChatBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

export function LiveSessionChat({
  pin,
  messages,
  chatEnabled,
  isHost,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onSendMessage,
  onToggleChat,
  variant = "lobby-card",
  className = "",
}: LiveSessionChatProps) {
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastMsgCountRef = useRef(messages.length);

  // Auto-scroll to bottom when new messages arrive & chime
  useEffect(() => {
    if (messages.length > lastMsgCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      // Only chime if sent by someone else
      if (lastMsg && lastMsg.senderName !== currentUserName && soundEnabled) {
        playChatBeep();
      }
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    lastMsgCountRef.current = messages.length;
  }, [messages, currentUserName, soundEnabled]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isSending) return;

    if (!isHost && !chatEnabled) {
      setErrorMsg("হোস্ট বর্তমানে চ্যাট বন্ধ রেখেছেন।");
      return;
    }

    if (!isHost && cooldown > 0) {
      setErrorMsg(`অনুগ্রহ করে ${cooldown} সেকেন্ড অপেক্ষা করুন।`);
      return;
    }

    try {
      setIsSending(true);
      setErrorMsg(null);
      await onSendMessage(text.slice(0, 100));
      setInputText("");
      if (!isHost) {
        setCooldown(3); // 3 seconds rate limit for students
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "বার্তা পাঠানো যায়নি";
      setErrorMsg(msg);
    } finally {
      setIsSending(false);
    }
  };

  const chips = isHost ? HOST_QUICK_CHIPS : STUDENT_QUICK_CHIPS;

  // Floating variant toggle trigger
  if (variant === "floating" && isCollapsed) {
    return (
      <button
        type="button"
        id="live-chat-floating-open-btn"
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-indigo-600 px-4 py-2.5 font-bold text-white shadow-xl hover:brightness-110 active:scale-95 transition-all"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="text-sm">লাইভ চ্যাট</span>
        {messages.length > 0 && (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[11px] font-black text-indigo-700">
            {messages.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      id="live-session-chat-container"
      className={`flex flex-col rounded-2xl border border-white/20 bg-slate-900/90 text-white shadow-2xl backdrop-blur-md overflow-hidden ${className} ${
        variant === "floating" ? "fixed bottom-5 right-5 z-40 w-80 sm:w-96 max-h-[500px]" : "w-full"
      }`}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <MessageSquare className="h-4 w-4 text-teal-400" />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ${
                chatEnabled ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
              }`}
            />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black tracking-wide text-white flex items-center gap-1.5">
              <span>লাইভ লবি চ্যাট</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  chatEnabled
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {chatEnabled ? "চালু" : "বন্ধ"}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Host Toggle Switch */}
          {isHost && onToggleChat && (
            <button
              type="button"
              id="host-toggle-chat-btn"
              onClick={() => onToggleChat(!chatEnabled)}
              title={chatEnabled ? "চ্যাট বন্ধ করতে ক্লিক করুন" : "চ্যাট চালু করতে ক্লিক করুন"}
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                chatEnabled
                  ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40"
                  : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40"
              }`}
            >
              <ShieldAlert className="h-3 w-3" />
              <span>{chatEnabled ? "🔇 চ্যাট বন্ধ করুন" : "💬 চ্যাট চালু করুন"}</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
            title={soundEnabled ? "শব্দ বন্ধ" : "শব্দ চালু"}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          {/* Floating Minimize */}
          {variant === "floating" && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Host Notice Banner if chat is disabled */}
      {!chatEnabled && (
        <div className="flex items-center gap-2 bg-rose-950/60 px-3 py-1.5 border-b border-rose-500/20 text-[11px] text-rose-300">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          <span>হোস্ট বর্তমানে শিক্ষার্থীদের জন্য টেক্সট চ্যাট সাময়িকভাবে বন্ধ রেখেছেন।</span>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-60 sm:max-h-72 min-h-[140px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
            <MessageSquare className="h-8 w-8 text-slate-600 mb-1 opacity-50" />
            <p className="text-xs font-semibold">এখনো কোনো বার্তা আসেনি</p>
            <p className="text-[11px] text-slate-500 mt-0.5">লবিতে শিক্ষক বা সহপাঠীদের সাথে কুশল বিনিময় করুন!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderName === currentUserName || (currentUserId && msg.senderId === currentUserId);
            const isMsgHost = msg.senderRole === "host";
            const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400">
                  {isMsgHost ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.2 text-[10px] font-black text-amber-300">
                      👑 হোস্ট
                    </span>
                  ) : (
                    <span className="font-bold text-slate-300">{msg.senderName}</span>
                  )}
                  <span>·</span>
                  <span className="text-[9px]">{timeStr}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-xs font-medium leading-relaxed break-words shadow-sm ${
                    isMsgHost
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold border border-amber-300/40"
                      : isMe
                      ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white border border-teal-400/30"
                      : "bg-slate-800/90 text-slate-200 border border-white/10"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction Chips */}
      {(chatEnabled || isHost) && (
        <div className="border-t border-white/10 bg-slate-950/40 px-2.5 py-2">
          <p className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-amber-400" />
            <span>দ্রুত বার্তা পাঠান:</span>
          </p>
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto no-scrollbar">
            {chips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isSending || (!isHost && !chatEnabled) || (!isHost && cooldown > 0)}
                onClick={() => handleSend(chip)}
                className="rounded-full bg-white/10 hover:bg-teal-500/20 hover:border-teal-400/40 border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-slate-200 hover:text-teal-200 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-white/10 bg-slate-950/80 p-2.5">
        {errorMsg && (
          <p className="text-[11px] text-rose-400 font-semibold mb-1 px-1">{errorMsg}</p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              id="live-chat-input-field"
              disabled={(!isHost && !chatEnabled) || isSending}
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, 100))}
              placeholder={
                !isHost && !chatEnabled
                  ? "চ্যাট সাময়িকভাবে বন্ধ আছে..."
                  : isHost
                  ? "হোস্ট হিসেবে বার্তা লিখুন (সর্বোচ্চ ১০০ অক্ষর)..."
                  : "বার্তা লিখুন (সর্বোচ্চ ১০০ অক্ষর)..."
              }
              className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 pr-12 text-xs text-white placeholder:text-slate-500 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-500">
              {inputText.length}/100
            </span>
          </div>

          <button
            type="submit"
            id="live-chat-send-button"
            disabled={
              !inputText.trim() ||
              isSending ||
              (!isHost && !chatEnabled) ||
              (!isHost && cooldown > 0)
            }
            className="flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 p-2 text-slate-950 hover:brightness-110 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title={cooldown > 0 ? `${cooldown} সেকেন্ড অপেক্ষা করুন` : "পাঠান"}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
