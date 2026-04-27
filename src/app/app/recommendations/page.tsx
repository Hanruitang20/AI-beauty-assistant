"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { BeautyProduct } from "@/lib/products";
import { PRODUCT_PRIMARY_CATEGORIES, ProductPrimaryCategory } from "@/lib/product-categories";
import { buildRecommendationViewModel, RecommendationInsight } from "@/lib/recommendation-service";
import { appendReturnTo } from "@/lib/navigation";
import { getExperiencesByProductIdsAsync, ProductExperience } from "@/lib/product-experience-service";
import { getProductsAsync } from "@/lib/product-service";
import { getProfileAsync, getProfileDraftAsync } from "@/lib/profile-service";

export default function RecommendationsPage() {
  const [savedProfile, setSavedProfile] = useState<Awaited<ReturnType<typeof getProfileAsync>>>(null);
  const [profileDraft, setProfileDraft] = useState<Awaited<ReturnType<typeof getProfileDraftAsync>>>(null);
  const [products, setProducts] = useState<BeautyProduct[]>([]);
  const [experiencesByProductId, setExperiencesByProductId] = useState<Record<string, ProductExperience>>({});
  const [analysisCategory, setAnalysisCategory] = useState<ProductPrimaryCategory>("all");
  const [analysisRefreshSeed, setAnalysisRefreshSeed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [nextProducts, nextProfile, nextProfileDraft] = await Promise.all([
          getProductsAsync(),
          getProfileAsync(),
          getProfileDraftAsync(),
        ]);
        if (!active) return;

        setProducts(nextProducts);
        setSavedProfile(nextProfile);
        setProfileDraft(nextProfileDraft || null);

        const nextExperiences = await getExperiencesByProductIdsAsync(nextProducts.map((product) => product.id));
        if (!active) return;
        setExperiencesByProductId(nextExperiences);
      } catch {
        if (!active) return;
        setError("推荐数据加载失败，请稍后重试。");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const recommendationView = buildRecommendationViewModel({
    products,
    profile: savedProfile,
    assessmentDraft: profileDraft,
    selectedCategory: analysisCategory,
    isSignedIn: true,
    experiencesByProductId,
    refreshSeed: analysisRefreshSeed,
  });

  if (loading) {
    return (
      <Card className="space-y-4 rounded-[24px]">
        <h1 className="editorial-heading text-2xl font-semibold tracking-tight text-[var(--foreground)]">为你</h1>
        <FeedbackState>数据加载中...</FeedbackState>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="space-y-4 rounded-[24px]">
        <h1 className="editorial-heading text-2xl font-semibold tracking-tight text-[var(--foreground)]">为你</h1>
        <FeedbackState>{error}</FeedbackState>
      </Card>
    );
  }

  if (recommendationView.state === "A_EMPTY_NO_PROFILE") {
    return (
      <Card className="space-y-4 rounded-[24px]">
        <h1 className="editorial-heading text-2xl font-semibold tracking-tight text-[var(--foreground)]">为你</h1>
        <FeedbackState>
          还需要了解你的个人情况和产品记录，才能帮你分析产品和使用方向。
        </FeedbackState>
        <div className="grid gap-2">
          <Link href="/app/assessment?returnTo=%2Fapp%2Frecommendations">
            <Button className="w-full">完善个人信息</Button>
          </Link>
          <Link href="/app/products/new">
            <Button variant="secondary" className="w-full">添加第一个产品</Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (recommendationView.state === "B_EMPTY_WITH_PROFILE") {
    return (
      <div className="space-y-4">
        <h1 className="editorial-heading text-[28px] font-semibold tracking-tight text-[var(--foreground)]">为你</h1>
        <Card className="space-y-3 rounded-[24px]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">个人画像</h2>
          <div className="grid gap-2 text-sm text-[var(--foreground)]">
            {(recommendationView.profileSummary.length ? recommendationView.profileSummary : ["已完成个人画像，可继续补充更细致的信息。"]).map((line) => (
              <p key={line}>· {line}</p>
            ))}
          </div>
        </Card>
        <Card className="space-y-3 rounded-[24px]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">下一步行动</h2>
          <p className="text-sm text-[var(--text-muted)]">
            你已完成个人画像。接下来添加正在使用、想买或被推荐的产品后，我就能进一步分析产品之间的搭配、重复和使用注意点。
          </p>
          <Link href="/app/products/new">
            <Button className="w-full">添加第一个产品</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (recommendationView.state === "C_WITH_PRODUCTS_NO_PROFILE") {
    return (
      <div className="space-y-4">
        <h1 className="editorial-heading text-[28px] font-semibold tracking-tight text-[var(--foreground)]">为你</h1>
        <Card className="space-y-3 rounded-[24px]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">产品记录概览</h2>
          <p className="text-sm text-[var(--text-muted)]">已记录 {products.length} 个产品。</p>
          {recommendationView.scopedExperienceCount > 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              当前分类下已记录 {recommendationView.scopedExperienceCount} 个使用感受，其中 {recommendationView.scopedRatedProductCount} 个已有评分。
            </p>
          ) : null}
          <p className="text-sm text-[var(--text-muted)]">
            状态分布：正在使用 {recommendationView.statusCount.using || 0} · 想购买 {recommendationView.statusCount.wishlist || 0} · 被推荐 {recommendationView.statusCount.recommended || 0} · 用过 {recommendationView.statusCount.used || 0}
          </p>
        </Card>
        <Card className="space-y-3 rounded-[24px]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">产品分析</h2>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]"
              style={{ borderColor: "var(--border-soft)" }}
              aria-label="刷新产品分析"
              onClick={() => setAnalysisRefreshSeed((seed) => seed + 1)}
            >
              ↻
            </button>
          </div>
          <p className="text-sm text-[var(--foreground)]">
            目前只能基于你记录的产品做初步整理。完善个人信息后，我才能结合你的肤质、敏感程度和主要诉求，给出更适合你的建议。
          </p>
          <CategoryChips selected={analysisCategory} onChange={setAnalysisCategory} />
          <ScopedAnalysisBody products={recommendationView.scopedProducts} insights={recommendationView.scopedInsights} />
        </Card>
        <Card className="space-y-3 rounded-[24px]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">下一步行动</h2>
          <p className="text-sm text-[var(--text-muted)]">先补充个人画像，再结合产品记录获得更准确的分析。</p>
          <Link href="/app/assessment?returnTo=%2Fapp%2Frecommendations">
            <Button className="w-full">完善个人信息</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <h1 className="editorial-heading text-[28px] font-semibold tracking-tight text-[var(--foreground)]">为你</h1>

      <Card className="space-y-3 rounded-[24px]">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">个人画像</h2>
        <div className="grid gap-2 text-sm text-[var(--foreground)]">
          {(recommendationView.profileSummary.length ? recommendationView.profileSummary : ["你已完成基础画像，可继续补充更细字段。"]).map((line) => (
            <p key={line}>· {line}</p>
          ))}
        </div>
      </Card>

      <Card className="space-y-3 rounded-[24px]">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">产品记录概览</h2>
        <div className="grid gap-2 text-sm text-[var(--text-muted)]">
          <p>已记录 {products.length} 个产品。</p>
          {recommendationView.scopedExperienceCount > 0 ? (
            <p>
              当前分类下已记录 {recommendationView.scopedExperienceCount} 个使用感受，其中 {recommendationView.scopedRatedProductCount} 个已有评分。
            </p>
          ) : null}
          <p>当前主要集中在：{recommendationView.topCategoryLabel}。</p>
          <p>状态分布：正在使用 {recommendationView.statusCount.using || 0} · 想购买 {recommendationView.statusCount.wishlist || 0} · 被推荐 {recommendationView.statusCount.recommended || 0} · 用过 {recommendationView.statusCount.used || 0}</p>
        </div>
      </Card>

      <Card className="space-y-3 rounded-[24px]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">产品分析</h2>
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs text-[var(--text-muted)] hover:text-[var(--foreground)]"
            style={{ borderColor: "var(--border-soft)" }}
            aria-label="刷新产品分析"
            onClick={() => setAnalysisRefreshSeed((seed) => seed + 1)}
          >
            ↻
          </button>
        </div>
        <CategoryChips selected={analysisCategory} onChange={setAnalysisCategory} />
        <ScopedAnalysisBody products={recommendationView.scopedProducts} insights={recommendationView.scopedInsights} />
      </Card>

      <Card className="space-y-3 rounded-[24px]">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">下一步行动</h2>
        {recommendationView.productCount === 1 ? (
          <div className="grid gap-2">
            <p className="text-sm text-[var(--text-muted)]">先理解这一个产品在你流程中的作用，再继续补充更多记录，让后续分析更完整。</p>
            <Link href={appendReturnTo(`/app/products/${products[0]?.id}`, "/app/recommendations")}>
              <Button variant="secondary" className="w-full">查看这个产品详情</Button>
            </Link>
            <Link href="/app/products/new">
              <Button className="w-full">继续添加产品</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-2">
            <p className="text-sm text-[var(--text-muted)]">继续补充使用体验（如刺激感、是否回购、搭配关系）后，分析会更贴近你的实际使用场景。</p>
            <Link href="/app/products">
              <Button className="w-full">回到产品库</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

function CategoryChips({
  selected,
  onChange,
}: {
  selected: ProductPrimaryCategory;
  onChange: (next: ProductPrimaryCategory) => void;
}) {
  return (
    <div className="-mx-1 hide-scrollbar overflow-x-auto pb-1">
      <div className="flex min-w-max gap-2 px-1">
        {PRODUCT_PRIMARY_CATEGORIES.map((category) => {
          const active = selected === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              className={[
                "h-8 flex-shrink-0 rounded-full border px-3 text-xs font-medium transition-colors",
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
  );
}

function ScopedAnalysisBody({ products, insights }: { products: BeautyProduct[]; insights: RecommendationInsight[] }) {
  if (products.length === 0) {
    return (
      <div className="space-y-3">
        <FeedbackState>这里还没有相关产品记录。添加这一类产品后，我可以帮你整理对应的产品分析。</FeedbackState>
        <div className="grid gap-2">
          <Link href="/app/products/new">
            <Button className="w-full">添加产品</Button>
          </Link>
          <Link href="/app/products/all">
            <Button variant="secondary" className="w-full">查看全部产品</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (products.length === 1) {
    const only = products[0];
    return (
      <div className="space-y-3">
        <div className="rounded-2xl bg-[var(--surface-soft)] p-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">单品基础分析</p>
          <p className="mt-1 text-sm text-[var(--foreground)]">
            当前分类下只有 1 个产品：{only.name}。先理解这款产品的作用，再补充同类或相关产品，才能做组合分析。
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">下一步：进入详情页查看或生成该产品摘要。</p>
        </div>
        <Link
          href={appendReturnTo(`/app/products/${only.id}`, "/app/recommendations")}
          className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]"
        >
          查看 {only.name} &gt;
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <InsightsList insights={insights} />
      <div className="rounded-2xl bg-[var(--surface-soft)] p-3">
        <p className="text-xs font-medium text-[var(--text-muted)]">相关产品</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {products.slice(0, 4).map((product) => (
            <Link
              key={product.id}
              href={appendReturnTo(`/app/products/${product.id}`, "/app/recommendations")}
              className="rounded-full border px-3 py-1 text-xs text-[var(--foreground)] hover:bg-[var(--surface)]"
              style={{ borderColor: "var(--border-soft)" }}
            >
              {product.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightsList({ insights }: { insights: RecommendationInsight[] }) {
  return (
    <div className="grid gap-2">
      {insights.map((item) => (
        <div key={item.title} className="rounded-2xl bg-[var(--surface-soft)] p-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
          <p className="mt-1 text-sm text-[var(--foreground)]">{item.reason}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">下一步：{item.nextStep}</p>
        </div>
      ))}
    </div>
  );
}
