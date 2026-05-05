import { localAuthRepository } from "@/lib/local/local-auth-repository";
import { localProductExperienceRepository } from "@/lib/local/local-product-experience-repository";
import { localProductRepository } from "@/lib/local/local-product-repository";
import { localProductSummaryRepository } from "@/lib/local/local-product-summary-repository";
import { localProfileRepository } from "@/lib/local/local-profile-repository";
import { remoteAuthRepository } from "@/lib/remote/remote-auth-repository";
import { DataSource, DataSourceMode } from "@/lib/data-source-types";

export const DEFAULT_DATA_SOURCE_MODE: DataSourceMode = "remote";

function resolveDataSourceMode(): DataSourceMode {
  const raw = process.env.NEXT_PUBLIC_DATA_SOURCE;
  if (!raw) return "remote";
  if (raw === "local") return "local";
  return "remote";
}

export const CURRENT_DATA_SOURCE_MODE: DataSourceMode = resolveDataSourceMode();
export const AUTH_DATA_SOURCE_MODE: DataSourceMode = CURRENT_DATA_SOURCE_MODE;

function resolveAuthProvider() {
  const raw = process.env.NEXT_PUBLIC_AUTH_PROVIDER;
  if (!raw) return "custom";
  return raw === "firebase" ? "firebase" : "custom";
}

const remoteStorageBackedDataSource: DataSource = {
  // Remote mode uses real auth provider + userId-scoped local storage repositories
  // until full remote data repositories are implemented.
  products: localProductRepository,
  profile: localProfileRepository,
  experiences: localProductExperienceRepository,
  summaries: localProductSummaryRepository,
  auth: remoteAuthRepository,
};

const runtimeDataSourceByMode: Record<DataSourceMode, DataSource> = {
  local: {
    products: localProductRepository,
    profile: localProfileRepository,
    experiences: localProductExperienceRepository,
    summaries: localProductSummaryRepository,
    auth: localAuthRepository,
  },
  remote: remoteStorageBackedDataSource,
};

if (process.env.NODE_ENV === "development") {
  const raw = process.env.NEXT_PUBLIC_DATA_SOURCE;
  const authProvider = resolveAuthProvider();
  console.info("[AuthDiagnostics] dataSource =", CURRENT_DATA_SOURCE_MODE);
  console.info("[AuthDiagnostics] authProvider =", authProvider);
  console.info("[AuthDiagnostics] NEXT_PUBLIC_DATA_SOURCE =", raw || "(unset -> remote)");
  if (CURRENT_DATA_SOURCE_MODE === "local") {
    console.warn("[AuthDiagnostics] local mode is dev backup only; default real-chain mode is remote/custom auth.");
  }
}

export const dataSource: DataSource = {
  ...runtimeDataSourceByMode[CURRENT_DATA_SOURCE_MODE],
};

export function getDataSource(mode: DataSourceMode = CURRENT_DATA_SOURCE_MODE) {
  return runtimeDataSourceByMode[mode];
}
