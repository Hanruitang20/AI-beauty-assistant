import { NextRequest, NextResponse } from "next/server";
import { buildForYouPrompt } from "@/lib/llm/for-you-prompt";
import {
  ForYouAnalysisRequest,
  validateForYouAnalysisRequest,
  validateForYouAnalysisResponse,
} from "@/lib/llm/for-you-schema";

const IS_DEV = process.env.NODE_ENV !== "production";
const MAX_PROVIDER_ATTEMPTS = 2;
const RETRY_DELAY_MS = 500;

function safeError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
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
  if (typeof obj.summary !== "string") return "summary is missing or not a string";
  if (!Array.isArray(obj.insights)) return "insights is missing or not an array";
  if (!obj.suggestedNextAction || typeof obj.suggestedNextAction !== "object") {
    return "suggestedNextAction is missing or not an object";
  }
  const action = obj.suggestedNextAction as Record<string, unknown>;
  if (typeof action.label !== "string") return "suggestedNextAction.label is missing or not a string";
  const validTargets = ["profile", "product_detail", "add_product", "continue_tracking"];
  if (!validTargets.includes(String(action.target))) return "suggestedNextAction.target is missing or invalid";
  const validInsightTypes = ["positive", "caution", "observation", "missing_info"];
  for (let i = 0; i < obj.insights.length; i += 1) {
    const insight = obj.insights[i] as Record<string, unknown>;
    if (!insight || typeof insight !== "object") return `insights[${i}] is not an object`;
    if (typeof insight.title !== "string") return `insights[${i}].title is missing or not a string`;
    if (typeof insight.reason !== "string") return `insights[${i}].reason is missing or not a string`;
    if (typeof insight.nextStep !== "string") return `insights[${i}].nextStep is missing or not a string`;
    if (!validInsightTypes.includes(String(insight.type))) return `insights[${i}].type is missing or invalid`;
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
  if (!apiKey || !model) {
    return safeError("LLM provider is not configured.", 503);
  }

  const baseUrl = (process.env.MINIMAX_BASE_URL || "https://api.minimax.io/v1").replace(/\/+$/, "");
  const requestUrl = `${baseUrl}/chat/completions`;
  const timeoutMs = Number(process.env.FOR_YOU_LLM_TIMEOUT_MS || 8000);
  const normalizedTimeoutMs = Number.isFinite(timeoutMs) ? timeoutMs : 8000;

  if (IS_DEV) {
    console.info("[ForYouLLM] MiniMax request config:", {
      baseUrl,
      model,
      requestUrl,
      timeoutMs: normalizedTimeoutMs,
    });
  }

  try {
    const prompt = buildForYouPrompt(input);
    let response: Response | null = null;
    let responseText = "";
    for (let attempt = 1; attempt <= MAX_PROVIDER_ATTEMPTS; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), normalizedTimeoutMs);
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
      return safeError("LLM provider request failed.", 502);
    }

    if (!response.ok) {
      return safeError("LLM provider request failed.", 502);
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
      return safeError("LLM provider request timed out.", 504);
    }
    return safeError("Failed to generate AI analysis.", 500);
  }
}
