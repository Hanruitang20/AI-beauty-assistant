import { BeautyProduct } from "@/lib/products";
import {
  createProduct as createStoredProduct,
  deleteProductById,
  generateMockSummary,
  getProductById as getStoredProductById,
  getRecentViewedProductIds,
  getStoredProducts,
  getSummaryByProductId,
  ProductSummary,
  saveSummaryByProductId,
  updateProduct as updateStoredProduct,
  markProductViewed as markStoredProductViewed,
} from "@/lib/products-store";

export type ProductInput = Omit<BeautyProduct, "id">;

export function getProducts() {
  return getStoredProducts();
}

export function getProductById(id: string) {
  return getStoredProductById(id);
}

export function createProduct(input: ProductInput) {
  return createStoredProduct(input);
}

export function updateProduct(id: string, updates: ProductInput) {
  return updateStoredProduct(id, updates);
}

export function deleteProduct(id: string) {
  deleteProductById(id);
}

export function getRecentProducts(limit = 5) {
  return getStoredProducts().slice(0, limit);
}

export function getRecentViewedProductIdsList() {
  return getRecentViewedProductIds();
}

export function getRecentViewedProducts(limit = 8) {
  const products = getStoredProducts();
  const byId = new Map(products.map((item) => [item.id, item]));
  return getRecentViewedProductIds()
    .map((id) => byId.get(id) || null)
    .filter((item): item is BeautyProduct => Boolean(item))
    .slice(0, limit);
}

export function markProductViewed(id: string) {
  markStoredProductViewed(id);
}

export function getProductSummary(productId: string) {
  return getSummaryByProductId(productId);
}

export function saveProductSummary(productId: string, summary: ProductSummary) {
  saveSummaryByProductId(productId, summary);
}

export function generateMockProductSummary(product: BeautyProduct) {
  return generateMockSummary(product);
}
