import { ForYouAnalysisRequest, ForYouAnalysisResponse, validateForYouAnalysisResponse } from "@/lib/llm/for-you-schema";
import { getScopedStorageKey } from "@/lib/storage-scope";

const QUALITY_METRICS_KEY = "llm-quality-metrics";
const MAX_RECORDS = 50;

type RiskLevel = "low" | "medium" | "high";

export type ForYouLlmQualityMetrics = {
  promptVersion: string;
  timestamp: string;
  jsonValid: boolean;
  fallbackUsed: boolean;
  hallucinationRisk: RiskLevel;
  groundednessScore: number;
  personalizationScore: number;
  actionabilityScore: number;
  specificityScore: number;
  repetitionRisk: RiskLevel;
  safetyRisk: RiskLevel;
  overallScore: number;
  notes: string[];
  requestSummary: {
    productCount: number;
    experienceCount: number;
    selectedCategory?: string;
  };
  responseSummary: {
    insightCount: number;
    avgReasonLength: number;
    avgNextStepLength: number;
  };
};

type EvaluateInput = {
  request: ForYouAnalysisRequest;
  response: unknown;
  promptVersion: string;
  isFallback: boolean;
};

function hasWindow() {
  return typeof window !== "undefined";
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function riskFromCount(count: number): RiskLevel {
  if (count >= 3) return "high";
  if (count >= 1) return "medium";
  return "low";
}

function safeParseMetrics(raw: string | null): ForYouLlmQualityMetrics[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ForYouLlmQualityMetrics[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function collectOutputText(response: ForYouAnalysisResponse | null) {
  if (!response) return "";
  const current = response.currentRecommendations
    .map((item) => `${item.title} ${item.reason} ${item.nextStep} ${item.product}`)
    .join(" ");
  const future = response.futureTips.map((item) => `${item.title} ${item.reason} ${item.nextStep}`).join(" ");
  return `${current} ${future}`.trim();
}

function calcAverageLength(values: string[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value.length, 0) / values.length);
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

export function evaluateForYouAnalysisQuality(input: EvaluateInput): ForYouLlmQualityMetrics {
  const timestamp = new Date().toISOString();
  const jsonValid = validateForYouAnalysisResponse(input.response);
  const response = jsonValid ? (input.response as ForYouAnalysisResponse) : null;
  const outputText = collectOutputText(response);
  const notes: string[] = [];

  const productNames = input.request.products.map((item) => item.name).filter(Boolean);
  const brandNames = input.request.products.map((item) => item.brand || "").filter(Boolean);
  const categories = input.request.products.map((item) => item.category).filter(Boolean);
  const profileTokens = [
    input.request.userProfile?.skinType || "",
    input.request.userProfile?.mainConcerns || "",
    input.request.userProfile?.sensitivityLevel || "",
    input.request.userProfile?.experienceLevel || "",
  ].filter(Boolean);
  const reactionTokens = input.request.experiences.map((item) => item.reaction || "").filter(Boolean);
  const usageTokens = input.request.experiences.map((item) => item.usageFrequency || "").filter(Boolean);
  const intentionTokens = input.request.experiences.map((item) => item.intention || "").filter(Boolean);

  let groundedMatches = 0;
  [...productNames, ...brandNames, ...profileTokens, ...reactionTokens, ...usageTokens, ...intentionTokens].forEach((token) => {
    if (token && outputText.includes(token)) groundedMatches += 1;
  });
  const groundednessScore = clampScore(30 + groundedMatches * 6);

  let personalizationScore = 40;
  if (outputText.includes("你")) personalizationScore += 20;
  if (profileTokens.some((token) => outputText.includes(token))) personalizationScore += 20;
  if (productNames.some((name) => outputText.includes(name))) personalizationScore += 20;
  personalizationScore = clampScore(personalizationScore);

  const actionWords = ["暂停", "减少", "调整", "记录", "对比", "分开使用", "降低频率", "观察", "先", "再"];
  const timeWords = ["3天", "5-7天", "每周", "早上", "晚上", "1-2周", "连续"];
  let actionabilityScore = 30;
  if (includesAny(outputText, actionWords)) actionabilityScore += 35;
  if (includesAny(outputText, timeWords)) actionabilityScore += 20;
  if (productNames.some((name) => outputText.includes(name)) || categories.some((c) => outputText.includes(c))) actionabilityScore += 15;
  actionabilityScore = clampScore(actionabilityScore);

  const genericPhrases = ["继续观察", "补充记录", "根据你的记录", "建议继续记录"];
  let specificityScore = 40;
  if (productNames.some((name) => outputText.includes(name))) specificityScore += 25;
  if (reactionTokens.some((token) => outputText.includes(token))) specificityScore += 20;
  if (includesAny(outputText, genericPhrases)) specificityScore -= 15;
  specificityScore = clampScore(specificityScore);

  const safetyWords = ["一定有效", "治疗", "治愈", "医学上证明", "绝对安全"];
  const medicalWords = ["诊断", "处方", "病症", "疾病"];
  const safetyHits = safetyWords.filter((word) => outputText.includes(word)).length + medicalWords.filter((word) => outputText.includes(word)).length;
  const safetyRisk = riskFromCount(safetyHits);
  if (safetyRisk !== "low") notes.push("检测到潜在安全措辞风险。");

  const repetitionGroups = response
    ? [
        ...response.currentRecommendations.map((item) => `${item.reason.slice(0, 40)}|${item.nextStep.slice(0, 30)}`),
        ...response.futureTips.map((item) => `${item.reason.slice(0, 40)}|${item.nextStep.slice(0, 30)}`),
      ]
    : [];
  const uniqueGroups = new Set(repetitionGroups);
  const repetitionCount = repetitionGroups.length - uniqueGroups.size;
  const repetitionRisk = riskFromCount(repetitionCount);
  if (repetitionRisk !== "low") notes.push("多条建议存在较高语义重复。");

  const hallucinationSignals = [
    ...["A醇", "视黄醇", "神经酰胺", "烟酰胺", "壬二酸"].filter((word) => outputText.includes(word)),
    ...["医生确诊", "医疗建议"].filter((word) => outputText.includes(word)),
  ];
  const requestIngredients = (input.request.products.flatMap((item) => item.experienceTags || [])).join(" ");
  const ingredientOnlyOutput =
    hallucinationSignals.length > 0 && !requestIngredients && !input.request.experiences.some((item) => (item.feedbackNote || "").includes("成分"));
  const unknownProductMention = productNames.length > 0 && !productNames.some((name) => outputText.includes(name));
  const hallucinationCount = (ingredientOnlyOutput ? 1 : 0) + (unknownProductMention ? 1 : 0);
  const hallucinationRisk = riskFromCount(hallucinationCount);
  if (hallucinationRisk !== "low") notes.push("输出可能存在与输入数据不充分对齐的内容。");

  if (!jsonValid) notes.push("响应未通过 JSON schema 校验。");
  if (input.isFallback) notes.push("本次展示使用了 fallback 分析。");

  const safetyScore = safetyRisk === "high" ? 20 : safetyRisk === "medium" ? 60 : 95;
  const overallScore = clampScore(
    groundednessScore * 0.25 +
      actionabilityScore * 0.25 +
      personalizationScore * 0.2 +
      specificityScore * 0.15 +
      safetyScore * 0.1 +
      (jsonValid && !input.isFallback ? 100 : 60) * 0.05,
  );

  const reasonValues = response
    ? [...response.currentRecommendations.map((item) => item.reason), ...response.futureTips.map((item) => item.reason)]
    : [];
  const nextStepValues = response
    ? [...response.currentRecommendations.map((item) => item.nextStep), ...response.futureTips.map((item) => item.nextStep)]
    : [];

  return {
    promptVersion: input.promptVersion,
    timestamp,
    jsonValid,
    fallbackUsed: input.isFallback,
    hallucinationRisk,
    groundednessScore,
    personalizationScore,
    actionabilityScore,
    specificityScore,
    repetitionRisk,
    safetyRisk,
    overallScore,
    notes,
    requestSummary: {
      productCount: input.request.context?.productCount || input.request.products.length,
      experienceCount: input.request.context?.experienceCount || input.request.experiences.length,
      selectedCategory: input.request.context?.selectedCategory,
    },
    responseSummary: {
      insightCount: response ? response.currentRecommendations.length + response.futureTips.length : 0,
      avgReasonLength: calcAverageLength(reasonValues),
      avgNextStepLength: calcAverageLength(nextStepValues),
    },
  };
}

export function getForYouLlmQualityMetrics() {
  if (!hasWindow()) return [];
  const metricsKey = getScopedStorageKey(QUALITY_METRICS_KEY);
  if (!metricsKey) return [];
  return safeParseMetrics(window.localStorage.getItem(metricsKey));
}

export function storeForYouLlmQualityMetrics(metric: ForYouLlmQualityMetrics) {
  if (!hasWindow()) return;
  const metricsKey = getScopedStorageKey(QUALITY_METRICS_KEY);
  if (!metricsKey) return;
  const existing = getForYouLlmQualityMetrics();
  const next = [metric, ...existing].slice(0, MAX_RECORDS);
  window.localStorage.setItem(metricsKey, JSON.stringify(next));

  if (process.env.NODE_ENV !== "production") {
    const win = window as Window & { getForYouLlmQualityMetrics?: () => ForYouLlmQualityMetrics[] };
    win.getForYouLlmQualityMetrics = getForYouLlmQualityMetrics;
  }
}

declare global {
  interface Window {
    getForYouLlmQualityMetrics?: () => ForYouLlmQualityMetrics[];
  }
}
