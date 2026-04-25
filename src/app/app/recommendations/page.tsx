"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { getStoredProducts, getSummaryMap } from "@/lib/products-store";
import { getSavedProfile } from "@/lib/profile-store";
import { buildForYouGuidance, GuidanceCard, UserGuidanceMode } from "@/lib/recommendations";
import { productCategoryLabelMap } from "@/lib/products";
import { getProfileDraft } from "@/lib/profile-draft";

export default function RecommendationsPage() {
  const profile = getSavedProfile() || getProfileDraft();
  const products = getStoredProducts();
  const summaries = getSummaryMap();

  if (!profile) {
    return (
      <Card className="space-y-4 rounded-[24px]">
        <h1 className="editorial-heading text-2xl font-semibold tracking-tight text-[var(--foreground)]">为你</h1>
        <FeedbackState>
          先完成个人信息后，“为你”页面才能给出更贴合你的状态解读与下一步建议。
        </FeedbackState>
        <div className="grid gap-2">
          <Link href="/app/onboarding">
            <Button className="w-full">去完成开始设置</Button>
          </Link>
          <Link href="/app/profile">
            <Button variant="secondary" className="w-full">去个人页完善信息</Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="space-y-4 rounded-[24px]">
        <h1 className="editorial-heading text-2xl font-semibold tracking-tight text-[var(--foreground)]">为你</h1>
        <FeedbackState>
          你还没有产品记录。“为你”页面会结合你的产品历史来做个性化判断，先添加 1-2 个产品吧。
        </FeedbackState>
        <Link href="/app/products/new">
          <Button className="w-full">添加第一个产品</Button>
        </Link>
      </Card>
    );
  }

  const guidance = buildForYouGuidance(profile, products, summaries);

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">For You</p>
        <h1 className="editorial-heading text-[28px] font-semibold tracking-tight text-[var(--foreground)]">为你</h1>
        <p className="text-sm text-[var(--text-muted)]">
          {guidance.recommendation_intro}
        </p>
      </div>

      <Card className="space-y-3 rounded-[24px]">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">你当前的状态</h2>
        <p className="text-sm text-[var(--foreground)]">{guidance.user_state_summary}</p>
        <p className="text-sm text-[var(--text-muted)]">{guidance.guidance_intro}</p>
      </Card>

      <Card className="space-y-3 rounded-[24px]">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">建议依据</h2>
        <div className="grid gap-2 text-sm text-[var(--text-muted)]">
          {guidance.recommendation_basis.map((line) => (
            <p key={line}>· {line}</p>
          ))}
        </div>
      </Card>

      <Card className="space-y-3 rounded-[24px]">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">当前更值得先关注的点</h2>
        <div className="grid gap-2 text-sm">
          {guidance.current_focus.map((focus) => (
            <div key={focus} className="rounded-2xl bg-[var(--surface-soft)] p-3 text-[var(--foreground)]">
              {focus}
            </div>
          ))}
        </div>
      </Card>

      <GuidanceSection title="现在更适合你的方向" card={guidance.sections.direction} mode={guidance.mode} />
      <GuidanceSection title="基于你已记录产品的建议" card={guidance.sections.product_based} mode={guidance.mode} />
      <GuidanceSection title="当前需要注意的点" card={guidance.sections.caution} mode={guidance.mode} />
      <GuidanceSection title="你下一步可以怎么做" card={guidance.sections.next_step} mode={guidance.mode} />
    </div>
  );
}

type GuidanceSectionProps = {
  title: string;
  card: GuidanceCard;
  mode: UserGuidanceMode;
};

function GuidanceSection({ title, card, mode }: GuidanceSectionProps) {
  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{title}</h2>
        <p className="text-sm leading-6 text-[var(--text-muted)]">{card.section_reason}</p>
      </div>
      <Card className="space-y-3 rounded-[24px]">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">{card.section_title}</h3>
        {card.suggestedCategory ? (
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--accent)]">
            关联品类：{productCategoryLabelMap[card.suggestedCategory]}
          </p>
        ) : null}
        <p className="text-sm leading-6 text-[var(--foreground)]">{card.primary_direction}</p>
        <div className="rounded-xl bg-[var(--surface-soft)] p-3">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--accent)]">为什么和你有关</p>
          <p className="mt-1 text-sm text-[var(--foreground)]">{card.relevance_reason}</p>
        </div>
        {card.caution_note ? (
          <div className="rounded-xl bg-[var(--surface)] p-3" style={{ border: "1px solid var(--border-soft)" }}>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--accent)]">现在需要注意</p>
            <p className="mt-1 text-sm text-[var(--foreground)]">{card.caution_note}</p>
          </div>
        ) : null}
        {card.key_terms?.length ? (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]">关键词</p>
            <p className="text-sm text-[var(--foreground)]">{card.key_terms.join(" · ")}</p>
          </div>
        ) : null}
        {mode === "beginner" && card.simple_explanation ? (
          <div className="rounded-xl bg-[var(--surface-soft)] p-3">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--accent)]">简单解释</p>
            <p className="mt-1 text-sm text-[var(--foreground)]">{card.simple_explanation}</p>
          </div>
        ) : null}
        {card.why_it_matters_now ? (
          <p className="text-sm text-[var(--text-muted)]">为什么现在重要：{card.why_it_matters_now}</p>
        ) : null}
        <div className="grid gap-2">
          <p className="text-sm text-[var(--foreground)]">下一步：{card.next_best_step}</p>
          <Button variant="secondary" className="w-full">{card.action_label}</Button>
        </div>
      </Card>
    </section>
  );
}
