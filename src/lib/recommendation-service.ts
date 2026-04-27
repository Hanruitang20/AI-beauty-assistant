import { BeautyProduct, getCategoryLabel } from "@/lib/products";
import { getPrimaryCategory, ProductPrimaryCategory } from "@/lib/product-categories";
import { getTopLevelCategoryLabel } from "@/lib/product-taxonomy";
import { deriveUserAppState } from "@/lib/user-state";
import { SavedProfile } from "@/lib/profile-store";
import { AssessmentProfileDraft } from "@/lib/profile-draft";
import { ProductExperience } from "@/lib/product-experience-service";

export type RecommendationInsight = {
  title: string;
  reason: string;
  nextStep: string;
};

export type RecommendationViewState = "A_EMPTY_NO_PROFILE" | "B_EMPTY_WITH_PROFILE" | "C_WITH_PRODUCTS_NO_PROFILE" | "D_WITH_PRODUCTS_WITH_PROFILE";

export type RecommendationViewModel = {
  state: RecommendationViewState;
  hasProfile: boolean;
  productCount: number;
  experienceCount: number;
  ratedProductCount: number;
  scopedExperienceCount: number;
  scopedRatedProductCount: number;
  profileSummary: string[];
  statusCount: Record<string, number>;
  selectedCategory: ProductPrimaryCategory;
  scopedProducts: BeautyProduct[];
  scopedInsights: RecommendationInsight[];
  topCategoryLabel: string;
};

export function buildRecommendationViewModel(input: {
  products: BeautyProduct[];
  profile: SavedProfile | null;
  assessmentDraft: AssessmentProfileDraft | null;
  selectedCategory: ProductPrimaryCategory;
  isSignedIn?: boolean;
  experiencesByProductId?: Record<string, ProductExperience>;
  refreshSeed?: number;
}): RecommendationViewModel {
  const userState = deriveUserAppState({
    isSignedIn: input.isSignedIn ?? true,
    products: input.products,
    profile: input.profile,
    assessmentDraft: input.assessmentDraft,
  });

  const profileSummary = [
    input.profile?.skinType ? `肤质：${input.profile.skinType}` : null,
    input.profile?.mainConcerns ? `主要诉求：${input.profile.mainConcerns}` : null,
    input.profile?.sensitivityLevel ? `敏感程度：${input.profile.sensitivityLevel}` : null,
    input.profile?.experienceLevel ? `经验水平：${input.profile.experienceLevel}` : null,
  ].filter(Boolean) as string[];

  const statusCount = input.products.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const categoryCount = input.products.reduce<Record<string, number>>((acc, item) => {
    const primary = getPrimaryCategory(item.category);
    acc[primary] = (acc[primary] || 0) + 1;
    return acc;
  }, {});
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  const scopedProducts =
    input.selectedCategory === "all"
      ? input.products
      : input.products.filter((item) => getPrimaryCategory(item.category) === input.selectedCategory);

  const scopedInsights = buildProductInsights({
    products: scopedProducts,
    hasProfile: userState.hasProfile,
    profileSkinType: input.profile?.skinType || "",
    selectedCategory: input.selectedCategory,
    experiencesByProductId: input.experiencesByProductId,
    refreshSeed: input.refreshSeed,
  });
  const allExperiences = input.products
    .map((item) => input.experiencesByProductId?.[item.id])
    .filter(Boolean) as ProductExperience[];
  const scopedExperiences = scopedProducts
    .map((item) => input.experiencesByProductId?.[item.id])
    .filter(Boolean) as ProductExperience[];

  return {
    state: mapState(userState.hasProfile, userState.productCount),
    hasProfile: userState.hasProfile,
    productCount: userState.productCount,
    experienceCount: allExperiences.length,
    ratedProductCount: allExperiences.filter((item) => typeof item.rating === "number").length,
    scopedExperienceCount: scopedExperiences.length,
    scopedRatedProductCount: scopedExperiences.filter((item) => typeof item.rating === "number").length,
    profileSummary,
    statusCount,
    selectedCategory: input.selectedCategory,
    scopedProducts,
    scopedInsights,
    topCategoryLabel: topCategory ? getTopLevelCategoryLabel(topCategory as ProductPrimaryCategory) : "未分类",
  };
}

