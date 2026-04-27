export type ProductStatus = "using" | "wishlist" | "used" | "recommended";

export type ProductCategory =
  | "cleanser"
  | "toner-mist"
  | "serum"
  | "moisturizer"
  | "sunscreen"
  | "mask"
  | "eye-care"
  | "targeted-treatment"
  | "other"
  | "makeup";

export type SourceType = "self-discovery" | "friend" | "creator" | "dermatologist";

export type BeautyProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  categoryType?: "preset" | "custom";
  status: ProductStatus;
  usageDurationMonths?: number;
  sourceType: SourceType;
  sourceLink?: string;
  note?: string;
};

export const productStatusLabelMap: Record<ProductStatus, string> = {
  using: "正在使用",
  wishlist: "想购买",
  used: "用过",
  recommended: "被推荐",
};

export const productCategoryLabelMap: Record<ProductCategory, string> = {
  cleanser: "洁面",
  "toner-mist": "爽肤水 / 喷雾",
  serum: "精华",
  moisturizer: "乳液 / 面霜",
  sunscreen: "防晒",
  mask: "面膜",
  "eye-care": "眼部护理",
  "targeted-treatment": "功效护理",
  other: "其他",
  makeup: "彩妆",
};

export function getCategoryLabel(category: string) {
  return productCategoryLabelMap[category as ProductCategory] || category || "未分类";
}

export const sourceTypeLabelMap: Record<SourceType, string> = {
  "self-discovery": "自己发现",
  friend: "朋友推荐",
  creator: "博主/社媒",
  dermatologist: "皮肤科医生",
};

export const mockProducts: BeautyProduct[] = [
  {
    id: "p1",
    name: "Hydra Calm Gel Cream",
    brand: "Round Lab",
    category: "moisturizer",
    status: "using",
    usageDurationMonths: 3,
    sourceType: "self-discovery",
    note: "妆前使用也很服帖。",
  },
  {
    id: "p2",
    name: "Niacinamide 10 Serum",
    brand: "Anua",
    category: "serum",
    status: "recommended",
    usageDurationMonths: 0,
    sourceType: "creator",
  },
  {
    id: "p3",
    name: "Daily UV Shield SPF50+",
    brand: "Beauty of Joseon",
    category: "sunscreen",
    status: "wishlist",
    usageDurationMonths: 0,
    sourceType: "friend",
  },
];
