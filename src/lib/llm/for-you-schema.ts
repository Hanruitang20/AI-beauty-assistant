export type ForYouAnalysisRequest = {
  userProfile: {
    skinType?: string;
    mainConcerns?: string;
    sensitivityLevel?: string;
    experienceLevel?: string;
    hasRoutine?: string;
    priorityGoal?: string;
    primaryFocus?: string;
    skincareFamiliarity?: string;
    preferredBrands?: string[];
    dislikedBrands?: string[];
    routineGoal?: string;
    budgetPreference?: string;
  } | null;
  products: Array<{
    id: string;
    name: string;
    brand?: string;
    category: string;
    status: string;
    subcategory?: string;
    rating?: number;
    usageFrequency?: string;
    experienceTags?: string[];
    repurchaseIntention?: string;
    futureIntention?: string;
    personalNote?: string;
    createdAt?: string;
    addedAt?: string;
  }>;
  experiences: Array<{
    productId: string;
    rating?: number;
    usageFrequency?: string;
    reaction?: string;
    intention?: string;
    feedbackNote?: string;
  }>;
  productMatchCandidates?: Array<{
    name: string;
    brand: string;
    category: string;
    matchReason: string;
    caution: string;
    howToTry: string;
  }>;
  productMatchHint?: {
    shouldFocusOnExistingProducts: boolean;
    fallbackTip?: string;
  };
  context?: {
    selectedCategory?: string;
    productCount: number;
    experienceCount: number;
    totalProductCount?: number;
    categoryDistribution?: Record<string, number>;
    productsWithLowRating?: string[];
    productsMarkedNotRepurchase?: string[];
    productsWithNegativeFeedback?: string[];
    productsWithHighRating?: string[];
  };
};

export type ForYouAnalysisResponse = {
  currentRecommendations: Array<{
    title: string;
    reason: string;
    nextStep: string;
    product: string;
    adaptation: "推荐" | "谨慎" | "不推荐";
  }>;
  futureTips: Array<{
    title: string;
    reason: string;
    nextStep: string;
  }>;
  productMatch: {
    title: string;
    reason: string;
    candidates: Array<{
      name: string;
      brand: string;
      category: string;
      matchReason: string;
      caution: string;
      howToTry: string;
    }>;
    fallbackTip?: string;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function validateForYouAnalysisRequest(input: unknown): input is ForYouAnalysisRequest {
  if (!isRecord(input)) return false;
  if (!Array.isArray(input.products) || !Array.isArray(input.experiences)) return false;
  if (!(input.userProfile === null || isRecord(input.userProfile))) return false;

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

  if (typeof input.productMatchCandidates !== "undefined") {
    if (!Array.isArray(input.productMatchCandidates)) return false;
    const candidatesValid = input.productMatchCandidates.every((candidate) => {
      if (!isRecord(candidate)) return false;
      if (typeof candidate.name !== "string") return false;
      if (typeof candidate.brand !== "string") return false;
      if (typeof candidate.category !== "string") return false;
      if (typeof candidate.matchReason !== "string") return false;
      if (typeof candidate.caution !== "string") return false;
      if (typeof candidate.howToTry !== "string") return false;
      return true;
    });
    if (!candidatesValid) return false;
  }

  if (typeof input.productMatchHint !== "undefined") {
    if (!isRecord(input.productMatchHint)) return false;
    if (typeof input.productMatchHint.shouldFocusOnExistingProducts !== "boolean") return false;
    if (typeof input.productMatchHint.fallbackTip !== "undefined" && typeof input.productMatchHint.fallbackTip !== "string") return false;
  }

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
  if (!Array.isArray(input.currentRecommendations)) return false;
  if (!Array.isArray(input.futureTips)) return false;
  if (!isRecord(input.productMatch)) return false;

  const validAdaptations = ["推荐", "谨慎", "不推荐"];
  const currentRecommendationsValid = input.currentRecommendations.every((item) => {
    if (!isRecord(item)) return false;
    if (typeof item.title !== "string") return false;
    if (typeof item.reason !== "string") return false;
    if (typeof item.nextStep !== "string") return false;
    if (typeof item.product !== "string") return false;
    if (!validAdaptations.includes(String(item.adaptation))) return false;
    return true;
  });
  if (!currentRecommendationsValid) return false;

  const futureTipsValid = input.futureTips.every((item) => {
    if (!isRecord(item)) return false;
    if (typeof item.title !== "string") return false;
    if (typeof item.reason !== "string") return false;
    if (typeof item.nextStep !== "string") return false;
    return true;
  });
  if (!futureTipsValid) return false;

  if (!Array.isArray(input.productMatch.candidates)) return false;
  if (typeof input.productMatch.title !== "string") return false;
  if (typeof input.productMatch.reason !== "string") return false;
  if (typeof input.productMatch.fallbackTip !== "undefined" && typeof input.productMatch.fallbackTip !== "string") return false;

  const productMatchCandidatesValid = input.productMatch.candidates.every((item) => {
    if (!isRecord(item)) return false;
    if (typeof item.name !== "string") return false;
    if (typeof item.brand !== "string") return false;
    if (typeof item.category !== "string") return false;
    if (typeof item.matchReason !== "string") return false;
    if (typeof item.caution !== "string") return false;
    if (typeof item.howToTry !== "string") return false;
    return true;
  });
  return productMatchCandidatesValid;
}
