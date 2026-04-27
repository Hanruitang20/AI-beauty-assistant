import { ProductSummaryRepository } from "@/lib/repositories/product-summary-repository";

function notImplemented(): never {
  throw new Error("Remote data source is not implemented yet.");
}

export const remoteProductSummaryRepository: ProductSummaryRepository = {
  async getByProductId() {
    return notImplemented();
  },
  async saveByProductId() {
    return notImplemented();
  },
  async deleteByProductId() {
    return notImplemented();
  },
  async getAll() {
    return notImplemented();
  },
};
