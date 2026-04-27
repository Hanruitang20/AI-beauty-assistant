import {
  createProduct,
  deleteProductById,
  getProductById,
  getRecentViewedProductIds,
  getStoredProducts,
  markProductViewed,
  updateProduct,
} from "@/lib/products-store";
import { ProductRepository } from "@/lib/repositories/product-repository";

export const localProductRepository: ProductRepository = {
  async getAll() {
    return getStoredProducts();
  },

  async getById(id) {
    return getProductById(id);
  },

  async create(input) {
    return createProduct(input);
  },

  async update(id, updates) {
    return updateProduct(id, updates);
  },

  async delete(id) {
    deleteProductById(id);
  },

  async getRecentViewedIds() {
    return getRecentViewedProductIds();
  },

  async markViewed(id) {
    markProductViewed(id);
  },
};
