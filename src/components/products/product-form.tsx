"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { FeedbackState } from "@/components/ui/feedback-state";
import { ProductCategory, ProductStatus, SourceType } from "@/lib/products";

export type ProductFormValues = {
  productName: string;
  brand: string;
  category: ProductCategory | "";
  sourceType: SourceType | "";
  sourceLink: string;
  note: string;
  status: ProductStatus | "";
};

type ProductFormProps = {
  mode: "create" | "edit";
  initialValues: ProductFormValues;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  submitLabel?: string;
};

export function ProductForm({ mode, initialValues, onSubmit, submitLabel }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (!form.productName || !form.brand || !form.category || !form.sourceType || !form.status) {
      setError("请填写所有必填项。");
      return;
    }

    if (form.sourceLink && !form.sourceLink.startsWith("http")) {
      setError("来源链接需以 http 或 https 开头。");
      return;
    }

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    await onSubmit(form);
    setSaving(false);
    setSaved(true);

    if (mode === "create") {
      setForm(initialValues);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">产品名称 *</span>
        <Input
          value={form.productName}
          placeholder="例如：积雪草修护面霜"
          onChange={(event) => setForm((prev) => ({ ...prev, productName: event.target.value }))}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">品牌 *</span>
        <Input
          value={form.brand}
          placeholder="例如：Skin1004"
          onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">品类 *</span>
        <Select
          value={form.category}
          onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as ProductCategory }))}
        >
          <option value="">请选择品类</option>
          <option value="cleanser">洁面</option>
          <option value="serum">精华</option>
          <option value="moisturizer">面霜/乳液</option>
          <option value="sunscreen">防晒</option>
          <option value="makeup">彩妆</option>
        </Select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">状态 *</span>
        <Select
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
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">来源链接（可选）</span>
        <Input
          value={form.sourceLink}
          placeholder="https://..."
          onChange={(event) => setForm((prev) => ({ ...prev, sourceLink: event.target.value }))}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">备注（可选）</span>
        <Textarea
          rows={4}
          value={form.note}
          placeholder="可记录使用感受、反应或注意事项。"
          onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
        />
      </label>

      {error ? <FeedbackState tone="error">{error}</FeedbackState> : null}
      {saved ? (
        <FeedbackState tone="success">
          {mode === "create" ? "产品已保存。" : "产品信息已更新。"}
        </FeedbackState>
      ) : null}

      <div className="sticky bottom-20 z-10 rounded-xl bg-[var(--surface)]/85 py-2 backdrop-blur">
        <Button className="w-full" type="submit" disabled={saving}>
          {saving ? "保存中..." : submitLabel || (mode === "create" ? "保存产品" : "保存修改")}
        </Button>
      </div>
    </form>
  );
}
