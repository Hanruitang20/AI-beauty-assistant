import { AuthRepository } from "@/lib/repositories/auth-repository";
import { ProductExperienceRepository } from "@/lib/repositories/product-experience-repository";
import { ProductRepository } from "@/lib/repositories/product-repository";
import { ProductSummaryRepository } from "@/lib/repositories/product-summary-repository";
import { ProfileRepository } from "@/lib/repositories/profile-repository";

export type DataSource = {
  products: ProductRepository;
  profile: ProfileRepository;
  experiences: ProductExperienceRepository;
  summaries: ProductSummaryRepository;
  auth: AuthRepository;
};

export type DataSourceMode = "local" | "remote";
