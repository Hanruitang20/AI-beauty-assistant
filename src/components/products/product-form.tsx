"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { FeedbackState } from "@/components/ui/feedback-state";
import { ProductStatus, SourceType } from "@/lib/products";
import { SKINCARE_PRODUCT_CATEGORY_OPTIONS } from "@/lib/product-options";

export type ProductFormValues = {
  productName: string;
  brand: string;
  category: string;
  categoryType: "preset" | "custom";
  customCategory: string;
  sourceType: SourceType | "";
  usageDurationMonths: string;
  note: string;
  status: ProductStatus | "";
};

type ProductFormProps = {
  mode: "create" | "edit";
  initialValues: ProductFormValues;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  submitLabel?: string;
  /** sticky: floating above bottom nav (新建页). inline: normal flow below fields (编辑页). */
  submitLayout?: "sticky" | "inline";
  submitStickyClassName?: string;
};

export function ProductForm({
  mode,
  initialValues,
  onSubmit,
  submitLabel,
  submitLayout = "sticky",
  submitStickyClassName,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError(null);

    if (!form.productName || !form.brand || !form.category || !form.sourceType || !form.status || form.usageDurationMonths === "") {
      setError("请填写所有必填项。");
      return;
    }

    if (form.categoryType === "custom" && !form.customCategory.trim()) {
      setError("请选择“其他”时，请填写自定义品类。");
      return;
    }

    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await onSubmit(form);
      if (mode === "create") {
        setForm(initialValues);
      }
    } catch {
      setError("保存失败，请稍后重试。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">产品名称 *</span>
        <Input
          value={form.productName}
          placeholder="例如：积雪草修护面霜"
          maxLength={60}
          onChange={(event) => setForm((prev) => ({ ...prev, productName: event.target.value }))}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">品牌 *</span>
        <Input
          value={form.brand}
          placeholder="例如：Skin1004"
          maxLength={40}
          onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">品类 *</span>
        <Select
          className="pr-11"
          value={form.category}
          onChange={(event) => {
            const value = event.target.value;
            setForm((prev) => ({
              ...prev,
              category: value,
              categoryType: value === "other" ? "custom" : "preset",
            }));
          }}
        >
          <option value="">请选择品类</option>
          {SKINCARE_PRODUCT_CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </label>
      {form.categoryType === "custom" ? (
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">请输入自定义品类 *</span>
          <Input
            value={form.customCategory}
            placeholder="例如：美容仪 / 香氛 / 医美护理"
            maxLength={30}
            onChange={(event) => setForm((prev) => ({ ...prev, customCategory: event.target.value }))}
          />
        </label>
      ) : null}

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">状态 *</span>
        <Select
          className="pr-11"
          value={form.status}
          onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as ProductStatus }))}
        >
          <option value="">请选择状态</option>
          <option value="using">正在使用</option>
          <option value="wishlist">想购买</option>
          <option value="used">用过</option>
          <option value="recommended">被推荐</option>
        </Select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">来源类型 *</span>
        <Select
          className="pr-11"
          value={form.sourceType}
          onChange={(event) => setForm((prev) => ({ ...prev, sourceType: event.target.value as SourceType }))}
        >
          <option value="">请选择来源类型</option>
          <option value="self-discovery">自己发现</option>
          <option value="friend">朋友推荐</option>
          <option value="creator">博主 / 社媒</option>
          <option value="dermatologist">皮肤科医生</option>
        </Select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">使用时长 *</span>
        <Select
          className="pr-11"
          value={form.usageDurationMonths}
          onChange={(event) => setForm((prev) => ({ ...prev, usageDurationMonths: event.target.value }))}
        >
          <option value="">请选择使用时长</option>
          <option value="0">未开始使用 / 仅记录</option>
          <option value="1">1 个月内</option>
          <option value="2">约 2 个月</option>
          <option value="3">约 3 个月</option>
          <option value="4">约 4 个月</option>
          <option value="6">约半年</option>
          <option value="12">约一年或更久</option>
        </Select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">备注（可选）</span>
        <Textarea
          rows={4}
          value={form.note}
          placeholder="可记录使用感受、反应或注意事项。"
          maxLength={150}
          onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
        />
      </label>

      {error ? <FeedbackState tone="error">{error}</FeedbackState> : null}

      {submitLayout === "inline" ? (
        <div className="mt-3 border-t pt-4" style={{ borderColor: "var(--border-soft)" }}>
          <Button className="w-full" type="submit" disabled={saving}>
            {saving ? "保存中..." : submitLabel || (mode === "create" ? "保存产品" : "保存修改")}
          </Button>
        </div>
      ) : (
        <div
          className={`sticky ${submitStickyClassName || "bottom-[calc(5.5rem+env(safe-area-inset-bottom))]"} z-10 rounded-xl bg-[var(--surface)]/85 py-2 backdrop-blur`}
        >
          <Button className="w-full" type="submit" disabled={saving}>
            {saving ? "保存中..." : submitLabel || (mode === "create" ? "保存产品" : "保存修改")}
          </Button>
        </div>
      )}
    </form>
  );
}
