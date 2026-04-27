import { BeautyProduct } from "@/lib/products";

export interface ProductRepository {
  getAll(): Promise<BeautyProduct[]>;
  getById(id: string): Promise<BeautyProduct | null>;
  create(input: Omit<BeautyProduct, "id">): Promise<BeautyProduct>;
  update(id: string, updates: Omit<BeautyProduct, "id">): Promise<BeautyProduct | null>;
  delete(id: string): Promise<void>;
  getRecentViewedIds(): Promise<string[]>;
  markViewed(id: string): Promise<void>;
}
