"use client";

import { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { recordsApi, type ApiRecord } from "@/lib/api";
import { toast } from "sonner";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<ApiRecord | null>(null);
  const [records, setRecords] = useState<ApiRecord[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const loadRecords = useCallback(async () => {
    try {
      const list = await recordsApi.list({ q: searchQuery || undefined });
      setRecords(list);
    } catch {
      toast.error("加载失败");
    }
  }, [searchQuery]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleDelete = async (id: number) => {
    try {
      await recordsApi.delete(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      toast.success("已删除记录", { duration: 1500 });
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch {
      toast.error("删除失败");
    }
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await recordsApi.update(id, { feedback_content: editContent });
      setRecords((prev) => prev.map((r) => r.id === id ? { ...r, feedback_content: editContent } : r));
      setEditingId(null);
      toast.success("已保存", { duration: 1500 });
      if (selectedRecord?.id === id) setSelectedRecord({ ...selectedRecord, feedback_content: editContent });
    } catch {
      toast.error("保存失败");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success("已复制到剪贴板", { duration: 1500 });
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    const time = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    if (diffDays === 0) return `今天 ${time}`;
    if (diffDays === 1) return `昨天 ${time}`;
    if (diffDays < 7) return `${diffDays}天前`;
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 ml-[220px]">
        <header className="sticky top-0 z-30 bg-warm/80 backdrop-blur-md border-b border-border/60">
          <div className="px-8 py-4">
            <h2 className="font-heading text-[18px] font-semibold text-foreground">历史记录</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">查看和管理已生成的课后反馈</p>
          </div>
        </header>

        <div className="p-8">
          <div className="max-w-[800px] mx-auto">
            <div className="mb-6">
              <div className="relative">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <Input
                  placeholder="搜索学生姓名、科目或知识点..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-[14px]"
                />
              </div>
            </div>

            {records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-muted-foreground" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                  </svg>
                </div>
                <p className="text-[14px] text-muted-foreground">
                  {searchQuery ? "没有找到匹配的记录" : "暂无历史记录，去生成第一条反馈吧"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((record, index) => (
                  <Card
                    key={record.id}
                    className="border-border/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer group animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setSelectedRecord(record)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[15px] font-semibold text-foreground">{record.student_name}</span>
                            <Badge variant="secondary" className="text-[11px] px-1.5 py-0 h-5 font-normal">{record.subject}</Badge>
                            <Badge variant="outline" className="text-[11px] px-1.5 py-0 h-5 font-normal">{record.grade}</Badge>
                          </div>
                          <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed">{record.knowledge_point}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[12px] text-muted-foreground">{formatDate(record.created_at)}</span>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-teal" onClick={(e) => { e.stopPropagation(); handleCopy(record.feedback_content); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Dialog */}
        <Dialog open={!!selectedRecord} onOpenChange={() => { setSelectedRecord(null); setEditingId(null); }}>
          <DialogContent className="max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-heading text-[16px]">
                <span>{selectedRecord?.student_name}</span>
                <Badge variant="secondary" className="text-[12px]">{selectedRecord?.subject}</Badge>
                <Badge variant="outline" className="text-[12px]">{selectedRecord?.grade}</Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-[12px] text-muted-foreground mb-1">知识点</p>
                <p className="text-[14px]">{selectedRecord?.knowledge_point}</p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground mb-1">生成时间</p>
                <p className="text-[14px]">{selectedRecord && new Date(selectedRecord.created_at).toLocaleString("zh-CN")}</p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground mb-1">反馈内容</p>
                {editingId === selectedRecord?.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[160px] text-[14px] leading-[1.9] resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" className="h-7 text-[12px] bg-teal hover:bg-teal-dark" onClick={() => handleSaveEdit(selectedRecord!.id)}>保存</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-[12px]" onClick={() => setEditingId(null)}>取消</Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-warm-dark rounded-xl p-4 border border-border/40">
                    <p className="text-[14px] leading-[1.9] whitespace-pre-wrap">{selectedRecord?.feedback_content}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" size="sm" className="h-8 text-[13px]" onClick={() => handleCopy(selectedRecord?.feedback_content || "")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                  复制
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-[13px]" onClick={() => { setEditingId(selectedRecord!.id); setEditContent(selectedRecord!.feedback_content); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                  编辑
                </Button>
                <Button variant="destructive" size="sm" className="h-8 text-[13px]" onClick={() => handleDelete(selectedRecord!.id)}>删除</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
