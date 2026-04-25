import { BeautyProduct, ProductCategory } from "@/lib/products";
import { ProductSummary } from "@/lib/products-store";

export type RecommendationItem = {
  title: string;
  category: "fit" | "beginner" | "budget" | "caution";
  explanation: string;
  whyItMatters: string;
  suggestedCategory?: ProductCategory;
};

const categoryLabel: Record<ProductCategory, string> = {
  cleanser: "洁面",
  serum: "精华",
  moisturizer: "面霜/乳液",
  sunscreen: "防晒",
  makeup: "彩妆",
};

export function buildMockRecommendations(
  profile: { skinConcerns?: string; experienceLevel?: string; budgetRange?: string } | null,
  products: BeautyProduct[],
  summaryMap: Record<string, ProductSummary>,
): RecommendationItem[] {
  const concerns = profile?.skinConcerns?.toLowerCase() || "";
  const experience = profile?.experienceLevel || "入门";
  const budget = profile?.budgetRange || "";
  const isBeginner = experience === "入门" || experience === "Beginner";
  const lowBudget = budget.includes("以下") || budget.includes("Under");
  const needsHydration = concerns.includes("dry") || concerns.includes("dehydra") || concerns.includes("缺水");
  const hasSunscreen = products.some((item) => item.category === "sunscreen");
  const usingProducts = products.filter((item) => item.status === "using");

  const recommendations: RecommendationItem[] = [];

  recommendations.push({
    category: "fit",
    title: needsHydration ? "优先补水的产品组合建议" : "平衡型护肤组合建议",
    suggestedCategory: needsHydration ? "moisturizer" : "cleanser",
    explanation: needsHydration
      ? "你的关注点说明屏障稳定更重要，建议优先选择温和保湿产品，并搭配低刺激洁面。"
      : "你的档案更适合强调流程稳定性，建议围绕一款稳定洁面，逐步叠加单一功效产品。",
    whyItMatters: "匹配你的肤质和目标，能减少无效尝试与反复踩坑。",
  });

  if (isBeginner) {
    recommendations.push({
      category: "beginner",
      title: "更适合新手的替代路径",
      suggestedCategory: "serum",
      explanation:
        "先从低刺激、步骤少的搭配开始。可以每周 2-3 晚加入舒缓型精华，再逐步增加频率。",
      whyItMatters: "降低上手门槛，更容易建立长期可执行的习惯。",
    });
  } else {
    recommendations.push({
      category: "beginner",
      title: "保留一个低风险兜底选择",
      suggestedCategory: "moisturizer",
      explanation:
        "即使你已有经验，也建议常备一款修护型保湿产品，用于皮肤状态不稳的时期。",
      whyItMatters: "在皮肤波动期及时兜底，避免问题扩大。",
    });
  }

  recommendations.push({
    category: "budget",
    title: lowBudget ? "预算优先：以基础刚需为核心" : "可尝试的平价替代方案",
    suggestedCategory: "cleanser",
    explanation: lowBudget
      ? "优先选择无香精、稳定性高的基础产品，减少频繁踩坑和重复购入带来的额外成本。"
      : "每个品类可先试 1 款性价比更高的替代产品，再决定是否回购高价款。",
    whyItMatters: "预算更可控，长期投入更可持续。",
  });

  const cautionFromSummaries = Object.values(summaryMap)
    .flatMap((summary) => summary.cautionPoints)
    .slice(0, 2)
    .join(" ");

  recommendations.push({
    category: "caution",
    title: hasSunscreen ? "叠加功效产品的风险提醒" : "日间防护优先提醒",
    explanation: hasSunscreen
      ? `你已经有防晒产品，这是很好的基础。新增功效产品时建议先做局部测试，避免一次叠加太多变量。${cautionFromSummaries}`.trim()
      : "在增加更多功效产品前，建议先补齐一款稳定防晒，让日间护理更完整。",
    whyItMatters: "先控制风险，再追求进阶效果，整体更稳。",
  });

  if (usingProducts.length > 0) {
    recommendations.push({
      category: "fit",
      title: `优化你当前的${categoryLabel[usingProducts[0].category]}产品使用`,
      suggestedCategory: usingProducts[0].category,
      explanation: `你目前正在使用 ${usingProducts[0].name}。建议把它作为稳定锚点，再逐步只新增一个变量产品进行观察。`,
      whyItMatters: "减少变量后，更容易判断每个产品是否真正有效。",
    });
  }

  return recommendations;
}
