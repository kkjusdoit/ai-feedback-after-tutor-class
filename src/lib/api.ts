import { API_BASE } from "./config";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "请求失败" }));
    throw new Error(err.error || "请求失败");
  }
  return res.json();
}

// ---- Students ----

export interface ApiStudent {
  id: number;
  name: string;
  grade: string;
  subject: string;
  feedback_count: number;
  created_at: string;
  updated_at: string;
}

export const studentsApi = {
  list: () => request<ApiStudent[]>("/api/students"),
  create: (data: { name: string; grade: string; subject: string }) =>
    request<ApiStudent>("/api/students", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: { name?: string; grade?: string; subject?: string }) =>
    request<{ ok: boolean }>(`/api/students/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<{ ok: boolean }>(`/api/students/${id}`, { method: "DELETE" }),
};

// ---- Feedback Records ----

export interface ApiRecord {
  id: number;
  student_id: number | null;
  student_name: string;
  grade: string;
  subject: string;
  knowledge_point: string;
  feedback_content: string;
  created_at: string;
}

export const recordsApi = {
  list: (params?: { q?: string; student_id?: number }) => {
    const sp = new URLSearchParams();
    if (params?.q) sp.set("q", params.q);
    if (params?.student_id) sp.set("student_id", String(params.student_id));
    const qs = sp.toString();
    return request<ApiRecord[]>(`/api/records${qs ? `?${qs}` : ""}`);
  },
  create: (data: {
    student_id?: number;
    student_name: string;
    grade: string;
    subject: string;
    knowledge_point: string;
    feedback_content: string;
  }) => request<ApiRecord>("/api/records", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: { feedback_content?: string; knowledge_point?: string }) =>
    request<{ ok: boolean }>(`/api/records/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<{ ok: boolean }>(`/api/records/${id}`, { method: "DELETE" }),
};

// ---- AI Generate ----

export interface GenerateResult {
  text: string;
  prompt: string;
  fallback: boolean;
}

export async function generateFeedback(params: {
  studentName: string;
  grade: string;
  subject: string;
  knowledgePoint: string;
  performance: Record<string, unknown>;
  tone: string;
}): Promise<GenerateResult> {
  return request<GenerateResult>("/api/generate", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