function mapState(hasProfile: boolean, productCount: number): RecommendationViewState {
  if (!hasProfile && productCount === 0) return "A_EMPTY_NO_PROFILE";
  if (hasProfile && productCount === 0) return "B_EMPTY_WITH_PROFILE";
  if (!hasProfile && productCount > 0) return "C_WITH_PRODUCTS_NO_PROFILE";
  return "D_WITH_PRODUCTS_WITH_PROFILE";
}

export function buildProductInsights(input: {
  products: Array<{ id: string; category: string; status: string }>;
  hasProfile: boolean;
  profileSkinType: string;
  selectedCategory: ProductPrimaryCategory;
  experiencesByProductId?: Record<string, ProductExperience>;
  refreshSeed?: number;
}): RecommendationInsight[] {
  const categoryCount = input.products.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  const entries = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
  const top = entries[0];

  const hasSunscreen = input.products.some((item) => item.category.includes("sunscreen") || item.category.includes("防晒"));
  const hasLip = input.products.some((item) => {
    const category = item.category.toLowerCase();
    return category.includes("唇") || category.includes("lip");
  });
  const hasBodyOrHair = input.products.some((item) => {
    const category = item.category.toLowerCase();
    return category.includes("body") || category.includes("hair") || category.includes("身体") || category.includes("头发");
  });
  const categoryLabel = input.selectedCategory === "all" ? "全部产品" : getTopLevelCategoryLabel(input.selectedCategory);
  const scopedExperiences = input.products
    .map((item) => input.experiencesByProductId?.[item.id])
    .filter(Boolean) as ProductExperience[];

  const insights: RecommendationInsight[] = [];
  if (top) {
    insights.push({
      title: "方向识别",
      reason: `${categoryLabel}下当前最多的是「${getCategoryLabel(top[0])}」（${top[1]} 个），可先从这一组记录梳理重点。`,
      nextStep: "先在同方向产品里对比使用状态，避免重复尝试。",
    });
  }
  insights.push({
    title: "搭配关系提示",
    reason:
      input.selectedCategory === "makeup" && hasLip
        ? "美妆记录里包含唇部相关产品，建议补充妆效、持久度、是否拔干和叠涂体验。"
        : input.selectedCategory === "body-hair" && hasBodyOrHair
          ? "身体&头发类产品建议关注使用频率、肤感/发感、香味接受度和是否油腻。"
          : hasSunscreen
            ? "记录里有防晒相关产品，建议结合底妆或日间步骤观察叠加后的肤感与稳定性。"
            : "可先按当前记录梳理常见使用顺序，减少一次上太多新品带来的干扰。",
    nextStep: "先固定基础步骤，再一次只新增一个变量观察 5-7 天。",
  });
  const infoGapInsight: RecommendationInsight = {
    title: "信息缺口",
    reason: input.hasProfile
      ? `已有画像${input.profileSkinType ? `（${input.profileSkinType}）` : ""}，但仍缺少使用频率、刺激感和回购意愿等记录，当前分析仍是规则化判断。`
      : "当前缺少个人画像与使用体验记录，因此只能做基础整理，不能做强个性化判断。",
    nextStep: "后续在产品详情中补充使用记录（频率/体验/是否回购），分析会更具体。",
  };

  const experienceInsight = buildExperienceInsight({
    scopedExperiences,
    hasProfile: input.hasProfile,
    refreshSeed: input.refreshSeed,
  });
  if (experienceInsight) {
    insights.push(experienceInsight);
  } else {
    insights.push(infoGapInsight);
  }

  return insights.slice(0, 3);
}

