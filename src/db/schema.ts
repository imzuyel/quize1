import {
  mysqlTable,
  datetime,
  int,
  text,
  varchar,
  boolean,
  timestamp,
  json,
  double,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/* ------------------------------------------------------------------ */
/* Users & auth                                                        */
/* ------------------------------------------------------------------ */

export const users = mysqlTable(
  "users",
  {
    id: int("id").primaryKey().autoincrement(),
    email: varchar("email", { length: 255 }).notNull(),
    studentId: text("student_id"),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    nameBn: text("name_bn"),
    role: varchar("role", { length: 255 }).notNull().default("student"), // super_admin | admin | teacher | student | parent
    classId: int("class_id"),
    sectionId: int("section_id"),
    tradeId: int("trade_id"),
    roll: varchar("roll", { length: 255 }),
    avatar: text("avatar"),
    xp: int("xp").notNull().default(0),
    level: varchar("level", { length: 255 }).notNull().default("beginner"),
    locale: varchar("locale", { length: 255 }).notNull().default("bn"),
    motionLevel: text("motion_level").notNull().default("medium"),
    /** Per-user preferences: notification toggles, teacher quiz defaults. */
    prefs: json("prefs").notNull().default({}),
    active: boolean("active").notNull().default(true),
    // pending | approved | rejected — self sign-ups wait for admin approval
    status: varchar("status", { length: 255 }).notNull().default("approved"),
    approvedBy: int("approved_by"),
    approvedAt: datetime("approved_at"),
    rejectionNote: text("rejection_note"),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    uniqueIndex("users_email_idx").on(t.email),
    index("users_role_idx").on(t.role),
    index("users_class_idx").on(t.classId),
    index("users_status_idx").on(t.status),
  ],
);

export const parentLinks = mysqlTable(
  "parent_links",
  {
    parentId: int("parent_id").notNull(),
    studentId: int("student_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.parentId, t.studentId] })],
);

export const sessionsTable = mysqlTable(
  "auth_sessions",
  {
    token: varchar("token", { length: 191 }).primaryKey(),
    userId: int("user_id").notNull(),
    expiresAt: datetime("expires_at").notNull(),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("auth_sessions_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/* Academic structure                                                  */
/* ------------------------------------------------------------------ */

export const classes = mysqlTable("classes", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  nameBn: text("name_bn"),
  level: int("level").notNull().default(6),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sections = mysqlTable(
  "sections",
  {
    id: int("id").primaryKey().autoincrement(),
    classId: int("class_id").notNull(),
    name: text("name").notNull(),
  },
  (t) => [index("sections_class_idx").on(t.classId)],
);

export const trades = mysqlTable("trades", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  nameBn: text("name_bn"),
  code: varchar("code", { length: 255 }),
});

export const subjects = mysqlTable(
  "subjects",
  {
    id: int("id").primaryKey().autoincrement(),
    name: text("name").notNull(),
    nameBn: text("name_bn"),
    classId: int("class_id"),
    tradeId: int("trade_id"),
    color: text("color").notNull().default("#2563eb"),
  },
  (t) => [index("subjects_class_idx").on(t.classId)],
);

export const chapters = mysqlTable(
  "chapters",
  {
    id: int("id").primaryKey().autoincrement(),
    subjectId: int("subject_id").notNull(),
    name: text("name").notNull(),
    nameBn: text("name_bn"),
    orderIndex: int("order_index").notNull().default(0),
  },
  (t) => [index("chapters_subject_idx").on(t.subjectId)],
);

export const topics = mysqlTable(
  "topics",
  {
    id: int("id").primaryKey().autoincrement(),
    chapterId: int("chapter_id").notNull(),
    name: text("name").notNull(),
    nameBn: text("name_bn"),
  },
  (t) => [index("topics_chapter_idx").on(t.chapterId)],
);

/* ------------------------------------------------------------------ */
/* Question bank                                                       */
/* ------------------------------------------------------------------ */

export const questions = mysqlTable(
  "questions",
  {
    id: int("id").primaryKey().autoincrement(),
    text: text("text").notNull(),
    type: varchar("type", { length: 255 }).notNull().default("mcq"),
    options: json("options").notNull().default([]),
    correct: json("correct").notNull().default([]),
    explanation: text("explanation"),
    hint: text("hint"),
    objective: text("objective"),
    difficulty: varchar("difficulty", { length: 255 }).notNull().default("medium"),
    marks: double("marks").notNull().default(1),
    // Default 30s per question; teachers can raise or lower it per question.
    timer: int("timer").notNull().default(30),
    language: varchar("language", { length: 255 }).notNull().default("bn"),
    media: json("media"),
    classId: int("class_id"),
    tradeId: int("trade_id"),
    subjectId: int("subject_id"),
    chapterId: int("chapter_id"),
    topicId: int("topic_id"),
    createdBy: int("created_by"),
    source: varchar("source", { length: 255 }).notNull().default("manual"), // manual | ai | document
    status: varchar("status", { length: 255 }).notNull().default("published"), // draft | review | published
    usedCount: int("used_count").notNull().default(0),
    qualityFlags: json("quality_flags").default([]),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    index("questions_subject_idx").on(t.subjectId),
    index("questions_class_idx").on(t.classId),
    index("questions_difficulty_idx").on(t.difficulty),
    index("questions_source_idx").on(t.source),
    index("questions_status_idx").on(t.status),
    index("questions_creator_idx").on(t.createdBy),
  ],
);

/* ------------------------------------------------------------------ */
/* Quizzes                                                             */
/* ------------------------------------------------------------------ */

export const quizzes = mysqlTable(
  "quizzes",
  {
    id: int("id").primaryKey().autoincrement(),
    title: text("title").notNull(),
    description: text("description"),
    mode: varchar("mode", { length: 255 }).notNull().default("live"), // live | exam | practice
    classId: int("class_id"),
    tradeId: int("trade_id"),
    templateId: int("template_id"),
    pdfSourceId: int("pdf_source_id"),
    settings: json("settings").notNull().default({}),
    status: varchar("status", { length: 255 }).notNull().default("draft"), // draft | published | archived
    createdBy: int("created_by"),
    scheduledAt: datetime("scheduled_at"),
    durationMinutes: int("duration_minutes").default(30),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    index("quizzes_creator_idx").on(t.createdBy),
    index("quizzes_mode_idx").on(t.mode),
    index("quizzes_status_idx").on(t.status),
    index("quizzes_pdf_source_idx").on(t.pdfSourceId),
  ],
);

export const quizSections = mysqlTable(
  "quiz_sections",
  {
    id: int("id").primaryKey().autoincrement(),
    quizId: int("quiz_id").notNull(),
    name: text("name").notNull(),
    orderIndex: int("order_index").notNull().default(0),
    settings: json("settings").notNull().default({}),
  },
  (t) => [index("quiz_sections_quiz_idx").on(t.quizId)],
);

export const quizQuestions = mysqlTable(
  "quiz_questions",
  {
    id: int("id").primaryKey().autoincrement(),
    quizId: int("quiz_id").notNull(),
    questionId: int("question_id").notNull(),
    sectionId: int("section_id"),
    orderIndex: int("order_index").notNull().default(0),
    marks: double("marks"),
    timer: int("timer"),
    settings: json("settings").notNull().default({}),
  },
  (t) => [
    index("quiz_questions_quiz_idx").on(t.quizId),
    index("quiz_questions_order_idx").on(t.quizId, t.orderIndex),
  ],
);

export const quizTemplates = mysqlTable(
  "quiz_templates",
  {
    id: int("id").primaryKey().autoincrement(),
    name: text("name").notNull(),
    category: varchar("category", { length: 255 }).notNull().default("academic"),
    config: json("config").notNull().default({}),
    visibility: varchar("visibility", { length: 255 }).notNull().default("school"), // private | school | shared
    ownerId: int("owner_id"),
    rating: double("rating").notNull().default(4.5),
    uses: int("uses").notNull().default(0),
    official: boolean("official").notNull().default(false),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("templates_category_idx").on(t.category)],
);

export const templateFavorites = mysqlTable(
  "template_favorites",
  {
    userId: int("user_id").notNull(),
    templateId: int("template_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.templateId] })],
);

export const quizPresets = mysqlTable("quiz_presets", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  settings: json("settings").notNull().default({}),
  ownerId: int("owner_id"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/* ------------------------------------------------------------------ */
/* Live sessions                                                       */
/* ------------------------------------------------------------------ */

export const quizSessions = mysqlTable(
  "quiz_sessions",
  {
    id: int("id").primaryKey().autoincrement(),
    quizId: int("quiz_id").notNull(),
    pin: varchar("pin", { length: 255 }).notNull(),
    joinKeyword: varchar("join_keyword", { length: 32 }),
    hostId: int("host_id"),
    state: varchar("state", { length: 255 }).notNull().default("lobby"),
    currentIndex: int("current_index").notNull().default(0),
    questionStartedAt: datetime("question_started_at"),
    questionEndsAt: datetime("question_ends_at"),
    pausedAt: datetime("paused_at"),
    lobbyLocked: boolean("lobby_locked").notNull().default(false),
    showLeaderboard: boolean("show_leaderboard").notNull().default(true),
    teamMode: boolean("team_mode").notNull().default(false),
    settings: json("settings").notNull().default({}),
    tournamentId: int("tournament_id"),
    version: int("version").notNull().default(0),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    endedAt: datetime("ended_at"),
  },
  (t) => [
    uniqueIndex("sessions_pin_idx").on(t.pin),
    uniqueIndex("sessions_join_keyword_idx").on(t.joinKeyword),
    index("sessions_quiz_idx").on(t.quizId),
    index("sessions_state_idx").on(t.state),
  ],
);

export const sessionTeams = mysqlTable(
  "session_teams",
  {
    id: int("id").primaryKey().autoincrement(),
    sessionId: int("session_id").notNull(),
    name: text("name").notNull(),
    color: text("color").notNull().default("#2563eb"),
    icon: text("icon").notNull().default("🚀"),
    score: double("score").notNull().default(0),
  },
  (t) => [index("session_teams_session_idx").on(t.sessionId)],
);

export const sessionPlayers = mysqlTable(
  "session_players",
  {
    id: int("id").primaryKey().autoincrement(),
    sessionId: int("session_id").notNull(),
    userId: int("user_id"),
    nickname: text("nickname").notNull(),
    studentRef: text("student_ref"),
    teamId: int("team_id"),
    score: double("score").notNull().default(0),
    streak: int("streak").notNull().default(0),
    bestStreak: int("best_streak").notNull().default(0),
    correctCount: int("correct_count").notNull().default(0),
    answeredCount: int("answered_count").notNull().default(0),
    powerUps: json("power_ups").notNull().default({}),
    connected: boolean("connected").notNull().default(true),
    removed: boolean("removed").notNull().default(false),
    lastSeen: datetime("last_seen").notNull().default(sql`CURRENT_TIMESTAMP`),
    joinedAt: datetime("joined_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    index("players_session_idx").on(t.sessionId),
    index("players_score_idx").on(t.sessionId, t.score),
  ],
);

export const playerAnswers = mysqlTable(
  "player_answers",
  {
    id: int("id").primaryKey().autoincrement(),
    sessionId: int("session_id").notNull(),
    playerId: int("player_id").notNull(),
    questionId: int("question_id").notNull(),
    questionIndex: int("question_index").notNull().default(0),
    answer: json("answer"),
    correct: boolean("correct").notNull().default(false),
    points: double("points").notNull().default(0),
    responseMs: int("response_ms").notNull().default(0),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    uniqueIndex("player_answer_unique").on(t.playerId, t.questionIndex),
    index("player_answers_session_idx").on(t.sessionId, t.questionIndex),
  ],
);

export const sessionReactions = mysqlTable(
  "session_reactions",
  {
    id: int("id").primaryKey().autoincrement(),
    sessionId: int("session_id").notNull(),
    playerId: int("player_id"),
    emoji: text("emoji").notNull(),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("reactions_session_idx").on(t.sessionId)],
);

export const quizResults = mysqlTable(
  "quiz_results",
  {
    id: int("id").primaryKey().autoincrement(),
    sessionId: int("session_id"),
    quizId: int("quiz_id").notNull(),
    userId: int("user_id"),
    playerName: text("player_name").notNull(),
    score: double("score").notNull().default(0),
    accuracy: double("accuracy").notNull().default(0),
    rank: int("rank").notNull().default(0),
    totalQuestions: int("total_questions").notNull().default(0),
    correctCount: int("correct_count").notNull().default(0),
    subjectBreakdown: json("subject_breakdown").default({}),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    index("results_quiz_idx").on(t.quizId),
    index("results_user_idx").on(t.userId),
  ],
);

/* ------------------------------------------------------------------ */
/* Exams & practice                                                    */
/* ------------------------------------------------------------------ */

export const examAttempts = mysqlTable(
  "exam_attempts",
  {
    id: int("id").primaryKey().autoincrement(),
    quizId: int("quiz_id").notNull(),
    userId: int("user_id").notNull(),
    startedAt: datetime("started_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    submittedAt: datetime("submitted_at"),
    endsAt: datetime("ends_at"),
    score: double("score").notNull().default(0),
    maxScore: double("max_score").notNull().default(0),
    status: varchar("status", { length: 255 }).notNull().default("in_progress"),
    order: json("order").notNull().default([]),
    flags: json("flags").notNull().default([]),
    mode: varchar("mode", { length: 255 }).notNull().default("exam"),
  },
  (t) => [
    index("attempts_quiz_idx").on(t.quizId),
    index("attempts_user_idx").on(t.userId),
  ],
);

export const examAnswers = mysqlTable(
  "exam_answers",
  {
    id: int("id").primaryKey().autoincrement(),
    attemptId: int("attempt_id").notNull(),
    questionId: int("question_id").notNull(),
    answer: json("answer"),
    correct: boolean("correct").notNull().default(false),
    points: double("points").notNull().default(0),
    marked: boolean("marked").notNull().default(false),
    updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [uniqueIndex("exam_answer_unique").on(t.attemptId, t.questionId)],
);

/* ------------------------------------------------------------------ */
/* Gamification                                                        */
/* ------------------------------------------------------------------ */

export const achievements = mysqlTable("achievements", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 255 }).notNull(),
  name: text("name").notNull(),
  nameBn: text("name_bn"),
  description: text("description"),
  icon: text("icon").notNull().default("🏆"),
  xp: int("xp").notNull().default(50),
  rule: json("rule").notNull().default({}),
  active: boolean("active").notNull().default(true),
});

export const studentAchievements = mysqlTable(
  "student_achievements",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").notNull(),
    achievementId: int("achievement_id").notNull(),
    earnedAt: datetime("earned_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [uniqueIndex("student_achievement_unique").on(t.userId, t.achievementId)],
);

export const tournaments = mysqlTable("tournaments", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  description: text("description"),
  stage: varchar("stage", { length: 255 }).notNull().default("class_round"),
  status: varchar("status", { length: 255 }).notNull().default("open"),
  createdBy: int("created_by"),
  config: json("config").notNull().default({}),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const tournamentEntries = mysqlTable(
  "tournament_entries",
  {
    id: int("id").primaryKey().autoincrement(),
    tournamentId: int("tournament_id").notNull(),
    userId: int("user_id"),
    playerName: text("player_name").notNull(),
    stage: varchar("stage", { length: 255 }).notNull().default("class_round"),
    score: double("score").notNull().default(0),
    qualified: boolean("qualified").notNull().default(false),
  },
  (t) => [index("tournament_entries_idx").on(t.tournamentId)],
);

export const challenges = mysqlTable("challenges", {
  id: int("id").primaryKey().autoincrement(),
  title: text("title").notNull(),
  metric: varchar("metric", { length: 255 }).notNull().default("accuracy"),
  classId: int("class_id"),
  startsAt: datetime("starts_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  endsAt: datetime("ends_at"),
  createdBy: int("created_by"),
});

export const playlists = mysqlTable("playlists", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  description: text("description"),
  quizIds: json("quiz_ids").notNull().default([]),
  createdBy: int("created_by"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const playlistProgress = mysqlTable(
  "playlist_progress",
  {
    id: int("id").primaryKey().autoincrement(),
    playlistId: int("playlist_id").notNull(),
    userId: int("user_id").notNull(),
    completedQuizIds: json("completed_quiz_ids").notNull().default([]),
    updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [uniqueIndex("playlist_progress_unique").on(t.playlistId, t.userId)],
);

/* ------------------------------------------------------------------ */
/* Feedback / reports / AI jobs / notifications / settings             */
/* ------------------------------------------------------------------ */

export const feedback = mysqlTable(
  "feedback",
  {
    id: int("id").primaryKey().autoincrement(),
    quizId: int("quiz_id").notNull(),
    sessionId: int("session_id"),
    userId: int("user_id"),
    playerName: text("player_name"),
    overall: int("overall").notNull().default(5),
    difficulty: int("difficulty").notNull().default(3),
    timerRating: int("timer_rating").notNull().default(3),
    quality: int("quality").notNull().default(5),
    engagement: int("engagement").notNull().default(5),
    comment: text("comment"),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("feedback_quiz_idx").on(t.quizId)],
);

export const questionReports = mysqlTable(
  "question_reports",
  {
    id: int("id").primaryKey().autoincrement(),
    questionId: int("question_id").notNull(),
    quizId: int("quiz_id"),
    reporterId: int("reporter_id"),
    reporterName: text("reporter_name"),
    reason: varchar("reason", { length: 255 }).notNull(),
    detail: text("detail"),
    status: varchar("status", { length: 255 }).notNull().default("open"),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("question_reports_status_idx").on(t.status)],
);

export const aiJobs = mysqlTable(
  "ai_generation_jobs",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id"),
    kind: varchar("kind", { length: 255 }).notNull().default("questions"),
    status: varchar("status", { length: 255 }).notNull().default("queued"),
    progress: int("progress").notNull().default(0),
    total: int("total").notNull().default(0),
    completed: int("completed").notNull().default(0),
    provider: varchar("provider", { length: 255 }).notNull().default("builtin"),
    params: json("params").notNull().default({}),
    validation: json("validation").default({}),
    error: text("error"),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    finishedAt: datetime("finished_at"),
  },
  (t) => [index("ai_jobs_user_idx").on(t.userId)],
);

export const aiResults = mysqlTable(
  "ai_generation_results",
  {
    id: int("id").primaryKey().autoincrement(),
    jobId: int("job_id").notNull(),
    payload: json("payload").notNull().default({}),
    flags: json("flags").notNull().default([]),
    approved: boolean("approved").notNull().default(false),
    questionId: int("question_id"),
    orderIndex: int("order_index").notNull().default(0),
  },
  (t) => [index("ai_results_job_idx").on(t.jobId)],
);

export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id"),
    audience: varchar("audience", { length: 255 }).notNull().default("user"),
    title: text("title").notNull(),
    body: text("body"),
    kind: varchar("kind", { length: 255 }).notNull().default("info"),
    link: text("link"),
    read: boolean("read").notNull().default(false),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.read)],
);

export const documents = mysqlTable(
  "documents",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id"),
    name: text("name").notNull(),
    kind: varchar("kind", { length: 255 }).notNull().default("pdf"),
    pageCount: int("page_count").notNull().default(0),
    chars: int("chars").notNull().default(0),
    method: text("method").notNull().default("pdfjs"),
    pages: json("pages").notNull().default([]),
    outline: json("outline").notNull().default([]),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("documents_user_idx").on(t.userId)],
);

export const presentations = mysqlTable(
  "presentations",
  {
    id: int("id").primaryKey().autoincrement(),
    title: text("title").notNull(),
    description: text("description"),
    theme: varchar("theme", { length: 255 }).notNull().default("aurora"),
    slides: json("slides").notNull().default([]),
    ownerId: int("owner_id"),
    visibility: varchar("visibility", { length: 255 }).notNull().default("private"),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("presentations_owner_idx").on(t.ownerId)],
);

export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 191 }).primaryKey(),
  value: json("value").notNull().default({}),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/* ------------------------------------------------------------------ */
/* Audit trail                                                        */
/* ------------------------------------------------------------------ */

export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: int("id").primaryKey().autoincrement(),
    actorId: int("actor_id"),
    action: varchar("action", { length: 255 }).notNull(),
    entity: varchar("entity", { length: 255 }).notNull(),
    entityId: int("entity_id"),
    details: json("details").notNull().default({}),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    index("audit_actor_idx").on(t.actorId),
    index("audit_entity_idx").on(t.entity, t.entityId),
    index("audit_created_idx").on(t.createdAt),
  ],
);

/* ------------------------------------------------------------------ */
/* Public memories / gallery / reviews                                 */
/* ------------------------------------------------------------------ */

export const galleryEvents = mysqlTable(
  "gallery_events",
  {
    id: int("id").primaryKey().autoincrement(),
    title: text("title").notNull(),
    caption: text("caption"),
    eventDate: datetime("event_date").notNull().default(sql`CURRENT_TIMESTAMP`),
    quizId: int("quiz_id"),
    teacherId: int("teacher_id"),
    className: text("class_name"),
    participantCount: int("participant_count").notNull().default(0),
    published: boolean("published").notNull().default(true),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("gallery_events_date_idx").on(t.eventDate), index("gallery_events_published_idx").on(t.published)],
);

export const galleryPhotos = mysqlTable(
  "gallery_photos",
  {
    id: int("id").primaryKey().autoincrement(),
    eventId: int("event_id").notNull(),
    originalPath: text("original_path"),
    optimizedPath: text("optimized_path").notNull(),
    thumbPath: text("thumb_path").notNull(),
    altText: text("alt_text"),
    width: int("width").notNull().default(0),
    height: int("height").notNull().default(0),
    bytes: int("bytes").notNull().default(0),
    sortOrder: int("sort_order").notNull().default(0),
    featured: boolean("featured").notNull().default(false),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("gallery_photos_event_idx").on(t.eventId)],
);

export const publicReviews = mysqlTable(
  "public_reviews",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    rating: int("rating").notNull().default(5),
    comment: text("comment").notNull(),
    quizId: int("quiz_id"),
    eventId: int("event_id"),
    status: varchar("status", { length: 32 }).notNull().default("pending"), // pending | approved | rejected
    featured: boolean("featured").notNull().default(false),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("public_reviews_status_idx").on(t.status), index("public_reviews_created_idx").on(t.createdAt)],
);

/* ------------------------------------------------------------------ */
/* PDF Library System                                                 */
/* ------------------------------------------------------------------ */

export const pdfLibrary = mysqlTable(
  "pdf_library",
  {
    id: int("id").primaryKey().autoincrement(),
    title: text("title").notNull(),
    originalFilename: text("original_filename").notNull(),
    storagePath: text("storage_path").notNull(),
    fileSize: int("file_size").notNull().default(0),
    mimeType: varchar("mime_type", { length: 255 }).notNull().default("application/pdf"),
    checksum: varchar("checksum", { length: 64 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 255 }),
    subjectId: int("subject_id"),
    classId: int("class_id"),
    tags: json("tags").notNull().default([]),
    status: varchar("status", { length: 255 }).notNull().default("active"), // active | inactive | archived
    pageCount: int("page_count").notNull().default(0),
    chars: int("chars").notNull().default(0),
    pages: json("pages").notNull().default([]),
    outline: json("outline").notNull().default([]),
    uploadedBy: int("uploaded_by"),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    index("pdf_checksum_idx").on(t.checksum),
    index("pdf_uploader_idx").on(t.uploadedBy),
    index("pdf_status_idx").on(t.status),
    index("pdf_class_subject_idx").on(t.classId, t.subjectId),
  ],
);

/* ------------------------------------------------------------------ */
/* Dynamic Frontend Control System                                     */
/* ------------------------------------------------------------------ */

export const frontendSections = mysqlTable(
  "frontend_sections",
  {
    id: int("id").primaryKey().autoincrement(),
    sectionKey: varchar("section_key", { length: 191 }).notNull(),
    title: text("title"),
    subtitle: text("subtitle"),
    description: text("description"),
    content: text("content"),
    icon: text("icon"),
    image: text("image"),
    link: text("link"),
    buttonText: text("button_text"),
    buttonVisible: boolean("button_visible").notNull().default(true),
    isActive: boolean("is_active").notNull().default(true),
    displayOrder: int("display_order").notNull().default(0),
    visibility: varchar("visibility", { length: 255 }).notNull().default("everyone"), // everyone | authenticated | roles
    allowedRoles: json("allowed_roles").notNull().default([]),
    startAt: datetime("start_at"),
    endAt: datetime("end_at"),
    createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    uniqueIndex("frontend_sections_key_idx").on(t.sectionKey),
    index("frontend_sections_order_idx").on(t.displayOrder),
    index("frontend_sections_active_idx").on(t.isActive),
  ],
);

