"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { BeautyProduct, getCategoryLabel } from "@/lib/products";
import { getProductsAsync, getRecentViewedProductIdsListAsync } from "@/lib/product-service";

export default function RecentViewedProductsPage() {
  const [recentViewed, setRecentViewed] = useState<BeautyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [items, recentViewedIds] = await Promise.all([getProductsAsync(), getRecentViewedProductIdsListAsync()]);
        if (!active) return;
        const next = recentViewedIds
          .map((id) => items.find((item) => item.id === id))
          .filter((item): item is BeautyProduct => Boolean(item));
        setRecentViewed(next);
      } catch {
        if (!active) return;
        setError("最近浏览加载失败，请稍后重试。");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="editorial-heading text-[28px] font-semibold text-[var(--foreground)]">最近查看</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">继续你最近浏览过的产品判断。</p>
      </div>

      <Card className="space-y-3 rounded-[24px]">
        {loading ? (
          <p className="text-sm text-[var(--text-muted)]">数据加载中...</p>
        ) : error ? (
          <p className="text-sm text-[var(--text-muted)]">{error}</p>
        ) : recentViewed.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">你最近还没有查看过产品详情。</p>
        ) : (
          <div className="grid gap-3">
            {recentViewed.map((product) => (
              <Link
                key={product.id}
                href={`/app/products/${product.id}`}
                className="rounded-2xl border bg-[var(--surface)] p-3"
                style={{ borderColor: "var(--border-soft)" }}
              >
                <p className="font-semibold text-[var(--foreground)]">{product.name}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {product.brand} · {getCategoryLabel(product.category)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
