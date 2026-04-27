import type { ProductExperience } from "@/lib/product-experience-service";
import { ProductExperienceRepository } from "@/lib/repositories/product-experience-repository";
import { getScopedStorageKey, getScopedStorageKeyWithLegacyMigration } from "@/lib/storage-scope";

const PRODUCT_EXPERIENCES_KEY = "product-experiences";

type ProductExperienceMap = Record<string, ProductExperience>;

function hasWindow() {
  return typeof window !== "undefined";
}

function getExperienceMap(): ProductExperienceMap {
  if (!hasWindow()) return {};
  const experiencesKey = getScopedStorageKeyWithLegacyMigration(PRODUCT_EXPERIENCES_KEY, ["beautyshelf.product-experiences"]);
  if (!experiencesKey) return {};
  const raw = window.localStorage.getItem(experiencesKey);
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
  const experiencesKey = getScopedStorageKey(PRODUCT_EXPERIENCES_KEY);
  if (!experiencesKey) return;
  window.localStorage.setItem(experiencesKey, JSON.stringify(map));
}

export const localProductExperienceRepository: ProductExperienceRepository = {
  async getByProductId(productId) {
    return getExperienceMap()[productId] || null;
  },

  async saveByProductId(productId, patch) {
    const map = getExperienceMap();
    const previous = map[productId];
    const next: ProductExperience = {
      ...(previous || {}),
      ...patch,
      productId,
      updatedAt: new Date().toISOString(),
    };
    map[productId] = next;
    saveExperienceMap(map);
    return next;
  },

  async deleteByProductId(productId) {
    const map = getExperienceMap();
    if (!map[productId]) return;
    delete map[productId];
    saveExperienceMap(map);
  },

  async getAll() {
    return getExperienceMap();
  },

  async getByProductIds(productIds) {
    const map = getExperienceMap();
    return productIds.reduce<Record<string, ProductExperience>>((acc, id) => {
      if (map[id]) acc[id] = map[id];
      return acc;
    }, {});
  },
};
