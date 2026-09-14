"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { parsePlayerAvatar } from "@/lib/avatar";
import { Button, Card } from "@/components/ui";
import { LiveSessionChat } from "@/components/live-session-chat";
import type { LiveChatMessage } from "@/lib/quiz-settings";

interface LiveKahootLobbyProps {
  pin: string;
  joinKeyword?: string | null;
  quizTitle: string;
  totalQuestions: number;
  players: Array<{
    id: number;
    nickname: string;
    score: number;
    connected: boolean;
  }>;
  lobbyLocked: boolean;
  onStart: () => void;
  onKick: (playerId: number) => void;
  onToggleLock: () => void;
  onShowQr: () => void;
  isStarting?: boolean;
  chatMessages?: LiveChatMessage[];
  chatEnabled?: boolean;
  onSendMessage?: (text: string) => Promise<unknown>;
  onToggleChat?: (enabled: boolean) => Promise<unknown>;
}

export function LiveKahootLobby({
  pin,
  joinKeyword,
  quizTitle,
  totalQuestions,
  players,
  lobbyLocked,
  onStart,
  onKick,
  onToggleLock,
  onShowQr,
  isStarting = false,
  chatMessages = [],
  chatEnabled = true,
  onSendMessage,
  onToggleChat,
}: LiveKahootLobbyProps) {
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const prevCountRef = useRef(players.length);

  // Sound chime when a new player joins
  useEffect(() => {
    if (players.length > prevCountRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }
      } catch {}
    }
    prevCountRef.current = players.length;
  }, [players.length]);

  const copyPin = () => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const copyLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${origin}/join?pin=${pin}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const joinUrl = typeof window !== "undefined" ? `${window.location.host}/join` : "join";

  return (
    <div className="relative min-h-[85vh] flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-white select-none">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* TOP BAR: Join Info, Game PIN, and Controls */}
      <header className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl p-4 sm:p-6 shadow-2xl">
          {/* Join Instructions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <button
              onClick={onShowQr}
              className="group relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-2 text-slate-900 shadow-xl transition-all hover:scale-105 active:scale-95"
              title="QR কোড বড় করে দেখান"
            >
              <span className="text-3xl">📱</span>
              <span className="absolute -bottom-2 rounded-md bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                QR স্ক্যান
              </span>
            </button>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                যোগদানের নির্দেশিকা
              </p>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                ব্রাউজারে যান:{" "}
                <span className="text-amber-300 underline decoration-amber-300/50 underline-offset-4 font-mono">
                  {joinUrl}
                </span>
              </h2>
              <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  onClick={copyLink}
                  className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold text-white/80 hover:bg-white/20 transition"
                >
                  {copiedLink ? "✓ লিংক কপি হয়েছে!" : "🔗 লিংক কপি করুন"}
                </button>
                {joinKeyword ? (
                  <span className="rounded-lg bg-indigo-500/30 border border-indigo-400/40 px-2.5 py-1 text-xs font-bold text-indigo-200">
                    কিওয়ার্ড: <span className="font-mono text-white">{joinKeyword}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* GAME PIN CARD */}
          <div className="flex flex-col items-center">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">
              GAME PIN
            </p>
            <button
              onClick={copyPin}
              className="group relative mt-1 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2.5 text-slate-950 shadow-2xl transition-all hover:scale-105 active:scale-95"
              title="পিন কপি করতে ক্লিক করুন"
            >
              <span className="font-mono text-3xl sm:text-4xl font-black tracking-[0.16em]">
                {pin.slice(0, 3)} {pin.slice(3)}
              </span>
              <span className="text-sm font-black opacity-70 group-hover:opacity-100">
                {copiedPin ? "✓" : "📋"}
              </span>
              {copiedPin ? (
                <span className="absolute -top-7 rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white shadow-lg anim-pop">
                  কপি করা হয়েছে!
                </span>
              ) : null}
            </button>
          </div>

          {/* TOP CONTROLS */}
          <div className="flex items-center gap-2">
            {onSendMessage ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat((v) => !v)}
                className={`border-white/20 text-white font-bold backdrop-blur flex items-center gap-1.5 ${
                  showChat ? "bg-teal-500/30 border-teal-400/50" : "bg-white/10"
                }`}
              >
                <span>💬 চ্যাট ({chatMessages.length})</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    chatEnabled ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                  }`}
                />
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleLock}
              className={`border-white/20 text-white font-bold backdrop-blur ${lobbyLocked ? "bg-rose-500/40" : "bg-white/10"}`}
            >
              {lobbyLocked ? "🔒 লবি লকড" : "🔓 উন্মুক্ত"}
            </Button>
            <Button
              size="lg"
              onClick={onStart}
              loading={isStarting}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-lg px-6 py-3 rounded-2xl shadow-xl shadow-emerald-950/40 transition-transform active:scale-95"
            >
              🚀 কুইজ শুরু করুন
            </Button>
          </div>
        </div>
      </header>

      {/* MIDDLE: AVATAR ARENA & LIVE LOBBY CHAT */}
      <main className="relative z-10 my-auto py-6 w-full max-w-6xl mx-auto">
        <div className={`w-full grid grid-cols-1 gap-6 items-start ${showChat && onSendMessage ? "lg:grid-cols-12" : "grid-cols-1"}`}>
          {/* Avatar Arena */}
          <div className={`flex flex-col items-center ${showChat && onSendMessage ? "lg:col-span-8" : "w-full"}`}>
            {/* PLAYER COUNT BANNER */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-5 py-2 text-white shadow-lg">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
                </span>
                <span className="text-base font-black tracking-wide">
                  {players.length} জন খেলোয়াড় প্রস্তুত
                </span>
              </div>
            </div>

            {/* AVATAR GRID WITH MOTION POP-IN & FLOATING ANIMATIONS */}
            {players.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="relative">
                  <div className="grid h-24 w-24 place-items-center rounded-3xl bg-white/10 border border-white/20 text-5xl backdrop-blur-xl shadow-2xl animate-bounce">
                    ⏳
                  </div>
                </div>
                <h3 className="mt-4 text-xl sm:text-2xl font-black text-white">
                  খেলোয়াড়দের জন্য অপেক্ষা করা হচ্ছে…
                </h3>
                <p className="mt-2 max-w-md text-xs sm:text-sm text-white/70">
                  শিক্ষার্থীরা <span className="font-mono text-amber-300 font-bold">{joinUrl}</span> এ গিয়ে কোড{" "}
                  <span className="font-mono text-amber-300 font-bold">{pin}</span> লিখলে তাদের নাম ও অ্যানিমেটেড অবতার এখানে আসবে।
                </p>
              </motion.div>
            ) : (
              <div className="w-full flex flex-wrap justify-center content-center gap-3 max-h-[48vh] overflow-y-auto p-2 pg-scroll">
                <AnimatePresence>
                  {players.map((p, idx) => {
                    const { avatar, name, bg } = parsePlayerAvatar(p.nickname, p.id);
                    return (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: 0.2, y: 30 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          y: [0, -5, 0],
                        }}
                        exit={{ opacity: 0, scale: 0.3 }}
                        transition={{
                          layout: { duration: 0.4 },
                          opacity: { duration: 0.3 },
                          scale: { type: "spring", stiffness: 400, damping: 20 },
                          y: {
                            repeat: Infinity,
                            duration: 2.2 + (idx % 5) * 0.3,
                            ease: "easeInOut",
                            delay: (idx % 6) * 0.2,
                          },
                        }}
                        className="group relative flex items-center gap-3 rounded-2xl border border-white/20 bg-white/15 backdrop-blur-md px-4 py-2.5 shadow-lg hover:border-white/40 hover:bg-white/25 transition-colors"
                      >
                        {/* Animated Avatar Icon */}
                        <div
                          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${bg} text-2xl shadow-md transform group-hover:rotate-6 transition-transform`}
                        >
                          {avatar}
                        </div>

                        {/* Nickname */}
                        <div className="flex flex-col">
                          <span className="font-extrabold text-sm sm:text-base text-white tracking-tight max-w-[140px] truncate">
                            {name}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-300">
                            ● সংযুক্ত
                          </span>
                        </div>

                        {/* Kick Button for Host */}
                        <button
                          onClick={() => onKick(p.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 grid h-6 w-6 place-items-center rounded-full bg-rose-500/80 text-white text-xs hover:bg-rose-600 shadow"
                          title="খেলোয়াড় সরান"
                        >
                          ✕
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right Column: Live Lobby Chat */}
          {showChat && onSendMessage && (
            <div className="lg:col-span-4 w-full">
              <LiveSessionChat
                pin={pin}
                messages={chatMessages}
                chatEnabled={chatEnabled}
                isHost={true}
                currentUserName="হোস্ট"
                onSendMessage={onSendMessage}
                onToggleChat={onToggleChat}
                variant="lobby-card"
              />
            </div>
          )}
        </div>
      </main>

      {/* BOTTOM FOOTER / LAUNCH BAR */}
      <footer className="relative z-10 mx-auto w-full max-w-4xl pt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md px-6 py-4">
          <div>
            <p className="text-xs font-semibold text-white/60">
              কুইজ: <span className="text-white font-bold">{quizTitle}</span> ({totalQuestions} টি প্রশ্ন)
            </p>
            <p className="text-xs text-white/40 mt-0.5">
              সবাই প্রস্তুত হলে নিচের সবুজ বাটনে ক্লিক করে প্রথম প্রশ্ন শুরু করুন
            </p>
          </div>

          <Button
            size="lg"
            onClick={onStart}
            loading={isStarting}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-lg px-8 py-3.5 rounded-xl shadow-xl shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-transform"
          >
            🚀 শুরু করুন ({players.length} জন সহ)
          </Button>
        </div>
      </footer>
    </div>
  );
}
