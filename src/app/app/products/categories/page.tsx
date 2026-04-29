"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { BeautyProduct, productCategoryLabelMap, productStatusLabelMap } from "@/lib/products";
import { getProductsAsync } from "@/lib/product-service";
import { SKINCARE_PRODUCT_CATEGORY_OPTIONS, SkincareCategoryValue } from "@/lib/product-options";

const categoryTabs: Array<{ key: SkincareCategoryValue; label: string }> = SKINCARE_PRODUCT_CATEGORY_OPTIONS.map((item) => ({
  key: item.value,
  label: item.label,
}));

export default function ProductCategoriesPage() {
  const [items, setItems] = useState<BeautyProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState<SkincareCategoryValue>("cleanser");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const nextItems = await getProductsAsync();
        if (!active) return;
        setItems(nextItems);
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

  const grouped = useMemo(() => {
    return items.filter((item) => item.category === activeCategory);
  }, [items, activeCategory]);

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="editorial-heading text-[28px] font-semibold text-[var(--foreground)]">分类浏览</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">按品类快速查看你的产品记录。</p>
      </div>

      <Card className="space-y-3 rounded-[24px]">
        <div className="flex flex-wrap gap-2">
          {categoryTabs.map((tab) => {
            const active = tab.key === activeCategory;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveCategory(tab.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${active ? "bg-[var(--accent)] text-white" : "bg-[var(--surface-soft)] text-[var(--foreground)]"}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-3 rounded-[24px]">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          {productCategoryLabelMap[activeCategory]}
        </h3>
        {loading ? (
          <p className="text-sm text-[var(--text-muted)]">数据加载中...</p>
        ) : error ? (
          <p className="text-sm text-[var(--text-muted)]">{error}</p>
        ) : grouped.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">这个分类下还没有产品。</p>
        ) : (
          <div className="grid gap-3">
            {grouped.map((product) => (
              <Link
                key={product.id}
                href={`/app/products/${product.id}`}
                className="rounded-2xl border bg-[var(--surface)] p-3"
                style={{ borderColor: "var(--border-soft)" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-[var(--foreground)]">{product.name}</p>
                  <span className="rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-xs text-[var(--accent-strong)]">
                    {productStatusLabelMap[product.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{product.brand}</p>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
