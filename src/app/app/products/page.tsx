"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BeautyProduct, productStatusLabelMap, sourceTypeLabelMap } from "@/lib/products";
import { deriveUserAppState } from "@/lib/user-state";
import { appendReturnTo } from "@/lib/navigation";
import { getExperiencesByProductIdsAsync, ProductExperience } from "@/lib/product-experience-service";
import { getProductsAsync } from "@/lib/product-service";
import { getProfileAsync, getProfileDraftAsync } from "@/lib/profile-service";

export default function ProductsPage() {
  const [items, setItems] = useState<BeautyProduct[]>([]);
  const [savedProfile, setSavedProfile] = useState<Awaited<ReturnType<typeof getProfileAsync>>>(null);
  const [profileDraft, setProfileDraft] = useState<Awaited<ReturnType<typeof getProfileDraftAsync>>>(null);
  const [experiencesByProductId, setExperiencesByProductId] = useState<Record<string, ProductExperience>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [nextItems, nextProfile, nextProfileDraft] = await Promise.all([
          getProductsAsync(),
          getProfileAsync(),
          getProfileDraftAsync(),
        ]);
        if (!active) return;

        setItems(nextItems);
        setSavedProfile(nextProfile);
        setProfileDraft(nextProfileDraft);

        const recentAdded = nextItems.slice(0, 3);
        const nextExperiences = await getExperiencesByProductIdsAsync(recentAdded.map((item) => item.id));
        if (!active) return;
        setExperiencesByProductId(nextExperiences);
      } catch {
        if (!active) return;
        setError("产品库数据加载失败，请稍后重试。");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

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
        {!userState.productCount ? null : !userState.hasProfile ? (
          <div className="grid grid-cols-1 gap-2">
            <Link href="/app/assessment?returnTo=%2Fapp%2Fproducts">
              <Button variant="secondary" className="w-full">完善个人信息</Button>
            </Link>
          </div>
        ) : null}
      </div>

      {loading ? (
        <Card className="rounded-[24px] text-center">
          <p className="text-sm text-[var(--text-muted)]">数据加载中...</p>
        </Card>
      ) : error ? (
        <Card className="rounded-[24px] text-center">
          <p className="text-sm text-[var(--text-muted)]">{error}</p>
        </Card>
      ) : !userState.productCount ? (
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
                <ProductListItem key={product.id} product={product} rating={experiencesByProductId[product.id]?.rating} />
              ))}
            </div>
          </Card>
        </div>
      )}

      {userState.productCount ? (
        <Link
          href="/app/products/new?returnTo=%2Fapp%2Fproducts"
          className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-2xl text-white shadow-[0_10px_24px_rgba(60,53,48,0.2)] active:scale-[0.98]"
          aria-label="添加产品"
        >
          +
        </Link>
      ) : null}
    </div>
  );
}

function ProductListItem({ product, rating }: { product: BeautyProduct; rating?: number }) {
  const detailHref = appendReturnTo(`/app/products/${product.id}`, "/app/products");
  return (
    <div className="rounded-[18px] border bg-[var(--surface)] p-4 shadow-[0_4px_16px_rgba(60,53,48,0.04)]" style={{ borderColor: "var(--border-soft)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={detailHref} className="text-base font-semibold text-[var(--foreground)] hover:underline">
          {product.name}
        </Link>
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
      <div className="pt-2">
        <Link href={detailHref}>
          <Button variant="secondary" className="h-9 w-full px-3 py-0 text-xs">
            查看详情
          </Button>
        </Link>
      </div>
    </div>
  );
}
