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
  const categoryLabel = input.selectedCategory === "all" ? "全部产品" : getTopLevelCategoryLabel(input.selectedCategory);
  const scopedExperiences = input.products
    .map((item) => input.experiencesByProductId?.[item.id])
    .filter(Boolean) as ProductExperience[];

  const insights: RecommendationInsight[] = [];
  if (top) {
    insights.push({
      title: "当前记录重心",
      reason: `在${categoryLabel}里，你目前记录最多的是「${getCategoryLabel(top[0])}」（${top[1]} 个）。可先围绕这一类做护肤步骤与体验对照。`,
      nextStep: "先比较同类产品的在用状态与反馈，减少重复投入。",
    });
  }
  insights.push({
    title: "流程与叠加观察",
    reason:
      hasSunscreen
        ? "你记录中包含防晒产品，建议优先关注日间叠加后的肤感稳定性与是否出现不适。"
        : "建议先明确早晚护肤顺序，避免同一阶段叠加过多新品造成判断困难。",
    nextStep: "先固定基础流程，每次只新增一个变量，连续观察约 5-7 天。",
  });
  const infoGapInsight: RecommendationInsight = {
    title: "记录仍可补强",
    reason: input.hasProfile
      ? "你已有基础画像，但当前使用反馈还不够连续，现阶段分析更偏结构化整理。"
      : "目前个人画像与使用反馈不足，暂时只能做基础梳理，无法给到更细的个性化建议。",
    nextStep: "在产品详情补充频率、体感与后续意愿，分析会更贴近日常护肤体验。",
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
        title: "高满意记录可先作为稳定锚点",
        reason: hasProfile
          ? "当前范围内评分整体较高，可优先保留这些更稳定的使用项，再做小步调整。"
          : "当前范围内评分整体较高，可优先保留这些更稳定的使用项，再做小步调整。",
        nextStep: "优先保持稳定项，每次只调整一个产品观察变化。",
      });
    }
    if (avg < 3) {
      candidates.push({
        title: "先复盘低评分共性",
        reason: "当前范围内存在低评分记录，建议回看其使用频率、肤感反馈与流程位置，减少重复试错。",
        nextStep: "先暂停低评分方向新增，优先观察已稳定产品。",
      });
    }
  } else if (rated.length === 1) {
    candidates.push({
      title: "先沉淀单品体验",
      reason: "你已有 1 条评分记录，适合继续补充使用频率与后续意愿，逐步判断是否长期保留。",
      nextStep: "补充同类产品体验后，再做组合层面的比较。",
    });
  }

  const reactionSet = new Set(
    scopedExperiences
      .flatMap((item) =>
        String(item.reaction || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      )
      .map((tag) => (tag === "none" ? "no_issue" : tag)),
  );
  if (
    reactionSet.has("irritating_or_breakout") ||
    reactionSet.has("stinging_or_redness") ||
    reactionSet.has("dry_or_tight") ||
    reactionSet.has("too_oily_or_heavy") ||
    reactionSet.has("clogging_or_breakout") ||
    reactionSet.has("uncomfortable")
  ) {
    candidates.push({
      title: "先优先观察不适信号",
      reason: "当前范围内出现过刺痛、泛红或闷痘等不适反馈，建议减少同时变量，先看状态是否回稳。",
      nextStep: "先用更稳定的基础步骤连续观察 5-7 天。",
    });
  }
  if (reactionSet.size > 0 && reactionSet.size === 1 && (reactionSet.has("none") || reactionSet.has("no_issue"))) {
    candidates.push({
      title: "当前未见明显不适反馈",
      reason: "现有记录里暂未出现明显不适，可继续关注长期使用下的稳定性与一致性。",
      nextStep: "保持当前节奏，持续补充评分与后续意愿。",
    });
  }

  const intentionCount = scopedExperiences.reduce<Record<string, number>>((acc, item) => {
    if (!item.intention) return acc;
    acc[item.intention] = (acc[item.intention] || 0) + 1;
    return acc;
  }, {});
  if ((intentionCount.continue || 0) + (intentionCount.repurchase || 0) > 0) {
    candidates.push({
      title: "愿意继续用的产品可沉淀为偏好",
      reason: "你已标记部分产品愿意继续使用或回购，这些记录可作为后续选品偏好依据。",
      nextStep: "优先补充这些产品的连续体验，形成更稳定判断。",
    });
  }
  if ((intentionCount.stop || 0) > 0) {
    candidates.push({
      title: "不继续用的记录同样有价值",
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
      title: "未实测产品先不下结论",
      reason: "当前范围内仍有较多产品未开始使用，建议先补充初次体验后再判断去留。",
      nextStep: "先从一个产品开始，记录首次使用感受。",
    });
  }
  if ((freqCount.daily || 0) > (scopedExperiences.length / 2)) {
    candidates.push({
      title: "高频使用产品更值得持续跟踪",
      reason: "你已有较高频使用记录，建议关注连续一段时间后的稳定性，而不只看单次体感。",
      nextStep: "持续记录 1-2 周，观察反馈是否稳定。",
    });
  }

  if (!candidates.length) {
    candidates.push({
      title: "观察期内先稳步记录",
      reason: "当前范围内仍在观察阶段，建议先补充连续记录，再决定是否长期保留。",
      nextStep: "先累计 2-3 条稳定记录后再做决策。",
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
