import { ProductExperienceRepository } from "@/lib/repositories/product-experience-repository";

function notImplemented(): never {
  throw new Error("Remote data source is not implemented yet.");
}

export const remoteProductExperienceRepository: ProductExperienceRepository = {
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
  async getByProductIds() {
    return notImplemented();
  },
};
