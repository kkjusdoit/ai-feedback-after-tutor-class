import type { ClassroomInfo, Performance } from "./data";

const MASTERY_MAP: Record<string, string[]> = {
  "掌握扎实": ["理解到位", "掌握得很好", "基础扎实", "运用自如"],
  "基本掌握": ["有了不错的理解", "基本掌握了", "大致掌握了", "理解得还行"],
  "需要巩固": ["还需要多练习", "理解还不够深入", "需要再巩固一下", "还不够熟练"],
};

const STATE_MAP: Record<string, string[]> = {
  "专注积极": ["听讲非常专注", "状态很好，全程投入", "注意力很集中", "上课很认真"],
  "状态稳定": ["状态比较稳定", "整体表现平稳", "跟着进度走", "上课状态还行"],
  "偶尔分神": ["偶尔会走神", "注意力还需要再集中一些", "有时会分心", "专注度可以再提高"],
};

const HOMEWORK_MAP: Record<string, string[]> = {
  "完成较好": ["作业完成得不错", "练习题做得挺好的", "作业正确率很高", "做题质量不错"],
  "部分错误": ["有几处需要纠正", "个别题目还需要再想想", "有些小错误", "作业有一些瑕疵"],
  "需要督促": ["作业完成度需要提高", "练习还需要加强", "作业这块需要多上心", "做题量还不够"],
};

const PARTICIPATION_MAP: Record<string, string[]> = {
  "主动回答": ["积极举手回答问题", "主动参与课堂互动", "回答问题很积极", "课堂上很活跃"],
  "跟随思路": ["跟着老师的思路走", "认真听讲做笔记", "基本能跟上节奏", "课堂参与度还可以"],
  "需要带动": ["需要老师多引导", "课堂上比较安静", "可以更主动一些", "回答问题时需要多鼓励"],
};

const HABIT_MAP: Record<string, string[]> = {
  "步骤规范": ["解题步骤很规范", "做题习惯很好", "书写工整，步骤清晰", "学习习惯不错"],
  "细节需稳": ["细节上还需要再稳一些", "有时候会粗心", "小细节需要注意", "准确率可以再提高"],
  "审题需慢": ["审题可以再仔细一些", "做题前先看清楚题目", "需要多花点时间审题", "读题要更仔细"],
};

const OUTPUT_MAP: Record<string, string[]> = {
  "独立完成": ["能够独立完成练习", "做题时不需要帮助", "自主解题能力不错", "独立思考能力很好"],
  "提示后完成": ["提示一下就能做出来", "给点引导就能完成", "思路打通后做得不错", "稍微点拨一下就明白了"],
  "需课后巩固": ["课后需要多加练习", "还需要回去再消化一下", "建议课后多做几道题巩固", "课下要多花时间"],
};

const SUGGESTIONS: Record<string, string[]> = {
  "掌握扎实": [
    "可以适当挑战一些更有难度的题目，拓展思维",
    "建议做一些综合题，把知识点串联起来",
    "基础已经很扎实了，可以尝试拔高训练",
  ],
  "基本掌握": [
    "建议把今天的内容再复习一遍，巩固一下",
    "多做几道类似的练习题加深理解",
    "有不清楚的地方及时问，别积攒问题",
  ],
  "需要巩固": [
    "建议今天回去把课本上的例题重新做一遍",
    "需要多花时间在基础上，不要急着做难题",
    "可以先从基础题开始，一步步来",
  ],
};

const ENCOURAGEMENTS: Record<string, string[]> = {
  "掌握扎实": [
    "继续保持这种学习状态，你很棒！",
    "表现非常出色，期待你更好的发挥！",
    "学得很扎实，加油！",
  ],
  "基本掌握": [
    "整体表现不错，继续努力！",
    "已经很好了，再加把劲！",
    "进步很明显，继续保持！",
  ],
  "需要巩固": [
    "不要着急，慢慢来，老师相信你可以的！",
    "遇到困难很正常，坚持下去一定会有进步！",
    "一步一步来，老师会陪着你一起努力！",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getClosestMastery(tone: string): string {
  if (tone === "简洁版") return "基本掌握";
  return "基本掌握";
}

export function generateFeedback(
  info: ClassroomInfo,
  perf: Performance
): string {
  const { studentName, knowledgePoint, subject } = info;
  const {
    mastery = "基本掌握",
    classState = "状态稳定",
    homework = "完成较好",
    participation = "跟随思路",
    studyHabit = "步骤规范",
    classOutput = "独立完成",
    tone = "客观具体",
  } = perf;

  const m = pick(MASTERY_MAP[mastery] || MASTERY_MAP["基本掌握"]);
  const s = pick(STATE_MAP[classState] || STATE_MAP["状态稳定"]);
  const h = pick(HOMEWORK_MAP[homework] || HOMEWORK_MAP["完成较好"]);
  const p = pick(PARTICIPATION_MAP[participation] || PARTICIPATION_MAP["跟随思路"]);
  const hab = pick(HABIT_MAP[studyHabit] || HABIT_MAP["步骤规范"]);
  const o = pick(OUTPUT_MAP[classOutput] || OUTPUT_MAP["独立完成"]);
  const sug = pick(SUGGESTIONS[mastery] || SUGGESTIONS["基本掌握"]);
  const enc = pick(ENCOURAGEMENTS[mastery] || ENCOURAGEMENTS["基本掌握"]);

  if (tone === "简洁版") {
    return [
      `${studentName}同学今天学习了${subject}「${knowledgePoint}」。`,
      `课堂上${s}，${p}。对知识点${m}，${h}，${o}。`,
      `${sug}`,
      `${enc}`,
    ].join("\n");
  }

  const greeting = tone === "鼓励温和" ? `${studentName}同学，` : `${studentName}家长您好，`;

  const part1 = `${greeting}今天${subject}课我们一起学习了「${knowledgePoint}」。从课堂表现来看，${studentName}对这部分内容${m}。`;

  const part2 = `课堂上${s}，${p}。${hab}，${o}。`;

  const part3 = homework === "完成较好"
    ? `今天的练习完成得不错，继续保持。`
    : homework === "部分错误"
    ? `练习中有一些小错误，已经当面讲解过了，回去可以再巩固一下。`
    : `练习完成度还需要提高，建议回去认真完成。`;

  const part4 = `建议：${sug}`;

  const part5 = tone === "重点提醒"
    ? `请家长帮忙监督一下课后练习的完成情况，有问题随时联系。`
    : enc;

  return [part1, "", part2, part3, "", part4, "", part5].join("\n");
}
