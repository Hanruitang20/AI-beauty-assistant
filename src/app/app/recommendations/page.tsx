"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
import type { ForYouAnalysisRequest, ForYouAnalysisResponse } from "@/lib/llm/for-you-schema";

export default function RecommendationsPage() {
  const [savedProfile, setSavedProfile] = useState<Awaited<ReturnType<typeof getProfileAsync>>>(null);
  const [profileDraft, setProfileDraft] = useState<Awaited<ReturnType<typeof getProfileDraftAsync>>>(null);
  const [products, setProducts] = useState<BeautyProduct[]>([]);
  const [experiencesByProductId, setExperiencesByProductId] = useState<Record<string, ProductExperience>>({});
  const [analysisCategory, setAnalysisCategory] = useState<ProductPrimaryCategory>("all");
  const [analysisRefreshSeed, setAnalysisRefreshSeed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [llmAnalysis, setLlmAnalysis] = useState<ForYouAnalysisResponse | null>(null);
  const [isLlmLoading, setIsLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);
  const llmAnalysisRef = useRef<ForYouAnalysisResponse | null>(null);
  const llmRequestSeqRef = useRef(0);
  const inflightPayloadKeyRef = useRef<string | null>(null);
  const lastSuccessfulPayloadKeyRef = useRef<string | null>(null);

  useEffect(() => {
    llmAnalysisRef.current = llmAnalysis;
  }, [llmAnalysis]);

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

  const llmPayload = useMemo<ForYouAnalysisRequest>(() => {
    const stableProducts = products.map((item) => ({
      id: item.id,
      name: item.name,
      brand: item.brand || undefined,
      category: item.category,
      status: item.status,
    }));
    const stableExperiences = Object.values(experiencesByProductId)
      .map((item) => ({
        productId: item.productId,
        rating: item.rating,
        usageFrequency: item.usageFrequency,
        reaction: item.reaction,
        intention: item.intention,
        feedbackNote: item.feedbackNote,
      }))
      .sort((a, b) => a.productId.localeCompare(b.productId));
    return {
      profile: savedProfile
        ? {
            skinType: savedProfile.skinType || undefined,
            mainConcerns: savedProfile.mainConcerns || undefined,
            sensitivityLevel: savedProfile.sensitivityLevel || undefined,
            experienceLevel: savedProfile.experienceLevel || undefined,
          }
        : null,
      products: stableProducts,
      experiences: stableExperiences,
      context: {
        selectedCategory: analysisCategory,
        productCount: stableProducts.length,
        experienceCount: stableExperiences.length,
      },
    };
  }, [products, experiencesByProductId, savedProfile, analysisCategory]);

  const payloadKey = useMemo(() => JSON.stringify(llmPayload), [llmPayload]);

  useEffect(() => {
    if (loading || error) return;
    if (recommendationView.state === "A_EMPTY_NO_PROFILE" || recommendationView.state === "B_EMPTY_WITH_PROFILE") {
      return;
    }
    if (!llmPayload.products.length) return;

    let active = true;
    const controller = new AbortController();
    async function runLlmAnalysis() {
      if (inflightPayloadKeyRef.current === payloadKey) return;
      if (lastSuccessfulPayloadKeyRef.current === payloadKey && llmAnalysisRef.current) {
        setLlmError(null);
        return;
      }

      const requestId = llmRequestSeqRef.current + 1;
      llmRequestSeqRef.current = requestId;
      inflightPayloadKeyRef.current = payloadKey;
      setIsLlmLoading(true);
      setLlmError(null);

      await new Promise((resolve) => setTimeout(resolve, 400));
      if (!active || requestId !== llmRequestSeqRef.current) return;

      try {
        const res = await fetch("/api/for-you-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(llmPayload),
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("llm_request_failed");
        }
        const data = (await res.json()) as ForYouAnalysisResponse;
        if (!active || requestId !== llmRequestSeqRef.current) return;
        lastSuccessfulPayloadKeyRef.current = payloadKey;
        setLlmAnalysis(data);
        setLlmError(null);
      } catch (fetchError: unknown) {
        if (!active || requestId !== llmRequestSeqRef.current) return;
        if ((fetchError as Error)?.name === "AbortError") return;
        if (!llmAnalysisRef.current && !lastSuccessfulPayloadKeyRef.current) {
          setLlmError("AI 分析暂时不可用，已先根据你的记录生成基础分析。");
        }
      } finally {
        if (!active || requestId !== llmRequestSeqRef.current) return;
        if (inflightPayloadKeyRef.current === payloadKey) {
          inflightPayloadKeyRef.current = null;
        }
        setIsLlmLoading(false);
      }
    }

    void runLlmAnalysis();

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    loading,
    error,
    recommendationView.state,
    payloadKey,
    llmPayload,
  ]);

  const fallbackInsights = recommendationView.scopedInsights;
  const llmInsights: RecommendationInsight[] = (llmAnalysis?.insights || []).map((item) => ({
    title: item.title,
    reason: item.reason,
    nextStep: item.nextStep,
  }));
  const effectiveInsights = llmInsights.length > 0 ? llmInsights : fallbackInsights;
  const llmSummary = llmAnalysis?.summary?.trim() || "";
  const llmCaution = llmAnalysis?.caution?.trim() || "";
  const llmActionHref = resolveSuggestedActionHref(
    llmAnalysis?.suggestedNextAction?.target,
    recommendationView.scopedProducts[0]?.id,
  );

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
          先补充基础肤况与当前产品记录，我才能按你的护肤状态给出更贴合的使用整理。
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
            {(recommendationView.profileSummary.length ? recommendationView.profileSummary : ["已完成基础护肤画像，可继续补充细节让建议更贴近日常使用。"]).map((line) => (
              <p key={line}>· {line}</p>
            ))}
          </div>
        </Card>
        <Card className="space-y-3 rounded-[24px]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">下一步行动</h2>
          <p className="text-sm text-[var(--text-muted)]">
            你已完成个人画像。再补充在用、想买或被推荐的护肤产品后，我可以开始做流程位置、重复投入和使用风险提示。
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
          {isLlmLoading ? <FeedbackState>正在整理你的护肤记录...</FeedbackState> : null}
          {llmError && !llmAnalysis ? <p className="text-xs text-[var(--text-muted)]">{llmError}</p> : null}
          {llmSummary ? (
            <div className="rounded-2xl bg-[var(--surface-soft)] p-3">
              <p className="text-sm text-[var(--foreground)]">{llmSummary}</p>
            </div>
          ) : null}
          {llmCaution ? <p className="text-xs text-[var(--text-muted)]">提醒：{llmCaution}</p> : null}
          {llmAnalysis?.suggestedNextAction?.label && llmActionHref ? (
            <Link href={llmActionHref}>
              <Button variant="secondary" className="w-full">{llmAnalysis.suggestedNextAction.label}</Button>
            </Link>
          ) : null}
          <p className="text-sm text-[var(--foreground)]">
            目前可先基于你的产品记录做护肤方向整理；补充肤质、敏感程度和主要诉求后，分析会更贴近你的实际耐受与目标。
          </p>
          <CategoryChips selected={analysisCategory} onChange={setAnalysisCategory} />
          <ScopedAnalysisBody products={recommendationView.scopedProducts} insights={effectiveInsights} />
        </Card>
        <Card className="space-y-3 rounded-[24px]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">下一步行动</h2>
          <p className="text-sm text-[var(--text-muted)]">先补充个人画像，再结合产品与使用反馈获得更稳妥的建议。</p>
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
          {(recommendationView.profileSummary.length ? recommendationView.profileSummary : ["你已完成基础护肤画像，可继续补充细项，让分析更个性化。"]).map((line) => (
            <p key={line}>· {line}</p>
          ))}
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
        {isLlmLoading ? <FeedbackState>正在整理你的护肤记录...</FeedbackState> : null}
        {llmError && !llmAnalysis ? <p className="text-xs text-[var(--text-muted)]">{llmError}</p> : null}
        {llmSummary ? (
          <div className="rounded-2xl bg-[var(--surface-soft)] p-3">
            <p className="text-sm text-[var(--foreground)]">{llmSummary}</p>
          </div>
        ) : null}
        {llmCaution ? <p className="text-xs text-[var(--text-muted)]">提醒：{llmCaution}</p> : null}
        {llmAnalysis?.suggestedNextAction?.label && llmActionHref ? (
          <Link href={llmActionHref}>
            <Button variant="secondary" className="w-full">{llmAnalysis.suggestedNextAction.label}</Button>
          </Link>
        ) : null}
        <CategoryChips selected={analysisCategory} onChange={setAnalysisCategory} />
        <ScopedAnalysisBody products={recommendationView.scopedProducts} insights={effectiveInsights} />
      </Card>

      <Card className="space-y-3 rounded-[24px]">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">下一步行动</h2>
        {recommendationView.productCount === 1 ? (
          <div className="grid gap-2">
            <p className="text-sm text-[var(--text-muted)]">先确认这一个产品在早晚流程中的位置与体感变化，再补充同类记录，后续比较会更可靠。</p>
            <Link href={appendReturnTo(`/app/products/${products[0]?.id}`, "/app/recommendations")}>
              <Button variant="secondary" className="w-full">查看这个产品详情</Button>
            </Link>
            <Link href="/app/products/new">
              <Button className="w-full">继续添加产品</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-2">
            <p className="text-sm text-[var(--text-muted)]">继续补充使用反馈（肤感变化、是否继续用、搭配稳定性）后，分析会更贴近你的日常护肤节奏。</p>
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
        <FeedbackState>当前分类下还没有护肤产品记录。补充这一类产品后，我可以基于你的画像与体验做对应分析。</FeedbackState>
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
          <p className="text-sm font-semibold text-[var(--foreground)]">单品观察起点</p>
          <p className="mt-1 text-sm text-[var(--foreground)]">
            当前分类下仅有 1 个产品：{only.name}。建议先记录它在流程中的位置与体感变化，再补充同类进行对比。
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">下一步：进入详情页补充使用反馈并查看摘要。</p>
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
        <p className="text-xs font-medium text-[var(--text-muted)]">可先从下列产品中补充连续体验，帮助判断组合稳定性。</p>
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

function resolveSuggestedActionHref(
  target: ForYouAnalysisResponse["suggestedNextAction"]["target"] | undefined,
  firstScopedProductId?: string,
) {
  if (!target) return null;
  if (target === "profile") return "/app/profile";
  if (target === "add_product") return "/app/products/new";
  if (target === "continue_tracking") return "/app/products";
  if (target === "product_detail") return firstScopedProductId ? `/app/products/${firstScopedProductId}` : "/app/products";
  return null;
}
