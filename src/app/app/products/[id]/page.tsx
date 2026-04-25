"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BeautyProduct,
  productCategoryLabelMap,
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
        <h1 className="text-2xl font-semibold text-rose-950">未找到该产品</h1>
        <p className="text-sm text-rose-700/80">
          本地数据中未找到该产品，请返回产品库查看。
        </p>
        <Link href="/app/products">
          <Button>返回产品库</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-rose-500">产品详情</p>
          <h1 className="text-2xl font-semibold tracking-tight text-rose-950">{product.name}</h1>
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

      <Card className="space-y-4">
        <div className="grid gap-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-rose-500">品牌</p>
            <p className="mt-1 font-medium text-rose-900">{product.brand}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-rose-500">品类</p>
            <p className="mt-1 font-medium text-rose-900">{productCategoryLabelMap[product.category]}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-rose-500">来源类型</p>
            <p className="mt-1 font-medium text-rose-900">{sourceTypeLabelMap[product.sourceType]}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-rose-500">状态</p>
            <p className="mt-1 inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
              {productStatusLabelMap[product.status]}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-rose-500">备注</p>
            <p className="mt-1 text-rose-800">{product.note || "暂时还没有备注。"}</p>
          </div>
          {product.sourceLink ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-rose-500">来源链接</p>
              <a
                href={product.sourceLink}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-sm text-rose-700 underline decoration-rose-300 underline-offset-4 hover:text-rose-900"
              >
                打开来源链接
              </a>
            </div>
          ) : null}
        </div>
      </Card>

      <ProductSummaryPanel summary={summary} loading={loadingSummary} onGenerate={handleGenerateSummary} />
      {summaryStatusText ? <FeedbackState tone={loadingSummary ? "info" : "success"}>{summaryStatusText}</FeedbackState> : null}

      <Card className="space-y-3 border-red-100">
        <h2 className="text-lg font-semibold text-rose-950">危险操作</h2>
        <p className="text-sm text-rose-700/80">
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
