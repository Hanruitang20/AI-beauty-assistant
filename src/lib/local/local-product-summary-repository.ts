import { getSummaryByProductId, getSummaryMap, saveSummaryByProductId } from "@/lib/products-store";
import { ProductSummaryRepository } from "@/lib/repositories/product-summary-repository";
import { getScopedStorageKey } from "@/lib/storage-scope";

const SUMMARY_KEY = "product-summaries";

export const localProductSummaryRepository: ProductSummaryRepository = {
  async getByProductId(productId) {
    return getSummaryByProductId(productId);
  },

  async saveByProductId(productId, summary) {
    saveSummaryByProductId(productId, summary);
  },

  async deleteByProductId(productId) {
    if (typeof window === "undefined") return;
    const summaryKey = getScopedStorageKey(SUMMARY_KEY);
    if (!summaryKey) return;
    const map = getSummaryMap();
    if (!map[productId]) return;
    const next = { ...map };
    delete next[productId];
    window.localStorage.setItem(summaryKey, JSON.stringify(next));
  },

  async getAll() {
    return getSummaryMap();
  },
};
