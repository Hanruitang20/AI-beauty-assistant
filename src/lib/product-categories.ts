import { mapToTopLevelCategory } from "@/lib/product-taxonomy";

export const PRODUCT_PRIMARY_CATEGORIES = [
  { id: "all", label: "全部" },
  { id: "skincare", label: "护肤" },
  { id: "makeup", label: "美妆" },
  { id: "body-hair", label: "身体&头发" },
  { id: "fragrance-other", label: "香氛&其他" },
] as const;

export type ProductPrimaryCategory = typeof PRODUCT_PRIMARY_CATEGORIES[number]["id"];

export function getPrimaryCategory(category: string): Exclude<ProductPrimaryCategory, "all"> {
  return mapToTopLevelCategory(category);
}
