"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { TagInput } from "@/components/forms/tag-input";
import { clearProfileDraft, getProfileDraft } from "@/lib/profile-draft";
import { getSavedProfile, saveProfile, SavedProfile } from "@/lib/profile-store";
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
  ingredientsToAvoid: "",
};

export function ProfileForm() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const savedProfile = getSavedProfile();
  const draft = searchParams.get("source") === "assessment" ? getProfileDraft() : null;

  const initialFormState: ProfileFormState = draft
    ? {
        ...initialForm,
        skinType: draft.skinType || "",
        mainConcerns: draft.skinConcerns || "",
        experienceLevel: draft.experienceLevel || "",
        skincareFamiliarity: draft.skincareFamiliarity || "",
        ingredientsToAvoid: draft.ingredientsToAvoid || "",
      }
    : savedProfile
      ? { ...initialForm, ...savedProfile }
      : initialForm;

  const [form, setForm] = useState<ProfileFormState>(initialFormState);
  const [prefilledFromAssessment, setPrefilledFromAssessment] = useState(Boolean(draft));
  const [loadedFromSavedProfile, setLoadedFromSavedProfile] = useState(Boolean(savedProfile && !draft));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    saveProfile(form);
    setSaving(false);
    setSaved(true);
    clearProfileDraft();
    setPrefilledFromAssessment(false);
    setLoadedFromSavedProfile(true);
    showToast({ tone: "success", message: "个人画像已保存到本地。" });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Beauty profile</p>
        <h1 className="editorial-heading text-[30px] font-semibold tracking-tight text-[#3c3530]">个人画像</h1>
        <p className="text-sm text-[var(--text-muted)]">这些信息会影响你的产品理解、建议优先级和推荐方向。</p>
      </div>

      <Card className="rounded-[24px]">
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

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">想避开的成分/已知不耐受</span>
            <Input
              placeholder="如：香精、刺激性酒精、某些精油"
              value={form.ingredientsToAvoid}
              onChange={(e) => setForm((p) => ({ ...p, ingredientsToAvoid: e.target.value }))}
            />
          </label>

          <TagInput
            label="偏好品牌（可选）"
            values={form.preferredBrands}
            onChange={(next) => setForm((p) => ({ ...p, preferredBrands: next }))}
            placeholder="输入品牌后按回车"
          />
          <TagInput
            label="已踩雷品牌/产品（可选）"
            values={form.dislikedBrands}
            onChange={(next) => setForm((p) => ({ ...p, dislikedBrands: next }))}
            placeholder="输入品牌或产品后按回车"
          />

          {saved ? <FeedbackState tone="success">个人画像已保存，本地建议将基于这些信息更新。</FeedbackState> : null}

          <div className="sticky bottom-24 z-10 rounded-xl bg-[var(--surface)]/85 py-2 backdrop-blur">
            <Button className="w-full" type="submit" disabled={saving}>
              {saving ? "保存中..." : "保存个人画像"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
