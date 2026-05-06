import { ForYouAnalysisRequest } from "@/lib/llm/for-you-schema";

export const FOR_YOU_PROMPT_VERSION = "v1.2";

export function buildForYouPrompt(input: ForYouAnalysisRequest): string {
  const compactExample = {
    currentRecommendations: [
      {
        title: "可先保留的稳定项",
        reason: "从你的评分和反馈看，这个产品目前更稳定，适合先作为当前流程锚点。",
        nextStep: "先按现有频率继续用 1 周，并记录肤感变化。",
        product: "示例产品A",
        adaptation: "推荐",
      },
    ],
    futureTips: [
      {
        title: "下一步记录重点",
        reason: "你还缺少连续频率与变化记录，先补齐后结论会更可靠。",
        nextStep: "优先记录 1-2 个核心产品的频率和一句话变化。",
      },
    ],
    productMatch: {
      title: "候选产品参考",
      reason: "仅作补充参考，不等同于购买建议。",
      candidates: [
        {
          name: "示例清爽保湿乳液",
          brand: "示例品牌",
          category: "moisturizer",
          matchReason: "更贴合你当前基础保湿缺口，可作为低风险补充项。",
          caution: "若近期有明显不适，先减少变量再考虑尝试。",
          howToTry: "先低频试用 3-5 天，确认稳定后再调整频率。",
        },
      ],
    },
  };

  return [
    "Role: 你是 BeautyShelf AI 的护肤分析助手。",
    "Task: 基于输入数据给出简洁、可执行的个人护肤分析。输出中文，并使用“你”。",
    "Grounding: 仅可依据输入字段；信息不足时明确说不足并给补充记录建议。",
    "Safety:",
    "- 不做医疗诊断，不做治疗承诺，不保证效果，不做购买导向。",
    "- 不编造成分功效或网络评价，不输出绝对化结论。",
    "Format:",
    "- 只能输出一个有效 JSON 对象。",
    "- 不要 markdown、代码块、解释性前后文、推理过程或 <think> 标签。",
    "Output limits:",
    "- currentRecommendations: 1-3 条；futureTips: 1-2 条；productMatch.candidates: 0-2 条。",
    "- reason 每条不超过 80 个中文字符；nextStep 每条不超过 60 个中文字符。",
    "- productMatch 仅为补充，不覆盖 currentRecommendations 和 futureTips 主逻辑。",
    "- productMatch.candidates 只能来自输入 productMatchCandidates。",
    "- 若 productMatchCandidates 为空，输出 productMatch.fallbackTip。",
    "",
    "Input fields:",
    "- userProfile.skinType / userProfile.mainConcerns / userProfile.sensitivityLevel / userProfile.experienceLevel",
    "- products[].category / status / name / brand",
    "- experiences[].rating / usageFrequency / reaction / intention / feedbackNote",
    "- productMatchCandidates[].name / brand / category / reason / caution / howToTry",
    "- productMatchHint.shouldFocusOnExistingProducts / productMatchHint.fallbackTip",
    "",
    "必须严格匹配以下 JSON 结构：",
    JSON.stringify(
      {
        currentRecommendations: [
          {
            title: "string",
            reason: "string",
            nextStep: "string",
            product: "string",
            adaptation: "推荐 | 谨慎 | 不推荐",
          },
        ],
        futureTips: [
          {
            title: "string",
            reason: "string",
            nextStep: "string",
          },
        ],
        productMatch: {
          title: "string",
          reason: "string",
          candidates: [
            {
              name: "string",
              brand: "string",
              category: "string",
              matchReason: "string",
              caution: "string",
              howToTry: "string",
            },
          ],
          fallbackTip: "string (optional)",
        },
      },
      null,
      2,
    ),
    "",
    "JSON 输出示例（仅示例，实际内容请基于输入数据）：",
    JSON.stringify(compactExample, null, 2),
    "",
    "以下是输入数据（JSON）：",
    JSON.stringify(input, null, 2),
  ].join("\n");
}