function buildExperienceInsight(input: {
  scopedExperiences: ProductExperience[];
  hasProfile: boolean;
  refreshSeed?: number;
}): RecommendationInsight | null {
  const { scopedExperiences, hasProfile } = input;
  if (!scopedExperiences.length) return null;
  const candidates: RecommendationInsight[] = [];

  const rated = scopedExperiences.filter((item) => typeof item.rating === "number");
  if (rated.length >= 2) {
    const avg = rated.reduce((sum, item) => sum + (item.rating || 0), 0) / rated.length;
    if (avg >= 4) {
      candidates.push({
        title: "高满意产品可以作为稳定参考",
        reason: hasProfile
          ? "当前范围内评分整体偏高，可结合你的画像与这些稳定体验，作为后续小步调整的参考。"
          : "当前范围内评分整体偏高，可先把这些产品作为相对稳定的使用参考，再小步尝试新变量。",
        nextStep: "优先保留高满意产品，再一次只调整一个产品观察变化。",
      });
    }
    if (avg < 3) {
      candidates.push({
        title: "先关注低评分产品的共同点",
        reason: "当前范围内有评分偏低的记录，可以回看它们的品类、状态和使用感受，减少相似方向的重复尝试。",
        nextStep: "先暂停低评分方向的新增尝试，优先观察已有稳定项。",
      });
    }
  } else if (rated.length === 1) {
    candidates.push({
      title: "先从单品感受开始判断",
      reason: "你已经记录了这个产品的评分，可以继续结合使用频率和后续意愿，判断它是否值得长期保留。",
      nextStep: "继续补充同类产品体验后，再做组合层面的判断。",
    });
  }

  const reactionSet = new Set(scopedExperiences.map((item) => item.reaction).filter(Boolean));
  if (reactionSet.has("irritating_or_breakout") || reactionSet.has("dry_or_tight") || reactionSet.has("uncomfortable")) {
    candidates.push({
      title: "先留意不适反应",
      reason: "当前范围内记录过不舒服、刺激或干燥紧绷等反应，建议先减少同时尝试的变量，再观察是否与某类产品反复相关。",
      nextStep: "先稳定 5-7 天，只保留基础步骤并记录变化。",
    });
  }
  if (reactionSet.size > 0 && reactionSet.size === 1 && (reactionSet.has("none") || reactionSet.has("no_issue"))) {
    candidates.push({
      title: "目前没有明显不适记录",
      reason: "当前范围内的使用感受里暂时没有明显不适反应，可以继续观察长期使用下的稳定性。",
      nextStep: "保持当前节奏，补充持续使用后的评分和意愿。",
    });
  }

  const intentionCount = scopedExperiences.reduce<Record<string, number>>((acc, item) => {
    if (!item.intention) return acc;
    acc[item.intention] = (acc[item.intention] || 0) + 1;
    return acc;
  }, {});
  if ((intentionCount.continue || 0) + (intentionCount.repurchase || 0) > 0) {
    candidates.push({
      title: "愿意继续用的产品值得沉淀",
      reason: "你已标记部分产品愿意继续使用或可能回购，它们可以作为后续偏好判断的参考。",
      nextStep: "优先围绕这些产品补充连续使用体验，形成稳定结论。",
    });
  }
  if ((intentionCount.stop || 0) > 0) {
    candidates.push({
      title: "不会继续用的产品也有价值",
      reason: "被标记为不会继续用的产品能帮助你识别不适合方向，减少后续重复尝试。",
      nextStep: "回看这些记录的共同点，并在后续选择里避开相似方向。",
    });
  }

  const freqCount = scopedExperiences.reduce<Record<string, number>>((acc, item) => {
    if (!item.usageFrequency) return acc;
    acc[item.usageFrequency] = (acc[item.usageFrequency] || 0) + 1;
    return acc;
  }, {});
  if ((freqCount.not_started || 0) > (scopedExperiences.length / 2)) {
    candidates.push({
      title: "未开始使用的产品先不做强判断",
      reason: "当前范围内不少产品还没有开始使用，建议先记录初次体验后再判断是否继续保留。",
      nextStep: "先从一个产品开始，记录首次使用感受。",
    });
  }
  if ((freqCount.daily || 0) > (scopedExperiences.length / 2)) {
    candidates.push({
      title: "常用产品更适合持续观察",
      reason: "你已有产品处在较高使用频率下，后续可关注是否持续稳定，而不只看第一次感受。",
      nextStep: "持续记录 1-2 周，观察体验是否稳定。",
    });
  }

  if (!candidates.length) {
    candidates.push({
      title: "还在观察的产品不急着下结论",
      reason: "当前范围内有产品仍在观察阶段，建议继续记录评分与体验变化，再做下一步判断。",
      nextStep: "先补充 2-3 条稳定记录，再决定是否继续保留。",
    });
  }

  const hasFeedbackNote = scopedExperiences.some((item) => Boolean(item.feedbackNote?.trim()));
  const seed = input.refreshSeed || 0;
  const picked = candidates[Math.abs(seed) % candidates.length];
  if (!hasFeedbackNote) return picked;
  return {
    ...picked,
    reason: `${picked.reason} 你已经补充了一些文字感受，后续可以结合评分和使用反馈一起回看。`,
  };
}
