"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductSummary } from "@/lib/products-store";

type ProductSummaryPanelProps = {
  summary: ProductSummary | null;
  loading: boolean;
  onGenerate: () => void;
};

function EmptyState({ onGenerate, loading }: { onGenerate: () => void; loading: boolean }) {
  return (
    <Card className="space-y-3 rounded-[24px] border-dashed bg-[var(--surface-soft)]/45">
      <h2 className="editorial-heading text-2xl font-semibold tracking-tight text-[var(--foreground)]">产品摘要</h2>
      <p className="text-sm text-[var(--text-muted)]">
        还没有生成摘要。点击按钮生成结构化摘要，帮助你更快理解这个产品。
      </p>
      <Button onClick={onGenerate} disabled={loading}>
        {loading ? "摘要生成中..." : "生成摘要"}
      </Button>
    </Card>
  );
}

export function ProductSummaryPanel({ summary, loading, onGenerate }: ProductSummaryPanelProps) {
  if (!summary) {
    return <EmptyState onGenerate={onGenerate} loading={loading} />;
  }

  const normalizedKeyTerms = summary.keyTerms.map((item) => {
    if (typeof item === "string") {
      return { term: item, explanation: "这是该产品摘要中的核心关键词。" };
    }
    return item;
  });

  return (
    <Card className="space-y-5 rounded-[24px] bg-[var(--surface-soft)]/30">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="editorial-heading text-2xl font-semibold tracking-tight text-[var(--foreground)]">产品摘要</h2>
        <Button variant="secondary" onClick={onGenerate} disabled={loading}>
          {loading ? "正在更新摘要..." : "刷新摘要"}
        </Button>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-2xl bg-[var(--surface)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">产品主要用途</p>
          <p className="mt-2 text-[var(--foreground)]">{summary.whatFor}</p>
        </div>
        <div className="rounded-2xl bg-[var(--surface)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">适合人群</p>
          <p className="mt-2 text-[var(--foreground)]">{summary.whoItSuits}</p>
        </div>
        <div className="rounded-2xl bg-[var(--surface)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">核心收益</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-[var(--foreground)]">
            {summary.benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-[var(--surface)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">注意事项</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-[var(--foreground)]">
            {summary.cautionPoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-2xl bg-[var(--surface)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">建议使用时机</p>
          <p className="mt-1 text-[var(--foreground)]">{summary.whenToUse}</p>
        </div>
        <div className="rounded-2xl bg-[var(--surface)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">建议起步频率</p>
          <p className="mt-1 text-[var(--foreground)]">{summary.howOftenToStart}</p>
        </div>
        <div className="rounded-2xl bg-[var(--surface)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">护肤步骤位置</p>
          <p className="mt-1 text-[var(--foreground)]">{summary.routineStep}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">关键词解释</h3>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {normalizedKeyTerms.map((item) => (
            <div
              key={item.term}
              className="w-48 shrink-0 rounded-2xl border bg-[var(--surface)] p-4 shadow-[0_4px_16px_rgba(60,53,48,0.04)]"
              style={{ borderColor: "var(--border-soft)" }}
            >
              <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent-strong)]">
                {item.term}
              </span>
              <p className="mt-2 text-sm text-[var(--foreground)]/90">{item.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border bg-[var(--surface-soft)]/75 p-4" style={{ borderColor: "var(--border-soft)" }}>
        <h3 className="text-sm font-semibold tracking-wide text-[var(--foreground)]">更简单地说</h3>
        <p className="text-sm text-[var(--foreground)]">{summary.inSimplerTerms}</p>
        <div className="rounded-xl bg-[var(--surface)] p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">如果你刚开始护肤</p>
          <p className="mt-1 text-sm text-[var(--foreground)]">{summary.ifYouAreNew}</p>
        </div>
        <div className="rounded-xl bg-[var(--surface)] p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">温和起步建议</p>
          <p className="mt-1 text-sm text-[var(--foreground)]">{summary.gentleWayToStart}</p>
        </div>
      </div>
    </Card>
  );
}
