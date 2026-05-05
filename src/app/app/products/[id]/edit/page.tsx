"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductForm, ProductFormValues } from "@/components/products/product-form";
import { getProductByIdAsync, updateProductAsync } from "@/lib/product-service";
import { FeedbackState } from "@/components/ui/feedback-state";
import { useToast } from "@/components/ui/toast-provider";
import { appendReturnTo, getSafeReturnTo } from "@/lib/navigation";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Awaited<ReturnType<typeof getProductByIdAsync>>>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
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

  useEffect(() => {
    let active = true;
    async function loadProduct() {
      setLoading(true);
      setLoadError(null);
      try {
        const nextProduct = await getProductByIdAsync(params.id);
        if (!active) return;
        setProduct(nextProduct);
      } catch {
        if (!active) return;
        setLoadError("产品加载失败，请稍后重试。");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadProduct();
    return () => {
      active = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <Card className="space-y-4">
        <FeedbackState>数据加载中...</FeedbackState>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="space-y-4">
        <FeedbackState>{loadError}</FeedbackState>
        <Button onClick={() => handleBack(detailHref)}>{"< "}返回详情页</Button>
      </Card>
    );
  }

  if (!product) {
    return (
      <Card className="space-y-4">
        <h1 className="text-2xl font-semibold text-rose-950">未找到该产品</h1>
        <FeedbackState>无法编辑：这个产品可能已经从本地数据中删除。</FeedbackState>
        <Button onClick={() => handleBack("/app/products")}>{"< "}返回产品库</Button>
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
    if (!values.sourceType || !values.status) {
      throw new Error("Required product fields are missing.");
    }
    try {
      await updateProductAsync(params.id, {
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
    } catch {
      showToast({ tone: "error", message: "保存失败，请稍后重试。" });
      throw new Error("Update product failed.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-rose-950">编辑产品</h1>
        </div>
      </div>

      <Card>
        <ProductForm mode="edit" initialValues={initialValues} onSubmit={handleUpdate} submitLayout="inline" />
      </Card>
    </div>
  );
}
