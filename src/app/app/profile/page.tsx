"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { TagInput } from "@/components/forms/tag-input";
import { clearProfileDraft, getProfileDraft } from "@/lib/profile-draft";
import { getSavedProfile, saveProfile } from "@/lib/profile-store";
import { FeedbackState } from "@/components/ui/feedback-state";
import { useToast } from "@/components/ui/toast-provider";

type ProfileForm = {
  skinType: string;
  skinConcerns: string;
  budgetRange: string;
  ingredientsToAvoid: string;
  fragrancePreference: string;
  preferredBrands: string[];
  dislikedBrands: string[];
  experienceLevel: string;
  skincareFamiliarity: string;
};

const initialForm: ProfileForm = {
  skinType: "",
  skinConcerns: "",
  budgetRange: "",
  ingredientsToAvoid: "",
  fragrancePreference: "",
  preferredBrands: [],
  dislikedBrands: [],
  experienceLevel: "",
  skincareFamiliarity: "",
};

const skinTypeMap: Record<string, string> = {
  Dry: "干性肌",
  Oily: "油性肌",
  Combination: "混合肌",
  Normal: "中性肌",
  Sensitive: "敏感肌",
  "Combination + Sensitive": "混合肌 + 敏感倾向",
  "Dry + Sensitive": "干性肌 + 敏感倾向",
  "Oily + Sensitive": "油性肌 + 敏感倾向",
};

const experienceLevelMap: Record<string, string> = {
  Beginner: "入门",
  Intermediate: "进阶",
  Advanced: "熟练",
};

const skincareFamiliarityMap: Record<string, string> = {
  "I only know basics": "我只了解基础步骤",
  "I follow a simple routine": "我有固定的基础护肤流程",
  "I understand active ingredients": "我比较理解功效成分",
};

const fragrancePreferenceMap: Record<string, string> = {
  "Fragrance free": "无香精",
  "Light fragrance only": "可接受淡香",
  "No strong preference": "无明显偏好",
};

const budgetRangeMap: Record<string, string> = {
  "Under $20": "￥150 以下",
  "$20-$50": "￥150-￥300",
  "$50-$100": "￥300-￥600",
  "$100+": "￥600 以上",
};

