import { BeautyProduct, getCategoryLabel } from "@/lib/products";
import { getPrimaryCategory, ProductPrimaryCategory } from "@/lib/product-categories";
import { getTopLevelCategoryLabel } from "@/lib/product-taxonomy";
import { deriveUserAppState } from "@/lib/user-state";
import { SavedProfile } from "@/lib/profile-store";
import { AssessmentProfileDraft } from "@/lib/profile-draft";

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
  });

  return {
    state: mapState(userState.hasProfile, userState.productCount),
    hasProfile: userState.hasProfile,
    productCount: userState.productCount,
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
  products: Array<{ category: string; status: string }>;
  hasProfile: boolean;
  profileSkinType: string;
  selectedCategory: ProductPrimaryCategory;
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
  insights.push({
    title: "信息缺口",
    reason: input.hasProfile
      ? `已有画像${input.profileSkinType ? `（${input.profileSkinType}）` : ""}，但仍缺少使用频率、刺激感和回购意愿等记录，当前分析仍是规则化判断。`
      : "当前缺少个人画像与使用体验记录，因此只能做基础整理，不能做强个性化判断。",
    nextStep: "后续在产品详情中补充使用记录（频率/体验/是否回购），分析会更具体。",
  });
  return insights.slice(0, 3);
}
