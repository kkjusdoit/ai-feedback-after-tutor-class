"use client";

import { useState, useCallback } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { FeedbackForm } from "@/components/feedback-form";
import { FeedbackDisplay } from "@/components/feedback-display";
import { recordsApi, generateFeedback } from "@/lib/api";
import type { ClassroomInfo, Performance } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function HomePage() {
  const [feedback, setFeedback] = useState("");
  const [fallbackPrompt, setFallbackPrompt] = useState("");
  const [currentInfo, setCurrentInfo] = useState<ClassroomInfo | null>(null);
  const [currentPerf, setCurrentPerf] = useState<Performance | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleResult = useCallback(async (result: Awaited<ReturnType<typeof generateFeedback>>, info: ClassroomInfo) => {
    if (result.fallback) {
      setFallbackPrompt(result.prompt);
      setFeedback("");
      toast.warning("AI 服务暂时不可用，已为你准备 Prompt，可复制到任意 AI 工具生成", { duration: 4000 });
    } else {
      setFeedback(result.text);
      setFallbackPrompt("");
      await recordsApi.create({
        student_name: info.studentName,
        grade: info.grade,
        subject: info.subject,
        knowledge_point: info.knowledgePoint,
        feedback_content: result.text,
      });
    }
  }, []);

  const handleGenerate = useCallback(async (info: ClassroomInfo, perf: Performance) => {
    setIsGenerating(true);
    setCurrentInfo(info);
    setCurrentPerf(perf);

    try {
      const result = await generateFeedback({
        studentName: info.studentName,
        grade: info.grade,
        subject: info.subject,
        knowledgePoint: info.knowledgePoint,
        performance: perf as unknown as Record<string, string>,
        tone: perf.tone,
      });
      await handleResult(result, info);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "请求失败，请检查网络");
    } finally {
      setIsGenerating(false);
    }
  }, [handleResult]);

  const handleRegenerate = useCallback(async () => {
    if (!currentInfo || !currentPerf) return;
    setIsGenerating(true);

    try {
      const result = await generateFeedback({
        studentName: currentInfo.studentName,
        grade: currentInfo.grade,
        subject: currentInfo.subject,
        knowledgePoint: currentInfo.knowledgePoint,
        performance: currentPerf as unknown as Record<string, string>,
        tone: currentPerf.tone,
      });
      await handleResult(result, currentInfo);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "请求失败，请检查网络");
    } finally {
      setIsGenerating(false);
    }
  }, [currentInfo, currentPerf, handleResult]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(fallbackPrompt).then(() => {
      toast.success("Prompt 已复制，粘贴到任意 AI 工具即可生成", { duration: 3000 });
    });
  };

  const handleSaveManual = async () => {
    if (!currentInfo) return;
    const content = prompt("请粘贴 AI 生成的反馈内容：");
    if (!content?.trim()) return;
    setFeedback(content.trim());
    setFallbackPrompt("");
    await recordsApi.create({
      student_name: currentInfo.studentName,
      grade: currentInfo.grade,
      subject: currentInfo.subject,
      knowledge_point: currentInfo.knowledgePoint,
      feedback_content: content.trim(),
    });
    toast.success("已保存", { duration: 1500 });
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 ml-[220px]">
        <header className="sticky top-0 z-30 bg-warm/80 backdrop-blur-md border-b border-border/60">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-[18px] font-semibold text-foreground">生成课后反馈</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">填写课堂信息，AI 即可生成专业反馈</p>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              AI 就绪
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="max-w-[960px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
              <div className="sticky top-[85px]">
                <FeedbackForm onGenerate={handleGenerate} isGenerating={isGenerating} />
              </div>

              <div>
                {feedback ? (
                  <FeedbackDisplay
                    content={feedback}
                    studentName={currentInfo?.studentName || ""}
                    onRegenerate={handleRegenerate}
                    isGenerating={isGenerating}
                  />
                ) : fallbackPrompt ? (
                  /* Fallback: copy prompt */
                  <div className="animate-fade-in-up">
                    <div className="bg-amber-light/50 border border-amber/30 rounded-xl p-5 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber/15 flex items-center justify-center shrink-0 mt-0.5">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-amber" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                            <path d="M12 9v4" /><path d="M12 17h.01" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-foreground">AI 服务暂时不可用</p>
                          <p className="text-[13px] text-muted-foreground mt-1">已为你准备好 Prompt，可以复制到 ChatGPT / DeepSeek / Kimi 等任意 AI 工具中生成反馈</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-warm-dark rounded-xl p-4 border border-border/40 mb-4">
                      <pre className="text-[13px] leading-relaxed whitespace-pre-wrap text-foreground font-sans max-h-[300px] overflow-y-auto">{fallbackPrompt}</pre>
                    </div>

                    <div className="flex gap-3">
                      <Button className="h-9 text-[13px] bg-teal hover:bg-teal-dark" onClick={handleCopyPrompt}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                        复制 Prompt
                      </Button>
                      <Button variant="outline" className="h-9 text-[13px]" onClick={handleSaveManual}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        粘贴生成结果
                      </Button>
                      <Button variant="ghost" className="h-9 text-[13px]" onClick={handleRegenerate}>
                        重试 AI 生成
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-teal-light/50 flex items-center justify-center mb-5">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-teal" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
                      </svg>
                    </div>
                    <h3 className="font-heading text-[16px] font-semibold text-foreground mb-2">等待生成反馈</h3>
                    <p className="text-[13px] text-muted-foreground max-w-[260px] leading-relaxed">
                      填写左侧课堂信息后，点击「生成课后反馈」按钮，AI 将为你生成专业的反馈内容
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
