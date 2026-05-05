import { dataSource } from "@/lib/data-source";
import { getScopedStorageKey, getScopedStorageKeyWithLegacyMigration } from "@/lib/storage-scope";

export type ProductRating = 1 | 2 | 3 | 4 | 5;
export type ProductUsageFrequency = "daily" | "weekly" | "occasionally" | "not_started";
export type ProductReaction =
  | "none"
  | "no_issue"
  | "comfortable"
  | "hydrating"
  | "absorbs_fast"
  | "gentle"
  | "effective"
  | "uncomfortable"
  | "irritating_or_breakout"
  | "dry_or_tight"
  | "texture_not_ideal"
  | "clogging_or_breakout"
  | "stinging_or_redness"
  | "too_oily_or_heavy"
  | "drying_or_cakey"
  | "not_smooth_or_pilling"
  | "poor_longevity"
  | "finish_not_ideal"
  | "greasy_or_heavy"
  | "scalp_or_body_discomfort"
  | "unclear_effect"
  | "scent_discomfort"
  | "hard_to_use"
  | "unsure";
export type ProductIntention = "continue" | "repurchase" | "stop" | "observing";

export type ProductExperience = {
  productId: string;
  rating?: ProductRating;
  usageFrequency?: ProductUsageFrequency;
  reaction?: ProductReaction;
  intention?: ProductIntention;
  feedbackNote?: string;
  updatedAt: string;
};
export type ProductExperiencePatch = Partial<Omit<ProductExperience, "productId" | "updatedAt">>;

const PRODUCT_EXPERIENCES_KEY = "product-experiences";
const LEGACY_PRODUCT_EXPERIENCES_KEYS = ["beautyshelf.product-experiences"];

type ProductExperienceMap = Record<string, ProductExperience>;

function hasWindow() {
  return typeof window !== "undefined";
}

function getExperienceMap(): ProductExperienceMap {
  if (!hasWindow()) return {};
  const key = getScopedStorageKeyWithLegacyMigration(PRODUCT_EXPERIENCES_KEY, LEGACY_PRODUCT_EXPERIENCES_KEYS);
  if (!key) return {};
  const raw = window.localStorage.getItem(key);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as ProductExperienceMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveExperienceMap(map: ProductExperienceMap) {
  if (!hasWindow()) return;
  const key = getScopedStorageKey(PRODUCT_EXPERIENCES_KEY);
  if (!key) return;
  window.localStorage.setItem(key, JSON.stringify(map));
}

export function getProductExperience(productId: string) {
  return getExperienceMap()[productId] || null;
}

export function saveProductExperience(
  productId: string,
  patch: ProductExperiencePatch,
) {
  const map = getExperienceMap();
  const previous = map[productId];
  const next: ProductExperience = {
    ...(previous || {}),
    productId,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  map[productId] = next;
  saveExperienceMap(map);
  return next;
}

export async function getProductExperienceAsync(productId: string) {
  return dataSource.experiences.getByProductId(productId);
}

export async function saveProductExperienceAsync(productId: string, patch: ProductExperiencePatch) {
  return dataSource.experiences.saveByProductId(productId, patch);
}

export async function deleteProductExperienceAsync(productId: string) {
  await dataSource.experiences.deleteByProductId(productId);
}

export async function getAllProductExperiencesAsync() {
  return dataSource.experiences.getAll();
}

export async function getExperiencesByProductIdsAsync(productIds: string[]) {
  return dataSource.experiences.getByProductIds(productIds);
}

export function deleteProductExperience(productId: string) {
  const map = getExperienceMap();
  if (!map[productId]) return;
  delete map[productId];
  saveExperienceMap(map);
}

export function getAllProductExperiences() {
  return getExperienceMap();
}

export function getExperiencesByProductIds(productIds: string[]) {
  const map = getExperienceMap();
  return productIds.reduce<Record<string, ProductExperience>>((acc, id) => {
    if (map[id]) acc[id] = map[id];
    return acc;
  }, {});
}
