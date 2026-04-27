import { localAuthRepository } from "@/lib/local/local-auth-repository";
import { localProductExperienceRepository } from "@/lib/local/local-product-experience-repository";
import { localProductRepository } from "@/lib/local/local-product-repository";
import { localProductSummaryRepository } from "@/lib/local/local-product-summary-repository";
import { localProfileRepository } from "@/lib/local/local-profile-repository";
import { remoteAuthRepository } from "@/lib/remote/remote-auth-repository";
import { remoteProductExperienceRepository } from "@/lib/remote/remote-product-experience-repository";
import { remoteProductRepository } from "@/lib/remote/remote-product-repository";
import { remoteProductSummaryRepository } from "@/lib/remote/remote-product-summary-repository";
import { remoteProfileRepository } from "@/lib/remote/remote-profile-repository";
import { DataSource, DataSourceMode } from "@/lib/data-source-types";

const dataSourceByMode: Record<DataSourceMode, DataSource> = {
  local: {
    products: localProductRepository,
    profile: localProfileRepository,
    experiences: localProductExperienceRepository,
    summaries: localProductSummaryRepository,
    auth: localAuthRepository,
  },
  remote: {
    products: remoteProductRepository,
    profile: remoteProfileRepository,
    experiences: remoteProductExperienceRepository,
    summaries: remoteProductSummaryRepository,
    auth: remoteAuthRepository,
  },
};

export const DEFAULT_DATA_SOURCE_MODE: DataSourceMode = "local";

function resolveDataSourceMode(): DataSourceMode {
  return process.env.NEXT_PUBLIC_DATA_SOURCE === "remote" ? "remote" : "local";
}

export const AUTH_DATA_SOURCE_MODE: DataSourceMode = resolveDataSourceMode();

if (process.env.NODE_ENV === "development") {
  // Development visibility for source switching.
  console.info("[DataSource] NEXT_PUBLIC_DATA_SOURCE =", process.env.NEXT_PUBLIC_DATA_SOURCE || "local");
  console.info("[DataSource] auth source =", AUTH_DATA_SOURCE_MODE);
}

export const dataSource: DataSource = {
  ...dataSourceByMode[DEFAULT_DATA_SOURCE_MODE],
  auth: dataSourceByMode[AUTH_DATA_SOURCE_MODE].auth,
};

export function getDataSource(mode: DataSourceMode = DEFAULT_DATA_SOURCE_MODE) {
  return dataSourceByMode[mode];
}
