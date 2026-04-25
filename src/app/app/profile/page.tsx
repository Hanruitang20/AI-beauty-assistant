"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProfileDraft } from "@/lib/profile-draft";
import { getSavedProfile } from "@/lib/profile-store";
import { FeedbackState } from "@/components/ui/feedback-state";
import { getStoredProducts } from "@/lib/products-store";

const AUTH_KEY = "beautyshelf.mock-auth";

export default function ProfilePage() {
  const authState = useMemo(
    () => (typeof window !== "undefined" ? window.localStorage.getItem(AUTH_KEY) : null),
    [],
  );
  const isLoggedIn = authState === "signed-in";
  const savedProfile = getSavedProfile();
  const draft = getProfileDraft();
  const products = getStoredProducts();
  const profileMainConcerns = savedProfile?.mainConcerns || "未填写";
  const profileSkinType = savedProfile?.skinType || "未填写";
  const profileSensitivity = savedProfile?.sensitivityLevel || "未填写";
  const profileExperience = savedProfile?.experienceLevel || "未填写";

  return (
    <div className="space-y-6 pb-6">
      <section className="rounded-[24px] border bg-[var(--surface)] p-5 shadow-[0_4px_16px_rgba(60,53,48,0.04)]" style={{ borderColor: "var(--border-soft)" }}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-[var(--accent)]/30 bg-[var(--surface-soft)] p-1">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--surface)] text-sm font-semibold text-[var(--accent)]">
                {isLoggedIn ? "HR" : "游客"}
              </div>
            </div>
          </div>
          <div>
            <h1 className="editorial-heading text-2xl font-semibold text-[#3c3530]">{isLoggedIn ? "Hanruitang" : "未登录用户"}</h1>
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {isLoggedIn ? "ID: bs_user_2026_001" : "当前为本地体验模式"}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Beauty Profile</h2>
          <Link href="/app/profile/edit" className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
            更新
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-[24px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">肤质</p>
            <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{profileSkinType}</p>
          </Card>
          <Card className="rounded-[24px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">敏感程度</p>
            <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{profileSensitivity}</p>
          </Card>
          <Card className="col-span-2 rounded-[24px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">主要诉求</p>
            <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{profileMainConcerns}</p>
          </Card>
          <Card className="col-span-2 rounded-[24px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">经验水平</p>
            <p className="mt-2 text-base font-semibold text-[var(--foreground)]">{profileExperience}</p>
          </Card>
        </div>
      </section>

      {!isLoggedIn ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">账号入口</h2>
          <div className="grid gap-2">
            <Link href="/auth/sign-in">
              <Button className="w-full">登录</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button variant="secondary" className="w-full">注册新账号</Button>
            </Link>
            <Link href="/app/profile/edit">
              <Button variant="secondary" className="w-full">先完善本地个人画像</Button>
            </Link>
          </div>
        </section>
      ) : (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">账户设置</h2>
          <div className="grid gap-2">
            <Link href="/app/profile/edit">
              <Button variant="secondary" className="w-full justify-start">个人信息</Button>
            </Link>
            <Button variant="secondary" className="w-full justify-start">AI 分析偏好（即将上线）</Button>
            <Button variant="secondary" className="w-full justify-start">设置与安全（即将上线）</Button>
            <Button variant="secondary" className="w-full justify-start">帮助与反馈（即将上线）</Button>
          </div>
        </section>
      )}

      <Card className="rounded-[24px]">
        <FeedbackState tone="info">
          当前本地数据：已保存 {products.length} 个产品，个人画像{savedProfile ? "已填写" : "未填写"}，测评草稿{draft ? "已存在" : "暂无"}。
        </FeedbackState>
      </Card>

      <div className="rounded-2xl bg-[var(--surface-soft)] p-4 text-sm text-[var(--foreground)]">
        <p className="font-medium">关于 BeautyShelf AI</p>
        <p className="mt-1 text-[var(--text-muted)]">
          这是一个 personal beauty/care assistant，会结合你的画像、产品记录和使用痕迹，持续给出更贴合你的建议。
        </p>
        <p className="mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]/80">Version 2.4.1</p>
      </div>
    </div>
  );
}
