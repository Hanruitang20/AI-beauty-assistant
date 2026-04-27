"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { createProductAsync } from "@/lib/product-service";
import { ProductForm, ProductFormValues } from "@/components/products/product-form";
import { useToast } from "@/components/ui/toast-provider";
import { getSafeReturnTo } from "@/lib/navigation";

const initialForm: ProductFormValues = {
  productName: "",
  brand: "",
  category: "",
  categoryType: "preset",
  customCategory: "",
  sourceType: "",
  usageDurationMonths: "",
  note: "",
  status: "",
};

export default function NewProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const safeReturnTo = getSafeReturnTo(searchParams.get("returnTo"), "/app/products");

  async function handleCreate(form: ProductFormValues) {
    const normalizedCategory = form.categoryType === "custom" ? form.customCategory.trim() : form.category;
    try {
      const created = await createProductAsync({
        name: form.productName,
        brand: form.brand,
        category: normalizedCategory,
        categoryType: form.categoryType,
        sourceType: form.sourceType,
        usageDurationMonths: Number(form.usageDurationMonths),
        note: form.note || undefined,
        status: form.status,
      });
      showToast({ tone: "success", message: `已添加「${created.name}」` });
      router.push(safeReturnTo);
    } catch {
      showToast({ tone: "error", message: "保存失败，请稍后重试。" });
      throw new Error("Create product failed.");
    }
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-2">
        <div>
          <h1 className="editorial-heading text-[30px] font-semibold tracking-tight text-[#3c3530]">新增产品</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">记录一次，后续选择就更轻松。</p>
        </div>
      </div>

      <Card className="rounded-[24px]">
        <ProductForm mode="create" initialValues={initialForm} onSubmit={handleCreate} />
      </Card>
    </div>
  );
}
