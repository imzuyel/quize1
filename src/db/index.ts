import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// ---------------------------------------------------------------------------
// In-memory mock store for AI Studio container environment (when MySQL is offline)
// ---------------------------------------------------------------------------

type MockRow = Record<string, any>;

const globalStore = globalThis as typeof globalThis & {
  __arenaMockStore?: Record<string, any>;
};

if (!globalStore.__arenaMockStore) {
  globalStore.__arenaMockStore = {
    nextId: 100,
    users: [
      {
        id: 1,
        email: "superadmin@pgtsc.edu.bd",
        passwordHash: "mock:hash",
        name: "সুপার অ্যাডমিন",
        nameBn: "সুপার অ্যাডমিন",
        role: "super_admin",
        active: true,
        status: "approved",
        studentId: null,
        classId: null,
        sectionId: null,
        tradeId: null,
        roll: null,
        avatar: null,
        xp: 2500,
        level: "expert",
        locale: "bn",
        prefs: {},
        createdAt: new Date(),
      },
      {
        id: 2,
        email: "admin@pgtsc.edu.bd",
        passwordHash: "mock:hash",
        name: "স্কুল অ্যাডমিন",
        nameBn: "স্কুল অ্যাডমিন",
        role: "admin",
        active: true,
        status: "approved",
        studentId: null,
        classId: null,
        sectionId: null,
        tradeId: null,
        roll: null,
        avatar: null,
        xp: 1800,
        level: "expert",
        locale: "bn",
        prefs: {},
        createdAt: new Date(),
      },
      {
        id: 3,
        email: "teacher@pgtsc.edu.bd",
        passwordHash: "mock:hash",
        name: "মো: জিয়েল রানা (শিক্ষক)",
        nameBn: "মো: জিয়েল রানা",
        role: "teacher",
        active: true,
        status: "approved",
        studentId: null,
        classId: null,
        sectionId: null,
        tradeId: null,
        roll: null,
        avatar: null,
        xp: 1200,
        level: "pro",
        locale: "bn",
        prefs: {},
        createdAt: new Date(),
      },
      {
        id: 4,
        email: "student@pgtsc.edu.bd",
        passwordHash: "mock:hash",
        name: "আরিফুল ইসলাম (শিক্ষার্থী)",
        nameBn: "আরিফুল ইসলাম",
        role: "student",
        studentId: "PGTSC-2025-001",
        active: true,
        status: "approved",
        classId: 1,
        sectionId: 1,
        tradeId: 1,
        roll: "01",
        avatar: null,
        xp: 650,
        level: "intermediate",
        locale: "bn",
        prefs: {},
        createdAt: new Date(),
      },
      {
        id: 5,
        email: "parent@pgtsc.edu.bd",
        passwordHash: "mock:hash",
        name: "অভিভাবক (সাদিয়ার পিতা)",
        nameBn: "অভিভাবক",
        role: "parent",
        studentId: null,
        active: true,
        status: "approved",
        classId: null,
        sectionId: null,
        tradeId: null,
        roll: null,
        avatar: null,
        xp: 150,
        level: "beginner",
        locale: "bn",
        prefs: {},
        createdAt: new Date(),
      },
    ],
    auth_sessions: [],
    settings: [
      {
        key: "branding",
        value: {
          schoolName: "পঞ্চগড় সরকারি টেকনিক্যাল স্কুল ও কলেজ",
          schoolNameEn: "Panchagarh Government Technical School & College",
          tagline: "কারিগরি শিক্ষায় সমৃদ্ধ দেশ, গড়বো আমরা স্মার্ট বাংলাদেশ",
          contact: "০১৭১১-০০০০০০",
          email: "principal@pgtsc.gov.bd",
          developerName: "Md. Juyel Rana",
          developerTitle: "Junior Instructor (Tech / Computer)",
          developerInstitute: "Panchagarh Government Technical School & College",
          copyright: "© 2025 PGTSC Quiz Arena. সর্বস্বত্ব সংরক্ষিত।",
          footer: "কারিগরি ও মাদ্রাসা শিক্ষা বিভাগ, শিক্ষা মন্ত্রণালয়",
        },
      },
      {
        key: "seo",
        value: {
          siteName: "PGTSC কুইজ অ্যারেনা",
          siteNameEn: "PGTSC Quiz Arena",
          tagline: "লাইভ কুইজ, অনলাইন পরীক্ষা ও প্রশ্ন ব্যাংক",
          description: "পঞ্চগড় সরকারি টেকনিক্যাল স্কুল ও কলেজের অফিসিয়াল অনলাইন কুইজ, পরীক্ষা ও এআই প্রশ্ন ব্যাংক প্ল্যাটফর্ম।",
          keywords: "PGTSC, Quiz, Exam, Panchagarh, Technical School, Bangladesh",
          themeColor: "#171c4a",
        },
      },
    ],
    trades: [
      { id: 1, name: "General Electronics", nameBn: "জেনারেল ইলেকট্রনিক্স", code: "GEL" },
      { id: 2, name: "IT Support & IoT Basics", nameBn: "আইটি সাপোর্ট ও আইওটি বেসিকস", code: "ITI" },
      { id: 3, name: "General Electrical", nameBn: "জেনারেল ইলেকট্রিক্যাল", code: "GEE" },
      { id: 4, name: "Apparel Manufacturing Basics", nameBn: "অ্যাপারেল ম্যানুফ্যাকচারিং বেসিকস", code: "AMB" },
    ],
    classes: [
      { id: 1, name: "Class 9 (SSC Voc)", nameBn: "নবম শ্রেণি (এসএসসি ভোকেশনাল)", level: 9 },
      { id: 2, name: "Class 10 (SSC Voc)", nameBn: "দশম শ্রেণি (এসএসসি ভোকেশনাল)", level: 10 },
      { id: 3, name: "Class 11 (HSC Voc)", nameBn: "একাদশ শ্রেণি (এইচএসসি ভোকেশনাল)", level: 11 },
      { id: 4, name: "Class 12 (HSC Voc)", nameBn: "দ্বাদশ শ্রেণি (এইচএসসি ভোকেশনাল)", level: 12 },
    ],
    subjects: [
      { id: 1, name: "Computer", nameBn: "কম্পিউটার ও তথ্য প্রযুক্তি", color: "#2f80ed" },
      { id: 2, name: "Mathematics", nameBn: "গণিত", color: "#0f7b6c" },
      { id: 3, name: "Electronics", nameBn: "ইলেকট্রনিক্স", color: "#8b5cf6" },
      { id: 4, name: "Electrical", nameBn: "ইলেকট্রিক্যাল", color: "#f0b429" },
      { id: 5, name: "English", nameBn: "ইংরেজি", color: "#e2574c" },
      { id: 6, name: "Bangla", nameBn: "বাংলা", color: "#0891b2" },
      { id: 7, name: "Physics", nameBn: "পদার্থবিজ্ঞান", color: "#16a34a" },
      { id: 8, name: "IoT Basics", nameBn: "আইওটি বেসিকস", color: "#db2777" },
    ],
    chapters: [
      { id: 1, subjectId: 1, name: "HTML Fundamentals", nameBn: "এইচটিএমএল মৌলিক", orderIndex: 0 },
      { id: 2, subjectId: 1, name: "Computer Networks", nameBn: "কম্পিউটার নেটওয়ার্ক", orderIndex: 1 },
      { id: 3, subjectId: 3, name: "Semiconductors", nameBn: "অর্ধপরিবাহী", orderIndex: 0 },
      { id: 4, subjectId: 4, name: "DC Circuits", nameBn: "ডিসি সার্কিট", orderIndex: 0 },
      { id: 5, subjectId: 2, name: "Algebra", nameBn: "বীজগণিত", orderIndex: 0 },
    ],
    topics: [
      { id: 1, chapterId: 1, name: "HTML Forms", nameBn: "এইচটিএমএল ফর্ম" },
      { id: 2, chapterId: 2, name: "IP Addressing", nameBn: "আইপি অ্যাড্রেসিং" },
      { id: 3, chapterId: 3, name: "Diode & Transistor", nameBn: "ডায়োড ও ট্রানজিস্টর" },
    ],
    questions: [
      {
        id: 1,
        text: "HTML ফর্মে ব্যবহারকারীর কাছ থেকে টেক্সট ইনপুট নেওয়ার জন্য কোন ট্যাগটি ব্যবহৃত হয়?",
        type: "mcq",
        options: ["<input>", "<form-data>", "<entry>", "<field>"],
        correct: [0],
        explanation: "<input> ট্যাগ দিয়ে টেক্সট, পাসওয়ার্ড, চেকবক্সসহ নানা ধরনের ইনপুট গ্রহণ করা হয়।",
        hint: "ফর্মের সর্বাধিক ব্যবহৃত ইনপুট ট্যাগ।",
        difficulty: "easy",
        marks: 1,
        timer: 30,
        subjectId: 1,
        classId: 2,
        tradeId: 2,
        createdBy: 3,
        status: "published",
        createdAt: new Date(),
      },
      {
        id: 2,
        text: "HTML ফর্মের গোপনীয় ডেটা (যেমন পাসওয়ার্ড) সার্ভারে পাঠানোর নিরাপদ পদ্ধতি কোনটি?",
        type: "mcq",
        options: ["POST মেথড", "GET মেথড", "SUBMIT মেথড", "FETCH মেথড"],
        correct: [0],
        explanation: "POST মেথডে ডেটা URL-এ প্রকাশ পায় না, তাই এটি তুলনামূলক বেশি নিরাপদ।",
        hint: "মেথডটি বডি (Body) দিয়ে ডেটা পাঠায়।",
        difficulty: "medium",
        marks: 1,
        timer: 30,
        subjectId: 1,
        classId: 2,
        tradeId: 2,
        createdBy: 3,
        status: "published",
        createdAt: new Date(),
      },
      {
        id: 3,
        text: "IPv4 ঠিকানা কত বিটের হয়ে থাকে?",
        type: "mcq",
        options: ["৩২ বিট", "৬৪ বিট", "১৬ বিট", "১২৮ বিট"],
        correct: [0],
        explanation: "IPv4 ৩২ বিটের এবং IPv6 ১২৮ বিটের অ্যাড্রেস ফরম্যাট ব্যবহার করে।",
        hint: "৪টি অক্টেট (৪ × ৮)।",
        difficulty: "easy",
        marks: 1,
        timer: 25,
        subjectId: 1,
        classId: 2,
        tradeId: 2,
        createdBy: 3,
        status: "published",
        createdAt: new Date(),
      },
      {
        id: 4,
        text: "LAN-এর পূর্ণরূপ কোনটি?",
        type: "mcq",
        options: ["Local Area Network", "Long Area Network", "Linked Access Node", "Local Access Number"],
        correct: [0],
        explanation: "LAN হলো Local Area Network, যা ছোট ভৌগোলিক এলাকায় ব্যবহৃত নেটওয়ার্ক।",
        hint: "স্কুল বা অফিসের নেটওয়ার্ক।",
        difficulty: "easy",
        marks: 1,
        timer: 20,
        subjectId: 1,
        classId: 2,
        tradeId: 2,
        createdBy: 3,
        status: "published",
        createdAt: new Date(),
      },
      {
        id: 5,
        text: "ডায়োড প্রধানত কোন কাজে ব্যবহৃত হয়?",
        type: "mcq",
        options: ["একমুখী বিদ্যুৎ প্রবাহ নিশ্চিত করতে", "ভোল্টেজ দ্বিগুণ করতে", "শব্দ তৈরি করতে", "রেজিস্ট্যান্স বৃদ্ধি করতে"],
        correct: [0],
        explanation: "ডায়োড কেবল এক দিকে কারেন্ট প্রবাহিত হতে দেয় এবং এসি থেকে ডিসি রূপান্তরে ব্যবহৃত হয়।",
        hint: "রেকটিফায়ার সার্কিটে এর প্রধান ব্যবহার।",
        difficulty: "medium",
        marks: 1,
        timer: 30,
        subjectId: 3,
        classId: 2,
        tradeId: 1,
        createdBy: 3,
        status: "published",
        createdAt: new Date(),
      },
      {
        id: 6,
        text: "AND গেটের আউটপুট কখন 1 হবে?",
        type: "mcq",
        options: ["সবগুলো ইনপুট 1 হলে", "যেকোনো একটি ইনপুট 1 হলে", "সব ইনপুট 0 হলে", "কখনোই নয়"],
        correct: [0],
        explanation: "AND গেটে সব ইনপুট হাই (1) হলেই কেবল আউটপুট 1 হয়।",
        hint: "যৌক্তিক গুণের নিয়ম মনে করুন।",
        difficulty: "easy",
        marks: 1,
        timer: 25,
        subjectId: 3,
        classId: 2,
        tradeId: 1,
        createdBy: 3,
        status: "published",
        createdAt: new Date(),
      },
      {
        id: 7,
        text: "ওহমের সূত্র অনুযায়ী V = কোনটি?",
        type: "mcq",
        options: ["I × R", "I / R", "R / I", "I + R"],
        correct: [0],
        explanation: "ভোল্টেজ = কারেন্ট (I) × রেজিস্ট্যান্স (R)।",
        hint: "কারেন্ট ও রোmemoryর গুণফল।",
        difficulty: "easy",
        marks: 1,
        timer: 20,
        subjectId: 4,
        classId: 2,
        tradeId: 3,
        createdBy: 3,
        status: "published",
        createdAt: new Date(),
      },
      {
        id: 8,
        text: "সিরিজ সার্কিটে নিচের কোন রাশিটি সর্বত্র সমান থাকে?",
        type: "mcq",
        options: ["কারেন্ট (Current)", "ভোল্টেজ (Voltage)", "পাওয়ার (Power)", "রোmemory (Resistance)"],
        correct: [0],
        explanation: "সিরিজ সংযোগে প্রতিটি উপাদানের মধ্য দিয়ে একই কারেন্ট প্রবাহিত হয়।",
        hint: "কারেন্ট চলাচলের কেবল একটি পথ থাকে।",
        difficulty: "medium",
        marks: 1,
        timer: 30,
        subjectId: 4,
        classId: 2,
        tradeId: 3,
        createdBy: 3,
        status: "published",
        createdAt: new Date(),
      },
      {
        id: 9,
        text: "x² - 5x + 6 = 0 সমীকরণের মূলদ্বয় কত?",
        type: "mcq",
        options: ["2 এবং 3", "1 এবং 6", "-2 এবং -3", "0 এবং 5"],
        correct: [0],
        explanation: "(x - 2)(x - 3) = 0 তাই x = 2 অথবা x = 3।",
        hint: "উৎপাদকে বিশ্লেষণ করুন।",
        difficulty: "medium",
        marks: 1,
        timer: 40,
        subjectId: 2,
        classId: 2,
        tradeId: 2,
        createdBy: 3,
        status: "published",
        createdAt: new Date(),
      },
      {
        id: 10,
        text: "Arduino Uno বোর্ডে ডিজিটাল I/O পিন সংখ্যা কতটি?",
        type: "mcq",
        options: ["১৪টি", "৮টি", "১৬টি", "২০টি"],
        correct: [0],
        explanation: "Arduino Uno-তে মোট ১৪টি ডিজিটাল ইনপুট/আউটপুট পিন থাকে (0 থেকে 13)।",
        hint: "৬টি পিন PWM হিসেবে কাজ করতে পারে।",
        difficulty: "easy",
        marks: 1,
        timer: 25,
        subjectId: 8,
        classId: 2,
        tradeId: 2,
        createdBy: 3,
        status: "published",
        createdAt: new Date(),
      },
    ],
    quizzes: [
      {
        id: 1,
        title: "ক্লাস ১০ কম্পিউটার — HTML ফর্ম ও নেটওয়ার্ক লাইভ কুইজ",
        description: "এইচটিএমএল ফর্ম ট্যাগ, মেথড ও নেটওয়ার্কিং মৌলিক বিষয়ের ওপর লাইভ কুইজ প্রতিযোগিতা।",
        mode: "live",
        classId: 2,
        tradeId: 2,
        durationMinutes: 15,
        status: "published",
        createdBy: 3,
        settings: { timePerQuestion: 30, shuffleQuestions: true, shuffleOptions: true, showLeaderboard: true, streakBonus: true },
        createdAt: new Date(),
      },
      {
        id: 2,
        title: "জেনারেল ইলেকট্রনিক্স ও ডিজিটাল লজিক কুইজ",
        description: "ডায়োড, ট্রানজিস্টর ও বেসিক লজিক গেটের ওপর কুইজ।",
        mode: "live",
        classId: 2,
        tradeId: 1,
        durationMinutes: 20,
        status: "published",
        createdBy: 3,
        settings: { timePerQuestion: 30, shuffleQuestions: true, shuffleOptions: true, showLeaderboard: true },
        createdAt: new Date(),
      },
      {
        id: 3,
        title: "গণিত ও জ্যামিতি অনুশীলন সেট",
        description: "বীজগণিত ও সমীকরণ সমাধানের স্ব-অনুশীলন সেট।",
        mode: "practice",
        classId: 2,
        tradeId: null,
        durationMinutes: 25,
        status: "published",
        createdBy: 3,
        settings: { timePerQuestion: 45, allowRetake: true },
        createdAt: new Date(),
      },
      {
        id: 4,
        title: "প্রথম সাময়িক পরীক্ষা — কম্পিউটার ও তথ্য প্রযুক্তি",
        description: "এসএসসি ভোকেশনাল দশম শ্রেণির ফরমাল অনলাইন পরীক্ষা।",
        mode: "exam",
        classId: 2,
        tradeId: 2,
        durationMinutes: 45,
        status: "published",
        createdBy: 3,
        settings: { shuffleQuestions: true, negativeMarking: 0.25, autoSubmit: true },
        createdAt: new Date(),
      },
      {
        id: 5,
        title: "ইলেকট্রিক্যাল সার্কিট ও নিরাপত্তা লাইভ সেশন",
        description: "ওহমের সূত্র, সিরিজ সার্কিট ও হাউস ওয়্যারিং নিরাপত্তা।",
        mode: "live",
        classId: 2,
        tradeId: 3,
        durationMinutes: 15,
        status: "published",
        createdBy: 3,
        settings: { timePerQuestion: 30, showLeaderboard: true },
        createdAt: new Date(),
      },
    ],
    quiz_questions: [
      { id: 1, quizId: 1, questionId: 1, orderIndex: 0 },
      { id: 2, quizId: 1, questionId: 2, orderIndex: 1 },
      { id: 3, quizId: 1, questionId: 3, orderIndex: 2 },
      { id: 4, quizId: 1, questionId: 4, orderIndex: 3 },
      { id: 5, quizId: 2, questionId: 5, orderIndex: 0 },
      { id: 6, quizId: 2, questionId: 6, orderIndex: 1 },
      { id: 7, quizId: 3, questionId: 9, orderIndex: 0 },
      { id: 8, quizId: 4, questionId: 1, orderIndex: 0 },
      { id: 9, quizId: 4, questionId: 2, orderIndex: 1 },
      { id: 10, quizId: 4, questionId: 3, orderIndex: 2 },
      { id: 11, quizId: 4, questionId: 4, orderIndex: 3 },
      { id: 12, quizId: 4, questionId: 10, orderIndex: 4 },
      { id: 13, quizId: 5, questionId: 7, orderIndex: 0 },
      { id: 14, quizId: 5, questionId: 8, orderIndex: 1 },
    ],
    quiz_sessions: [],
    session_players: [],
    session_teams: [],
    player_answers: [],
    quiz_results: [],
    quiz_templates: [],
    achievements: [],
    notifications: [],
    quiz_sections: [],
    quiz_presets: [],
  };
}

