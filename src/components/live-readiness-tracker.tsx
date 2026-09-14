"use client";

import { motion } from "motion/react";
import { parsePlayerAvatar } from "@/lib/avatar";
import { Button } from "@/components/ui";

interface LiveReadinessTrackerProps {
  players: Array<{
    id: number;
    nickname: string;
    score: number;
  }>;
  readyPlayerIds: number[];
  currentIndex: number;
  totalQuestions: number;
  onNext: () => void;
  isHost?: boolean;
  isLoading?: boolean;
}

export function LiveReadinessTracker({
  players,
  readyPlayerIds = [],
  currentIndex,
  totalQuestions,
  onNext,
  isHost = true,
  isLoading = false,
}: LiveReadinessTrackerProps) {
  const readySet = new Set(readyPlayerIds);
  const total = Math.max(1, players.length);
  const count = readyPlayerIds.length;
  const pct = Math.min(100, Math.round((count / total) * 100));
  const isLastQuestion = currentIndex + 1 >= totalQuestions;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 text-white shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left info & progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚦</span>
            <h4 className="text-base font-black tracking-tight text-white">
              পরবর্তী প্রশ্নের প্রস্তুতি ট্র্যাকার
            </h4>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-xs font-black text-emerald-300">
              {count} / {players.length} জন প্রস্তুত ({pct}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          <p className="mt-1.5 text-xs text-white/50">
            শিক্ষার্থীরা তাদের ডিভাইসে &ldquo;আমি রেডি&rdquo; চাপলে এখানে লাইভ আপডেট হবে
          </p>
        </div>

        {/* Host action */}
        {isHost && (
          <div className="flex flex-col items-end shrink-0">
            <Button
              size="lg"
              onClick={onNext}
              loading={isLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-base sm:text-lg px-6 py-3 rounded-xl shadow-lg shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-transform"
            >
              {isLastQuestion
                ? "🏁 ফলাফল দেখুন"
                : `➡️ পরবর্তী প্রশ্ন (${currentIndex + 2}/${totalQuestions})`}
            </Button>
            <span className="mt-1 text-[11px] font-medium text-white/40">
              হোস্ট শুরু করলে তবেই প্রশ্ন আসবে
            </span>
          </div>
        )}
      </div>

      {/* Mini Avatar Grid of who is ready */}
      {players.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          {players.map((p) => {
            const isReady = readySet.has(p.id);
            const { avatar, name, bg } = parsePlayerAvatar(p.nickname, p.id);
            return (
              <motion.div
                key={p.id}
                animate={isReady ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                  isReady
                    ? "border border-emerald-400/60 bg-emerald-500/25 text-emerald-100 shadow-sm"
                    : "border border-white/10 bg-white/5 text-white/40"
                }`}
                title={isReady ? `${name} প্রস্তুত` : `${name} অপেক্ষা করছে`}
              >
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full text-[11px] bg-gradient-to-br ${bg}`}
                >
                  {avatar}
                </span>
                <span className="max-w-[100px] truncate">{name}</span>
                <span>{isReady ? "✓" : "⏳"}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface PlayerReadyButtonProps {
  isReady: boolean;
  onToggleReady: () => void;
  readyCount: number;
  totalPlayers: number;
}

export function PlayerReadyButton({
  isReady,
  onToggleReady,
  readyCount,
  totalPlayers,
}: PlayerReadyButtonProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl p-4 text-center text-white shadow-xl">
      <div className="flex flex-col items-center gap-2">
        <span className="text-3xl">{isReady ? "✅" : "👍"}</span>
        <h3 className="text-lg font-black">
          {isReady ? "আপনি প্রস্তুত!" : "পরবর্তী প্রশ্নের জন্য প্রস্তুত?"}
        </h3>
        <p className="text-xs text-white/70">
          {readyCount} / {totalPlayers} জন শিক্ষার্থী প্রস্তুত · শিক্ষক শুরু করার জন্য অপেক্ষা করা হচ্ছে
        </p>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onToggleReady}
          className={`mt-2 w-full max-w-sm rounded-xl py-3 px-6 text-base font-black shadow-lg transition-all ${
            isReady
              ? "bg-white/20 text-white border border-white/30 hover:bg-white/30"
              : "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-emerald-950/40"
          }`}
        >
          {isReady ? "✓ প্রস্তুতি নিশ্চিত করা হয়েছে (অপেক্ষা করুন)" : "👍 আমি প্রস্তুত! (Ready)"}
        </motion.button>
      </div>
    </div>
  );
}
