"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { createProduct } from "@/lib/products-store";
import { ProductForm, ProductFormValues } from "@/components/products/product-form";
import { useToast } from "@/components/ui/toast-provider";

const initialForm: ProductFormValues = {
  productName: "",
  brand: "",
  category: "",
  sourceType: "",
  sourceLink: "",
  note: "",
  status: "",
};

export default function NewProductPage() {
  const router = useRouter();
  const { showToast } = useToast();

  async function handleCreate(form: ProductFormValues) {
    const created = createProduct({
      name: form.productName,
      brand: form.brand,
      category: form.category,
      sourceType: form.sourceType,
      sourceLink: form.sourceLink || undefined,
      note: form.note || undefined,
      status: form.status,
    });
    showToast({ tone: "success", message: "产品已加入你的产品库。" });
    router.push(`/app/products?created=${encodeURIComponent(created.name)}`);
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Add to shelf</p>
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
