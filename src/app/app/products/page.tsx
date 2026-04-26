"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { BeautyProduct, getCategoryLabel, productStatusLabelMap, sourceTypeLabelMap } from "@/lib/products";
import { getStoredProducts } from "@/lib/products-store";

export default function ProductsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [items] = useState<BeautyProduct[]>(() => getStoredProducts());
  const [showCreatedBanner, setShowCreatedBanner] = useState(false);

  const quickMatchedProducts = useMemo(() => {
    return items.filter((product) => {
      if (!query) return false;
      return (
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [query, items]);

  const isEmpty = items.length === 0;
  const recentAdded = items.slice(0, 3);
  const createdProductName = searchParams.get("created");
  const createdAt = searchParams.get("createdAt");

  useEffect(() => {
    if (!createdProductName) return;
    setShowCreatedBanner(true);
    const hideTimer = window.setTimeout(() => setShowCreatedBanner(false), 2800);
    const clearQueryTimer = window.setTimeout(() => router.replace(pathname), 200);
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(clearQueryTimer);
    };
  }, [createdProductName, createdAt, pathname, router]);

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">产品库首页</p>
          <h1 className="editorial-heading text-[28px] font-semibold tracking-tight text-[var(--foreground)]">我的产品库</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">先记录你最近关注的产品，再进入完整产品库管理。</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/app/products/new">
            <Button className="w-full">添加产品</Button>
          </Link>
          <Link href="/app/assessment">
            <Button variant="secondary" className="w-full">快速测评</Button>
          </Link>
        </div>
      </div>

      <Card className="space-y-4 rounded-[24px]">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">快速搜索</h3>
        <Input placeholder="快速找产品：输入产品名或品牌" value={query} onChange={(event) => setQuery(event.target.value)} />
        {query ? (
          quickMatchedProducts.length ? (
            <div className="grid gap-2">
              {quickMatchedProducts.slice(0, 4).map((product) => (
                <ProductListItem key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <FeedbackState>没有找到相关产品。</FeedbackState>
          )
        ) : null}
        {query ? (
          <Link href={`/app/products/all?search=${encodeURIComponent(query)}`}>
            <Button variant="secondary" className="w-full">在完整产品库中查看搜索结果</Button>
          </Link>
        ) : null}
      </Card>

      {showCreatedBanner && createdProductName ? (
        <FeedbackState tone="success">已添加「{createdProductName}」</FeedbackState>
      ) : null}

      {isEmpty ? (
        <Card className="rounded-[24px] text-center">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">暂无产品</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            你还没有添加任何产品。先记录一个正在使用或感兴趣的产品，产品库就会开始为你工作。
          </p>
          <div className="mt-4">
            <Link href="/app/products/new">
              <Button className="w-full">添加第一个产品</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          <Card className="space-y-3 rounded-[24px]">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">最近添加</h3>
            {recentAdded.length === 0 ? (
              <FeedbackState>你还没有添加产品。</FeedbackState>
            ) : (
              <div className="grid gap-3">
                {recentAdded.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}
            <Link href="/app/products/all">
              <Button variant="secondary" className="w-full">查看全部产品</Button>
            </Link>
          </Card>
        </div>
      )}
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
