"use client";

import { useState, useCallback } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { FeedbackForm } from "@/components/feedback-form";
import { FeedbackDisplay } from "@/components/feedback-display";
import { recordsApi, generateFeedback } from "@/lib/api";
import type { ClassroomInfo, Performance } from "@/lib/data";
import { toast } from "sonner";

export default function HomePage() {
  const [feedback, setFeedback] = useState("");
  const [currentInfo, setCurrentInfo] = useState<ClassroomInfo | null>(null);
  const [currentPerf, setCurrentPerf] = useState<Performance | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
      setFeedback(result);

      await recordsApi.create({
        student_name: info.studentName,
        grade: info.grade,
        subject: info.subject,
        knowledge_point: info.knowledgePoint,
        feedback_content: result,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "AI 生成失败，请稍后重试");
    } finally {
      setIsGenerating(false);
    }
  }, []);

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
      setFeedback(result);

      await recordsApi.create({
        student_name: currentInfo.studentName,
        grade: currentInfo.grade,
        subject: currentInfo.subject,
        knowledge_point: currentInfo.knowledgePoint,
        feedback_content: result,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "AI 生成失败，请稍后重试");
    } finally {
      setIsGenerating(false);
    }
  }, [currentInfo, currentPerf]);

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
