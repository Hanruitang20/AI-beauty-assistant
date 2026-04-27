import { getSummaryByProductId, getSummaryMap, saveSummaryByProductId } from "@/lib/products-store";
import { ProductSummaryRepository } from "@/lib/repositories/product-summary-repository";

const SUMMARY_KEY = "beautyshelf.product-summaries";

export const localProductSummaryRepository: ProductSummaryRepository = {
  async getByProductId(productId) {
    return getSummaryByProductId(productId);
  },

  async saveByProductId(productId, summary) {
    saveSummaryByProductId(productId, summary);
  },

  async deleteByProductId(productId) {
    if (typeof window === "undefined") return;
    const map = getSummaryMap();
    if (!map[productId]) return;
    const next = { ...map };
    delete next[productId];
    window.localStorage.setItem(SUMMARY_KEY, JSON.stringify(next));
  },

  async getAll() {
    return getSummaryMap();
  },
};