function toChineseProfile(values: Partial<ProfileForm>): Partial<ProfileForm> {
  return {
    ...values,
    skinType: values.skinType ? skinTypeMap[values.skinType] || values.skinType : values.skinType,
    experienceLevel: values.experienceLevel
      ? experienceLevelMap[values.experienceLevel] || values.experienceLevel
      : values.experienceLevel,
    skincareFamiliarity: values.skincareFamiliarity
      ? skincareFamiliarityMap[values.skincareFamiliarity] || values.skincareFamiliarity
      : values.skincareFamiliarity,
    fragrancePreference: values.fragrancePreference
      ? fragrancePreferenceMap[values.fragrancePreference] || values.fragrancePreference
      : values.fragrancePreference,
    budgetRange: values.budgetRange
      ? budgetRangeMap[values.budgetRange] || values.budgetRange
      : values.budgetRange,
    ingredientsToAvoid: values.ingredientsToAvoid
      ? values.ingredientsToAvoid
          .replace("Fragrance", "香精")
          .replace("harsh alcohol", "刺激性酒精")
      : values.ingredientsToAvoid,
  };
}

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const savedProfile = getSavedProfile();
  const draft = searchParams.get("source") === "assessment" ? getProfileDraft() : null;

  const initialFormState: ProfileForm = draft
    ? {
        ...initialForm,
        ...toChineseProfile(draft),
      }
    : savedProfile
      ? {
          ...initialForm,
          ...toChineseProfile(savedProfile),
        }
      : {
          ...initialForm,
          skinType: toChineseProfile({ skinType: searchParams.get("skinType") || "" }).skinType || "",
          skinConcerns: searchParams.get("concerns") || "",
          experienceLevel:
            toChineseProfile({ experienceLevel: searchParams.get("experienceLevel") || "" }).experienceLevel || "",
        };

  const [form, setForm] = useState<ProfileForm>(() => ({
    ...initialFormState,
  }));
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
    showToast({ tone: "success", message: "个人档案已保存到本地。" });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-rose-950">个人档案</h1>
        <p className="max-w-2xl text-sm text-rose-700/80">
          这份档案会用于产品整理、推荐建议和后续个性化体验。
        </p>
      </div>

      <Card>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="md:col-span-2 space-y-2">
            {prefilledFromAssessment ? (
              <FeedbackState>
                已应用测评结果。你可以在保存前继续自由修改全部字段。
              </FeedbackState>
            ) : null}
            {prefilledFromAssessment && savedProfile ? (
              <FeedbackState tone="warning">
                检测到你之前已保存过档案：当前已先应用测评结果作为起点，你仍可按原有习惯继续调整。
              </FeedbackState>
            ) : null}
            {loadedFromSavedProfile ? (
              <FeedbackState tone="info">
                已从当前浏览器的本地档案中自动回填。
              </FeedbackState>
            ) : null}
            <FeedbackState tone="info">当前档案可随时编辑，建议按你的真实习惯填写。</FeedbackState>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-rose-900">肤质类型</span>
            <Select
              value={form.skinType}
              onChange={(event) => setForm((prev) => ({ ...prev, skinType: event.target.value }))}
            >
              <option value="">请选择肤质</option>
              <option value="干性肌">干性肌</option>
              <option value="油性肌">油性肌</option>
              <option value="混合肌">混合肌</option>
              <option value="中性肌">中性肌</option>
              <option value="敏感肌">敏感肌</option>
              <option value="混合肌 + 敏感倾向">混合肌 + 敏感倾向</option>
              <option value="干性肌 + 敏感倾向">干性肌 + 敏感倾向</option>
              <option value="油性肌 + 敏感倾向">油性肌 + 敏感倾向</option>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-rose-900">皮肤关注点</span>
            <Input
              placeholder="如：痘痘、泛红、缺水、毛孔"
              value={form.skinConcerns}
              onChange={(event) => setForm((prev) => ({ ...prev, skinConcerns: event.target.value }))}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-rose-900">预算区间</span>
            <Select
              value={form.budgetRange}
              onChange={(event) => setForm((prev) => ({ ...prev, budgetRange: event.target.value }))}
            >
              <option value="">请选择预算区间</option>
              <option value="￥150 以下">￥150 以下</option>
              <option value="￥150-￥300">￥150-￥300</option>
              <option value="￥300-￥600">￥300-￥600</option>
              <option value="￥600 以上">￥600 以上</option>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-rose-900">想避开的成分</span>
            <Input
              placeholder="如：香精、刺激性酒精、某些精油"
              value={form.ingredientsToAvoid}
              onChange={(event) => setForm((prev) => ({ ...prev, ingredientsToAvoid: event.target.value }))}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-rose-900">香精偏好</span>
            <Select
              value={form.fragrancePreference}
              onChange={(event) => setForm((prev) => ({ ...prev, fragrancePreference: event.target.value }))}
            >
              <option value="">请选择香精偏好</option>
              <option value="无香精">无香精</option>
              <option value="可接受淡香">可接受淡香</option>
              <option value="无明显偏好">无明显偏好</option>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-rose-900">护肤经验</span>
            <Select
              value={form.experienceLevel}
              onChange={(event) => setForm((prev) => ({ ...prev, experienceLevel: event.target.value }))}
            >
              <option value="">请选择经验水平</option>
              <option value="入门">入门</option>
              <option value="进阶">进阶</option>
              <option value="熟练">熟练</option>
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-rose-900">护肤熟悉度</span>
            <Select
              value={form.skincareFamiliarity}
              onChange={(event) => setForm((prev) => ({ ...prev, skincareFamiliarity: event.target.value }))}
            >
              <option value="">请选择熟悉度</option>
              <option value="我只了解基础步骤">我只了解基础步骤</option>
              <option value="我有固定的基础护肤流程">我有固定的基础护肤流程</option>
              <option value="我比较理解功效成分">我比较理解功效成分</option>
            </Select>
          </label>

          <div>
            <TagInput
              label="偏好品牌"
              values={form.preferredBrands}
              onChange={(next) => setForm((prev) => ({ ...prev, preferredBrands: next }))}
              placeholder="输入品牌后按回车"
            />
          </div>
          <div>
            <TagInput
              label="不喜欢的品牌"
              values={form.dislikedBrands}
              onChange={(next) => setForm((prev) => ({ ...prev, dislikedBrands: next }))}
              placeholder="输入品牌后按回车"
            />
          </div>

          {saved ? (
            <FeedbackState tone="success">
              档案已保存在本地，下次进入会自动回填。
            </FeedbackState>
          ) : null}

          <div className="sticky bottom-20 z-10 bg-white/80 py-2 backdrop-blur">
            <Button className="w-full" type="submit" disabled={saving}>
              {saving ? "保存中..." : "保存档案"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
