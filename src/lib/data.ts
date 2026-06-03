export type GradeLevel = "小学" | "初中" | "高中";

export interface GradeOption {
  level: GradeLevel;
  grades: string[];
}

export const GRADE_OPTIONS: GradeOption[] = [
  { level: "小学", grades: ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"] },
  { level: "初中", grades: ["初一", "初二", "初三"] },
  { level: "高中", grades: ["高一", "高二", "高三"] },
];

export const SUBJECTS = ["数学", "语文", "英语", "物理", "化学", "生物", "历史", "地理", "政治"] as const;

export type MasteryLevel = "掌握扎实" | "基本掌握" | "需要巩固";
export type ClassState = "专注积极" | "状态稳定" | "偶尔分神";
export type HomeworkStatus = "完成较好" | "部分错误" | "需要督促";
export type Participation = "主动回答" | "跟随思路" | "需要带动";
export type StudyHabit = "步骤规范" | "细节需稳" | "审题需慢";
export type ClassOutput = "独立完成" | "提示后完成" | "需课后巩固";
export type FeedbackTone = "客观具体" | "鼓励温和" | "重点提醒" | "简洁版";

export interface ClassroomInfo {
  studentName: string;
  gradeLevel: GradeLevel | "";
  grade: string;
  subject: string;
  knowledgePoint: string;
}

export interface Performance {
  mastery: MasteryLevel | "";
  classState: ClassState | "";
  homework: HomeworkStatus | "";
  participation: Participation | "";
  studyHabit: StudyHabit | "";
  classOutput: ClassOutput | "";
  tone: FeedbackTone | "";
}

export interface FeedbackRecord {
  id: string;
  studentName: string;
  grade: string;
  subject: string;
  knowledgePoint: string;
  feedbackContent: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  subject: string;
  feedbackCount: number;
  lastFeedbackAt: string;
}

// Mock data store
let mockStudents: Student[] = [
  { id: "1", name: "张三", grade: "初一", subject: "数学", feedbackCount: 3, lastFeedbackAt: "2026-05-20T10:00:00Z" },
  { id: "2", name: "李四", grade: "五年级", subject: "英语", feedbackCount: 2, lastFeedbackAt: "2026-05-18T14:00:00Z" },
  { id: "3", name: "王五", grade: "高一", subject: "物理", feedbackCount: 1, lastFeedbackAt: "2026-05-15T09:00:00Z" },
];

let mockRecords: FeedbackRecord[] = [
  {
    id: "1",
    studentName: "张三",
    grade: "初一",
    subject: "数学",
    knowledgePoint: "二次函数图像与性质",
    feedbackContent: "张三同学，今天我们一起学习了二次函数的图像与性质。通过课堂练习来看，你对抛物线的开口方向、顶点坐标这些基础概念已经有了不错的理解，做题时思路也比较清晰。\n\n课堂上你听讲比较专注，遇到不太确定的地方会主动举手提问，这点很好。作业完成情况总体不错，最后一道关于对称轴的应用题做得特别漂亮，说明你已经能把学到的知识用起来了。\n\n建议接下来多练习一些含参数的二次函数问题，这类题目变化比较多，多做几道就能找到感觉。另外画图的时候注意标注关键点，养成好习惯。\n\n总的来说这节课表现不错，继续保持这种学习状态，下次课我们学习二次函数与一元二次方程的关系，加油！",
    createdAt: "2026-06-02T14:30:00Z",
  },
  {
    id: "2",
    studentName: "李四",
    grade: "五年级",
    subject: "英语",
    knowledgePoint: "一般过去时态专项训练",
    feedbackContent: "李四家长您好，今天英语课主要复习了一般过去时态。李四对规则动词的过去式变化掌握得不错，像 played、watched 这些都能准确拼写。不过不规则动词这块还需要加强，特别是 go-went、eat-ate 这类高频词，建议每天花5分钟记几个。\n\n课堂上李四的状态比较稳定，跟着进度走，朗读环节声音可以再大一些。作业里选择题全对，填空题有两处时态混用，已经当面纠正过了。\n\n建议这周把课本第36页的不规则动词表过一遍，重点记前20个。下周我们会做时态综合练习，提前准备一下会更从容。",
    createdAt: "2026-06-01T16:00:00Z",
  },
  {
    id: "3",
    studentName: "王五",
    grade: "高一",
    subject: "物理",
    knowledgePoint: "牛顿第二定律应用",
    feedbackContent: "王五同学今天学习了牛顿第二定律的应用，整体表现非常好。在受力分析环节，你能够准确画出力的示意图，F=ma 的代入计算也很熟练，几道典型例题都做对了。\n\n课堂上你很积极，主动上台演示了解题过程，思路清晰、步骤规范。特别是在连接体问题中，你能灵活运用整体法和隔离法，这在高一阶段是很难得的。\n\n建议可以适当拓展一下变力作用下的运动分析，这是后续动量定理的基础。另外计算时注意单位换算的准确性，今天有一道题因为单位没统一导致结果偏差。\n\n期待下次课的表现！",
    createdAt: "2026-05-30T11:00:00Z",
  },
];

export function getStudents(): Student[] {
  return mockStudents;
}

export function addStudent(student: Omit<Student, "id" | "feedbackCount" | "lastFeedbackAt">): Student {
  const existing = mockStudents.find(
    (s) => s.name === student.name && s.subject === student.subject
  );
  if (existing) return existing;

  const newStudent: Student = {
    ...student,
    id: String(Date.now()),
    feedbackCount: 1,
    lastFeedbackAt: new Date().toISOString(),
  };
  mockStudents = [newStudent, ...mockStudents];
  return newStudent;
}

export function getRecords(): FeedbackRecord[] {
  return mockRecords;
}

export function addRecord(record: Omit<FeedbackRecord, "id" | "createdAt">): FeedbackRecord {
  const newRecord: FeedbackRecord = {
    ...record,
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
  };
  mockRecords = [newRecord, ...mockRecords];
  return newRecord;
}

export function deleteRecord(id: string): void {
  mockRecords = mockRecords.filter((r) => r.id !== id);
}

export function searchRecords(query: string): FeedbackRecord[] {
  const q = query.toLowerCase();
  return mockRecords.filter(
    (r) =>
      r.studentName.toLowerCase().includes(q) ||
      r.subject.toLowerCase().includes(q) ||
      r.knowledgePoint.toLowerCase().includes(q)
  );
}
