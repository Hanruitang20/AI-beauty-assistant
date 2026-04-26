import { getPrimaryCategory, ProductPrimaryCategory } from "@/lib/product-categories";
import { BeautyProduct, getCategoryLabel, sourceTypeLabelMap } from "@/lib/products";

export function normalizeSearchText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function buildProductSearchText(product: BeautyProduct) {
  const categoryLabel = getCategoryLabel(product.category);
  return normalizeSearchText(
    [
      product.name,
      product.brand,
      product.category,
      categoryLabel,
      sourceTypeLabelMap[product.sourceType],
      product.note || "",
    ].join(" "),
  );
}

export function filterProductsByPrimaryCategory(
  products: BeautyProduct[],
  selectedCategory: ProductPrimaryCategory,
) {
  if (selectedCategory === "all") return products;
  return products.filter((product) => getPrimaryCategory(product.category) === selectedCategory);
}

export function filterProductsBySearchAndCategory(
  products: BeautyProduct[],
  input: {
    query: string;
    selectedCategory: ProductPrimaryCategory;
  },
) {
  const normalizedQuery = normalizeSearchText(input.query);
  return filterProductsByPrimaryCategory(products, input.selectedCategory).filter((product) => {
    if (!normalizedQuery) return true;
    return buildProductSearchText(product).includes(normalizedQuery);
  });
}
