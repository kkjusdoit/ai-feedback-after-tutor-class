"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TagSelector } from "@/components/tag-selector";
import type { ClassroomInfo, Performance, GradeLevel, FeedbackTone } from "@/lib/data";
import { GRADE_OPTIONS, SUBJECTS } from "@/lib/data";
import { studentsApi, type ApiStudent } from "@/lib/api";
import { toast } from "sonner";

interface FeedbackFormProps {
  onGenerate: (info: ClassroomInfo, perf: Performance) => void;
  isGenerating: boolean;
}

export function FeedbackForm({ onGenerate, isGenerating }: FeedbackFormProps) {
  const [info, setInfo] = useState<ClassroomInfo>({
    studentName: "",
    gradeLevel: "初中",
    grade: "初二",
    subject: "数学",
    knowledgePoint: "",
  });

  const [perf, setPerf] = useState<Performance>({
    mastery: "",
    classState: "",
    homework: "",
    participation: "",
    studyHabit: "",
    classOutput: "",
    tone: "",
  });

  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newName, setNewName] = useState("");

  const loadStudents = useCallback(async () => {
    try {
      const list = await studentsApi.list();
      setStudents(list);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleAddStudent = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      await studentsApi.create({ name, grade: info.grade, subject: info.subject });
      setNewName("");
      setShowAddStudent(false);
      await loadStudents();
      setInfo({ ...info, studentName: name });
      toast.success(`已添加学生「${name}」`, { duration: 1500 });
    } catch {
      toast.error("添加失败");
    }
  };

  const handleDeleteStudent = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await studentsApi.delete(id);
      await loadStudents();
      toast.success("已删除", { duration: 1500 });
    } catch {
      toast.error("删除失败");
    }
  };

  const availableGrades = info.gradeLevel
    ? GRADE_OPTIONS.find((g) => g.level === info.gradeLevel)?.grades || []
    : [];

  const canGenerate =
    info.studentName.trim() &&
    info.grade &&
    info.subject &&
    info.knowledgePoint.trim() &&
    perf.mastery &&
    perf.classState &&
    perf.homework &&
    perf.participation &&
    perf.studyHabit &&
    perf.classOutput &&
    perf.tone;

  return (
    <div className="space-y-5">
      {/* Classroom Info Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-[15px] font-heading font-semibold">
            <span className="w-6 h-6 rounded-md bg-teal/10 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-teal" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </span>
            课堂信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Student Name */}
          <div className="space-y-1.5">
            <Label className="text-[13px] text-muted-foreground">学生姓名</Label>
            <Input
              placeholder="请输入学生姓名"
              value={info.studentName}
              onChange={(e) => setInfo({ ...info, studentName: e.target.value })}
              className="h-9 text-[14px]"
            />
            {/* Quick select from DB */}
            {students.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {students.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setInfo({ ...info, studentName: s.name, grade: s.grade, subject: s.subject })}
                    className={`group relative px-2.5 py-0.5 rounded-md text-[12px] border transition-colors ${
                      info.studentName === s.name
                        ? "bg-teal/10 border-teal text-teal"
                        : "border-border text-muted-foreground hover:border-teal/50 hover:text-foreground"
                    }`}
                  >
                    {s.name}
                    <span
                      onClick={(e) => handleDeleteStudent(e, s.id)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-muted-foreground/20 text-[10px] leading-4 text-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-destructive"
                    >
                      ×
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setShowAddStudent(true)}
                  className="px-2 py-0.5 rounded-md text-[12px] border border-dashed border-border text-muted-foreground hover:border-teal/50 hover:text-teal transition-colors"
                >
                  + 添加
                </button>
              </div>
            )}
            {students.length === 0 && !showAddStudent && (
              <button
                onClick={() => setShowAddStudent(true)}
                className="text-[12px] text-teal hover:underline mt-1"
              >
                + 添加常用学生
              </button>
            )}
            {showAddStudent && (
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="输入姓名"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-7 text-[12px] flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAddStudent()}
                />
                <Button size="sm" className="h-7 text-[11px] px-2 bg-teal hover:bg-teal-dark" onClick={handleAddStudent}>确定</Button>
                <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2" onClick={() => { setShowAddStudent(false); setNewName(""); }}>取消</Button>
              </div>
            )}
          </div>

          {/* Grade Level & Grade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[13px] text-muted-foreground">学段</Label>
              <Select
                value={info.gradeLevel}
                onValueChange={(v) =>
                  setInfo({ ...info, gradeLevel: (v || "") as GradeLevel, grade: "" })
                }
              >
                <SelectTrigger className="h-9 text-[14px]">
                  <SelectValue placeholder="选择学段" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_OPTIONS.map((g) => (
                    <SelectItem key={g.level} value={g.level}>{g.level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] text-muted-foreground">年级</Label>
              <Select
                value={info.grade}
                onValueChange={(v) => setInfo({ ...info, grade: v || "" })}
                disabled={!info.gradeLevel}
              >
                <SelectTrigger className="h-9 text-[14px]">
                  <SelectValue placeholder="选择年级" />
                </SelectTrigger>
                <SelectContent>
                  {availableGrades.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label className="text-[13px] text-muted-foreground">科目</Label>
            <Select
              value={info.subject}
              onValueChange={(v) => setInfo({ ...info, subject: v || "" })}
            >
              <SelectTrigger className="h-9 text-[14px]">
                <SelectValue placeholder="选择科目" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Knowledge Point */}
          <div className="space-y-1.5">
            <Label className="text-[13px] text-muted-foreground">知识点</Label>
            <Textarea
              placeholder="例：二次函数图像与性质、牛顿第二定律"
              value={info.knowledgePoint}
              onChange={(e) =>
                setInfo({ ...info, knowledgePoint: e.target.value.slice(0, 100) })
              }
              className="min-h-[72px] text-[14px] resize-none"
            />
            <p className="text-[11px] text-muted-foreground text-right">
              {info.knowledgePoint.length}/100
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-[15px] font-heading font-semibold">
            <span className="w-6 h-6 rounded-md bg-amber/10 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-amber" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
            课堂表现
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TagSelector label="掌握情况" options={["掌握扎实", "基本掌握", "需要巩固"]} value={perf.mastery} onChange={(v) => setPerf({ ...perf, mastery: v as Performance["mastery"] })} />
          <TagSelector label="课堂状态" options={["专注积极", "状态稳定", "偶尔分神"]} value={perf.classState} onChange={(v) => setPerf({ ...perf, classState: v as Performance["classState"] })} />
          <TagSelector label="作业情况" options={["完成较好", "部分错误", "需要督促"]} value={perf.homework} onChange={(v) => setPerf({ ...perf, homework: v as Performance["homework"] })} />
          <TagSelector label="课堂参与" options={["主动回答", "跟随思路", "需要带动"]} value={perf.participation} onChange={(v) => setPerf({ ...perf, participation: v as Performance["participation"] })} />
          <TagSelector label="学习习惯" options={["步骤规范", "细节需稳", "审题需慢"]} value={perf.studyHabit} onChange={(v) => setPerf({ ...perf, studyHabit: v as Performance["studyHabit"] })} />
          <TagSelector label="课堂产出" options={["独立完成", "提示后完成", "需课后巩固"]} value={perf.classOutput} onChange={(v) => setPerf({ ...perf, classOutput: v as Performance["classOutput"] })} />
          <TagSelector label="反馈语气" options={["客观具体", "鼓励温和", "重点提醒", "简洁版"]} value={perf.tone} onChange={(v) => setPerf({ ...perf, tone: v as FeedbackTone })} />
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button
        className="w-full h-11 text-[15px] font-medium bg-teal hover:bg-teal-dark shadow-sm transition-all duration-200 disabled:opacity-50"
        disabled={!canGenerate || isGenerating}
        onClick={() => onGenerate(info, perf)}
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            AI 生成中...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
            生成课后反馈
          </span>
        )}
      </Button>
    </div>
  );
}
