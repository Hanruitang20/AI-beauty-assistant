"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import {
  buildProductSearchText,
  filterProductsByPrimaryCategory,
  filterProductsBySearchAndCategory,
  normalizeSearchText,
} from "@/lib/product-filters";
import {
  BeautyProduct,
  productStatusLabelMap,
  sourceTypeLabelMap,
} from "@/lib/products";
import { appendReturnTo, getCurrentPathWithQuery } from "@/lib/navigation";
import { TopLevelCategory, topLevelCategoryOptions } from "@/lib/product-taxonomy";
import { getProductsAsync } from "@/lib/product-service";
import { getExperiencesByProductIdsAsync, ProductExperience } from "@/lib/product-experience-service";

export default function AllProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<BeautyProduct[]>([]);
  const [experiencesByProductId, setExperiencesByProductId] = useState<Record<string, ProductExperience>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const query = searchParams.get("q") || "";
  const selectedCategory = getCategoryIdFromParam(searchParams.get("category"));

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const nextItems = await getProductsAsync();
        if (!active) return;
        setItems(nextItems);
        const nextExperiences = await getExperiencesByProductIdsAsync(nextItems.map((item) => item.id));
        if (!active) return;
        setExperiencesByProductId(nextExperiences);
      } catch {
        if (!active) return;
        setError("产品数据加载失败，请稍后重试。");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const currentReturnTo = useMemo(() => {
    return getCurrentPathWithQuery(pathname, searchParams);
  }, [pathname, searchParams]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);
    const productsByCategory = filterProductsByPrimaryCategory(items, selectedCategory);

    // Keep the same query behavior while using shared helper building blocks.
    const productsByQuery = productsByCategory.filter((product) => {
      if (!normalizedQuery) return true;
      return buildProductSearchText(product).includes(normalizedQuery);
    });

    // Shared combined helper is called to keep one canonical entry point available.
    const combined = filterProductsBySearchAndCategory(items, {
      query,
      selectedCategory,
    });

    if (normalizedQuery) return combined;
    return productsByQuery;
  }, [query, selectedCategory, items]);

  function updateFilters(next: { query?: string; category?: TopLevelCategory }) {
    const params = new URLSearchParams(searchParams.toString());
    const resolvedQuery = next.query ?? query;
    const resolvedCategory = next.category ?? selectedCategory;

    if (resolvedQuery.trim()) {
      params.set("q", resolvedQuery);
    } else {
      params.delete("q");
    }

    if (resolvedCategory === "all") {
      params.delete("category");
    } else {
      const label = topLevelCategoryOptions.find((item) => item.id === resolvedCategory)?.label || "";
      if (label) params.set("category", label);
    }

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="editorial-heading text-[28px] font-semibold text-[var(--foreground)]">全部产品</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">回看你记录过的产品，也作为 AI 判断的依据。</p>
      </div>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">⌕</span>
        <Input
          placeholder="搜索产品名或品牌"
          value={query}
          onChange={(event) => updateFilters({ query: event.target.value })}
          className="h-12 rounded-2xl pl-10 pr-3"
        />
      </div>

      <div className="-mx-1 hide-scrollbar overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2 px-1">
          {topLevelCategoryOptions.map((category) => {
            const active = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => updateFilters({ category: category.id })}
                className={[
                  "h-9 flex-shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-soft)]",
                ].join(" ")}
                style={{ borderColor: active ? "var(--accent)" : "var(--border-soft)" }}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      <Card className="space-y-3 rounded-[24px]">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          产品列表（{filteredProducts.length}）
        </h3>
        {query ? (
          <p className="text-xs text-[var(--text-muted)]">
            搜索中：{query}
          </p>
        ) : null}
        {loading ? (
          <FeedbackState>产品加载中...</FeedbackState>
        ) : error ? (
          <FeedbackState>{error}</FeedbackState>
        ) : items.length === 0 ? (
          <div className="space-y-3">
            <FeedbackState>还没有产品记录。</FeedbackState>
            <Link href="/app/products/new">
              <Button className="w-full">添加第一个产品</Button>
            </Link>
          </div>
        ) : filteredProducts.length === 0 ? (
          <FeedbackState>没有找到匹配的产品。可以换个关键词，或切回「全部」查看。</FeedbackState>
        ) : (
          <div className="grid gap-3">
            {filteredProducts.map((product) => (
              <ProductListItem
                key={product.id}
                product={product}
                returnTo={currentReturnTo}
                rating={experiencesByProductId[product.id]?.rating}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function getCategoryIdFromParam(rawCategory: string | null): TopLevelCategory {
  if (!rawCategory) return "all";
  const byId = topLevelCategoryOptions.find((item) => item.id === rawCategory);
  if (byId) return byId.id;
  const byLabel = topLevelCategoryOptions.find((item) => item.label === rawCategory);
  if (byLabel) return byLabel.id;
  return "all";
}

function ProductListItem({ product, returnTo, rating }: { product: BeautyProduct; returnTo: string; rating?: number }) {
  return (
    <Link
      href={appendReturnTo(`/app/products/${product.id}`, returnTo)}
      className="block rounded-[18px] border bg-[var(--surface)] p-4 shadow-[0_4px_16px_rgba(60,53,48,0.04)] transition hover:bg-[var(--surface-soft)]"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-base font-semibold text-[var(--foreground)]">{product.name}</p>
        <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-strong)]">
          {productStatusLabelMap[product.status]}
        </span>
      </div>
      {typeof rating === "number" ? (
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          <span className="text-[var(--accent)]">{"★".repeat(Math.max(0, Math.min(5, rating)))}</span>
          <span className="text-[var(--border-soft)]">{"☆".repeat(Math.max(0, 5 - Math.min(5, rating)))}</span>
          <span className="ml-1">{Math.min(5, Math.max(0, rating))}/5</span>
        </p>
      ) : null}
      <p className="mt-1 text-xs text-[var(--text-muted)]">来源：{sourceTypeLabelMap[product.sourceType]}</p>
    </Link>
  );
}
