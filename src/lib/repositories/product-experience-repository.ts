import type { ProductExperience, ProductExperiencePatch } from "@/lib/product-experience-service";

export interface ProductExperienceRepository {
  getByProductId(productId: string): Promise<ProductExperience | null>;
  saveByProductId(productId: string, patch: ProductExperiencePatch): Promise<ProductExperience>;
  deleteByProductId(productId: string): Promise<void>;
  getAll(): Promise<Record<string, ProductExperience>>;
  getByProductIds(productIds: string[]): Promise<Record<string, ProductExperience>>;
}
