"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { getStoredProducts, getSummaryMap } from "@/lib/products-store";
import { getSavedProfile } from "@/lib/profile-store";
import { buildMockRecommendations } from "@/lib/recommendations";
import { productCategoryLabelMap } from "@/lib/products";
import { getProfileDraft } from "@/lib/profile-draft";

export default function RecommendationsPage() {
  const profile = getSavedProfile() || getProfileDraft();
  const products = getStoredProducts();
  const summaries = getSummaryMap();
  const recommendations = buildMockRecommendations(profile, products, summaries);
  const grouped = {
    fit: recommendations.filter((item) => item.category === "fit"),
    beginner: recommendations.filter((item) => item.category === "beginner"),
    budget: recommendations.filter((item) => item.category === "budget"),
    caution: recommendations.filter((item) => item.category === "caution"),
  };

  if (!profile) {
    return (
      <Card className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-rose-950">推荐建议</h1>
        <FeedbackState>
          请先保存个人档案，我们会基于你的肤质关注点和护肤经验生成建议。
        </FeedbackState>
        <div className="grid gap-2">
          <Link href="/app/onboarding">
            <Button className="w-full">去完成开始设置</Button>
          </Link>
          <Link href="/app/profile">
            <Button variant="secondary" className="w-full">直接填写档案</Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-rose-950">推荐建议</h1>
        <FeedbackState>
          你还没有产品数据。先添加 1-2 个正在使用或想购买的产品，建议会更贴合你的实际情况。
        </FeedbackState>
        <Link href="/app/products/new">
          <Button className="w-full">添加第一个产品</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-rose-950">推荐建议</h1>
        <p className="text-sm text-rose-700/80">
          基于你的档案、产品库状态和已生成摘要，提供可体验的前端建议结果（本地 mock）。
        </p>
      </div>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-rose-900">本次建议概览</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-2xl bg-rose-50 p-3">
            <p className="text-xs text-rose-600">匹配建议</p>
            <p className="mt-1 text-xl font-semibold text-rose-900">{grouped.fit.length}</p>
          </div>
          <div className="rounded-2xl bg-rose-50 p-3">
            <p className="text-xs text-rose-600">入门替代</p>
            <p className="mt-1 text-xl font-semibold text-rose-900">{grouped.beginner.length}</p>
          </div>
          <div className="rounded-2xl bg-rose-50 p-3">
            <p className="text-xs text-rose-600">预算优化</p>
            <p className="mt-1 text-xl font-semibold text-rose-900">{grouped.budget.length}</p>
          </div>
          <div className="rounded-2xl bg-rose-50 p-3">
            <p className="text-xs text-rose-600">风险提醒</p>
            <p className="mt-1 text-xl font-semibold text-rose-900">{grouped.caution.length}</p>
          </div>
        </div>
      </Card>

      <RecommendationGroup
        title="可能适合你的产品方向"
        subtitle="结合你的档案与当前产品状态给出的匹配建议"
        items={grouped.fit}
      />
      <RecommendationGroup
        title="新手友好替代方案"
        subtitle="更低门槛、可持续的起步路径"
        items={grouped.beginner}
      />
      <RecommendationGroup
        title="更省预算的可选路径"
        subtitle="在不牺牲稳定性的前提下优化投入"
        items={grouped.budget}
      />
      <RecommendationGroup
        title="需要留意的风险点"
        subtitle="帮助你提前规避常见误区"
        items={grouped.caution}
      />
    </div>
  );
}

type RecommendationGroupProps = {
  title: string;
  subtitle: string;
  items: ReturnType<typeof buildMockRecommendations>;
};

function RecommendationGroup({ title, subtitle, items }: RecommendationGroupProps) {
  if (!items.length) return null;

  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-lg font-semibold text-rose-900">{title}</h2>
        <p className="text-sm leading-6 text-rose-700/80">{subtitle}</p>
      </div>
      <div className="grid gap-3">
        {items.map((item) => (
          <Card key={`${item.category}-${item.title}`} className="space-y-3">
            <h3 className="text-base font-semibold text-rose-900">{item.title}</h3>
            {item.suggestedCategory ? (
              <p className="text-xs uppercase tracking-wide text-rose-500">
                推荐关注：{productCategoryLabelMap[item.suggestedCategory]}
              </p>
            ) : null}
            <p className="text-sm leading-6 text-rose-800/90">{item.explanation}</p>
            <div className="rounded-xl bg-rose-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-rose-500">为什么这条建议重要</p>
              <p className="mt-1 text-sm text-rose-800">{item.whyItMatters}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
