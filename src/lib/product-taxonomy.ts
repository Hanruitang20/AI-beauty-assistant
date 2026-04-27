import { SKINCARE_PRODUCT_CATEGORY_FILTER_OPTIONS, SkincareCategoryFilterValue } from "@/lib/product-options";

export type TopLevelCategory = SkincareCategoryFilterValue;

export const topLevelCategoryOptions: Array<{ id: TopLevelCategory; label: string }> =
  SKINCARE_PRODUCT_CATEGORY_FILTER_OPTIONS.map((item) => ({ id: item.id, label: item.label }));

const legacyCategoryMap: Record<string, Exclude<TopLevelCategory, "all">> = {
  makeup: "other",
  skincare: "other",
  "body-hair": "other",
  "fragrance-other": "other",
};

const categoryKeywords: Array<{ id: Exclude<TopLevelCategory, "all">; keywords: string[] }> = [
  { id: "cleanser", keywords: ["cleanser", "洁面", "洗面"] },
  { id: "toner-mist", keywords: ["toner", "mist", "爽肤水", "喷雾", "化妆水"] },
  { id: "serum", keywords: ["serum", "精华"] },
  { id: "moisturizer", keywords: ["moisturizer", "乳液", "面霜"] },
  { id: "sunscreen", keywords: ["sunscreen", "防晒"] },
  { id: "mask", keywords: ["mask", "面膜"] },
  { id: "eye-care", keywords: ["eye", "眼部", "眼霜"] },
  { id: "targeted-treatment", keywords: ["treatment", "功效", "修护", "抗痘", "美白", "抗老", "刷酸"] },
];

export function mapToTopLevelCategory(category: string): Exclude<TopLevelCategory, "all"> {
  const normalized = category.trim().toLowerCase();
  if (normalized in legacyCategoryMap) {
    return legacyCategoryMap[normalized];
  }
  const byId = topLevelCategoryOptions.find((item) => item.id !== "all" && item.id === normalized);
  if (byId && byId.id !== "all") return byId.id;
  const byKeyword = categoryKeywords.find((entry) => entry.keywords.some((word) => normalized.includes(word)));
  if (byKeyword) return byKeyword.id;
  return "other";
}

export function getTopLevelCategoryLabel(category: TopLevelCategory) {
  return topLevelCategoryOptions.find((item) => item.id === category)?.label || "其他";
}
