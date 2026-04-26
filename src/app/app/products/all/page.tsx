"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import {
  BeautyProduct,
  ProductStatus,
  getCategoryLabel,
  productStatusLabelMap,
  sourceTypeLabelMap,
} from "@/lib/products";
import { getStoredProducts } from "@/lib/products-store";

type Filters = {
  status: "" | ProductStatus;
  category: string;
  brand: string;
};

const initialFilters: Filters = {
  status: "",
  category: "",
  brand: "",
};

export default function AllProductsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [items] = useState<BeautyProduct[]>(() => getStoredProducts());
  const categoryOptions = useMemo(() => Array.from(new Set(items.map((item) => item.category))), [items]);

  const filteredProducts = useMemo(() => {
    return items.filter((product) => {
      const matchQuery =
        !query ||
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase());
      const matchStatus = !filters.status || product.status === filters.status;
      const matchCategory = !filters.category || product.category === filters.category;
      const matchBrand = !filters.brand || product.brand.toLowerCase().includes(filters.brand.toLowerCase());
      return matchQuery && matchStatus && matchCategory && matchBrand;
    });
  }, [filters, query, items]);

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="editorial-heading text-[28px] font-semibold text-[var(--foreground)]">全部产品</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">这里承载完整浏览与筛选。</p>
      </div>

      <Card className="space-y-4 rounded-[24px]">
        <div className="grid gap-2">
          <Input placeholder="搜索产品名或品牌" value={query} onChange={(event) => setQuery(event.target.value)} />
          <Select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as Filters["status"] }))}
          >
            <option value="">全部状态</option>
            <option value="using">正在使用</option>
            <option value="wishlist">想购买</option>
            <option value="used">用过</option>
            <option value="recommended">被推荐</option>
          </Select>
          <Select
            value={filters.category}
            onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value as Filters["category"] }))}
          >
            <option value="">全部品类</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </Select>
          <Input
            placeholder="按品牌筛选"
            value={filters.brand}
            onChange={(event) => setFilters((prev) => ({ ...prev, brand: event.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" className="text-xs" onClick={() => setFilters((prev) => ({ ...prev, status: "recommended" }))}>
            快捷筛选：被推荐
          </Button>
          <Button variant="secondary" className="text-xs" onClick={() => setFilters((prev) => ({ ...prev, status: "wishlist" }))}>
            快捷筛选：想购买
          </Button>
        </div>
      </Card>

      <Card className="space-y-3 rounded-[24px]">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">产品列表</h3>
        {filteredProducts.length === 0 ? (
          <FeedbackState>没有匹配当前搜索和筛选条件的产品。</FeedbackState>
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

function ProductListItem({ product }: { product: BeautyProduct }) {
  return (
    <div className="rounded-[18px] border bg-[var(--surface)] p-4 shadow-[0_4px_16px_rgba(60,53,48,0.04)]" style={{ borderColor: "var(--border-soft)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={`/app/products/${product.id}`} className="text-base font-semibold text-[var(--foreground)] hover:underline">
          {product.name}
        </Link>
        <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-strong)]">
          {productStatusLabelMap[product.status]}
        </span>
      </div>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        {product.brand} · {getCategoryLabel(product.category)}
      </p>
      <p className="text-xs text-[var(--text-muted)]">来源：{sourceTypeLabelMap[product.sourceType]}</p>
    </div>
  );
}
