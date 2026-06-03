interface Env {
  ANTHROPIC_BASE_URL: string;
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_MODEL: string;
  DEEPSEEK_BASE_URL: string;
  DEEPSEEK_API_KEY: string;
  DEEPSEEK_MODEL: string;
  ai_feedback_db: D1Database;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });

const TONE_INSTRUCTIONS: Record<string, string> = {
  "客观具体": "语气客观、具体，用数据和事实说话，不夸大不煽情。",
  "鼓励温和": "语气鼓励、温和，多肯定进步，指出不足时委婉带建议。",
  "重点提醒": "语气直接，重点突出问题，适合需要家长配合督促的情况。",
  "简洁版": "精简到100-200字，只保留核心信息，适合快速发送。",
};

function buildPrompt(params: {
  studentName: string;
  grade: string;
  subject: string;
  knowledgePoint: string;
  performance: Record<string, string>;
  tone: string;
}): string {
  const { studentName, grade, subject, knowledgePoint, performance, tone } = params;
  const toneInstruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS["客观具体"];
  const isShort = tone === "简洁版";

  return `你是一位专业的${subject}老师，刚给${grade}学生${studentName}上完一节课。

本节课知识点：${knowledgePoint}

课堂表现评估：
- 掌握情况：${performance.mastery}
- 课堂状态：${performance.classState}
- 作业情况：${performance.homework}
- 课堂参与：${performance.participation}
- 学习习惯：${performance.studyHabit}
- 课堂产出：${performance.classOutput}

请生成一条课后反馈，发送给家长。要求：

1. 结构包含：本节课学习内容 → 知识掌握情况 → 课堂表现 → 学习建议 → 鼓励性总结
2. 字数${isShort ? "100-200字" : "200-400字"}
3. 语气：${toneInstruction}
4. 像真实老师写的，有具体细节，不要空洞模板
5. 禁止出现"AI""模型""系统"等词
6. 直接输出反馈内容，不要加标题或前缀`;
}