const store = globalStore.__arenaMockStore!;

function getTableName(table: any): string {
  if (!table) return "";
  if (typeof table === "string") return table;
  return (
    table[Symbol.for("drizzle:Name")] ||
    table[Symbol.for("drizzle:OriginalName")] ||
    table._?.name ||
    table.name ||
    ""
  );
}

function extractStringValue(obj: any, maxDepth = 4): string[] {
  const strings: string[] = [];
  const seen = new WeakSet();
  function walk(val: any, depth: number) {
    if (!val || depth > maxDepth) return;
    if (typeof val === "string") {
      strings.push(val);
      return;
    }
    if (typeof val === "object") {
      if (seen.has(val)) return;
      seen.add(val);
      try {
        for (const k of Object.keys(val)) {
          if (k === "table" || k === "columns" || k === "schema") continue;
          walk(val[k], depth + 1);
        }
      } catch {
        // ignore
      }
    }
  }
  walk(obj, 0);
  return strings;
}

interface QueryContext {
  type: "select" | "insert" | "update" | "delete" | "execute";
  table?: any;
  fields?: any;
  whereClauses: any[];
  joinClauses: any[];
  limitCount?: number;
  insertValues?: any[];
  updateValues?: any;
  isReturningId?: boolean;
}

function getRowValue(row: any, col: string): any {
  if (!row || typeof row !== "object") return undefined;
  if (col in row) return row[col];
  const camel = col.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
  if (camel in row) return row[camel];
  const snake = col.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
  if (snake in row) return row[snake];
  return undefined;
}

