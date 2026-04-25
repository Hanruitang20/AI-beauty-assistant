"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import {
  BeautyProduct,
  ProductStatus,
  ProductCategory,
  productCategoryLabelMap,
  productStatusLabelMap,
  sourceTypeLabelMap,
} from "@/lib/products";
import { getStoredProducts, saveProducts } from "@/lib/products-store";
import { getRecentViewedProductIds, getSummaryMap } from "@/lib/products-store";
import { useToast } from "@/components/ui/toast-provider";

type Filters = {
  status: "" | ProductStatus;
  category: "" | ProductCategory;
  brand: string;
};

const initialFilters: Filters = {
  status: "",
  category: "",
  brand: "",
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [query, setQuery] = useState("");
  const [items] = useState<BeautyProduct[]>(() => getStoredProducts());
  const [showAllProducts, setShowAllProducts] = useState(false);
  const deletedToastShownRef = useRef(false);

  useEffect(() => {
    saveProducts(items);
  }, [items]);

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

  const isEmpty = items.length === 0;
  const summaryMap = getSummaryMap();
  const recentAdded = items.slice(0, 4);
  const recentViewed = getRecentViewedProductIds()
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is BeautyProduct => Boolean(item))
    .slice(0, 4);
  const focusItems = items.filter((item) => item.status === "wishlist" || item.status === "recommended").slice(0, 4);
  const summarizedItems = items.filter((item) => Boolean(summaryMap[item.id])).slice(0, 4);
  const needLearnMore = items.filter((item) => !summaryMap[item.id]).slice(0, 4);
  const categoryEntries = [
    { key: "护肤", count: items.filter((item) => ["cleanser", "serum", "moisturizer", "sunscreen"].includes(item.category)).length },
    { key: "身体护理", count: 0 },
    { key: "头发护理", count: 0 },
    { key: "彩妆", count: items.filter((item) => item.category === "makeup").length },
  ];
  const createdProductName = searchParams.get("created");
  const deleted = searchParams.get("deleted");

  useEffect(() => {
    if (deleted === "1" && !deletedToastShownRef.current) {
      showToast({ tone: "success", message: "产品已删除。" });
      deletedToastShownRef.current = true;
    }
  }, [deleted, showToast]);

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">欢迎回来</p>
          <h1 className="editorial-heading text-[28px] font-semibold tracking-tight text-[var(--foreground)]">我的产品库</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">这里不是简单列表，而是你的选品与决策中枢。</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setShowAllProducts((prev) => !prev)}>
            {showAllProducts ? "收起全部产品" : "查看全部产品"}
          </Button>
          <Link href="/app/assessment">
            <Button variant="secondary" className="w-full">开始快速测评</Button>
          </Link>
        </div>
      </div>

      {createdProductName ? (
        <FeedbackState tone="success">
          添加成功：{createdProductName}
        </FeedbackState>
      ) : null}

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
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, category: event.target.value as Filters["category"] }))
            }
          >
            <option value="">全部品类</option>
            <option value="cleanser">洁面</option>
            <option value="serum">精华</option>
            <option value="moisturizer">面霜/乳液</option>
            <option value="sunscreen">防晒</option>
            <option value="makeup">彩妆</option>
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

      {isEmpty ? (
        <Card className="rounded-[24px] text-center">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">暂无产品</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            你还没有添加任何产品。这里会用于整理你用过、被推荐过、感兴趣的产品，并给出后续决策线索。
          </p>
          <div className="mt-4">
            <Link href="/app/products/new">
              <Button className="w-full">添加第一个产品</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          <ProductsSection title="最近添加" items={recentAdded} />
          <ProductsSection title="最近查看" items={recentViewed} emptyText="你最近还没有查看过产品详情。" />
          <ProductsSection title="当前关注（想购买 / 被推荐）" items={focusItems} />
          <Card className="space-y-3 rounded-[24px]">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">分类入口</h3>
            <div className="grid grid-cols-2 gap-2">
              {categoryEntries.map((entry) => (
                <div key={entry.key} className="rounded-xl bg-[var(--surface-soft)] p-3 text-sm">
                  <p className="font-medium text-[var(--foreground)]">{entry.key}</p>
                  <p className="text-xs text-[var(--text-muted)]">{entry.count} 个产品</p>
                </div>
              ))}
            </div>
          </Card>
          <ProductsSection title="已生成摘要的产品" items={summarizedItems} emptyText="还没有已生成摘要的产品，可在详情页生成。" />
          <ProductsSection title="待进一步了解的产品" items={needLearnMore} emptyText="当前产品都已有摘要，做得很好。" />

          {showAllProducts ? (
            <Card className="space-y-3 rounded-[24px]">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">全部产品</h3>
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
          ) : null}
        </div>
      )}

      <Link
        href="/app/products/new"
        aria-label="新增产品"
        className="fixed bottom-24 right-6 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-3xl font-light leading-none text-white shadow-[0_8px_20px_rgba(60,53,48,0.2)]"
      >
        +
      </Link>
    </div>
  );
}

function ProductsSection({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: BeautyProduct[];
  emptyText?: string;
}) {
  return (
    <Card className="space-y-3 rounded-[24px]">
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{title}</h3>
      {items.length === 0 ? (
        <FeedbackState>{emptyText || "暂无数据。"}</FeedbackState>
      ) : (
        <div className="grid gap-3">
          {items.map((product) => (
            <ProductListItem key={product.id} product={product} />
          ))}
        </div>
      )}
    </Card>
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
        {product.brand} · {productCategoryLabelMap[product.category]}
      </p>
      <p className="text-xs text-[var(--text-muted)]">来源：{sourceTypeLabelMap[product.sourceType]}</p>
      <div className="pt-2">
        <Link href={`/app/products/${product.id}`}>
          <Button variant="secondary" className="h-9 w-full px-3 py-0 text-xs">
            查看详情
          </Button>
        </Link>
      </div>
    </div>
  );
}
