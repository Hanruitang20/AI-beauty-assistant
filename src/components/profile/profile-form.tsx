"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import {
  clearProfileDraftAsync,
  getProfileAsync,
  getProfileDraftAsync,
  saveProfileAsync,
} from "@/lib/profile-service";
import { SavedProfile } from "@/lib/profile-store";
import { FeedbackState } from "@/components/ui/feedback-state";
import { useToast } from "@/components/ui/toast-provider";

type ProfileFormState = SavedProfile;

const initialForm: ProfileFormState = {
  primaryFocus: "",
  skinType: "",
  mainConcerns: "",
  sensitivityLevel: "",
  preferredBrands: [],
  dislikedBrands: [],
  experienceLevel: "",
  skincareFamiliarity: "",
  hasRoutine: "",
  priorityGoal: "",
};

export function ProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const sourceFromAssessment = searchParams.get("source") === "assessment";

  const [form, setForm] = useState<ProfileFormState>(initialForm);
  const [prefilledFromAssessment, setPrefilledFromAssessment] = useState(false);
  const [loadedFromSavedProfile, setLoadedFromSavedProfile] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      setInitializing(true);
      setLoadError(null);
      try {
        const [savedProfile, draft] = await Promise.all([getProfileAsync(), getProfileDraftAsync()]);
        if (!active) return;

        const shouldUseDraft = sourceFromAssessment && Boolean(draft);
        const nextFormState: ProfileFormState = shouldUseDraft
          ? {
              ...initialForm,
              skinType: draft?.skinType || "",
              mainConcerns: draft?.skinConcerns || "",
              experienceLevel: draft?.experienceLevel || "",
              skincareFamiliarity: draft?.skincareFamiliarity || "",
            }
          : savedProfile
            ? { ...initialForm, ...savedProfile }
            : initialForm;

        setForm(nextFormState);
        setPrefilledFromAssessment(shouldUseDraft);
        setLoadedFromSavedProfile(Boolean(savedProfile && !shouldUseDraft));
      } catch {
        if (!active) return;
        setLoadError("个人档案加载失败，请稍后重试。");
      } finally {
        if (active) setInitializing(false);
      }
    }

    loadInitialData();
    return () => {
      active = false;
    };
  }, [sourceFromAssessment]);

  function resolveReturnToPath() {
    const fallbackPath = "/app/products";
    const raw = searchParams.get("returnTo");
    if (!raw || !raw.startsWith("/")) return fallbackPath;
    if (raw === "/app/onboarding") return fallbackPath;
    return raw;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await saveProfileAsync(form);
      await clearProfileDraftAsync();
      setPrefilledFromAssessment(false);
      setLoadedFromSavedProfile(true);
      showToast({ tone: "success", message: "个人画像已保存到本地。" });
      router.push(resolveReturnToPath());
    } catch {
      showToast({ tone: "error", message: "保存失败，请稍后重试。" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="editorial-heading text-[30px] font-semibold tracking-tight text-[#3c3530]">个人画像</h1>
        <p className="text-sm text-[var(--text-muted)]">这些信息会影响你的产品理解、建议优先级和推荐方向。</p>
      </div>

      <Card className="rounded-[24px]">
        {initializing ? (
          <div className="pb-2">
            <FeedbackState tone="info">数据加载中...</FeedbackState>
          </div>
        ) : null}
        {loadError ? (
          <div className="pb-2">
            <FeedbackState>{loadError}</FeedbackState>
          </div>
        ) : null}
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            {prefilledFromAssessment ? (
              <FeedbackState>我们已将测评结果作为起点应用到个人画像，你可以继续修改。</FeedbackState>
            ) : null}
            {loadedFromSavedProfile ? (
              <FeedbackState tone="info">已加载你此前保存的本地个人画像。</FeedbackState>
            ) : null}
            <FeedbackState tone="info">你可以随时调整信息，推荐会跟随更新。</FeedbackState>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">主要关注方向</span>
            <Select value={form.primaryFocus} onChange={(e) => setForm((p) => ({ ...p, primaryFocus: e.target.value }))}>
              <option value="">请选择方向</option>
              <option value="护肤">护肤</option>
              <option value="身体护理">身体护理</option>
              <option value="头发护理">头发护理</option>
              <option value="彩妆">彩妆</option>
              <option value="混合关注">混合关注</option>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">肤质</span>
            <Select value={form.skinType} onChange={(e) => setForm((p) => ({ ...p, skinType: e.target.value }))}>
              <option value="">请选择肤质</option>
              <option value="干性肌">干性肌</option>
              <option value="油性肌">油性肌</option>
              <option value="混合肌">混合肌</option>
              <option value="中性肌">中性肌</option>
              <option value="敏感肌">敏感肌</option>
              <option value="混合肌 + 敏感倾向">混合肌 + 敏感倾向</option>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">当前主要困扰/诉求</span>
            <Input
              placeholder="如：缺水、泛红、痘痘、暗沉"
              value={form.mainConcerns}
              onChange={(e) => setForm((p) => ({ ...p, mainConcerns: e.target.value }))}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">敏感程度</span>
            <Select
              value={form.sensitivityLevel}
              onChange={(e) => setForm((p) => ({ ...p, sensitivityLevel: e.target.value }))}
            >
              <option value="">请选择敏感程度</option>
              <option value="不太敏感">不太敏感</option>
              <option value="偶尔敏感">偶尔敏感</option>
              <option value="比较敏感">比较敏感</option>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">护理经验水平</span>
            <Select
              value={form.experienceLevel}
              onChange={(e) => setForm((p) => ({ ...p, experienceLevel: e.target.value }))}
            >
              <option value="">请选择经验水平</option>
              <option value="入门">入门</option>
              <option value="进阶">进阶</option>
              <option value="熟练">熟练</option>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">护理熟悉程度</span>
            <Select
              value={form.skincareFamiliarity}
              onChange={(e) => setForm((p) => ({ ...p, skincareFamiliarity: e.target.value }))}
            >
              <option value="">请选择熟悉程度</option>
              <option value="我只了解基础步骤">我只了解基础步骤</option>
              <option value="我有固定的基础护理流程">我有固定的基础护理流程</option>
              <option value="我比较理解功效成分">我比较理解功效成分</option>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">是否已有固定 routine</span>
            <Select value={form.hasRoutine} onChange={(e) => setForm((p) => ({ ...p, hasRoutine: e.target.value }))}>
              <option value="">请选择</option>
              <option value="已有且稳定">已有且稳定</option>
              <option value="有但不稳定">有但不稳定</option>
              <option value="还没有">还没有</option>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">当前最想优先解决的问题</span>
            <Input
              placeholder="如：先稳定敏感，再改善痘印"
              value={form.priorityGoal}
              onChange={(e) => setForm((p) => ({ ...p, priorityGoal: e.target.value }))}
            />
          </label>

          <div className="sticky bottom-24 z-10 rounded-xl bg-[var(--surface)]/85 py-2 backdrop-blur">
            <Button className="w-full" type="submit" disabled={saving || initializing}>
              {saving ? "保存中..." : "保存个人画像"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
