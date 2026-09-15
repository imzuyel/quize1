export const FUN_AVATARS = [
  { emoji: "🦁", name: "Lion", bg: "from-amber-400 via-orange-500 to-yellow-600" },
  { emoji: "🐯", name: "Tiger", bg: "from-orange-500 via-amber-500 to-yellow-500" },
  { emoji: "🦊", name: "Fox", bg: "from-orange-400 via-red-500 to-rose-600" },
  { emoji: "🐼", name: "Panda", bg: "from-slate-700 via-slate-800 to-slate-950" },
  { emoji: "🐨", name: "Koala", bg: "from-slate-300 via-slate-400 to-slate-500" },
  { emoji: "🐻", name: "Bear", bg: "from-amber-800 via-yellow-800 to-amber-900" },
  { emoji: "🐺", name: "Wolf", bg: "from-slate-600 via-blue-900 to-slate-950" },
  { emoji: "🦄", name: "Unicorn", bg: "from-pink-300 via-purple-400 to-indigo-500" },
  { emoji: "🐉", name: "Dragon", bg: "from-red-600 via-orange-600 to-amber-500" },
  { emoji: "🦖", name: "Dino", bg: "from-emerald-400 via-teal-600 to-lime-500" },
  { emoji: "🚀", name: "Rocket", bg: "from-cyan-400 via-blue-500 to-indigo-600" },
  { emoji: "🛸", name: "UFO", bg: "from-green-400 via-teal-500 to-blue-600" },
  { emoji: "🪐", name: "Planet", bg: "from-indigo-600 via-purple-600 to-pink-500" },
  { emoji: "☄️", name: "Comet", bg: "from-blue-500 via-indigo-600 to-rose-500" },
  { emoji: "⚡", name: "Bolt", bg: "from-yellow-300 via-amber-400 to-orange-500" },
  { emoji: "🔮", name: "Orb", bg: "from-violet-600 via-fuchsia-700 to-pink-600" },
  { emoji: "👑", name: "Crown", bg: "from-yellow-300 via-amber-400 to-yellow-600" },
  { emoji: "🏆", name: "Trophy", bg: "from-amber-300 via-yellow-400 to-amber-500" },
  { emoji: "💎", name: "Diamond", bg: "from-cyan-300 via-teal-400 to-blue-500" },
  { emoji: "🎯", name: "Target", bg: "from-rose-500 via-red-600 to-red-700" },
  { emoji: "🤖", name: "Robot", bg: "from-cyan-400 via-sky-500 to-blue-600" },
  { emoji: "👾", name: "Alien", bg: "from-fuchsia-500 via-purple-600 to-indigo-700" },
  { emoji: "🧙", name: "Wizard", bg: "from-purple-500 via-indigo-700 to-purple-900" },
  { emoji: "🥷", name: "Ninja", bg: "from-zinc-700 via-slate-800 to-slate-950" },
  { emoji: "🦸", name: "Hero", bg: "from-sky-400 via-blue-500 to-indigo-600" },
  { emoji: "🧛", name: "Vampire", bg: "from-red-900 via-rose-950 to-zinc-900" },
  { emoji: "🐙", name: "Octopus", bg: "from-pink-500 via-rose-600 to-indigo-600" },
  { emoji: "🐬", name: "Dolphin", bg: "from-sky-300 via-cyan-400 to-blue-600" },
  { emoji: "🦈", name: "Shark", bg: "from-slate-400 via-blue-700 to-slate-800" },
  { emoji: "🦅", name: "Eagle", bg: "from-amber-600 via-blue-900 to-slate-900" },
  { emoji: "🦉", name: "Owl", bg: "from-yellow-600 via-amber-700 to-stone-800" },
  { emoji: "🦜", name: "Parrot", bg: "from-lime-400 via-emerald-500 to-teal-600" },
  { emoji: "🦚", name: "Peacock", bg: "from-teal-400 via-emerald-500 to-blue-600" },
  { emoji: "🌋", name: "Volcano", bg: "from-orange-600 via-red-600 to-amber-800" },
  { emoji: "🌀", name: "Cyclone", bg: "from-cyan-400 via-teal-500 to-indigo-600" },
  { emoji: "🌌", name: "Nebula", bg: "from-pink-500 via-violet-600 to-fuchsia-900" },
  { emoji: "🎩", name: "Hat", bg: "from-zinc-800 via-slate-900 to-black" },
  { emoji: "🎮", name: "Controller", bg: "from-indigo-500 via-purple-600 to-pink-500" },
  { emoji: "🎨", name: "Palette", bg: "from-pink-400 via-purple-500 to-amber-400" },
  { emoji: "🐾", name: "Paws", bg: "from-orange-300 via-amber-400 to-yellow-600" },
  { emoji: "🐈", name: "Cat", bg: "from-rose-400 via-orange-400 to-yellow-500" },
  { emoji: "🐈‍⬛", name: "Panther", bg: "from-indigo-950 via-slate-900 to-zinc-950" },
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
