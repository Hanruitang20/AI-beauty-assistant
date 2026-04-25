import { BeautyProduct, ProductCategory } from "@/lib/products";
import { ProductSummary } from "@/lib/products-store";

export type UserGuidanceMode = "beginner" | "curious" | "goal_oriented" | "knowledge_builder";

export type GuidanceCard = {
  section_title: string;
  section_reason: string;
  primary_direction: string;
  relevance_reason: string;
  caution_note?: string;
  next_best_step: string;
  action_label: string;
  key_terms?: string[];
  simple_explanation?: string;
  why_it_matters_now?: string;
  suggestedCategory?: ProductCategory;
};

type UserProfile = {
  skinType?: string;
  mainConcerns?: string;
  skinConcerns?: string;
  experienceLevel?: string;
  hasRoutine?: string;
  preferredBrands?: string[];
  dislikedBrands?: string[];
  priorityGoal?: string;
};

export type GuidancePageData = {
  recommendation_intro: string;
  guidance_intro: string;
  user_state_summary: string;
  recommendation_basis: string[];
  current_focus: string[];
  mode: UserGuidanceMode;
  sections: {
    now_state: GuidanceCard;
    direction: GuidanceCard;
    product_based: GuidanceCard;
    caution: GuidanceCard;
    next_step: GuidanceCard;
  };
};

const categoryLabelMap: Record<ProductCategory, string> = {
  cleanser: "洁面",
  serum: "精华",
  moisturizer: "面霜/乳液",
  sunscreen: "防晒",
  makeup: "彩妆",
};

function inferMode(profile: UserProfile | null, products: BeautyProduct[]): UserGuidanceMode {
  const level = profile?.experienceLevel || "入门";
  const hasGoal = Boolean(profile?.priorityGoal && profile.priorityGoal.trim().length > 0);
  const hasManyRecords = products.length >= 8;

  if (level.includes("入门")) return "beginner";
  if (hasGoal) return "goal_oriented";
  if (hasManyRecords || level.includes("熟练")) return "knowledge_builder";
  return "curious";
}

function modeText(mode: UserGuidanceMode) {
  if (mode === "beginner") {
    return {
      intro: "你现在更需要低门槛、可执行、容易坚持的护理建议。",
      explanationStrength: "我们会优先用通俗语言解释术语和步骤。",
    };
  }
  if (mode === "goal_oriented") {
    return {
      intro: "你有明确目标，我们会优先提供问题-原因-建议-下一步的链路。",
      explanationStrength: "我们会把建议聚焦在当前最相关的解决路径。",
    };
  }
  if (mode === "knowledge_builder") {
    return {
      intro: "你更关注系统理解，我们会补充方法论和判断框架。",
      explanationStrength: "我们会加强成分逻辑和适配思路的解释。",
    };
  }
  return {
    intro: "你在探索阶段，我们会提供适配分析与注意事项，帮你减少犹豫。",
    explanationStrength: "我们会重点解释为什么这些建议和你有关。",
  };
}

