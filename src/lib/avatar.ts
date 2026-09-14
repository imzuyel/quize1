export const FUN_AVATARS = [
  { emoji: "🦁", name: "Lion", bg: "from-amber-400 to-orange-600" },
  { emoji: "🐯", name: "Tiger", bg: "from-orange-500 to-amber-600" },
  { emoji: "🦊", name: "Fox", bg: "from-orange-400 to-red-500" },
  { emoji: "🐼", name: "Panda", bg: "from-emerald-400 to-teal-700" },
  { emoji: "🚀", name: "Rocket", bg: "from-blue-500 to-indigo-700" },
  { emoji: "⚡", name: "Bolt", bg: "from-yellow-400 to-amber-500" },
  { emoji: "🧙", name: "Wizard", bg: "from-purple-500 to-indigo-800" },
  { emoji: "🤖", name: "Robot", bg: "from-cyan-400 to-blue-600" },
  { emoji: "🦄", name: "Unicorn", bg: "from-pink-400 to-purple-600" },
  { emoji: "🦖", name: "Dino", bg: "from-lime-400 to-emerald-600" },
  { emoji: "🎯", name: "Target", bg: "from-rose-500 to-red-700" },
  { emoji: "👑", name: "Crown", bg: "from-amber-300 to-yellow-600" },
  { emoji: "👾", name: "Alien", bg: "from-fuchsia-500 to-purple-700" },
  { emoji: "🥷", name: "Ninja", bg: "from-slate-700 to-slate-950" },
  { emoji: "🦸", name: "Hero", bg: "from-sky-400 to-blue-600" },
  { emoji: "💎", name: "Diamond", bg: "from-cyan-300 to-teal-600" },
];

const EMOJI_REGEX = /^(\p{Extended_Pictographic}|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF])\s*(.*)$/u;

export function parsePlayerAvatar(nickname: string, playerId: number) {
  const trimmed = (nickname || "").trim();
  const match = trimmed.match(EMOJI_REGEX);
  if (match && match[1]) {
    const avatar = match[1];
    const name = match[2]?.trim() || trimmed;
    const found = FUN_AVATARS.find((a) => a.emoji === avatar);
    const bg = found ? found.bg : FUN_AVATARS[Math.abs(playerId) % FUN_AVATARS.length].bg;
    return { avatar, name, bg };
  }

  const def = FUN_AVATARS[Math.abs(playerId) % FUN_AVATARS.length];
  return { avatar: def.emoji, name: trimmed || "খেলোয়াড়", bg: def.bg };
}
