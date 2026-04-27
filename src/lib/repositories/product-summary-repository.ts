import { ProductSummary } from "@/lib/products-store";

export interface ProductSummaryRepository {
  getByProductId(productId: string): Promise<ProductSummary | null>;
  saveByProductId(productId: string, summary: ProductSummary): Promise<void>;
  deleteByProductId(productId: string): Promise<void>;
  getAll(): Promise<Record<string, ProductSummary>>;
}
