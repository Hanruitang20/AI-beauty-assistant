export type ProductRating = 1 | 2 | 3 | 4 | 5;
export type ProductUsageFrequency = "daily" | "weekly" | "occasionally" | "not_started";
export type ProductReaction =
  | "none"
  | "no_issue"
  | "uncomfortable"
  | "irritating_or_breakout"
  | "dry_or_tight"
  | "texture_not_ideal"
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

const PRODUCT_EXPERIENCES_KEY = "beautyshelf.product-experiences";

type ProductExperienceMap = Record<string, ProductExperience>;

function hasWindow() {
  return typeof window !== "undefined";
}

function getExperienceMap(): ProductExperienceMap {
  if (!hasWindow()) return {};
  const raw = window.localStorage.getItem(PRODUCT_EXPERIENCES_KEY);
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
  window.localStorage.setItem(PRODUCT_EXPERIENCES_KEY, JSON.stringify(map));
}

export function getProductExperience(productId: string) {
  return getExperienceMap()[productId] || null;
}

export function saveProductExperience(
  productId: string,
  patch: Partial<Omit<ProductExperience, "productId" | "updatedAt">>,
) {
  const map = getExperienceMap();
  const previous = map[productId];
  const next: ProductExperience = {
    productId,
    ...(previous || {}),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  map[productId] = next;
  saveExperienceMap(map);
  return next;
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
