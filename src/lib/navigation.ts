type SearchParamsLike = URLSearchParams | { toString(): string };

export function getSafeReturnTo(value: string | null, fallback: string): string {
  if (!value) return fallback;
  if (!value.startsWith("/app/")) return fallback;
  return value;
}

export function appendReturnTo(path: string, returnTo: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}returnTo=${encodeURIComponent(returnTo)}`;
}

export function getCurrentPathWithQuery(pathname: string, searchParams: SearchParamsLike) {
  const qs = new URLSearchParams(searchParams.toString()).toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
