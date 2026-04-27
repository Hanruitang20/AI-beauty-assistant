"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { BeautyProduct, getCategoryLabel } from "@/lib/products";
import { getProductSummaryAsync, getProductsAsync } from "@/lib/product-service";

export default function SummarizedProductsPage() {
  const [summarizedItems, setSummarizedItems] = useState<BeautyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const items = await getProductsAsync();
        if (!active) return;
        const summaries = await Promise.all(items.map((item) => getProductSummaryAsync(item.id)));
        if (!active) return;
        const nextItems = items.filter((_, index) => Boolean(summaries[index]));
        setSummarizedItems(nextItems);
      } catch {
        if (!active) return;
        setError("摘要列表加载失败，请稍后重试。");
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
        <h1 className="editorial-heading text-[28px] font-semibold text-[var(--foreground)]">已生成摘要</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">查看已经完成结构化整理的产品。</p>
      </div>

      <Card className="space-y-3 rounded-[24px]">
        {loading ? (
          <p className="text-sm text-[var(--text-muted)]">数据加载中...</p>
        ) : error ? (
          <p className="text-sm text-[var(--text-muted)]">{error}</p>
        ) : summarizedItems.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">还没有已生成摘要的产品，可去详情页生成。</p>
        ) : (
          <div className="grid gap-3">
            {summarizedItems.map((product) => (
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