async function tryMimo(env: Env, prompt: string, isShort: boolean): Promise<string | null> {
  try {
    const resp = await fetch(`${env.ANTHROPIC_BASE_URL}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL,
        max_tokens: isShort ? 512 : 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json<{ content?: { text?: string }[] }>();
    return data.content?.[0]?.text || null;
  } catch {
    return null;
  }
}

async function tryDeepSeek(env: Env, prompt: string, isShort: boolean): Promise<string | null> {
  try {
    const resp = await fetch(`${env.DEEPSEEK_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.DEEPSEEK_MODEL,
        max_tokens: isShort ? 512 : 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json<{ choices?: { message?: { content?: string } }[] }>();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const path = url.pathname;
    const db = env.ai_feedback_db;

    try {
      // ========== AI Generate ==========
      if (path === "/api/generate" && request.method === "POST") {
        const body = await request.json<{
          studentName: string;
          grade: string;
          subject: string;
          knowledgePoint: string;
          performance: Record<string, string>;
          tone: string;
        }>();

        const { tone } = body;
        const isShort = tone === "简洁版";
        const prompt = buildPrompt(body);

        // Try mimo first
        let text = await tryMimo(env, prompt, isShort);

        // Fallback to DeepSeek
        if (!text) {
          text = await tryDeepSeek(env, prompt, isShort);
        }

        // Both failed - return prompt for manual copy
        if (!text) {
          return json({ text: "", prompt, fallback: true });
        }

        return json({ text, fallback: false });
      }

      // ========== Students CRUD ==========
      if (path === "/api/students") {
        if (request.method === "GET") {
          const rows = await db.prepare(
            "SELECT s.*, (SELECT COUNT(*) FROM feedback_records WHERE student_id = s.id) as feedback_count FROM students s ORDER BY updated_at DESC"
          ).all();
          return json(rows.results);
        }
        if (request.method === "POST") {
          const body = await request.json<{ name: string; grade: string; subject: string }>();
          const result = await db.prepare(
            "INSERT INTO students (name, grade, subject) VALUES (?, ?, ?)"
          ).bind(body.name, body.grade, body.subject).run();
          return json({ id: result.meta.last_row_id, ...body }, 201);
        }
      }

      if (path.match(/^\/api\/students\/\d+$/)) {
        const id = path.split("/").pop()!;

        if (request.method === "PUT") {
          const body = await request.json<{ name?: string; grade?: string; subject?: string }>();
          const sets: string[] = [];
          const vals: string[] = [];
          if (body.name) { sets.push("name = ?"); vals.push(body.name); }
          if (body.grade) { sets.push("grade = ?"); vals.push(body.grade); }
          if (body.subject) { sets.push("subject = ?"); vals.push(body.subject); }
          sets.push("updated_at = datetime('now')");
          vals.push(id);
          await db.prepare(`UPDATE students SET ${sets.join(", ")} WHERE id = ?`).bind(...vals).run();
          return json({ ok: true });
        }

        if (request.method === "DELETE") {
          await db.prepare("DELETE FROM feedback_records WHERE student_id = ?").bind(id).run();
          await db.prepare("DELETE FROM students WHERE id = ?").bind(id).run();
          return json({ ok: true });
        }
      }

      // ========== Feedback Records CRUD ==========
      if (path === "/api/records") {
        if (request.method === "GET") {
          const q = url.searchParams.get("q") || "";
          const studentId = url.searchParams.get("student_id");
          let stmt;
          if (studentId) {
            stmt = db.prepare("SELECT * FROM feedback_records WHERE student_id = ? ORDER BY created_at DESC").bind(studentId);
          } else if (q) {
            stmt = db.prepare("SELECT * FROM feedback_records WHERE student_name LIKE ? OR subject LIKE ? OR knowledge_point LIKE ? ORDER BY created_at DESC")
              .bind(`%${q}%`, `%${q}%`, `%${q}%`);
          } else {
            stmt = db.prepare("SELECT * FROM feedback_records ORDER BY created_at DESC");
          }
          const rows = await stmt.all();
          return json(rows.results);
        }

        if (request.method === "POST") {
          const body = await request.json<{
            student_id?: number;
            student_name: string;
            grade: string;
            subject: string;
            knowledge_point: string;
            feedback_content: string;
          }>();
          const result = await db.prepare(
            "INSERT INTO feedback_records (student_id, student_name, grade, subject, knowledge_point, feedback_content) VALUES (?, ?, ?, ?, ?, ?)"
          ).bind(body.student_id || null, body.student_name, body.grade, body.subject, body.knowledge_point, body.feedback_content).run();
          return json({ id: result.meta.last_row_id, ...body }, 201);
        }
      }

      if (path.match(/^\/api\/records\/\d+$/)) {
        const id = path.split("/").pop()!;

        if (request.method === "PUT") {
          const body = await request.json<{ feedback_content?: string; knowledge_point?: string }>();
          const sets: string[] = [];
          const vals: string[] = [];
          if (body.feedback_content) { sets.push("feedback_content = ?"); vals.push(body.feedback_content); }
          if (body.knowledge_point) { sets.push("knowledge_point = ?"); vals.push(body.knowledge_point); }
          if (sets.length === 0) return json({ ok: true });
          vals.push(id);
          await db.prepare(`UPDATE feedback_records SET ${sets.join(", ")} WHERE id = ?`).bind(...vals).run();
          return json({ ok: true });
        }

        if (request.method === "DELETE") {
          await db.prepare("DELETE FROM feedback_records WHERE id = ?").bind(id).run();
          return json({ ok: true });
        }
      }

      return json({ error: "Not Found" }, 404);
    } catch (err) {
      console.error(err);
      return json({ error: "Internal Server Error" }, 500);
    }
  },
};