function matchesCondition(clause: any, row: any): boolean {
  if (!clause) return true;
  if (typeof clause === "function") return true;

  const chunks = clause.queryChunks || (clause.sql ? clause.sql.queryChunks : null);
  if (!chunks || !Array.isArray(chunks)) return true;

  // If there are sub-SQL objects (e.g. from and(...) or or(...))
  const subSqls = chunks.filter((c: any) => c && (c.constructor?.name === "SQL" || c.queryChunks));
  if (subSqls.length > 0) {
    const isOr = chunks.some(
      (c: any) => Array.isArray(c?.value) && c.value.join("").toLowerCase().includes("or"),
    );
    if (isOr) {
      return subSqls.some((s: any) => matchesCondition(s, row));
    }
    return subSqls.every((s: any) => matchesCondition(s, row));
  }

  let colName: string | null = null;
  let paramVal: any = undefined;
  let hasParam = false;
  let op = "=";

  for (const c of chunks) {
    if (c && typeof c.name === "string" && (c.table || c.columnType)) {
      colName = c.name;
    } else if (c && c.constructor && (c.constructor.name === "Param" || "value" in c && !Array.isArray(c.value))) {
      paramVal = c.value;
      hasParam = true;
    } else if (c && c.value && Array.isArray(c.value)) {
      const str = c.value.join("").trim().toLowerCase();
      if (
        str.includes("=") ||
        str.includes("like") ||
        str.includes("in") ||
        str.includes("null") ||
        str.includes("<>") ||
        str.includes("!=")
      ) {
        op = str;
      }
    }
  }

  if (colName && hasParam) {
    const rowVal = getRowValue(row, colName);
    if (op.includes("=") && !op.includes("<>") && !op.includes("!=")) {
      return String(rowVal) === String(paramVal);
    }
    if (op.includes("<>") || op.includes("!=")) {
      return String(rowVal) !== String(paramVal);
    }
    if (op.includes("like")) {
      const pattern = String(paramVal).replace(/%/g, ".*");
      return new RegExp(pattern, "i").test(String(rowVal ?? ""));
    }
    if (op.includes("in") && Array.isArray(paramVal)) {
      return paramVal.map(String).includes(String(rowVal));
    }
  }

  if (colName && op.includes("is null")) return getRowValue(row, colName) == null;
  if (colName && op.includes("is not null")) return getRowValue(row, colName) != null;

  return true;
}

