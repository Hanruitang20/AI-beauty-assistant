import { BeautyProduct, getCategoryLabel, productStatusLabelMap } from "@/lib/products";
import { getScopedStorageKey, getScopedStorageKeyWithLegacyMigration } from "@/lib/storage-scope";

const PRODUCTS_KEY = "products";
const SUMMARY_KEY = "product-summaries";
const RECENT_VIEWED_KEY = "recent-viewed-products";
const PRODUCT_IMAGES_KEY = "product-images";
const LEGACY_SUMMARY_KEYS = ["beautyshelf.product-summaries"];

export type ProductSummary = {
  whatFor: string;
  benefits: string[];
  whoItSuits: string;
  cautionPoints: string[];
  whenToUse: string;
  howOftenToStart: string;
  routineStep: string;
  keyTerms: Array<{
    term: string;
    explanation: string;
  }>;
  inSimplerTerms: string;
  ifYouAreNew: string;
  gentleWayToStart: string;
};

type ProductSummaryMap = Record<string, ProductSummary>;

function hasWindow() {
  return typeof window !== "undefined";
}

export function getStoredProducts(): BeautyProduct[] {
  if (!hasWindow()) return [];
  const productsKey = getScopedStorageKeyWithLegacyMigration(PRODUCTS_KEY, ["beautyshelf.products"]);
  if (!productsKey) return [];

  const raw = window.localStorage.getItem(productsKey);
  if (!raw) {
    window.localStorage.setItem(productsKey, JSON.stringify([]));
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as BeautyProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveProducts(products: BeautyProduct[]) {
  if (!hasWindow()) return;
  const productsKey = getScopedStorageKey(PRODUCTS_KEY);
  if (!productsKey) return;
  window.localStorage.setItem(productsKey, JSON.stringify(products));
}

export function getRecentViewedProductIds() {
  if (!hasWindow()) return [];
  const recentViewedKey = getScopedStorageKeyWithLegacyMigration(RECENT_VIEWED_KEY, ["beautyshelf.recent-viewed-products"]);
  if (!recentViewedKey) return [];
  const raw = window.localStorage.getItem(recentViewedKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function markProductViewed(id: string) {
  if (!hasWindow()) return;
  const recentViewedKey = getScopedStorageKey(RECENT_VIEWED_KEY);
  if (!recentViewedKey) return;
  const existing = getRecentViewedProductIds().filter((item) => item !== id);
  const next = [id, ...existing].slice(0, 8);
  window.localStorage.setItem(recentViewedKey, JSON.stringify(next));
}

export function createProduct(input: Omit<BeautyProduct, "id">) {
  const nextProduct: BeautyProduct = {
    ...input,
    id: `p_${Date.now()}`,
  };
  const existing = getStoredProducts();
  const next = [nextProduct, ...existing];
  saveProducts(next);
  return nextProduct;
}

export function getProductById(id: string) {
  const products = getStoredProducts();
  return products.find((item) => item.id === id) || null;
}

export function updateProduct(id: string, updates: Omit<BeautyProduct, "id">) {
  const products = getStoredProducts();
  const next = products.map((product) => (product.id === id ? { ...updates, id } : product));
  saveProducts(next);
  return next.find((product) => product.id === id) || null;
}

export function deleteProductById(id: string) {
  const products = getStoredProducts();
  const next = products.filter((product) => product.id !== id);
  saveProducts(next);

  const summaryMap = getSummaryMap();
  if (summaryMap[id]) {
    const rest = { ...summaryMap };
    delete rest[id];
    if (hasWindow()) {
      const summaryKey = getScopedStorageKey(SUMMARY_KEY);
      if (summaryKey) {
        window.localStorage.setItem(summaryKey, JSON.stringify(rest));
      }
    }
  }

  const recent = getRecentViewedProductIds().filter((item) => item !== id);
  const recentViewedKey = getScopedStorageKey(RECENT_VIEWED_KEY);
  if (hasWindow()) {
    if (recentViewedKey) {
      window.localStorage.setItem(recentViewedKey, JSON.stringify(recent));
    }
  }

  const imageMap = getProductImageMap();
  if (imageMap[id]) {
    const restImages = { ...imageMap };
    delete restImages[id];
    if (hasWindow()) {
      const productImagesKey = getScopedStorageKey(PRODUCT_IMAGES_KEY);
      if (productImagesKey) {
        window.localStorage.setItem(productImagesKey, JSON.stringify(restImages));
      }
    }
  }
}

function getProductImageMap(): Record<string, string> {
  if (!hasWindow()) return {};
  const productImagesKey = getScopedStorageKeyWithLegacyMigration(PRODUCT_IMAGES_KEY, ["beautyshelf.product-images"]);
  if (!productImagesKey) return {};
  const raw = window.localStorage.getItem(productImagesKey);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getProductImageById(id: string) {
  return getProductImageMap()[id] || "";
}

export function saveProductImageById(id: string, imageDataUrl: string) {
  if (!hasWindow()) return;
  const productImagesKey = getScopedStorageKey(PRODUCT_IMAGES_KEY);
  if (!productImagesKey) return;
  const all = getProductImageMap();
  const next = { ...all, [id]: imageDataUrl };
  window.localStorage.setItem(productImagesKey, JSON.stringify(next));
}

export function getSummaryMap(): ProductSummaryMap {
  if (!hasWindow()) return {};
  const summaryKey = getScopedStorageKeyWithLegacyMigration(SUMMARY_KEY, LEGACY_SUMMARY_KEYS);
  if (!summaryKey) return {};
  const raw = window.localStorage.getItem(summaryKey);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ProductSummaryMap;
  } catch {
    return {};
  }
}

export function getSummaryByProductId(id: string) {
  return getSummaryMap()[id] || null;
}

export function saveSummaryByProductId(id: string, summary: ProductSummary) {
  const all = getSummaryMap();
  const next = { ...all, [id]: summary };
  if (!hasWindow()) return;
  const summaryKey = getScopedStorageKey(SUMMARY_KEY);
  if (!summaryKey) return;
  window.localStorage.setItem(summaryKey, JSON.stringify(next));
}

export function generateMockSummary(product: BeautyProduct): ProductSummary {
  const categoryDefaults: Partial<Record<string, Partial<ProductSummary>>> = {
    cleanser: {
      whenToUse: "早晚都可使用，卸妆后进行清洁。",
      routineStep: "清洁第一步",
      howOftenToStart: "先每天 1 次，3-5 天后无不适再增加到 2 次。",
    },
    "toner-mist": {
      whenToUse: "洁面后使用，帮助补水舒缓并为后续步骤打底。",
      routineStep: "清洁后打底步骤",
      howOftenToStart: "可从早晚各 1 次开始，观察是否有刺痛或泛红。",
    },
    serum: {
      whenToUse: "建议在爽肤后、保湿前使用。",
      routineStep: "功效护理步骤",
      howOftenToStart: "可先每周 3 晚，皮肤稳定后再增加频率。",
    },
    moisturizer: {
      whenToUse: "早晚都可使用，放在功效护理之后。",
      routineStep: "锁水保湿步骤",
      howOftenToStart: "从第一天开始可早晚使用。",
    },
    sunscreen: {
      whenToUse: "每天早晨使用，作为护肤最后一步。",
      routineStep: "日间防护步骤",
      howOftenToStart: "建议立即建立每日使用习惯。",
    },
    mask: {
      whenToUse: "建议在晚间护肤中使用，放在精华前后按产品说明调整。",
      routineStep: "周期护理步骤",
      howOftenToStart: "可从每周 2-3 次开始，避免频繁叠加高活性产品。",
    },
    "eye-care": {
      whenToUse: "建议在精华后、面霜前后使用，轻拍吸收。",
      routineStep: "眼周护理步骤",
      howOftenToStart: "可从晚间 1 次开始，稳定后再增加到早晚。",
    },
    "targeted-treatment": {
      whenToUse: "按说明在特定问题区域或特定时段使用。",
      routineStep: "定向功效步骤",
      howOftenToStart: "建议低频起步，观察刺激、泛红和干燥反应后再调整。",
    },
  };

  const defaults: Partial<ProductSummary> = categoryDefaults[product.category] ?? {};
  const statusGuideMap: Record<BeautyProduct["status"], string> = {
    using: "你已经在使用它，建议保持其它步骤稳定，便于观察真实效果。",
    wishlist: "你还在考虑阶段，建议先确认肤质匹配和预算，再决定是否入手。",
    used: "你之前用过它，可结合当时体验判断是否值得回购。",
    recommended: "这是被推荐的产品，建议结合你的肤质和现有流程再做选择。",
  };
  const sourceGuideMap: Record<BeautyProduct["sourceType"], string> = {
    "self-discovery": "你是自己发现这款产品，建议先从低频尝试验证是否适合。",
    friend: "来自朋友推荐，建议先做局部测试，不盲目照搬他人用法。",
    creator: "来自博主/社媒推荐，建议结合自身肤质，不直接复制全套流程。",
    dermatologist: "来自医生建议，优先按温和、稳定、可持续的节奏建立使用习惯。",
  };

  const inSimplerTermsMap: Partial<Record<string, string>> = {
    cleanser: "简单说，它的核心价值是把脸清洁干净，同时尽量不过度带走皮肤水分。",
    "toner-mist": "简单说，它主要用于补水舒缓，帮助后续护肤更稳定。",
    serum: "简单说，它是集中护理步骤，用来针对性改善某个皮肤问题。",
    moisturizer: "简单说，它的作用是锁住水分、降低干燥和紧绷感。",
    sunscreen: "简单说，它是白天最关键的保护步骤，能减少日晒带来的长期损伤。",
    mask: "简单说，它是周期护理步骤，适合按节奏补充修护或保湿。",
    "eye-care": "简单说，它用于眼周护理，重点是温和和持续观察耐受度。",
    "targeted-treatment": "简单说，它是针对特定问题的功效护理，低频起步更稳妥。",
  };

  return {
    whatFor: `${product.name} 主要作为${getCategoryLabel(product.category)}使用，帮助你建立更稳定、舒适的日常流程。`,
    benefits: [
      "帮助你更快做出产品选择，减少纠结",
      "让日常护肤更稳定、更可持续",
      "更容易融入新手友好的基础流程",
      statusGuideMap[product.status],
    ],
    whoItSuits: `适合希望护肤步骤清晰、低负担、易坚持的人群。${sourceGuideMap[product.sourceType]}`,
    cautionPoints: [
      "皮肤易敏时，建议先做局部测试",
      "和高浓度功效产品叠加时，先从低频开始",
      "若持续刺痛或泛红，建议暂停并重新评估",
      product.sourceType === "creator" ? "社媒热门搭配不一定适合你，避免一次上太多新品。" : "每次调整只改变 1 个变量，更容易判断是否适合。",
    ],
    whenToUse: defaults.whenToUse || "可根据你的日常流程安排使用。",
    howOftenToStart: defaults.howOftenToStart || "建议先每周 2-3 次，再根据状态调整。",
    routineStep: defaults.routineStep || "灵活插入流程",
    keyTerms: [
      {
        term: getCategoryLabel(product.category),
        explanation: "表示它在你的整体护肤流程中属于哪一类核心步骤。",
      },
      {
        term: productStatusLabelMap[product.status],
        explanation: "表示你和这款产品当前的关系阶段，便于后续决策。",
      },
      {
        term: product.brand,
        explanation: "用于聚合同品牌体验，帮助你判断品牌稳定性与偏好。",
      },
      {
        term: "新手友好",
        explanation: "代表这款产品更适合从低门槛、低风险方式开始尝试。",
      },
    ],
    inSimplerTerms: inSimplerTermsMap[product.category] || "简单说，它是你当前护理流程中的一个功能步骤，先从低频、低负担方式开始更稳妥。",
    ifYouAreNew: "如果你是护肤新手，先把步骤做少、做稳定，比追求复杂搭配更有效。",
    gentleWayToStart:
      product.status === "using"
        ? "温和起步建议：先维持当前用量不变，连续观察 7 天，再决定是否加量。"
        : "温和起步建议：前 1 周隔天使用，皮肤稳定后再提高到常规频率。",
  };
}
