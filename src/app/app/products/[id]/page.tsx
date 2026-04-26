"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BeautyProduct,
  getCategoryLabel,
  productStatusLabelMap,
  sourceTypeLabelMap,
} from "@/lib/products";
import {
  deleteProductById,
  generateMockSummary,
  getProductById,
  getSummaryByProductId,
  ProductSummary,
  saveSummaryByProductId,
  markProductViewed,
} from "@/lib/products-store";
import { ProductSummaryPanel } from "@/components/products/product-summary-panel";
import { FeedbackState } from "@/components/ui/feedback-state";
import { useToast } from "@/components/ui/toast-provider";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const productId = params.id;
  const product = useMemo<BeautyProduct | null>(() => getProductById(productId), [productId]);
  const [summary, setSummary] = useState<ProductSummary | null>(() => getSummaryByProductId(productId));
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [summaryStatusText, setSummaryStatusText] = useState<string | null>(null);
  const updatedToastShownRef = useRef(false);

  useEffect(() => {
    if (searchParams.get("updated") === "1" && !updatedToastShownRef.current) {
      showToast({ tone: "success", message: "产品修改已保存。" });
      updatedToastShownRef.current = true;
    }
  }, [searchParams, showToast]);

  useEffect(() => {
    if (product) {
      markProductViewed(product.id);
    }
  }, [product]);

  async function handleGenerateSummary() {
    if (!product) return;
    setLoadingSummary(true);
    setSummaryStatusText("正在整理产品信息，请稍候...");
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const generated = generateMockSummary(product);
    saveSummaryByProductId(product.id, generated);
    setSummary(generated);
    setLoadingSummary(false);
    setSummaryStatusText("摘要已更新，你可以继续刷新以查看不同角度的说明。");
  }

  function handleDeleteProduct() {
    if (!product) return;
    deleteProductById(product.id);
    showToast({ tone: "success", message: "该产品已从产品库删除。" });
    router.push("/app/products?deleted=1");
  }

  if (!product) {
    return (
      <Card className="space-y-4">
        <h1 className="editorial-heading text-2xl font-semibold text-[var(--foreground)]">未找到该产品</h1>
        <p className="text-sm text-[var(--text-muted)]">
          本地数据中未找到该产品，请返回产品库查看。
        </p>
        <Link href="/app/products">
          <Button>返回产品库</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="relative aspect-square w-full overflow-hidden rounded-[24px] border bg-[var(--surface-soft)] shadow-[0_4px_24px_rgba(60,53,48,0.04)]" style={{ borderColor: "var(--border-soft)" }}>
        <div className="flex h-full w-full items-center justify-center text-sm text-[var(--text-muted)]">
          产品视觉占位图
        </div>
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
            {productStatusLabelMap[product.status]}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{getCategoryLabel(product.category)}</p>
          <h1 className="editorial-heading text-[30px] font-semibold tracking-tight text-[#3c3530]">{product.name}</h1>
          <p className="text-sm text-[var(--text-muted)]">{product.brand} · {getCategoryLabel(product.category)}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/app/products/${product.id}/edit`}>
            <Button variant="secondary" className="w-full">编辑</Button>
          </Link>
          <Link href="/app/products">
            <Button variant="secondary" className="w-full">返回产品库</Button>
          </Link>
        </div>
      </div>

      <Card className="space-y-4 rounded-[24px]">
        <div className="grid gap-3 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">品牌</p>
            <p className="mt-1 font-medium text-[var(--foreground)]">{product.brand}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">品类</p>
            <p className="mt-1 font-medium text-[var(--foreground)]">{getCategoryLabel(product.category)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">状态</p>
            <p className="mt-1 inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
              {productStatusLabelMap[product.status]}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">来源类型</p>
            <p className="mt-1 font-medium text-[var(--foreground)]">{sourceTypeLabelMap[product.sourceType]}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">备注</p>
            <p className="mt-1 text-[var(--foreground)]">{product.note || "暂时还没有备注。"}</p>
          </div>
          {product.sourceLink ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">来源链接</p>
              <a
                href={product.sourceLink}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-sm text-[var(--accent)] underline underline-offset-4 hover:text-[var(--accent-strong)]"
              >
                打开来源链接
              </a>
            </div>
          ) : null}
        </div>
      </Card>

      <ProductSummaryPanel summary={summary} loading={loadingSummary} onGenerate={handleGenerateSummary} />
      {summaryStatusText ? <FeedbackState tone={loadingSummary ? "info" : "success"}>{summaryStatusText}</FeedbackState> : null}

      <Card className="space-y-3 rounded-[24px]" style={{ background: "color-mix(in oklab, var(--danger-soft) 26%, white)" }}>
        <h2 className="text-lg font-semibold text-[var(--danger-text)]">危险操作</h2>
        <p className="text-sm text-[var(--text-muted)]">
          如果你不再需要这个产品，可以在这里删除。
        </p>
        {showDeleteConfirm ? (
          <div className="space-y-3">
            <FeedbackState tone="warning">
              删除后会同时移除该产品及其生成摘要（本地数据）。
            </FeedbackState>
            <div className="flex gap-2">
              <Button variant="danger" className="w-full" onClick={handleDeleteProduct}>
                确认删除
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => setShowDeleteConfirm(false)}>
                取消
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="danger" className="w-full" onClick={() => setShowDeleteConfirm(true)}>
            删除产品
          </Button>
        )}
      </Card>
    </div>
  );
}
