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
    <div className="space-y-5">
      <div className="space-y-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-rose-950">新增产品</h1>
          <p className="mt-1 text-sm text-rose-700/80">记录一次，后续选择就更轻松。</p>
        </div>
      </div>

      <Card>
        <ProductForm mode="create" initialValues={initialForm} onSubmit={handleCreate} />
      </Card>
    </div>
  );
}
