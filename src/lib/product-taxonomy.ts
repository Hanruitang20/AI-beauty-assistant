export type TopLevelCategory = "all" | "skincare" | "makeup" | "body-hair" | "fragrance-other";

export const topLevelCategoryOptions: Array<{ id: TopLevelCategory; label: string }> = [
  { id: "all", label: "全部" },
  { id: "skincare", label: "护肤" },
  { id: "makeup", label: "美妆" },
  { id: "body-hair", label: "身体&头发" },
  { id: "fragrance-other", label: "香氛&其他" },
];

const skincareKeywords = [
  "cleanser", "serum", "moisturizer", "sunscreen",
  "洁面", "爽肤水", "化妆水", "精华", "面霜", "乳液", "防晒", "面膜", "眼霜", "卸妆", "修护", "保湿", "美白", "抗老", "控油", "祛痘",
];
const makeupKeywords = [
  "makeup", "彩妆", "粉底", "气垫", "遮瑕", "散粉", "定妆", "腮红", "修容", "高光", "眼影", "眼线", "睫毛膏", "眉笔", "口红", "唇釉", "唇蜜", "唇部", "底妆",
];
const bodyHairKeywords = [
  "body", "hair", "身体乳", "护手霜", "沐浴露", "磨砂膏", "身体护理", "洗发水", "护发素", "发膜", "发油", "头皮护理", "头发护理",
];
const fragranceOtherKeywords = [
  "香水", "香氛", "香薰", "身体喷雾", "美容仪", "工具", "医美", "口腔护理", "其他",
];

export function mapToTopLevelCategory(category: string): Exclude<TopLevelCategory, "all"> {
  const normalized = category.trim().toLowerCase();
  if (skincareKeywords.some((word) => normalized.includes(word))) return "skincare";
  if (makeupKeywords.some((word) => normalized.includes(word))) return "makeup";
  if (bodyHairKeywords.some((word) => normalized.includes(word))) return "body-hair";
  if (fragranceOtherKeywords.some((word) => normalized.includes(word))) return "fragrance-other";
  return "fragrance-other";
}

export function getTopLevelCategoryLabel(category: TopLevelCategory) {
  return topLevelCategoryOptions.find((item) => item.id === category)?.label || "香氛&其他";
}
