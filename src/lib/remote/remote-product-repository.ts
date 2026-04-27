import { ProductRepository } from "@/lib/repositories/product-repository";

function notImplemented(): never {
  throw new Error("Remote data source is not implemented yet.");
}

export const remoteProductRepository: ProductRepository = {
  async getAll() {
    return notImplemented();
  },
  async getById() {
    return notImplemented();
  },
  async create() {
    return notImplemented();
  },
  async update() {
    return notImplemented();
  },
  async delete() {
    return notImplemented();
  },
  async getRecentViewedIds() {
    return notImplemented();
  },
  async markViewed() {
    return notImplemented();
  },
};
