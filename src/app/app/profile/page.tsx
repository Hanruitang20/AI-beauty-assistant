"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProfileDraft } from "@/lib/profile-draft";
import { getSavedProfile } from "@/lib/profile-store";
import { FeedbackState } from "@/components/ui/feedback-state";
import { getStoredProducts } from "@/lib/products-store";
import { getMockUser, signOutMock } from "@/lib/mock-auth";

export default function ProfilePage() {
  const router = useRouter();
  const user = getMockUser();
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
                {(user?.name || "用户").slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
          <div>
            <h1 className="editorial-heading text-2xl font-semibold text-[#3c3530]">{user?.name || "BeautyShelf 用户"}</h1>
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
              ID: {user?.id || "bs_user_mock"}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">个人档案</h2>
          <Link href="/app/profile/edit" className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
            编辑
          </Link>
        </div>

        <Link href="/app/profile/edit" className="block">
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
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">账户设置</h2>
        <div className="grid gap-2">
          <Button variant="secondary" className="w-full justify-start">设置（即将上线）</Button>
          <Button variant="secondary" className="w-full justify-start">帮助与反馈（即将上线）</Button>
        </div>
      </section>

      <div className="rounded-2xl bg-[var(--surface-soft)] p-4 text-sm text-[var(--foreground)]">
        <p className="font-medium">关于 BeautyShelf AI</p>
        <p className="mt-1 text-[var(--text-muted)]">
          这是一个 personal beauty/care assistant，会结合你的画像、产品记录和使用痕迹，持续给出更贴合你的建议。
        </p>
        <p className="mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]/80">Version 2.4.1</p>
      </div>

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => {
          signOutMock();
          router.replace("/auth/sign-in");
        }}
      >
        退出登录
      </Button>
    </div>
  );
}
