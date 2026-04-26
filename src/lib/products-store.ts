import { BeautyProduct, getCategoryLabel, productStatusLabelMap } from "@/lib/products";

const PRODUCTS_KEY = "beautyshelf.products";
const SUMMARY_KEY = "beautyshelf.product-summaries";
const RECENT_VIEWED_KEY = "beautyshelf.recent-viewed-products";
const PRODUCT_IMAGES_KEY = "beautyshelf.product-images";

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

  const raw = window.localStorage.getItem(PRODUCTS_KEY);
  if (!raw) {
    window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
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
  window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function getRecentViewedProductIds() {
  if (!hasWindow()) return [];
  const raw = window.localStorage.getItem(RECENT_VIEWED_KEY);
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
  const existing = getRecentViewedProductIds().filter((item) => item !== id);
  const next = [id, ...existing].slice(0, 8);
  window.localStorage.setItem(RECENT_VIEWED_KEY, JSON.stringify(next));
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
      window.localStorage.setItem(SUMMARY_KEY, JSON.stringify(rest));
    }
  }

  const recent = getRecentViewedProductIds().filter((item) => item !== id);
  if (hasWindow()) {
    window.localStorage.setItem(RECENT_VIEWED_KEY, JSON.stringify(recent));
  }

  const imageMap = getProductImageMap();
  if (imageMap[id]) {
    const restImages = { ...imageMap };
    delete restImages[id];
    if (hasWindow()) {
      window.localStorage.setItem(PRODUCT_IMAGES_KEY, JSON.stringify(restImages));
    }
  }
}

function getProductImageMap(): Record<string, string> {
  if (!hasWindow()) return {};
  const raw = window.localStorage.getItem(PRODUCT_IMAGES_KEY);
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
  const all = getProductImageMap();
  const next = { ...all, [id]: imageDataUrl };
  window.localStorage.setItem(PRODUCT_IMAGES_KEY, JSON.stringify(next));
}

export function getSummaryMap(): ProductSummaryMap {
  if (!hasWindow()) return {};
  const raw = window.localStorage.getItem(SUMMARY_KEY);
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
  window.localStorage.setItem(SUMMARY_KEY, JSON.stringify(next));
}

export function generateMockSummary(product: BeautyProduct): ProductSummary {
  const categoryDefaults: Partial<Record<string, Partial<ProductSummary>>> = {
    cleanser: {
      whenToUse: "早晚都可使用，卸妆后进行清洁。",
      routineStep: "清洁第一步",
      howOftenToStart: "先每天 1 次，3-5 天后无不适再增加到 2 次。",
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
    makeup: {
      whenToUse: "护肤和防晒完成后使用。",
      routineStep: "妆面完成步骤",
      howOftenToStart: "按日常需求使用即可。",
    },
  };

  const defaults = categoryDefaults[product.category];
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
    serum: "简单说，它是集中护理步骤，用来针对性改善某个皮肤问题。",
    moisturizer: "简单说，它的作用是锁住水分、降低干燥和紧绷感。",
    sunscreen: "简单说，它是白天最关键的保护步骤，能减少日晒带来的长期损伤。",
    makeup: "简单说，它用于修饰妆面，前提是底层护肤和防晒已经做好。",
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
