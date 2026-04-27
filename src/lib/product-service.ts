import { dataSource } from "@/lib/data-source";
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

export async function getProductsAsync() {
  return dataSource.products.getAll();
}

export function getProductById(id: string) {
  return getStoredProductById(id);
}

export async function getProductByIdAsync(id: string) {
  return dataSource.products.getById(id);
}

export function createProduct(input: ProductInput) {
  return createStoredProduct(input);
}

export async function createProductAsync(input: ProductInput) {
  return dataSource.products.create(input);
}

export function updateProduct(id: string, updates: ProductInput) {
  return updateStoredProduct(id, updates);
}

export async function updateProductAsync(id: string, updates: ProductInput) {
  return dataSource.products.update(id, updates);
}

export function deleteProduct(id: string) {
  deleteProductById(id);
}

export async function deleteProductAsync(id: string) {
  await dataSource.products.delete(id);
}

export function getRecentProducts(limit = 5) {
  return getStoredProducts().slice(0, limit);
}

export async function getRecentProductsAsync(limit = 5) {
  const products = await dataSource.products.getAll();
  return products.slice(0, limit);
}

export function getRecentViewedProductIdsList() {
  return getRecentViewedProductIds();
}

export async function getRecentViewedProductIdsListAsync() {
  return dataSource.products.getRecentViewedIds();
}

export function getRecentViewedProducts(limit = 8) {
  const products = getStoredProducts();
  const byId = new Map(products.map((item) => [item.id, item]));
  return getRecentViewedProductIds()
    .map((id) => byId.get(id) || null)
    .filter((item): item is BeautyProduct => Boolean(item))
    .slice(0, limit);
}

export async function getRecentViewedProductsAsync(limit = 8) {
  const products = await dataSource.products.getAll();
  const byId = new Map(products.map((item) => [item.id, item]));
  const recentViewedIds = await dataSource.products.getRecentViewedIds();
  return recentViewedIds
    .map((id) => byId.get(id) || null)
    .filter((item): item is BeautyProduct => Boolean(item))
    .slice(0, limit);
}

export function markProductViewed(id: string) {
  markStoredProductViewed(id);
}

export async function markProductViewedAsync(id: string) {
  await dataSource.products.markViewed(id);
}

export function getProductSummary(productId: string) {
  return getSummaryByProductId(productId);
}

export async function getProductSummaryAsync(productId: string) {
  return dataSource.summaries.getByProductId(productId);
}

export function saveProductSummary(productId: string, summary: ProductSummary) {
  saveSummaryByProductId(productId, summary);
}

export async function saveProductSummaryAsync(productId: string, summary: ProductSummary) {
  await dataSource.summaries.saveByProductId(productId, summary);
}

export function generateMockProductSummary(product: BeautyProduct) {
  return generateMockSummary(product);
}

export async function generateMockProductSummaryAsync(product: BeautyProduct) {
  return generateMockSummary(product);
}