export function buildForYouGuidance(
  profile: UserProfile | null,
  products: BeautyProduct[],
  summaryMap: Record<string, ProductSummary>,
): GuidancePageData {
  const concerns = (profile?.mainConcerns || profile?.skinConcerns || "").toLowerCase();
  const experience = profile?.experienceLevel || "入门阶段";
  const needsHydration = concerns.includes("dry") || concerns.includes("dehydra") || concerns.includes("缺水");
  const oilyConcern = concerns.includes("油") || concerns.includes("毛孔");
  const redConcern = concerns.includes("红") || concerns.includes("敏");
  const hasSunscreen = products.some((item) => item.category === "sunscreen");
  const usingProducts = products.filter((item) => item.status === "using");
  const hasRoutine = profile?.hasRoutine?.includes("已有");
  const disliked = profile?.dislikedBrands || [];
  const priorityGoal = profile?.priorityGoal || "";

  const mode = inferMode(profile, products);
  const modeCopy = modeText(mode);

  const cautionFromSummaries = Object.values(summaryMap)
    .flatMap((summary) => summary.cautionPoints)
    .slice(0, 2)
    .join(" ");

  const stateSummary = [
    profile?.skinType ? `肤质倾向：${profile.skinType}` : "肤质信息仍可补充",
    profile?.mainConcerns || profile?.skinConcerns
      ? `当前关注：${profile.mainConcerns || profile.skinConcerns}`
      : "当前关注点：建议补充",
    `经验阶段：${experience}`,
  ].join("；");

  const primaryDirection = needsHydration
    ? "先关注温和修护与补水稳定，再逐步加入功效项。"
    : oilyConcern
      ? "先关注清爽控油与耐受平衡，避免一次叠加过多活性。"
      : redConcern
        ? "先关注敏感稳定与屏障修护，再评估进阶功效。"
        : "先建立可坚持的基础流程，再做局部优化。";

  const firstUsing = usingProducts[0];
  const productBasedDirection = firstUsing
    ? `你现在有正在使用的${categoryLabelMap[firstUsing.category]}（${firstUsing.name}），建议把它作为观察锚点。`
    : "你目前没有标记“正在使用”的产品，建议先确定 1 个当前主力产品，便于判断效果。";

  const nextStep = priorityGoal
    ? `围绕「${priorityGoal}」先做 7 天最小行动：保留基础流程 + 新增 1 个低风险变量。`
    : "先完成一个 7 天小循环：记录早晚使用、肤感变化与是否刺激，再决定是否新增产品。";

  return {
    recommendation_intro: "这是你的“为你”页面：不是泛推荐，而是基于你记录与状态的个性化解读中心。",
    guidance_intro: modeCopy.intro,
    user_state_summary: stateSummary,
    recommendation_basis: [
      `已保存产品 ${products.length} 个`,
      `已生成摘要 ${Object.keys(summaryMap).length} 个`,
      profile?.mainConcerns || profile?.skinConcerns ? "已填写主要关注点" : "关注点信息仍可完善",
      modeCopy.explanationStrength,
    ],
    current_focus: [primaryDirection, hasRoutine ? "你已有基础流程，可做小步优化。" : "你仍在建立流程阶段，建议减少变量。"],
    mode,
    sections: {
      now_state: {
        section_title: "你当前的状态",
        section_reason: "先理解你现在的基础状态，后续建议才有意义。",
        primary_direction: stateSummary,
        relevance_reason: "这些判断基于你的画像字段、测评草稿和当前产品记录。",
        next_best_step: "如果有变化，请优先更新“当前主要困扰”，建议会立即更贴合。",
        action_label: "去完善个人信息",
        simple_explanation: mode === "beginner" ? "先看懂自己现在的状态，再决定用什么产品，通常更不容易踩雷。" : undefined,
      },
      direction: {
        section_title: "现在更适合你的方向",
        section_reason: "这不是直接让你买什么，而是先确定“先关注什么”。",
        primary_direction: primaryDirection,
        relevance_reason: "方向优先级来自你的肤质、关注点和经验阶段。",
        next_best_step: "先按这个方向筛选你下一步要比较的 1-2 类产品。",
        action_label: "查看方向建议",
        key_terms: mode === "knowledge_builder" ? ["耐受性", "变量控制", "基础流程"] : ["先稳定", "再进阶"],
        why_it_matters_now: "方向正确，会直接降低决策成本和无效尝试。",
      },
      product_based: {
        section_title: "基于你已记录产品的建议",
        section_reason: "让建议真正连接你的记录，而不是随机生成。",
        primary_direction: productBasedDirection,
        relevance_reason: `你当前保存了 ${products.length} 个产品，重点参考了“使用中/想购买/被推荐”的状态分布。`,
        caution_note: disliked.length > 0 ? `你记录过不偏好的品牌：${disliked.slice(0, 2).join("、")}，建议继续回避相似触发点。` : undefined,
        next_best_step: firstUsing ? `围绕 ${firstUsing.name} 做一条“可对比”记录，再加一个新变量。` : "先把下一款准备尝试的产品标记为“想购买”并补充备注。",
        action_label: "去产品库查看记录",
        suggestedCategory: firstUsing?.category,
      },
      caution: {
        section_title: "当前需要注意的点",
        section_reason: "先规避风险，比盲目加产品更重要。",
        primary_direction: hasSunscreen
          ? "你已有防晒基础，当前重点是避免高刺激活性叠加。"
          : "你当前更应先补齐稳定防晒，再考虑新增高功效产品。",
        relevance_reason: "提醒来自你的产品结构和摘要中的注意事项。",
        caution_note: cautionFromSummaries || "如果最近有泛红/起皮，建议先停用高刺激变量 3-5 天观察。",
        next_best_step: "今天先确认一个“暂缓项”和一个“保留项”，减少决策负担。",
        action_label: "查看需要暂缓的项",
        why_it_matters_now: "先稳住状态，后续进阶会更可持续。",
      },
      next_step: {
        section_title: "你下一步可以怎么做",
        section_reason: "看完建议后，要有立即可执行的动作。",
        primary_direction: nextStep,
        relevance_reason: priorityGoal
          ? `你的优先目标是「${priorityGoal}」，因此下一步以目标相关动作优先。`
          : "你尚未设置明确优先目标，因此建议先建立最小可执行闭环。",
        next_best_step: "完成后回到“为你”页面查看更新解读。",
        action_label: priorityGoal ? "按目标执行下一步" : "创建 7 天行动计划",
        simple_explanation: mode === "beginner" ? "一次只改一个变量，更容易知道到底是什么在起作用。" : undefined,
      },
    },
  };
}
