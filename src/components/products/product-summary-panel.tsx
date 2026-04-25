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
    <Card className="space-y-3 border-dashed bg-gradient-to-br from-rose-50 to-white">
      <h2 className="text-xl font-semibold tracking-tight text-rose-950">产品摘要</h2>
      <p className="text-sm text-rose-700/80">
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
    <Card className="space-y-5 bg-gradient-to-b from-white to-rose-50/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-rose-950">产品摘要</h2>
        <Button variant="secondary" onClick={onGenerate} disabled={loading}>
          {loading ? "正在更新摘要..." : "刷新摘要"}
        </Button>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-500">产品主要用途</p>
          <p className="mt-2 text-rose-800">{summary.whatFor}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-500">适合人群</p>
          <p className="mt-2 text-rose-800">{summary.whoItSuits}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-500">核心收益</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-rose-800">
            {summary.benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-500">注意事项</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-rose-800">
            {summary.cautionPoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-500">建议使用时机</p>
          <p className="mt-1 text-rose-800">{summary.whenToUse}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-500">建议起步频率</p>
          <p className="mt-1 text-rose-800">{summary.howOftenToStart}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-500">护肤步骤位置</p>
          <p className="mt-1 text-rose-800">{summary.routineStep}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold tracking-wide text-rose-900">关键词解释</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {normalizedKeyTerms.map((item) => (
            <div key={item.term} className="rounded-2xl border border-rose-100 bg-white p-4">
              <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">
                {item.term}
              </span>
              <p className="mt-2 text-sm text-rose-800/90">{item.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
        <h3 className="text-sm font-semibold tracking-wide text-rose-900">更简单地说</h3>
        <p className="text-sm text-rose-800">{summary.inSimplerTerms}</p>
        <div className="rounded-xl bg-white p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-500">如果你刚开始护肤</p>
          <p className="mt-1 text-sm text-rose-800">{summary.ifYouAreNew}</p>
        </div>
        <div className="rounded-xl bg-white p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-500">温和起步建议</p>
          <p className="mt-1 text-sm text-rose-800">{summary.gentleWayToStart}</p>
        </div>
      </div>
    </Card>
  );
}
