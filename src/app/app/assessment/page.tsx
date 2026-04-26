"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { saveProfileDraft } from "@/lib/profile-draft";
import { queueToast } from "@/lib/flash-toast";

type Question = {
  id: string;
  prompt: string;
  options: string[];
};

const questions: Question[] = [
  {
    id: "tightness",
    prompt: "洗脸后皮肤会不会容易紧绷？",
    options: ["几乎不会", "偶尔会", "经常会"],
  },
  {
    id: "oil_tzone",
    prompt: "T 区会不会比较容易出油？",
    options: ["不太会", "有时候会", "很容易"],
  },
  {
    id: "sensitivity",
    prompt: "尝试新产品会不会容易刺痛或泛红？",
    options: ["基本不会", "偶尔会", "比较容易"],
  },
  {
    id: "main_goal",
    prompt: "你最想改善什么问题？",
    options: ["干燥/缺水", "出油/毛孔", "敏感/泛红", "痘痘/闭口"],
  },
  {
    id: "routine_time",
    prompt: "平时你愿意花多少时间在护肤上？",
    options: ["5 分钟内", "5-15 分钟", "15 分钟以上"],
  },
  {
    id: "experience",
    prompt: "你对护肤流程熟不熟？",
    options: ["刚入门", "有一点经验", "比较熟悉"],
  },
];

type Answers = Record<string, string>;

export default function AssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [answers, setAnswers] = useState<Answers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round(((submitted ? questions.length : currentIndex + 1) / questions.length) * 100);

  const summary = useMemo(() => {
    if (!submitted) return null;

    const tightness = answers.tightness;
    const oil = answers.oil_tzone;
    const sensitivity = answers.sensitivity;
    const mainGoal = answers.main_goal;
    const experience = answers.experience;

    let skinType = "混合肌";
    if (tightness === "经常会" && oil !== "很容易") skinType = "干性肌";
    if (oil === "很容易" && tightness !== "经常会") skinType = "油性肌";
    if (sensitivity === "比较容易") skinType = `${skinType} + 敏感倾向`;

    const concerns: string[] = [];
    if (mainGoal) concerns.push(mainGoal);
    if (sensitivity === "比较容易") concerns.push("敏感稳定");
    if (oil === "很容易") concerns.push("控油平衡");
    if (tightness === "经常会") concerns.push("补水修护");

    return {
      skinType,
      primaryConcerns: [...new Set(concerns)].slice(0, 3),
      experienceLevel: experience || "刚入门",
    };
  }, [answers, submitted]);

  const canSubmit = questions.every((question) => answers[question.id]);
  const canGoNext = Boolean(answers[currentQuestion.id]);

  function handleNext() {
    if (!canGoNext) return;
    if (isLastQuestion) {
      setSubmitted(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  }

  function handlePrev() {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => prev - 1);
  }

  function handleApplyToProfile() {
    if (!summary) return;

    const skincareFamiliarity =
      summary.experienceLevel === "刚入门"
        ? "我只了解基础步骤"
        : summary.experienceLevel === "有一点经验"
          ? "我有固定的基础护肤流程"
          : "我比较理解功效成分";

    const ingredientsToAvoid = answers.sensitivity === "比较容易" ? "香精、刺激性酒精" : "";

    saveProfileDraft({
      skinType: summary.skinType,
      skinConcerns: summary.primaryConcerns.join(", "),
      experienceLevel:
        summary.experienceLevel === "有一点经验"
          ? "进阶"
          : summary.experienceLevel === "比较熟悉"
            ? "熟练"
            : "入门",
      skincareFamiliarity,
      ingredientsToAvoid,
    });

    queueToast({ tone: "success", message: "测评结果已应用到个人画像草稿。" });
    const returnTo = searchParams.get("returnTo") || "/app/products";
    router.push(`/app/profile/edit?source=assessment&returnTo=${encodeURIComponent(returnTo)}`);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h1 className="editorial-heading text-2xl font-semibold tracking-tight text-[var(--foreground)]">快速肤质与护肤习惯测评</h1>
        <p className="text-sm text-[var(--text-muted)]">
          保持轻量。回答 6 个日常问题，快速获得一份可用的初始档案。
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-soft)]">
          <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          第 {submitted ? questions.length : currentIndex + 1} / {questions.length} 题 · 已回答 {answeredCount} 题
        </p>
      </div>

      <Card className="space-y-5 rounded-[24px]">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            问题 {currentIndex + 1}
          </p>
          <p className="text-lg font-semibold text-[var(--foreground)]">{currentQuestion.prompt}</p>
        </div>
        <div className="grid gap-2">
          {currentQuestion.options.map((option) => {
            const active = answers[currentQuestion.id] === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }))}
                className={`rounded-2xl border px-4 py-3 text-left text-sm ${
                  active
                    ? "bg-[var(--surface-soft)] text-[var(--accent)]"
                    : "bg-[var(--surface)] text-[var(--foreground)]"
                }`}
                style={{ borderColor: active ? "var(--focus-ring)" : "var(--border-soft)" }}
              >
                {option}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" className="w-full" onClick={handlePrev} disabled={currentIndex === 0}>
            上一题
          </Button>
          <Button className="w-full" onClick={handleNext} disabled={!canGoNext}>
            {isLastQuestion ? "查看测评结果" : "下一题"}
          </Button>
        </div>
        {!canSubmit ? <p className="text-xs text-[var(--text-muted)]">完成全部题目后可查看完整结果。</p> : null}
      </Card>

      {submitted && summary ? (
        <Card className="space-y-4 rounded-[24px]">
          <h2 className="editorial-heading text-xl font-semibold text-[var(--foreground)]">你的初始结果</h2>
          <div className="grid gap-3 text-sm">
            <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
              <p className="text-xs text-[var(--text-muted)]">可能的肤质类型</p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">{summary.skinType}</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
              <p className="text-xs text-[var(--text-muted)]">核心关注点</p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">{summary.primaryConcerns.join(", ")}</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
              <p className="text-xs text-[var(--text-muted)]">护肤经验水平</p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">{summary.experienceLevel}</p>
            </div>
          </div>
          <div className="grid gap-2">
            <Button className="w-full" onClick={handleApplyToProfile}>一键应用到档案</Button>
            <Link href="/app/profile/edit">
              <Button variant="secondary" className="w-full">改为手动编辑档案</Button>
            </Link>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
