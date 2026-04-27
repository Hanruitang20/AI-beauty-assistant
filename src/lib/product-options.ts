export const SKINCARE_PRODUCT_CATEGORY_OPTIONS = [
  { value: "cleanser", label: "洁面" },
  { value: "toner-mist", label: "爽肤水 / 喷雾" },
  { value: "serum", label: "精华" },
  { value: "moisturizer", label: "乳液 / 面霜" },
  { value: "sunscreen", label: "防晒" },
  { value: "mask", label: "面膜" },
  { value: "eye-care", label: "眼部护理" },
  { value: "targeted-treatment", label: "功效护理" },
  { value: "other", label: "其他" },
] as const;

export type SkincareCategoryValue = typeof SKINCARE_PRODUCT_CATEGORY_OPTIONS[number]["value"];

export const SKINCARE_PRODUCT_CATEGORY_FILTER_OPTIONS = [
  { id: "all", label: "全部" },
  ...SKINCARE_PRODUCT_CATEGORY_OPTIONS.map((item) => ({ id: item.value, label: item.label })),
] as const;

export type SkincareCategoryFilterValue = typeof SKINCARE_PRODUCT_CATEGORY_FILTER_OPTIONS[number]["id"];

export const SKINCARE_REACTION_OPTIONS = [
  { value: "comfortable", label: "肤感舒服" },
  { value: "hydrating", label: "保湿力不错" },
  { value: "absorbs_fast", label: "吸收快" },
  { value: "gentle", label: "温和不刺激" },
  { value: "effective", label: "效果明显" },
  { value: "clogging_or_breakout", label: "有闷痘 / 闭口" },
  { value: "stinging_or_redness", label: "有刺痛 / 泛红" },
  { value: "too_oily_or_heavy", label: "太油 / 太厚重" },
  { value: "unclear_effect", label: "效果不明显" },
  { value: "unsure", label: "暂时不确定" },
] as const;

export type SkincareReactionValue = typeof SKINCARE_REACTION_OPTIONS[number]["value"];

export function isSkincareCategoryValue(value: string): value is SkincareCategoryValue {
  return SKINCARE_PRODUCT_CATEGORY_OPTIONS.some((item) => item.value === value);
}
