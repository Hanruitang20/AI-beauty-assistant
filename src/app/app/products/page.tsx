"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import {
  BeautyProduct,
  ProductStatus,
  ProductCategory,
  productCategoryLabelMap,
  productStatusLabelMap,
  sourceTypeLabelMap,
} from "@/lib/products";
import { getStoredProducts, saveProducts } from "@/lib/products-store";
import { useToast } from "@/components/ui/toast-provider";

type Filters = {
  status: "" | ProductStatus;
  category: "" | ProductCategory;
  brand: string;
};

const initialFilters: Filters = {
  status: "",
  category: "",
  brand: "",
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<BeautyProduct[]>(() => getStoredProducts());
  const deletedToastShownRef = useRef(false);

  useEffect(() => {
    saveProducts(items);
  }, [items]);

  const filteredProducts = useMemo(() => {
    return items.filter((product) => {
      const matchQuery =
        !query ||
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase());
      const matchStatus = !filters.status || product.status === filters.status;
      const matchCategory = !filters.category || product.category === filters.category;
      const matchBrand = !filters.brand || product.brand.toLowerCase().includes(filters.brand.toLowerCase());

      return matchQuery && matchStatus && matchCategory && matchBrand;
    });
  }, [filters, query, items]);

  const isEmpty = items.length === 0;
  const createdProductName = searchParams.get("created");
  const deleted = searchParams.get("deleted");

  useEffect(() => {
    if (deleted === "1" && !deletedToastShownRef.current) {
      showToast({ tone: "success", message: "产品已删除。" });
      deletedToastShownRef.current = true;
    }
  }, [deleted, showToast]);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-rose-950">我的产品库</h1>
          <p className="mt-1 text-sm text-rose-700/80">你的个人美妆护肤清单，清晰可检索。</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setItems([])}>
            演示空状态
          </Button>
          <Link href="/app/products/new">
            <Button className="w-full">新增产品</Button>
          </Link>
        </div>
      </div>

      {createdProductName ? (
        <FeedbackState tone="success">
          添加成功：{createdProductName}
        </FeedbackState>
      ) : null}

      <Card className="space-y-4">
        <div className="grid gap-2">
          <Input placeholder="搜索产品名或品牌" value={query} onChange={(event) => setQuery(event.target.value)} />
          <Select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as Filters["status"] }))}
          >
            <option value="">全部状态</option>
            <option value="using">正在使用</option>
            <option value="wishlist">想购买</option>
            <option value="used">用过</option>
            <option value="recommended">被推荐</option>
          </Select>
          <Select
            value={filters.category}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, category: event.target.value as Filters["category"] }))
            }
          >
            <option value="">全部品类</option>
            <option value="cleanser">洁面</option>
            <option value="serum">精华</option>
            <option value="moisturizer">面霜/乳液</option>
            <option value="sunscreen">防晒</option>
            <option value="makeup">彩妆</option>
          </Select>
          <Input
            placeholder="按品牌筛选"
            value={filters.brand}
            onChange={(event) => setFilters((prev) => ({ ...prev, brand: event.target.value }))}
          />
        </div>
      </Card>

      {isEmpty ? (
        <Card className="text-center">
          <h2 className="text-xl font-semibold text-rose-900">你的产品库还是空的</h2>
          <p className="mt-2 text-sm text-rose-700/80">
            先添加一个你正在使用的产品，慢慢建立自己的长期产品记录。
          </p>
          <div className="mt-4">
            <Link href="/app/products/new">
              <Button className="w-full">添加第一个产品</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredProducts.length === 0 ? (
            <Card className="p-4">
              <FeedbackState>没有匹配当前搜索和筛选条件的产品。</FeedbackState>
            </Card>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/app/products/${product.id}`} className="text-lg font-semibold text-rose-900 hover:underline">
                    {product.name}
                  </Link>
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                    {productStatusLabelMap[product.status]}
                  </span>
                </div>
                <p className="text-sm text-rose-700/90">
                  {product.brand} · {productCategoryLabelMap[product.category]}
                </p>
                <p className="text-xs text-rose-600">来源：{sourceTypeLabelMap[product.sourceType]}</p>
                {product.note ? <p className="text-sm text-rose-700/80">{product.note}</p> : null}
                <div className="pt-1">
                  <Link href={`/app/products/${product.id}`}>
                    <Button variant="secondary" className="h-9 w-full px-3 py-0 text-xs">
                      查看详情
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
