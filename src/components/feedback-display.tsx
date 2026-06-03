"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface FeedbackDisplayProps {
  content: string;
  studentName: string;
  onRegenerate: () => void;
  isGenerating: boolean;
}

export function FeedbackDisplay({
  content,
  studentName,
  onRegenerate,
  isGenerating,
}: FeedbackDisplayProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [finalText, setFinalText] = useState("");
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!content) return;

    setDisplayedText("");
    setIsTyping(true);
    setIsEditing(false);
    setFinalText(content);
    indexRef.current = 0;

    const chars = content.split("");
    const speed = 12; // ms per character

    const typeNext = () => {
      if (indexRef.current < chars.length) {
        setDisplayedText(chars.slice(0, indexRef.current + 1).join(""));
        indexRef.current++;
        typingRef.current = setTimeout(typeNext, speed);
      } else {
        setIsTyping(false);
      }
    };

    typingRef.current = setTimeout(typeNext, 300);

    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [content]);

  const handleCopy = () => {
    const textToCopy = finalText || content;
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success("已复制到剪贴板", {
        description: "可以直接粘贴发送给家长",
        duration: 2000,
      });
    });
  };

  const handleEdit = () => {
    setEditText(finalText || content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setFinalText(editText);
    setDisplayedText(editText);
    setIsEditing(false);
    setIsTyping(false);
    toast.success("已保存修改", { duration: 1500 });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const displayContent = finalText || content;

  if (!content) return null;

  return (
    <Card className="border-border/60 shadow-sm animate-fade-in-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[15px] font-heading font-semibold">
            <span className="w-6 h-6 rounded-md bg-teal/10 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-teal" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            生成结果
            {isTyping && (
              <span className="text-[12px] text-teal font-normal ml-2 animate-pulse">
                生成中...
              </span>
            )}
          </CardTitle>
          {!isTyping && !isEditing && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 px-3 text-[13px] text-muted-foreground hover:text-foreground hover:bg-teal-light/40"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                复制
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 px-3 text-[13px] text-muted-foreground hover:text-foreground hover:bg-amber-light/40"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                编辑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
                disabled={isGenerating}
                className="h-8 px-3 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
                换一种说法
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[240px] text-[14px] leading-relaxed resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={handleCancelEdit} className="h-8 text-[13px]">
                取消
              </Button>
              <Button size="sm" onClick={handleSaveEdit} className="h-8 text-[13px] bg-teal hover:bg-teal-dark">
                保存
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="bg-warm-dark rounded-xl p-5 border border-border/40">
              <p className="text-[14px] leading-[1.9] text-foreground whitespace-pre-wrap">
                {isTyping ? (
                  <span>
                    {displayedText}
                    <span className="typing-cursor" />
                  </span>
                ) : (
                  displayContent
                )}
              </p>
            </div>
            {!isTyping && (
              <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                约 {displayContent.length} 字
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