function matchesAllConditions(whereClauses: any[], row: any): boolean {
  if (!whereClauses || whereClauses.length === 0) return true;
  return whereClauses.every((clause) => matchesCondition(clause, row));
}

function executeMockQuery(ctx: QueryContext): any {
  const tableName = getTableName(ctx.table);

  if (!Array.isArray((store as any)[tableName])) {
    (store as any)[tableName] = [];
  }

  if (ctx.type === "insert") {
    const list = Array.isArray(ctx.insertValues) ? ctx.insertValues : [ctx.insertValues];
    const target = (store as any)[tableName] || ((store as any)[tableName] = []);
    const inserted = list.map((item) => {
      const row = {
        id: item?.id ?? store.nextId++,
        createdAt: new Date(),
        ...item,
      };
      target.push(row);
      return row;
    });
    if (ctx.isReturningId) {
      return inserted.map((x) => ({ id: x.id }));
    }
    return {
      insertId: inserted[inserted.length - 1]?.id ?? 1,
      affectedRows: inserted.length,
    };
  }

  if (ctx.type === "update") {
    const target = (store as any)[tableName] || [];
    let affected = 0;
    if (ctx.updateValues) {
      target.forEach((row: any) => {
        if (matchesAllConditions(ctx.whereClauses, row)) {
          Object.assign(row, ctx.updateValues);
          affected++;
        }
      });
    }
    return { affectedRows: affected };
  }

  if (ctx.type === "delete") {
    const target = (store as any)[tableName] || [];
    const beforeLen = target.length;
    (store as any)[tableName] = target.filter((row: any) => !matchesAllConditions(ctx.whereClauses, row));
    return { affectedRows: beforeLen - (store as any)[tableName].length };
  }

  // SELECT query handling
  let rows: MockRow[] = [];

  if (tableName === "auth_sessions" || tableName === "sessionsTable") {
    // Check if joined with users
    const isUserJoin = ctx.joinClauses.some((j) => getTableName(j.table) === "users");
    const whereStrings = ctx.whereClauses.flatMap(extractStringValue);
    
    // Find matching session
    const sessionsList = (store.auth_sessions || []) as MockRow[];
    let matchedSession = sessionsList.find((s: MockRow) => whereStrings.includes(s.token));
    if (!matchedSession && sessionsList.length > 0) {
      matchedSession = sessionsList[sessionsList.length - 1];
    }

    if (matchedSession && isUserJoin) {
      const userList = (store.users || []) as MockRow[];
      const user = userList.find((u: MockRow) => u.id === matchedSession?.userId);
      if (user) {
        rows = [user];
      }
    } else if (matchedSession) {
      rows = [matchedSession];
    } else {
      rows = [];
    }
  } else if (tableName === "users") {
    const whereStrings = ctx.whereClauses.flatMap(extractStringValue);
    const wantedRole = ["super_admin", "admin", "teacher", "student", "parent"].find((r: string) =>
      whereStrings.includes(r),
    );
    const userList = (store.users || []) as MockRow[];
    if (wantedRole) {
      const user = userList.find((u: MockRow) => u.role === wantedRole);
      rows = user ? [user] : [];
    } else {
      rows = userList.filter((u: MockRow) => matchesAllConditions(ctx.whereClauses, u));
    }
  } else if (tableName === "settings") {
    const whereStrings = ctx.whereClauses.flatMap(extractStringValue);
    const key = whereStrings.find((k: string) => k === "branding" || k === "seo");
    const settingsList = (store.settings || []) as MockRow[];
    if (key) {
      const s = settingsList.find((item: MockRow) => item.key === key);
      rows = s ? [s] : [];
    } else {
      rows = [...settingsList];
    }
  } else if (tableName === "quiz_questions" && ctx.joinClauses.some((j) => getTableName(j.table) === "questions")) {
    // Join quiz_questions with questions
    const qqList = (store.quiz_questions || []).filter((qq: any) =>
      matchesAllConditions(ctx.whereClauses, qq),
    );
    rows = qqList
      .map((qq: any) => {
        const q = (store.questions || []).find((quest: any) => quest.id === qq.questionId);
        if (!q) return null;
        return {
          ...q,
          ...qq,
          id: q.id,
          quizId: qq.quizId,
          questionId: qq.questionId,
          orderIndex: qq.orderIndex,
          marks: qq.marks ?? q.marks ?? 1,
          timer: qq.timer ?? q.timer ?? 30,
        };
      })
      .filter(Boolean);
  } else if (tableName && Array.isArray((store as any)[tableName])) {
    const all = (store as any)[tableName] as MockRow[];
    rows = all.filter((r) => matchesAllConditions(ctx.whereClauses, r));
  } else {
    rows = [];
  }

  if (typeof ctx.limitCount === "number") {
    rows = rows.slice(0, ctx.limitCount);
  }

  return rows;
}

