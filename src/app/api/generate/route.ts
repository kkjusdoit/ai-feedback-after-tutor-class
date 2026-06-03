import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.ANTHROPIC_BASE_URL || "https://token-plan-sgp.xiaomimimo.com/anthropic";
const API_KEY = process.env.ANTHROPIC_API_KEY || "";
const MODEL = process.env.ANTHROPIC_MODEL || "mimo-v2.5-pro";

const TONE_INSTRUCTIONS: Record<string, string> = {
  "客观具体": "语气客观、具体，用数据和事实说话，不夸大不煽情。",
  "鼓励温和": "语气鼓励、温和，多肯定进步，指出不足时委婉带建议。",
  "重点提醒": "语气直接，重点突出问题，适合需要家长配合督促的情况。",
  "简洁版": "精简到100-200字，只保留核心信息，适合快速发送。",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentName, grade, subject, knowledgePoint, performance, tone } = body;

    const toneInstruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS["客观具体"];
    const isShort = tone === "简洁版";

    const prompt = `你是一位专业的${subject}老师，刚给${grade}学生${studentName}上完一节课。

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

    const response = await fetch(`${API_BASE}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: isShort ? 512 : 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", errText);
      return NextResponse.json({ error: "AI 生成失败，请稍后重试" }, { status: 502 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    return NextResponse.json({ text });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
