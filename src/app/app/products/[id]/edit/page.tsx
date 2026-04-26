"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductForm, ProductFormValues } from "@/components/products/product-form";
import { getProductById, updateProduct } from "@/lib/products-store";
import { FeedbackState } from "@/components/ui/feedback-state";
import { useToast } from "@/components/ui/toast-provider";
import { appendReturnTo, getSafeReturnTo } from "@/lib/navigation";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const safeReturnTo = getSafeReturnTo(searchParams.get("returnTo"), "");
  const detailHref = safeReturnTo
    ? appendReturnTo(`/app/products/${params.id}`, safeReturnTo)
    : `/app/products/${params.id}`;

  function handleBack(fallbackPath: string) {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackPath);
  }

  const product = getProductById(params.id);

  if (!product) {
    return (
      <Card className="space-y-4">
        <h1 className="text-2xl font-semibold text-rose-950">未找到该产品</h1>
        <FeedbackState>无法编辑：这个产品可能已经从本地数据中删除。</FeedbackState>
        <Button onClick={() => handleBack("/app/products")}>返回产品库</Button>
      </Card>
    );
  }

  const initialValues: ProductFormValues = {
    productName: product.name,
    brand: product.brand,
    category: product.categoryType === "custom" ? "other" : product.category,
    categoryType: product.categoryType || "preset",
    customCategory: product.categoryType === "custom" ? product.category : "",
    sourceType: product.sourceType,
    usageDurationMonths: String(product.usageDurationMonths ?? 0),
    note: product.note || "",
    status: product.status,
  };

  async function handleUpdate(values: ProductFormValues) {
    const normalizedCategory = values.categoryType === "custom" ? values.customCategory.trim() : values.category;
    updateProduct(params.id, {
      name: values.productName,
      brand: values.brand,
      category: normalizedCategory,
      categoryType: values.categoryType,
      sourceType: values.sourceType,
      usageDurationMonths: Number(values.usageDurationMonths),
      note: values.note || undefined,
      status: values.status,
    });
    showToast({ tone: "success", message: "产品信息已更新。" });
    router.push(detailHref);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-rose-950">编辑产品</h1>
          <p className="mt-1 text-sm text-rose-700/80">随着使用变化，及时更新记录，让产品库更准确。</p>
        </div>
        <Button variant="secondary" className="w-full" onClick={() => handleBack(detailHref)}>
          返回详情页
        </Button>
      </div>

      <Card>
        <ProductForm mode="edit" initialValues={initialValues} onSubmit={handleUpdate} />
      </Card>
    </div>
  );
}
