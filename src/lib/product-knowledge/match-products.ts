import { BeautyProduct } from "@/lib/products";
import {
  ConcernLabel,
  ExperienceLevelLabel,
  SKINCARE_KNOWLEDGE_PRODUCTS,
  SkincareKnowledgeProduct,
  SkinTypeLabel,
  UserGroupLabel,
} from "@/lib/product-knowledge/skincare-products";

type MinimalUserProfile = {
  skinType?: string;
  mainConcerns?: string;
  sensitivityLevel?: string;
  experienceLevel?: string;
};

export type ProductMatchCandidate = {
  name: string;
  brand: string;
  category: string;
  matchReason: string;
  caution: string;
  howToTry: string;
};

export type MatchProductCandidatesResult = {
  shouldFocusOnExistingProducts: boolean;
  candidates: ProductMatchCandidate[];
  fallbackTip?: string;
};

type MatchOptions = {
  topK?: number;
};

const BASELINE_FALLBACK_TIP = "建议你先补充已有产品的使用体验，而不是继续新增产品。";
const CATEGORY_BASE_PRIORITY: Record<string, number> = {
  sunscreen: 5,
  moisturizer: 4,
  cleanser: 3,
  "toner-mist": 2,
  serum: 1,
  mask: 1,
};

function normalize(value?: string) {
  return (value || "").trim().toLowerCase();
}

