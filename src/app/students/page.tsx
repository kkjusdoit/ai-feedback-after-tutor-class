"use client";

import { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { studentsApi, recordsApi, type ApiStudent, type ApiRecord } from "@/lib/api";
import { GRADE_OPTIONS, SUBJECTS } from "@/lib/data";
import { toast } from "sonner";

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<ApiStudent | null>(null);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [studentRecords, setStudentRecords] = useState<ApiRecord[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", grade: "", subject: "" });
  const [editingStudent, setEditingStudent] = useState<ApiStudent | null>(null);

  const loadStudents = useCallback(async () => {
    try {
      const list = await studentsApi.list();
      setStudents(list);
    } catch {
      toast.error("加载失败");
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    if (selectedStudent) {
      recordsApi.list({ student_id: selectedStudent.id }).then(setStudentRecords).catch(() => {});
    }
  }, [selectedStudent]);

  const filtered = searchQuery
    ? students.filter(
        (s) =>
          s.name.includes(searchQuery) ||
          s.subject.includes(searchQuery) ||
          s.grade.includes(searchQuery)
      )
    : students;

  const handleAdd = async () => {
    if (!newStudent.name.trim()) return;
    try {
      await studentsApi.create(newStudent);
      setShowAdd(false);
      setNewStudent({ name: "", grade: "", subject: "" });
      await loadStudents();
      toast.success("已添加", { duration: 1500 });
    } catch {
      toast.error("添加失败");
    }
  };

  const handleUpdate = async () => {
    if (!editingStudent) return;
    try {
      await studentsApi.update(editingStudent.id, {
        name: editingStudent.name,
        grade: editingStudent.grade,
        subject: editingStudent.subject,
      });
      setEditingStudent(null);
      await loadStudents();
      toast.success("已更新", { duration: 1500 });
    } catch {
      toast.error("更新失败");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await studentsApi.delete(id);
      await loadStudents();
      setSelectedStudent(null);
      toast.success("已删除", { duration: 1500 });
    } catch {
      toast.error("删除失败");
    }
  };

  const handleDeleteRecord = async (id: number) => {
    try {
      await recordsApi.delete(id);
      setStudentRecords((prev) => prev.filter((r) => r.id !== id));
      toast.success("已删除", { duration: 1500 });
    } catch {
      toast.error("删除失败");
    }
  };

  const getInitials = (name: string) => name.charAt(0);

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-teal/10 text-teal-dark",
      "bg-amber/10 text-amber",
      "bg-blue-100 text-blue-700",
      "bg-rose-100 text-rose-700",
      "bg-violet-100 text-violet-700",
      "bg-emerald-100 text-emerald-700",
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const gradeOpts = GRADE_OPTIONS.flatMap((g) => g.grades.map((gr) => ({ level: g.level, grade: gr })));

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 ml-[220px]">
        <header className="sticky top-0 z-30 bg-warm/80 backdrop-blur-md border-b border-border/60">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-[18px] font-semibold text-foreground">学生档案</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">管理学生信息和历史反馈记录</p>
            </div>
            <Button className="h-8 text-[13px] bg-teal hover:bg-teal-dark" onClick={() => setShowAdd(true)}>
              + 添加学生
            </Button>
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
                  placeholder="搜索学生姓名、科目或年级..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-[14px]"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-muted-foreground" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <p className="text-[14px] text-muted-foreground">
                  {searchQuery ? "没有找到匹配的学生" : "暂无学生，点击右上角添加"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((student, index) => (
                  <Card
                    key={student.id}
                    className="border-border/60 shadow-sm hover:shadow-md transition-all cursor-pointer group animate-fade-in-up"
                    style={{ animationDelay: `${index * 60}ms` }}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[18px] font-heading font-semibold ${getAvatarColor(student.name)}`}>
                          {getInitials(student.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[15px] font-semibold text-foreground mb-1">{student.name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[11px] px-1.5 py-0 h-5 font-normal">{student.subject}</Badge>
                            <Badge variant="outline" className="text-[11px] px-1.5 py-0 h-5 font-normal">{student.grade}</Badge>
                            <span className="text-[11px] text-muted-foreground">{student.feedback_count}条记录</span>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-teal" onClick={(e) => { e.stopPropagation(); setEditingStudent(student); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(student.id); }}>
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

        {/* Student Detail Dialog */}
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-[650px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 font-heading text-[16px]">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[16px] font-semibold ${getAvatarColor(selectedStudent?.name || "")}`}>
                  {getInitials(selectedStudent?.name || "")}
                </div>
                <div>
                  <span>{selectedStudent?.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[11px] px-1.5 py-0 h-4 font-normal">{selectedStudent?.subject}</Badge>
                    <Badge variant="outline" className="text-[11px] px-1.5 py-0 h-4 font-normal">{selectedStudent?.grade}</Badge>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-4 px-1">
                <div className="text-center">
                  <p className="text-[24px] font-heading font-bold text-teal">{studentRecords.length}</p>
                  <p className="text-[11px] text-muted-foreground">反馈记录</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="text-[14px] font-medium text-foreground">
                    {selectedStudent && formatDate(selectedStudent.updated_at)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">最近反馈</p>
                </div>
              </div>

              <div>
                <p className="text-[13px] font-medium text-foreground mb-3">历史反馈</p>
                {studentRecords.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground text-center py-6">暂无反馈记录</p>
                ) : (
                  <div className="space-y-3">
                    {studentRecords.map((record) => (
                      <div key={record.id} className="bg-warm-dark rounded-lg p-4 border border-border/40 group relative">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[12px] text-muted-foreground">{formatDate(record.created_at)}</span>
                          <span className="text-[12px] text-muted-foreground">{record.knowledge_point}</span>
                        </div>
                        <p className="text-[13px] leading-relaxed text-foreground line-clamp-3">{record.feedback_content}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /></svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Student Dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="font-heading text-[16px]">添加学生</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-[13px] text-muted-foreground">姓名</Label>
                <Input value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} placeholder="请输入学生姓名" className="h-9 text-[14px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] text-muted-foreground">年级</Label>
                <Select value={newStudent.grade} onValueChange={(v) => setNewStudent({ ...newStudent, grade: v || "" })}>
                  <SelectTrigger className="h-9 text-[14px]"><SelectValue placeholder="选择年级" /></SelectTrigger>
                  <SelectContent>
                    {gradeOpts.map((g) => <SelectItem key={g.grade} value={g.grade}>{g.grade}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] text-muted-foreground">科目</Label>
                <Select value={newStudent.subject} onValueChange={(v) => setNewStudent({ ...newStudent, subject: v || "" })}>
                  <SelectTrigger className="h-9 text-[14px]"><SelectValue placeholder="选择科目" /></SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" className="h-9 text-[13px]" onClick={() => setShowAdd(false)}>取消</Button>
                <Button className="h-9 text-[13px] bg-teal hover:bg-teal-dark" onClick={handleAdd}>添加</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Student Dialog */}
        <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
          <DialogContent className="max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="font-heading text-[16px]">编辑学生</DialogTitle>
            </DialogHeader>
            {editingStudent && (
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label className="text-[13px] text-muted-foreground">姓名</Label>
                  <Input value={editingStudent.name} onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })} className="h-9 text-[14px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] text-muted-foreground">年级</Label>
                  <Select value={editingStudent.grade} onValueChange={(v) => setEditingStudent({ ...editingStudent, grade: v || "" })}>
                    <SelectTrigger className="h-9 text-[14px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {gradeOpts.map((g) => <SelectItem key={g.grade} value={g.grade}>{g.grade}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] text-muted-foreground">科目</Label>
                  <Select value={editingStudent.subject} onValueChange={(v) => setEditingStudent({ ...editingStudent, subject: v || "" })}>
                    <SelectTrigger className="h-9 text-[14px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" className="h-9 text-[13px]" onClick={() => setEditingStudent(null)}>取消</Button>
                  <Button className="h-9 text-[13px] bg-teal hover:bg-teal-dark" onClick={handleUpdate}>保存</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
