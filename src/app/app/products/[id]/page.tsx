"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BeautyProduct,
  getCategoryLabel,
  productStatusLabelMap,
  sourceTypeLabelMap,
} from "@/lib/products";
import {
  getProductImageById,
  saveProductImageById,
} from "@/lib/products-store";
import { ProductSummary } from "@/lib/products-store";
import { ProductSummaryPanel } from "@/components/products/product-summary-panel";
import { FeedbackState } from "@/components/ui/feedback-state";
import { useToast } from "@/components/ui/toast-provider";
import { appendReturnTo, getSafeReturnTo } from "@/lib/navigation";
import {
  deleteProductExperienceAsync,
  getProductExperienceAsync,
  ProductExperience,
} from "@/lib/product-experience-service";
import { ProductExperienceCard } from "@/components/products/product-experience-card";
import {
  deleteProductAsync,
  generateMockProductSummaryAsync,
  getProductByIdAsync,
  getProductSummaryAsync,
  markProductViewedAsync,
  saveProductSummaryAsync,
} from "@/lib/product-service";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const productId = params.id;
  const [product, setProduct] = useState<BeautyProduct | null>(null);
  const [summary, setSummary] = useState<ProductSummary | null>(null);
  const [productImage, setProductImage] = useState<string>(() => getProductImageById(productId));
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryStatusText, setSummaryStatusText] = useState<string | null>(null);
  const [experience, setExperience] = useState<ProductExperience | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const safeReturnTo = getSafeReturnTo(searchParams.get("returnTo"), "");
  const resolvedReturnTo = safeReturnTo || null;
  const editHref = safeReturnTo
    ? appendReturnTo(`/app/products/${productId}/edit`, safeReturnTo)
    : `/app/products/${productId}/edit`;

  function handleBackToPrevious() {
    if (resolvedReturnTo) {
      router.replace(resolvedReturnTo);
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/app/products");
  }

  function navigateAfterDelete() {
    if (resolvedReturnTo) {
      router.replace(resolvedReturnTo);
      return;
    }
    router.push("/app/products");
  }

  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      setLoadError(null);
      try {
        const [nextProduct, nextSummary, nextExperience] = await Promise.all([
          getProductByIdAsync(productId),
          getProductSummaryAsync(productId),
          getProductExperienceAsync(productId),
        ]);
        if (!active) return;
        setProduct(nextProduct);
        setSummary(nextSummary);
        setExperience(nextExperience);
      } catch {
        if (!active) return;
        setLoadError("产品数据加载失败，请稍后重试。");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadData();
    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    if (product) {
      void markProductViewedAsync(product.id).catch(() => {
        // Non-blocking side effect for recent viewed.
      });
    }
  }, [product]);

  async function handleGenerateSummary() {
    if (!product) return;
    if (loadingSummary) return;
    setLoadingSummary(true);
    setSummaryStatusText("正在整理产品信息，请稍候...");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const generated = await generateMockProductSummaryAsync(product);
      await saveProductSummaryAsync(product.id, generated);
      setSummary(generated);
      setSummaryStatusText("摘要已更新，你可以继续刷新以查看不同角度的说明。");
    } catch {
      showToast({ tone: "error", message: "摘要生成失败，请稍后重试。" });
      setSummaryStatusText("摘要生成失败，请稍后重试。");
    } finally {
      setLoadingSummary(false);
    }
  }

  async function handleConfirmDelete() {
    if (!product) return;
    if (deleting) return;
    setDeleting(true);
    try {
      await Promise.all([
        deleteProductAsync(product.id),
        deleteProductExperienceAsync(product.id),
      ]);
      showToast({ tone: "success", message: `已删除「${product.name}」` });
      setShowDeleteDialog(false);
      navigateAfterDelete();
    } catch {
      showToast({ tone: "error", message: "删除失败，请稍后重试。" });
    } finally {
      setDeleting(false);
    }
  }

  function handleImagePick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast({ tone: "error", message: "请选择图片文件。" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) return;
      saveProductImageById(productId, dataUrl);
      setProductImage(dataUrl);
      showToast({ tone: "success", message: "产品图片已更新。" });
    };
    reader.readAsDataURL(file);
  }

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
        <Button onClick={handleBackToPrevious}>{"< "}返回上一级</Button>
      </Card>
    );
  }

  if (!product) {
    return (
      <Card className="space-y-4">
        <h1 className="editorial-heading text-2xl font-semibold text-[var(--foreground)]">未找到该产品</h1>
        <p className="text-sm text-[var(--text-muted)]">
          本地数据中未找到该产品，请返回产品库查看。
        </p>
        <Button onClick={handleBackToPrevious}>{"< "}返回上一级</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="relative mx-auto aspect-square w-[70%] overflow-hidden rounded-[24px] border bg-[var(--surface-soft)] shadow-[0_4px_24px_rgba(60,53,48,0.04)]" style={{ borderColor: "var(--border-soft)" }}>
        {productImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={productImage} alt={`${product.name} 产品图`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[var(--text-muted)]">
            产品视觉占位图
          </div>
        )}
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
            {productStatusLabelMap[product.status]}
          </span>
        </div>
        <button
          type="button"
          className="absolute bottom-3 right-3 inline-flex min-h-11 items-center rounded-full border bg-[var(--surface)]/90 px-3 py-1 text-[11px] font-medium text-[var(--foreground)] shadow-sm"
          style={{ borderColor: "var(--border-soft)" }}
          onClick={() => imageInputRef.current?.click()}
        >
          上传图片
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImagePick}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{getCategoryLabel(product.category)}</p>
            <h1 className="editorial-heading text-[30px] font-semibold tracking-tight text-[#3c3530]">{product.name}</h1>
          </div>
          <Link href={editHref} className="inline-flex min-h-11 items-center rounded-full border px-3 py-1 text-xs font-medium text-[var(--accent)]" style={{ borderColor: "var(--border-soft)" }}>
            编辑
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
            {productStatusLabelMap[product.status]}
          </span>
          <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
            {(product.usageDurationMonths || 0) > 0 ? `${product.usageDurationMonths} 个月` : "未开始使用"}
          </span>
          <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
            {sourceTypeLabelMap[product.sourceType]}
          </span>
        </div>
      </div>

      <ProductSummaryPanel summary={summary} loading={loadingSummary} onGenerate={handleGenerateSummary} />
      {summaryStatusText ? <FeedbackState tone={loadingSummary ? "info" : "success"}>{summaryStatusText}</FeedbackState> : null}

      <ProductExperienceCard
        productId={productId}
        initialExperience={experience}
        onUpdated={setExperience}
      />

      {product.note ? (
        <Card className="space-y-2 rounded-[24px]">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">我的备注</h2>
          <p className="text-sm text-[var(--foreground)]">{product.note}</p>
        </Card>
      ) : null}
      <button
        type="button"
        onClick={() => setShowDeleteDialog(true)}
        className="w-full pt-2 text-center text-xs font-medium text-[var(--danger-text)]/80 hover:text-[var(--danger-text)]"
      >
        删除产品
      </button>

      {showDeleteDialog ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <div
            className="w-full max-w-[420px] rounded-[24px] border bg-[var(--surface)] p-5 shadow-[0_18px_36px_rgba(60,53,48,0.2)]"
            style={{ borderColor: "var(--border-soft)" }}
          >
            <h3 className="text-base font-semibold text-[var(--foreground)]">确认删除这个产品？</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              删除后，这个产品及相关摘要/使用感受将从你的产品库中移除，此操作不可恢复。
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="secondary" className="w-full" onClick={() => setShowDeleteDialog(false)}>
                取消
              </Button>
              <Button variant="danger" className="w-full" onClick={handleConfirmDelete} disabled={deleting}>
                {deleting ? "删除中..." : "确认删除"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
