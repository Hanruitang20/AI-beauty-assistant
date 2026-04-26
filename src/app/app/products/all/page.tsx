"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import {
  BeautyProduct,
  getCategoryLabel,
  productStatusLabelMap,
  sourceTypeLabelMap,
} from "@/lib/products";
import { mapToTopLevelCategory, TopLevelCategory, topLevelCategoryOptions } from "@/lib/product-taxonomy";
import { getStoredProducts } from "@/lib/products-store";

export default function AllProductsPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TopLevelCategory>("all");
  const [items] = useState<BeautyProduct[]>(() => getStoredProducts());

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    return items.filter((product) => {
      const categoryLabel = getCategoryLabel(product.category);
      const searchableText = normalizeText([
        product.name,
        product.brand,
        product.category,
        categoryLabel,
        sourceTypeLabelMap[product.sourceType],
        product.note || "",
      ].join(" "));
      const matchQuery =
        !normalizedQuery ||
        searchableText.includes(normalizedQuery);
      const productTopLevelCategory = mapToTopLevelCategory(product.category);
      const matchCategory = selectedCategory === "all" || productTopLevelCategory === selectedCategory;
      return matchQuery && matchCategory;
    });
  }, [query, selectedCategory, items]);

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
          onChange={(event) => setQuery(event.target.value)}
          className="h-12 rounded-2xl pl-10 pr-3"
        />
      </div>

      <div className="-mx-1 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2 px-1">
          {topLevelCategoryOptions.map((category) => {
            const active = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
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
        {items.length === 0 ? (
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
              <ProductListItem key={product.id} product={product} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function ProductListItem({ product }: { product: BeautyProduct }) {
  return (
    <Link
      href={`/app/products/${product.id}`}
      className="block rounded-[18px] border bg-[var(--surface)] p-4 shadow-[0_4px_16px_rgba(60,53,48,0.04)] transition hover:bg-[var(--surface-soft)]"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-base font-semibold text-[var(--foreground)]">{product.name}</p>
        <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-strong)]">
          {productStatusLabelMap[product.status]}
        </span>
      </div>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        {product.brand} · {getCategoryLabel(product.category)}
      </p>
      <p className="text-xs text-[var(--text-muted)]">来源：{sourceTypeLabelMap[product.sourceType]}</p>
    </Link>
  );
}
