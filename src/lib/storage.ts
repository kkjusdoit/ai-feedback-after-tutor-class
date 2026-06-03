import type { FeedbackRecord, Student } from "./data";

const HISTORY_KEY = "ai-feedback-history";
const STUDENTS_KEY = "ai-feedback-students";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- History ---

export function getHistory(): FeedbackRecord[] {
  return readJSON<FeedbackRecord[]>(HISTORY_KEY, []);
}

export function addHistory(record: FeedbackRecord) {
  const list = getHistory();
  list.unshift(record);
  writeJSON(HISTORY_KEY, list);
  syncStudentsFromHistory(list);
}

export function deleteHistory(id: string) {
  const list = getHistory().filter((r) => r.id !== id);
  writeJSON(HISTORY_KEY, list);
  syncStudentsFromHistory(list);
}

// --- Students ---

export function getStudents(): Student[] {
  return readJSON<Student[]>(STUDENTS_KEY, []);
}

function syncStudentsFromHistory(records: FeedbackRecord[]) {
  const map = new Map<string, Student>();

  for (const r of records) {
    const key = `${r.studentName}-${r.grade}-${r.subject}`;
    const existing = map.get(key);
    if (existing) {
      existing.feedbackCount++;
      if (r.createdAt > existing.lastFeedbackAt) {
        existing.lastFeedbackAt = r.createdAt;
      }
    } else {
      map.set(key, {
        id: key,
        name: r.studentName,
        grade: r.grade,
        subject: r.subject,
        feedbackCount: 1,
        lastFeedbackAt: r.createdAt,
      });
    }
  }

  writeJSON(STUDENTS_KEY, Array.from(map.values()));
}
