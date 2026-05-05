"use client";

import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-provider";
import { useEffect, useRef, useState } from "react";
import {
  ProductExperience,
  ProductIntention,
  ProductReaction,
  ProductUsageFrequency,
  saveProductExperienceAsync,
} from "@/lib/product-experience-service";
import { SKINCARE_REACTION_OPTIONS } from "@/lib/product-options";

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
  initialExperience?: ProductExperience | null;
  onUpdated?: (experience: ProductExperience) => void;
};

export function ProductExperienceCard({
  productId,
  initialExperience = null,
  onUpdated,
}: ProductExperienceCardProps) {
  const { showToast } = useToast();
  const successToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [experience, setExperience] = useState<ProductExperience | null>(initialExperience);
  const [feedbackNoteDraft, setFeedbackNoteDraft] = useState(initialExperience?.feedbackNote || "");
  const feedbackOptions = SKINCARE_REACTION_OPTIONS;

  useEffect(() => {
    return () => {
      if (successToastTimerRef.current !== null) {
        clearTimeout(successToastTimerRef.current);
        successToastTimerRef.current = null;
      }
    };
  }, []);

  function scheduleDebouncedSavedToast() {
    if (successToastTimerRef.current !== null) {
      clearTimeout(successToastTimerRef.current);
    }
    successToastTimerRef.current = setTimeout(() => {
      successToastTimerRef.current = null;
      showToast({ tone: "success", message: "已保存更新" });
    }, 5000);
  }

  async function updateExperience(patch: Partial<Omit<ProductExperience, "productId" | "updatedAt">>) {
    const optimistic: ProductExperience = {
      productId,
      ...(experience || {}),
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    setExperience(optimistic);
    if (Object.prototype.hasOwnProperty.call(patch, "feedbackNote")) {
      setFeedbackNoteDraft((patch.feedbackNote as string | undefined) || "");
    }
    onUpdated?.(optimistic);
    try {
      const next = await saveProductExperienceAsync(productId, patch);
      setExperience(next);
      if (Object.prototype.hasOwnProperty.call(patch, "feedbackNote")) {
        setFeedbackNoteDraft(next.feedbackNote || "");
      }
      onUpdated?.(next);
      scheduleDebouncedSavedToast();
    } catch {
      showToast({ tone: "error", message: "保存失败，请稍后重试。" });
    }
  }

  function normalizeSelectedReaction(value?: ProductReaction) {
    if (!value) return undefined;
    if (value === "none") return "no_issue";
    return value;
  }

  function parseSelectedReactions(value?: ProductReaction) {
    if (!value) return [];
    const normalized = value === "none" ? "no_issue" : value;
    return String(normalized)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean) as ProductReaction[];
  }

  function serializeSelectedReactions(values: ProductReaction[]) {
    if (!values.length) return undefined;
    return values.join(",") as ProductReaction;
  }

  function handleFeedbackNoteSave() {
    const normalized = feedbackNoteDraft.trim();
    const current = (experience?.feedbackNote || "").trim();
    if (normalized === current) return;
    void updateExperience({ feedbackNote: normalized || undefined });
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
                    void updateExperience({ rating: undefined });
                    return;
                  }
                  void updateExperience({ rating: score as 1 | 2 | 3 | 4 | 5 });
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
        onSelect={(value) => void updateExperience({ usageFrequency: value })}
      />
      <MultiSelectExperienceChips
        title="使用反馈（最多选 3 项）"
        options={feedbackOptions}
        selected={parseSelectedReactions(normalizeSelectedReaction(experience?.reaction))}
        onSelect={(values) => void updateExperience({ reaction: serializeSelectedReactions(values) })}
      />
      <ExperienceChips
        title="后续意愿"
        options={intentionOptions}
        selected={experience?.intention}
        onSelect={(value) => void updateExperience({ intention: value })}
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
          className="min-h-11 w-full rounded-xl border bg-[var(--surface)] px-3 text-base text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--focus-ring)]/30"
          style={{ borderColor: "var(--border-soft)" }}
        />
      </div>
    </Card>
  );
}

function MultiSelectExperienceChips<T extends string>({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  selected: T[];
  onSelect: (values: T[]) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                if (active) {
                  onSelect(selected.filter((item) => item !== option.value));
                  return;
                }
                if (selected.length >= 3) return;
                onSelect([...selected, option.value]);
              }}
              className={[
                "min-h-11 rounded-full border px-3 text-xs font-medium transition-colors",
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

function ExperienceChips<T extends string>({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: ReadonlyArray<{ value: T; label: string }>;
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
                "min-h-11 rounded-full border px-3 text-xs font-medium transition-colors",
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
