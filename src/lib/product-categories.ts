import { mapToTopLevelCategory } from "@/lib/product-taxonomy";
import { SKINCARE_PRODUCT_CATEGORY_FILTER_OPTIONS } from "@/lib/product-options";

export const PRODUCT_PRIMARY_CATEGORIES = SKINCARE_PRODUCT_CATEGORY_FILTER_OPTIONS;

export type ProductPrimaryCategory = typeof PRODUCT_PRIMARY_CATEGORIES[number]["id"];

export function getPrimaryCategory(category: string): Exclude<ProductPrimaryCategory, "all"> {
  return mapToTopLevelCategory(category);
}
