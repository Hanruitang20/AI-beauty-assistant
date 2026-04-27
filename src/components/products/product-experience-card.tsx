"use client";

import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-provider";
import { useState } from "react";
import { getPrimaryCategory } from "@/lib/product-categories";
import {
  ProductExperience,
  ProductIntention,
  ProductReaction,
  ProductUsageFrequency,
  saveProductExperience,
} from "@/lib/product-experience-service";

const usageFrequencyOptions: Array<{ value: ProductUsageFrequency; label: string }> = [
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每周几次" },
  { value: "occasionally", label: "偶尔" },
  { value: "not_started", label: "还没开始" },
];

const intentionOptions: Array<{ value: ProductIntention; label: string }> = [
  { value: "continue", label: "继续用" },
  { value: "repurchase", label: "可能回购" },
  { value: "stop", label: "不会回购" },
  { value: "observing", label: "还在观察" },
];

type ProductExperienceCardProps = {
  productId: string;
  productCategory: string;
  initialExperience?: ProductExperience | null;
  onUpdated?: (experience: ProductExperience) => void;
};

export function ProductExperienceCard({
  productId,
  productCategory,
  initialExperience = null,
  onUpdated,
}: ProductExperienceCardProps) {
  const { showToast } = useToast();
  const [experience, setExperience] = useState<ProductExperience | null>(initialExperience);
  const [feedbackNoteDraft, setFeedbackNoteDraft] = useState(initialExperience?.feedbackNote || "");
  const primaryCategory = getPrimaryCategory(productCategory);
  const feedbackOptions = getFeedbackOptionsByPrimaryCategory(primaryCategory);

  function updateExperience(patch: Partial<Omit<ProductExperience, "productId" | "updatedAt">>) {
    const next = saveProductExperience(productId, patch);
    setExperience(next);
    if (Object.prototype.hasOwnProperty.call(patch, "feedbackNote")) {
      setFeedbackNoteDraft(next.feedbackNote || "");
    }
    onUpdated?.(next);
    showToast({ tone: "success", message: "已更新使用感受" });
  }

  function normalizeSelectedReaction(value?: ProductReaction) {
    if (!value) return undefined;
    if (value === "none") return "no_issue";
    return value;
  }

  function handleFeedbackNoteSave() {
    const normalized = feedbackNoteDraft.trim();
    const current = (experience?.feedbackNote || "").trim();
    if (normalized === current) return;
    updateExperience({ feedbackNote: normalized || undefined });
  }

  return (
    <Card className="space-y-4 rounded-[24px]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">我的使用感受</h2>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((score) => {
            const active = (experience?.rating || 0) >= score;
            return (
              <button
                key={score}
                type="button"
                aria-label={`评分 ${score} 星`}
                onClick={() => {
                  const current = experience?.rating;
                  if (current === score) {
                    updateExperience({ rating: undefined });
                    return;
                  }
                  updateExperience({ rating: score as 1 | 2 | 3 | 4 | 5 });
                }}
                className={`text-lg transition-colors ${active ? "text-[var(--accent)]" : "text-[var(--border-soft)] hover:text-[var(--accent)]"}`}
              >
                ★
              </button>
            );
          })}
        </div>
      </div>

      <ExperienceChips
        title="使用频率"
        options={usageFrequencyOptions}
        selected={experience?.usageFrequency}
        onSelect={(value) => updateExperience({ usageFrequency: value })}
      />
      <ExperienceChips
        title="使用反馈"
        options={feedbackOptions}
        selected={normalizeSelectedReaction(experience?.reaction)}
        onSelect={(value) => updateExperience({ reaction: value })}
      />
      <ExperienceChips
        title="后续意愿"
        options={intentionOptions}
        selected={experience?.intention}
        onSelect={(value) => updateExperience({ intention: value })}
      />
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">一句话感受（可选）</p>
        <input
          value={feedbackNoteDraft}
          onChange={(event) => setFeedbackNoteDraft(event.target.value)}
          onBlur={handleFeedbackNoteSave}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              (event.currentTarget as HTMLInputElement).blur();
            }
          }}
          placeholder="例如：上脸更服帖，最近更稳定。"
          maxLength={60}
          className="h-10 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--focus-ring)]/30"
          style={{ borderColor: "var(--border-soft)" }}
        />
      </div>
    </Card>
  );
}

function ExperienceChips<T extends string>({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: Array<{ value: T; label: string }>;
  selected?: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={[
                "h-8 rounded-full border px-3 text-xs font-medium transition-colors",
                active
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)]",
              ].join(" ")}
              style={{ borderColor: active ? "var(--accent)" : "var(--border-soft)" }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getFeedbackOptionsByPrimaryCategory(primaryCategory: ReturnType<typeof getPrimaryCategory>) {
  const common: Array<{ value: ProductReaction; label: string }> = [
    { value: "no_issue", label: "没有明显问题" },
  ];

  if (primaryCategory === "skincare") {
    return [
      ...common,
      { value: "uncomfortable", label: "有点不舒服" },
      { value: "irritating_or_breakout", label: "闷痘或刺激" },
      { value: "dry_or_tight", label: "干燥或紧绷" },
      { value: "texture_not_ideal", label: "吸收/肤感不理想" },
      { value: "unsure", label: "不确定" },
    ];
  }

  if (primaryCategory === "makeup") {
    return [
      ...common,
      { value: "drying_or_cakey", label: "拔干或卡纹" },
      { value: "not_smooth_or_pilling", label: "不服帖或搓泥" },
      { value: "poor_longevity", label: "持久度不理想" },
      { value: "finish_not_ideal", label: "颜色/妆效不满意" },
      { value: "unsure", label: "不确定" },
    ];
  }

  if (primaryCategory === "body-hair") {
    return [
      ...common,
      { value: "greasy_or_heavy", label: "油腻或厚重" },
      { value: "dry_or_tight", label: "干燥或紧绷" },
      { value: "scalp_or_body_discomfort", label: "头皮/身体不适" },
      { value: "unclear_effect", label: "效果不明显" },
      { value: "unsure", label: "不确定" },
    ];
  }

  return [
    ...common,
    { value: "scent_discomfort", label: "味道不适" },
    { value: "poor_longevity", label: "留香不理想" },
    { value: "hard_to_use", label: "使用不方便" },
    { value: "unclear_effect", label: "效果不明显" },
    { value: "unsure", label: "不确定" },
  ];
}
