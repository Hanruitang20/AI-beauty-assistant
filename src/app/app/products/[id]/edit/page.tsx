"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductForm, ProductFormValues } from "@/components/products/product-form";
import { getProductById, updateProduct } from "@/lib/products-store";
import { FeedbackState } from "@/components/ui/feedback-state";
import { useToast } from "@/components/ui/toast-provider";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();

  const product = getProductById(params.id);

  if (!product) {
    return (
      <Card className="space-y-4">
        <h1 className="text-2xl font-semibold text-rose-950">未找到该产品</h1>
        <FeedbackState>无法编辑：这个产品可能已经从本地数据中删除。</FeedbackState>
        <Link href="/app/products">
          <Button>返回产品库</Button>
        </Link>
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
    sourceLink: product.sourceLink || "",
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
      sourceLink: values.sourceLink || undefined,
      note: values.note || undefined,
      status: values.status,
    });
    showToast({ tone: "success", message: "产品信息已更新。" });
    router.push(`/app/products/${params.id}?updated=1`);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-rose-950">编辑产品</h1>
          <p className="mt-1 text-sm text-rose-700/80">随着使用变化，及时更新记录，让产品库更准确。</p>
        </div>
        <Link href={`/app/products/${params.id}`}>
          <Button variant="secondary" className="w-full">返回详情页</Button>
        </Link>
      </div>

      <Card>
        <ProductForm mode="edit" initialValues={initialValues} onSubmit={handleUpdate} />
      </Card>
    </div>
  );
}
