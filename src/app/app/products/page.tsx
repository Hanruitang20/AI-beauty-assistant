"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BeautyProduct, getCategoryLabel, productStatusLabelMap, sourceTypeLabelMap } from "@/lib/products";
import { getStoredProducts } from "@/lib/products-store";
import { getSavedProfile } from "@/lib/profile-store";
import { getProfileDraft } from "@/lib/profile-draft";
import { deriveUserAppState } from "@/lib/user-state";

export default function ProductsPage() {
  const [items] = useState<BeautyProduct[]>(() => getStoredProducts());
  const savedProfile = getSavedProfile();
  const profileDraft = getProfileDraft();
  const userState = deriveUserAppState({
    isSignedIn: true,
    products: items,
    profile: savedProfile,
    assessmentDraft: profileDraft,
  });

  const recentAdded = items.slice(0, 3);

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <div>
          <h1 className="editorial-heading text-[28px] font-semibold tracking-tight text-[var(--foreground)]">我的产品库</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">先记录你最近关注的产品，再进入完整产品库管理。</p>
        </div>
        {!userState.productCount ? null : (
          <div className={userState.hasProfile ? "grid grid-cols-1 gap-2" : "grid grid-cols-2 gap-2"}>
            <Link href="/app/products/new">
              <Button className="w-full">添加产品</Button>
            </Link>
            {!userState.hasProfile ? (
              <Link href="/app/assessment?returnTo=%2Fapp%2Fproducts">
                <Button variant="secondary" className="w-full">完善个人信息</Button>
              </Link>
            ) : null}
          </div>
        )}
      </div>

      {!userState.productCount ? (
        <Card className="rounded-[24px] text-center">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">暂无产品</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            你还没有添加任何产品。先记录一个正在使用或感兴趣的产品，产品库就会开始为你工作。
          </p>
          <div className="mt-4 grid gap-2">
            <Link href="/app/products/new">
              <Button className="w-full">添加第一个产品</Button>
            </Link>
            {!userState.hasProfile ? (
              <Link href="/app/assessment?returnTo=%2Fapp%2Fproducts">
                <Button variant="secondary" className="w-full">完善个人信息</Button>
              </Link>
            ) : null}
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {userState.hasOneProduct ? (
            <Card className="rounded-[24px] bg-[var(--surface-soft)] text-sm text-[var(--foreground)]">
              继续添加你正在用或想买的产品，我可以更好地帮你整理护理方向。
            </Card>
          ) : null}

          <Card className="space-y-3 rounded-[24px]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">最近添加</h3>
              <Link href="/app/products/all" className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]">
                查看全部 &gt;
              </Link>
            </div>
            <div className="grid gap-3">
              {recentAdded.map((product) => (
                <ProductListItem key={product.id} product={product} />
              ))}
            </div>
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