function createChainableMock(initialCtx?: Partial<QueryContext>): any {
  const ctx: QueryContext = {
    type: "select",
    whereClauses: [],
    joinClauses: [],
    ...initialCtx,
  };

  const proxy: any = new Proxy(function () {}, {
    get(_target, prop) {
      if (prop === "then") {
        return (onFulfilled: any, onRejected?: any) => {
          return Promise.resolve(executeMockQuery(ctx)).then(onFulfilled, onRejected);
        };
      }
      if (prop === "catch") {
        return (onRejected: any) => {
          return Promise.resolve(executeMockQuery(ctx)).catch(onRejected);
        };
      }
      if (prop === "$returningId") {
        return () => {
          ctx.isReturningId = true;
          return proxy;
        };
      }
      if (prop === "from") {
        return (table: any) => {
          ctx.table = table;
          return proxy;
        };
      }
      if (prop === "where") {
        return (...args: any[]) => {
          ctx.whereClauses.push(...args);
          return proxy;
        };
      }
      if (prop === "innerJoin" || prop === "leftJoin" || prop === "rightJoin") {
        return (table: any, on: any) => {
          ctx.joinClauses.push({ table, on });
          return proxy;
        };
      }
      if (prop === "limit") {
        return (n: number) => {
          ctx.limitCount = n;
          return proxy;
        };
      }
      if (prop === "offset" || prop === "orderBy" || prop === "groupBy" || prop === "having") {
        return () => proxy;
      }
      if (prop === "values") {
        return (vals: any) => {
          ctx.insertValues = vals;
          return proxy;
        };
      }
      if (prop === "set") {
        return (patch: any) => {
          ctx.updateValues = patch;
          return proxy;
        };
      }
      if (prop === "onDuplicateKeyUpdate") {
        return () => proxy;
      }
      return (..._args: any[]) => proxy;
    },
    apply(_target, _thisArg, args) {
      if (ctx.type === "select" && args.length > 0 && !ctx.fields) {
        ctx.fields = args[0];
      }
      return proxy;
    },
  });

  return proxy;
}

