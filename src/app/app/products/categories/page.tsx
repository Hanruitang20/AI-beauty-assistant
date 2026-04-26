"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { BeautyProduct, ProductCategory, productCategoryLabelMap, productStatusLabelMap } from "@/lib/products";
import { getStoredProducts } from "@/lib/products-store";

const categoryTabs: Array<{ key: ProductCategory; label: string }> = [
  { key: "cleanser", label: "洁面" },
  { key: "serum", label: "精华" },
  { key: "moisturizer", label: "面霜/乳液" },
  { key: "sunscreen", label: "防晒" },
  { key: "makeup", label: "彩妆" },
];

export default function ProductCategoriesPage() {
  const [items] = useState<BeautyProduct[]>(() => getStoredProducts());
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("cleanser");

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
        {grouped.length === 0 ? (
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
