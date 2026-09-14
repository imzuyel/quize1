export const QUESTION_TYPES = [
  { value: "mcq", label: "Multiple Choice", icon: "🔘", description: "একটি সঠিক উত্তর" },
  { value: "multi_select", label: "Multiple Select", icon: "☑️", description: "একাধিক সঠিক উত্তর" },
  { value: "true_false", label: "True / False", icon: "✔️", description: "সত্য বা মিথ্যা" },
  { value: "short_answer", label: "Short Answer", icon: "📝", description: "সংক্ষিপ্ত লিখিত উত্তর" },
  { value: "numeric_answer", label: "Numeric Answer", icon: "🔢", description: "সংখ্যাভিত্তিক উত্তর" },
  { value: "word_answer", label: "Word Answer", icon: "🔤", description: "একটি শব্দ/টার্ম" },
  { value: "puzzle", label: "Puzzle", icon: "🧩", description: "অক্ষর/টাইল দিয়ে সমাধান" },
  { value: "matching", label: "Matching", icon: "↔️", description: "দুই পাশের জোড়া মিলান" },
  { value: "ordering", label: "Ordering", icon: "🔀", description: "সঠিক ক্রমে সাজান" },
  { value: "poll", label: "Poll", icon: "📊", description: "মতামত, কোনো সঠিক উত্তর নেই" },
  { value: "word_cloud", label: "Word Cloud", icon: "☁️", description: "সবার শব্দ থেকে cloud" },
  { value: "open_ended", label: "Open-ended", icon: "💭", description: "মুক্ত উত্তর, teacher review" },
] as const;

export type QuestionType = typeof QUESTION_TYPES[number]["value"];

export const GRID_TYPES = new Set(["mcq", "multi_select", "true_false", "poll"]);
export const TEXT_TYPES = new Set(["short_answer", "word_answer", "open_ended", "word_cloud"]);
export const INTERACTIVE_TYPES = new Set(["numeric_answer", "matching", "ordering", "puzzle", "short_answer", "word_answer", "open_ended", "word_cloud"]);

export function typeNeedsOptions(type: string) {
  return ["mcq", "multi_select", "true_false", "matching", "ordering", "poll"].includes(type);
}

export function typeIsAutoGraded(type: string) {
  return !["poll", "word_cloud", "open_ended"].includes(type);
}
