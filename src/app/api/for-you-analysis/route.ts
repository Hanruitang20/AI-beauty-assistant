import { NextRequest, NextResponse } from "next/server";
import { buildForYouPrompt } from "@/lib/llm/for-you-prompt";
import {
  ForYouAnalysisRequest,
  validateForYouAnalysisRequest,
  validateForYouAnalysisResponse,
} from "@/lib/llm/for-you-schema";

export const maxDuration = 60;

const IS_DEV = process.env.NODE_ENV !== "production";
const MAX_PROVIDER_ATTEMPTS = 2;
const RETRY_DELAY_MS = 500;

function safeError(message: string, status: number, errorCode?: string) {
  return NextResponse.json(
    errorCode ? { error: message, errorCode } : { error: message },
    { status },
  );
}

function parseLlmJson(raw: string): unknown {
  const withoutThink = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const trimmed = withoutThink.trim();
  if (!trimmed) {
    throw new Error("empty_after_think_strip");
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    try {
      return JSON.parse(fenced);
    } catch {
      const first = fenced.indexOf("{");
      const last = fenced.lastIndexOf("}");
      if (first >= 0 && last > first) {
        return JSON.parse(fenced.slice(first, last + 1));
      }
      throw new Error("invalid_json");
    }
  }
}

function previewText(value: string, max = 1000) {
  return value.length > max ? `${value.slice(0, max)}...(truncated)` : value;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getResponseValidationHint(input: unknown): string {
  if (!input || typeof input !== "object") return "response is not an object";
  const obj = input as Record<string, unknown>;
  if (!Array.isArray(obj.currentRecommendations)) return "currentRecommendations is missing or not an array";
  if (!Array.isArray(obj.futureTips)) return "futureTips is missing or not an array";
  const validAdaptations = ["推荐", "谨慎", "不推荐"];
  for (let i = 0; i < obj.currentRecommendations.length; i += 1) {
    const item = obj.currentRecommendations[i] as Record<string, unknown>;
    if (!item || typeof item !== "object") return `currentRecommendations[${i}] is not an object`;
    if (typeof item.title !== "string") return `currentRecommendations[${i}].title is missing or not a string`;
    if (typeof item.reason !== "string") return `currentRecommendations[${i}].reason is missing or not a string`;
    if (typeof item.nextStep !== "string") return `currentRecommendations[${i}].nextStep is missing or not a string`;
    if (typeof item.product !== "string") return `currentRecommendations[${i}].product is missing or not a string`;
    if (!validAdaptations.includes(String(item.adaptation))) return `currentRecommendations[${i}].adaptation is missing or invalid`;
  }
  for (let i = 0; i < obj.futureTips.length; i += 1) {
    const item = obj.futureTips[i] as Record<string, unknown>;
    if (!item || typeof item !== "object") return `futureTips[${i}] is not an object`;
    if (typeof item.title !== "string") return `futureTips[${i}].title is missing or not a string`;
    if (typeof item.reason !== "string") return `futureTips[${i}].reason is missing or not a string`;
    if (typeof item.nextStep !== "string") return `futureTips[${i}].nextStep is missing or not a string`;
  }
  return "unknown schema mismatch";
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return safeError("Invalid JSON request body.", 400);
  }

  if (!validateForYouAnalysisRequest(payload)) {
    return safeError("Invalid for-you analysis request shape.", 400);
  }
  const input = payload as ForYouAnalysisRequest;

  const apiKey = process.env.MINIMAX_API_KEY;
  const model = process.env.MINIMAX_MODEL;
  const baseUrl = (process.env.MINIMAX_BASE_URL || "https://api.minimax.io/v1").replace(/\/+$/, "");
  const timeoutMsRaw = process.env.MINIMAX_TIMEOUT_MS || "60000";
  const timeoutMs = Number(timeoutMsRaw);
  const normalizedTimeoutMs = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 60000;
  const authProvider = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "custom";
  const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE || "remote";

  if (!apiKey || !model) {
    console.error("[ForYouRoute] precheck failed before provider request", {
      reasonCode: "ERROR_MINIMAX_CONFIG_MISSING",
      hasMiniMaxApiKey: Boolean(apiKey),
      hasMiniMaxBaseUrl: Boolean(process.env.MINIMAX_BASE_URL),
      hasMiniMaxModel: Boolean(model),
      minimaxTimeoutMs: normalizedTimeoutMs,
      authProvider,
      dataSource,
    });
    return safeError("LLM provider is not configured.", 503, "ERROR_MINIMAX_CONFIG_MISSING");
  }

  const requestUrl = `${baseUrl}/chat/completions`;

  if (IS_DEV) {
    console.info("[ForYouLLM] MiniMax request config:", {
      baseUrl,
      model,
      requestUrl,
      timeoutMs: normalizedTimeoutMs,
    });
  }

  let lastProviderRequestStartedAt = 0;
  try {
    const prompt = buildForYouPrompt(input);
    let response: Response | null = null;
    let responseText = "";
    for (let attempt = 1; attempt <= MAX_PROVIDER_ATTEMPTS; attempt += 1) {
      lastProviderRequestStartedAt = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), normalizedTimeoutMs);
      const requestMeta = (() => {
        try {
          const parsed = new URL(requestUrl);
          return {
            baseUrlHost: parsed.host,
            requestUrlPath: parsed.pathname,
          };
        } catch {
          return {
            baseUrlHost: "invalid_url",
            requestUrlPath: requestUrl,
          };
        }
      })();
      console.error("[ForYouRoute] MiniMax request start", {
        reasonCode: "MINIMAX_REQUEST_START",
        model,
        hasApiKey: Boolean(apiKey),
        baseUrlHost: requestMeta.baseUrlHost,
        timeoutMs: normalizedTimeoutMs,
        requestUrlPath: requestMeta.requestUrlPath,
      });
      try {
        response = await fetch(requestUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: "You are BeautyShelf AI, a skincare product recording and analysis assistant." },
              { role: "user", content: prompt },
            ],
            temperature: 0.4,
          }),
          signal: controller.signal,
        });
      } catch (fetchError) {
        const errorName = (fetchError as Error)?.name || "UnknownError";
        const isAbortError = errorName === "AbortError";
        const isTypeError = errorName === "TypeError";
        if (IS_DEV) {
          console.error("[ForYouLLM] Fetch threw before response:", {
            attempt,
            name: errorName,
            message: (fetchError as Error)?.message || "Unknown fetch error",
            isAbortError,
          });
        }
        clearTimeout(timeoutId);
        if (isAbortError) {
          throw fetchError;
        }
        if (isTypeError && attempt < MAX_PROVIDER_ATTEMPTS) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        throw fetchError;
      } finally {
        clearTimeout(timeoutId);
      }

      if (IS_DEV && response) {
        console.info("[ForYouLLM] Provider HTTP status:", { attempt, status: response.status });
      }

      responseText = await response.text();
      if (IS_DEV) {
        console.info("[ForYouLLM] Provider raw response preview:", previewText(responseText));
      }

      if (response.status >= 500 && response.status < 600 && attempt < MAX_PROVIDER_ATTEMPTS) {
        if (IS_DEV) {
          console.warn("[ForYouLLM] Retrying provider request due to 5xx status.", {
            attempt,
            status: response.status,
          });
        }
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      break;
    }

    if (!response) {
      return safeError("LLM provider request failed.", 502, "ERROR_MINIMAX_PROVIDER_UNAVAILABLE");
    }

    if (!response.ok) {
      return safeError("LLM provider request failed.", 502, "ERROR_MINIMAX_PROVIDER_UNAVAILABLE");
    }

    let providerJson: { choices?: Array<{ message?: { content?: string } }> };
    try {
      providerJson = JSON.parse(responseText) as { choices?: Array<{ message?: { content?: string } }> };
    } catch (parseError) {
      if (IS_DEV) {
        console.error("[ForYouLLM] Provider JSON.parse failed:", {
          message: (parseError as Error)?.message || "Unknown parse error",
          rawTextPreview: previewText(responseText),
        });
      }
      return safeError("LLM provider returned non-JSON response.", 502);
    }

    if (IS_DEV) {
      const keys = providerJson && typeof providerJson === "object" ? Object.keys(providerJson as Record<string, unknown>) : [];
      console.info("[ForYouLLM] Provider JSON shape:", {
        topLevelKeys: keys,
        hasChoices: Array.isArray(providerJson?.choices),
        choicesLength: Array.isArray(providerJson?.choices) ? providerJson.choices.length : null,
      });
    }
    const content = providerJson?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return safeError("LLM provider returned empty content.", 502);
    }
    if (IS_DEV) {
      console.info("[ForYouLLM] Extracted model content before parse:", content);
    }

    let parsed: unknown;
    try {
      parsed = parseLlmJson(content);
    } catch {
      return safeError("LLM output is not valid JSON.", 502);
    }

    if (!validateForYouAnalysisResponse(parsed)) {
      if (IS_DEV) {
        console.warn("[ForYouLLM] Response validation failed.", {
          hint: getResponseValidationHint(parsed),
          parsedType: typeof parsed,
          parsedKeys: parsed && typeof parsed === "object" ? Object.keys(parsed as Record<string, unknown>) : null,
          extractedContentPreview: previewText(content),
        });
      }
      return safeError("LLM output schema validation failed.", 502);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    if ((error as Error)?.name === "AbortError") {
      const elapsedMs = lastProviderRequestStartedAt > 0 ? Date.now() - lastProviderRequestStartedAt : null;
      console.error("[ForYouRoute] MiniMax request timeout", {
        reasonCode: "MINIMAX_REQUEST_TIMEOUT",
        timeoutMs: normalizedTimeoutMs,
        elapsedMs,
        errorName: (error as Error)?.name || "AbortError",
        errorMessage: (error as Error)?.message || "AbortError",
      });
      return safeError("LLM provider request timed out.", 504);
    }
    console.error("[ForYouRoute] unexpected route failure", {
      reasonCode: "ERROR_FOR_YOU_ROUTE_PRECHECK_FAILED",
      hasMiniMaxApiKey: Boolean(process.env.MINIMAX_API_KEY),
      hasMiniMaxBaseUrl: Boolean(process.env.MINIMAX_BASE_URL),
      minimaxTimeoutMs: normalizedTimeoutMs,
      authProvider: process.env.NEXT_PUBLIC_AUTH_PROVIDER || "custom",
      dataSource: process.env.NEXT_PUBLIC_DATA_SOURCE || "remote",
      errorName: (error as Error)?.name || "UnknownError",
      errorMessage: (error as Error)?.message || "Unknown error",
    });
    return safeError("Failed to generate AI analysis.", 500, "ERROR_FOR_YOU_ROUTE_PRECHECK_FAILED");
  }
}
