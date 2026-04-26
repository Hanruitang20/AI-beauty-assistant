import { BeautyProduct } from "@/lib/products";

export type JourneyItem = {
  id: string;
  name: string;
  category: string;
  usageDurationMonths?: number;
  widthClassName: string;
  usageLabel: string;
};

export type ProductJourneyPreview = {
  monthLabels: string[];
  items: JourneyItem[];
};

export function getJourneyWidthClassName(months?: number) {
  const value = months ?? 0;
  if (value >= 6) return "w-full";
  if (value >= 4) return "w-4/5";
  if (value >= 2) return "w-3/5";
  if (value >= 1) return "w-2/5";
  return "w-1/4";
}

export function getJourneyUsageLabel(months?: number) {
  const value = months ?? 0;
  if (value <= 0) return "记录中";
  return `使用中 ${value} 个月`;
}

export function buildProductJourneyPreview(products: BeautyProduct[], maxItems = 3): ProductJourneyPreview {
  const now = new Date();
  const monthLabels = Array.from({ length: 4 }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1);
    return `${date.getMonth() + 1}月`;
  });

  const items = products.slice(0, maxItems).map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    usageDurationMonths: product.usageDurationMonths,
    widthClassName: getJourneyWidthClassName(product.usageDurationMonths),
    usageLabel: getJourneyUsageLabel(product.usageDurationMonths),
  }));

  return {
    monthLabels,
    items,
  };
}