function splitTokens(value?: string) {
  return (value || "")
    .split(/[、,，/]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapSkinTypeTokens(skinType?: string): SkinTypeLabel[] {
  const tokens = splitTokens(skinType);
  const result = new Set<SkinTypeLabel>();
  tokens.forEach((token) => {
    if (token.includes("干")) result.add("干皮");
    if (token.includes("油")) result.add("油皮");
    if (token.includes("混")) result.add("混油皮");
    if (token.includes("敏")) result.add("敏感肌");
    if (token.includes("痘")) result.add("痘痘肌");
  });
  return [...result];
}

function mapConcernTokens(mainConcerns?: string): ConcernLabel[] {
  const raw = splitTokens(mainConcerns);
  const result = new Set<ConcernLabel>();
  raw.forEach((item) => {
    if (item.includes("保湿") || item.includes("补水") || item.includes("干")) result.add("保湿");
    if (item.includes("控油") || item.includes("出油")) result.add("控油");
    if (item.includes("修护") || item.includes("屏障")) result.add("修护");
    if (item.includes("舒缓") || item.includes("泛红") || item.includes("敏")) result.add("舒缓");
    if (item.includes("提亮")) result.add("提亮");
    if (item.includes("防晒")) result.add("防晒");
    if (item.includes("闭口") || item.includes("痘")) result.add("减少闭口");
  });
  return [...result];
}

function mapExperienceLevel(experienceLevel?: string): ExperienceLevelLabel {
  const raw = experienceLevel || "";
  if (raw.includes("入门") || raw.includes("新手")) return "beginner";
  if (raw.includes("熟练") || raw.includes("高阶")) return "advanced";
  if (raw.includes("advanced")) return "advanced";
  if (raw.includes("intermediate")) return "intermediate";
  return "beginner";
}

function buildSensitiveBias(profile: MinimalUserProfile) {
  const raw = profile.sensitivityLevel || "";
  const isSensitive = raw.includes("敏") || raw.includes("高") || raw.includes("容易");
  return {
    isSensitive,
    preferTags: isSensitive ? ["温和", "舒缓", "基础保湿", "基础护理", "新手友好"] : [],
    avoidTags: isSensitive ? ["功效型"] : [],
  };
}

function countCategories(products: BeautyProduct[]) {
  return products.reduce<Record<string, number>>((acc, item) => {
    const key = normalize(item.category);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function shouldSkipCategoryBecauseFullyRecorded(
  category: string,
  recordedNameKeys: Set<string>,
  recordedBrandKeys: Set<string>,
): boolean {
  const allOfCategory = SKINCARE_KNOWLEDGE_PRODUCTS.filter((item) => item.category === category);
  if (!allOfCategory.length) return false;
  return allOfCategory.every((item) => {
    const nameKey = normalize(item.name);
    const brandNameKey = `${normalize(item.brand)}::${nameKey}`;
    return recordedNameKeys.has(nameKey) || recordedBrandKeys.has(brandNameKey);
  });
}

function buildCategoryBoost(categoryCount: Record<string, number>) {
  const hasSunscreen = (categoryCount.sunscreen || 0) > 0;
  const hasMoisturizer = (categoryCount.moisturizer || 0) > 0;
  const basicCount =
    (categoryCount.cleanser || 0) +
    (categoryCount["toner-mist"] || 0) +
    (categoryCount.moisturizer || 0) +
    (categoryCount.sunscreen || 0);
  const activeCount = (categoryCount.serum || 0) + (categoryCount.mask || 0) + (categoryCount["targeted-treatment"] || 0);

  return {
    sunscreenBoost: hasSunscreen ? 0 : 20,
    moisturizerBoost: hasMoisturizer ? 0 : 16,
    rebalanceBoostByCategory: basicCount < activeCount ? { moisturizer: 12, cleanser: 8, sunscreen: 10 } : {},
  };
}

function buildMatchReason(product: SkincareKnowledgeProduct, matched: {
  skin: string[];
  concerns: string[];
  level: boolean;
  sensitive: boolean;
}) {
  const parts: string[] = [];
  if (matched.skin.length > 0) parts.push(`贴合你的肤质方向（${matched.skin.join("、")}）`);
  if (matched.concerns.length > 0) parts.push(`对齐你当前关注目标（${matched.concerns.join("、")}）`);
  if (matched.level) parts.push("与你当前护肤经验阶段匹配");
  if (matched.sensitive) parts.push("对敏感阶段更友好，优先温和与基础护理思路");
  if (!parts.length) parts.push("作为补充参考，帮助你完善当前护理结构");
  return `该候选${parts.join("，")}。${product.reason}`;
}

export function matchProductCandidates(
  userProfile: MinimalUserProfile | null,
  products: BeautyProduct[],
  options?: MatchOptions,
): MatchProductCandidatesResult {
  const topK = Math.max(1, Math.min(5, options?.topK || 3));
  const recordedNameKeys = new Set(products.map((item) => normalize(item.name)).filter(Boolean));
  const recordedBrandKeys = new Set(
    products
      .map((item) => `${normalize(item.brand)}::${normalize(item.name)}`)
      .filter((item) => item !== "::"),
  );

  const skippedCategories = new Set<string>();
  Object.keys(CATEGORY_BASE_PRIORITY).forEach((category) => {
    if (shouldSkipCategoryBecauseFullyRecorded(category, recordedNameKeys, recordedBrandKeys)) {
      skippedCategories.add(category);
    }
  });

  const remainingCandidates = SKINCARE_KNOWLEDGE_PRODUCTS.filter((item) => {
    const nameKey = normalize(item.name);
    const brandNameKey = `${normalize(item.brand)}::${nameKey}`;
    if (recordedNameKeys.has(nameKey) || recordedBrandKeys.has(brandNameKey)) return false;
    if (skippedCategories.has(item.category)) return false;
    return true;
  });

  if (!remainingCandidates.length) {
    return {
      shouldFocusOnExistingProducts: true,
      candidates: [],
      fallbackTip: BASELINE_FALLBACK_TIP,
    };
  }

  const profile = userProfile || {};
  const skinTargets = mapSkinTypeTokens(profile.skinType);
  const concernTargets = mapConcernTokens(profile.mainConcerns);
  const levelTarget = mapExperienceLevel(profile.experienceLevel);
  const sensitiveBias = buildSensitiveBias(profile);
  const categoryCount = countCategories(products);
  const categoryBoost = buildCategoryBoost(categoryCount);

  const scored = remainingCandidates.map((item) => {
    let score = CATEGORY_BASE_PRIORITY[item.category] || 0;
    const matchedSkin = item.suitableSkinTypes.filter((token) => skinTargets.includes(token));
    const matchedConcerns = item.concerns.filter((token) => concernTargets.includes(token));
    const matchedLevel = item.experienceLevel === levelTarget;

    score += matchedSkin.length * 8;
    score += matchedConcerns.length * 10;
    if (matchedLevel) score += 12;

    if (sensitiveBias.isSensitive) {
      if (item.tags.some((tag) => sensitiveBias.preferTags.includes(tag))) score += 8;
      if (item.tags.some((tag) => sensitiveBias.avoidTags.includes(tag))) score -= 6;
      if (item.concerns.includes("舒缓") || item.concerns.includes("修护") || item.concerns.includes("保湿")) score += 8;
    }

    if (levelTarget === "beginner" && item.experienceLevel !== "beginner") score -= 6;
    if (levelTarget === "beginner" && item.tags.includes("功效型")) score -= 4;

    if (item.category === "sunscreen") score += categoryBoost.sunscreenBoost;
    if (item.category === "moisturizer") score += categoryBoost.moisturizerBoost;
    score += categoryBoost.rebalanceBoostByCategory[item.category as keyof typeof categoryBoost.rebalanceBoostByCategory] || 0;

    const matchedGroups = item.suitableUserGroups.filter((group) => {
      const groupKeywordMap: Record<UserGroupLabel, string[]> = {
        护肤新手: ["新手", "入门"],
        轻熟龄: ["轻熟", "熟龄"],
        屏障脆弱: ["屏障", "敏感"],
        容易长痘: ["长痘", "痘"],
        容易出油: ["出油", "油"],
        冬天易干: ["冬", "干"],
      };
      return groupKeywordMap[group].some((keyword) => (profile.mainConcerns || "").includes(keyword));
    });
    score += matchedGroups.length * 4;

    return {
      item,
      score,
      matchReason: buildMatchReason(item, {
        skin: matchedSkin,
        concerns: matchedConcerns,
        level: matchedLevel,
        sensitive: sensitiveBias.isSensitive && item.tags.some((tag) => sensitiveBias.preferTags.includes(tag)),
      }),
    };
  });

  const candidates = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ item, matchReason }): ProductMatchCandidate => ({
      name: item.name,
      brand: item.brand,
      category: item.category,
      matchReason,
      caution: item.caution,
      howToTry: item.howToTry,
    }));

  if (!candidates.length) {
    return {
      shouldFocusOnExistingProducts: true,
      candidates: [],
      fallbackTip: BASELINE_FALLBACK_TIP,
    };
  }

  return {
    shouldFocusOnExistingProducts: false,
    candidates,
  };
}