const noOpRelational = {
  findMany: async () => [],
  findFirst: async () => null,
  findUnique: async () => null,
  create: async (d: any) => d?.data ?? {},
  update: async (d: any) => d?.data ?? {},
  delete: async () => ({}),
};

const mockDb: any = {
  select: (fields?: any) => createChainableMock({ type: "select", fields }),
  insert: (table: any) => createChainableMock({ type: "insert", table }),
  update: (table: any) => createChainableMock({ type: "update", table }),
  delete: (table: any) => createChainableMock({ type: "delete", table }),
  execute: async () => [[], []],
  transaction: async (cb: any) => cb(mockDb),
  query: new Proxy({}, { get: () => noOpRelational }),
};

// ---------------------------------------------------------------------------
// Database Connection Setup
// ---------------------------------------------------------------------------

let activePool: any = null;
let activeDb: any = null;

// Only connect to external MySQL if DATABASE_URL is not localhost/127.0.0.1 (which does not run in this container)
if (
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes("127.0.0.1") &&
  !process.env.DATABASE_URL.includes("localhost")
) {
  try {
    const pool = mysql.createPool(process.env.DATABASE_URL);
    activePool = pool;
    activeDb = drizzle(pool);
  } catch (err) {
    console.warn("[AI Studio] MySQL connection failed, falling back to mock:", err);
  }
}

export const pool =
  activePool ?? {
    query: async () => [[], []],
    execute: async () => [[], []],
    getConnection: async () => ({
      release: () => {},
      query: async () => [[], []],
      execute: async () => [[], []],
    }),
  };

type DrizzleDatabase = ReturnType<typeof drizzle>;
export const db: DrizzleDatabase = (activeDb ?? mockDb) as unknown as DrizzleDatabase;
