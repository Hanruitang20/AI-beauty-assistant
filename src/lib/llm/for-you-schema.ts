export type ForYouAnalysisRequest = {
  profile: {
    skinType?: string;
    mainConcerns?: string;
    sensitivityLevel?: string;
    experienceLevel?: string;
  } | null;
  products: Array<{
    id: string;
    name: string;
    brand?: string;
    category: string;
    status: string;
  }>;
  experiences: Array<{
    productId: string;
    rating?: number;
    usageFrequency?: string;
    reaction?: string;
    intention?: string;
    feedbackNote?: string;
  }>;
  context?: {
    selectedCategory?: string;
    productCount: number;
    experienceCount: number;
  };
};

export type ForYouAnalysisResponse = {
  summary: string;
  insights: Array<{
    title: string;
    reason: string;
    nextStep: string;
    type: "positive" | "caution" | "observation" | "missing_info";
  }>;
  caution?: string;
  suggestedNextAction: {
    label: string;
    target: "profile" | "product_detail" | "add_product" | "continue_tracking";
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function validateForYouAnalysisRequest(input: unknown): input is ForYouAnalysisRequest {
  if (!isRecord(input)) return false;
  if (!Array.isArray(input.products) || !Array.isArray(input.experiences)) return false;
  if (!(input.profile === null || isRecord(input.profile))) return false;

  const productsValid = input.products.every((product) => {
    if (!isRecord(product)) return false;
    if (typeof product.id !== "string") return false;
    if (typeof product.name !== "string") return false;
    if (typeof product.category !== "string") return false;
    if (typeof product.status !== "string") return false;
    if (typeof product.brand !== "undefined" && typeof product.brand !== "string") return false;
    return true;
  });
  if (!productsValid) return false;

  const experiencesValid = input.experiences.every((experience) => {
    if (!isRecord(experience)) return false;
    if (typeof experience.productId !== "string") return false;
    if (typeof experience.rating !== "undefined" && typeof experience.rating !== "number") return false;
    if (typeof experience.usageFrequency !== "undefined" && typeof experience.usageFrequency !== "string") return false;
    if (typeof experience.reaction !== "undefined" && typeof experience.reaction !== "string") return false;
    if (typeof experience.intention !== "undefined" && typeof experience.intention !== "string") return false;
    if (typeof experience.feedbackNote !== "undefined" && typeof experience.feedbackNote !== "string") return false;
    return true;
  });
  if (!experiencesValid) return false;

  if (typeof input.context !== "undefined") {
    if (!isRecord(input.context)) return false;
    if (typeof input.context.productCount !== "number") return false;
    if (typeof input.context.experienceCount !== "number") return false;
    if (typeof input.context.selectedCategory !== "undefined" && typeof input.context.selectedCategory !== "string") return false;
  }

  return true;
}

export function validateForYouAnalysisResponse(input: unknown): input is ForYouAnalysisResponse {
  if (!isRecord(input)) return false;
  if (typeof input.summary !== "string") return false;
  if (!Array.isArray(input.insights)) return false;
  if (!isRecord(input.suggestedNextAction)) return false;
  if (typeof input.suggestedNextAction.label !== "string") return false;

  const validTargets = ["profile", "product_detail", "add_product", "continue_tracking"];
  if (!validTargets.includes(String(input.suggestedNextAction.target))) return false;

  if (typeof input.caution !== "undefined" && typeof input.caution !== "string") return false;

  const validInsightTypes = ["positive", "caution", "observation", "missing_info"];
  const insightsValid = input.insights.every((insight) => {
    if (!isRecord(insight)) return false;
    if (typeof insight.title !== "string") return false;
    if (typeof insight.reason !== "string") return false;
    if (typeof insight.nextStep !== "string") return false;
    if (!validInsightTypes.includes(String(insight.type))) return false;
    return true;
  });
  return insightsValid;
}
