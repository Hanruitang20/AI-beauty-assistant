"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSavedProfile } from "@/lib/profile-store";
import { getMockUser, signOutMock } from "@/lib/mock-auth";
import { getStoredProducts } from "@/lib/products-store";
import { getCategoryLabel } from "@/lib/products";
import { queueToast } from "@/lib/flash-toast";
import { useToast } from "@/components/ui/toast-provider";

const MOCK_USER_AVATAR_KEY = "beautyshelf.mock-user-avatar";

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const user = getMockUser();
  const products = getStoredProducts();
  const savedProfile = getSavedProfile();
  const [avatar, setAvatar] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(MOCK_USER_AVATAR_KEY) || "";
  });
  const profileMainConcerns = savedProfile?.mainConcerns || "未填写";
  const profileSkinType = savedProfile?.skinType || "未填写";
  const profileSensitivity = savedProfile?.sensitivityLevel || "未填写";
  const profileExperience = savedProfile?.experienceLevel || "未填写";
  const monthLabels = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 4 }).map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1);
      return `${date.getMonth() + 1}月`;
    });
  }, []);
  const journeyProducts = useMemo(() => products.slice(0, 3), [products]);

  function getJourneyWidth(months?: number) {
    const value = months ?? 0;
    if (value >= 6) return "w-full";
    if (value >= 4) return "w-4/5";
    if (value >= 2) return "w-3/5";
    if (value >= 1) return "w-2/5";
    return "w-1/4";
  }

  function getJourneyLabel(months?: number) {
    const value = months ?? 0;
    if (value <= 0) return "记录中";
    return `使用中 ${value} 个月`;
  }

  function handleAvatarPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast({ tone: "error", message: "请选择图片文件。" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) return;
      setAvatar(dataUrl);
      window.localStorage.setItem(MOCK_USER_AVATAR_KEY, dataUrl);
      showToast({ tone: "success", message: "头像已更新。" });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6 pb-6">
      <section className="rounded-[24px] border bg-[var(--surface)] p-5 shadow-[0_4px_16px_rgba(60,53,48,0.04)]" style={{ borderColor: "var(--border-soft)" }}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-2 border-[var(--accent)]/30 bg-[var(--surface-soft)] p-1 shadow-sm">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="用户头像" className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--surface)] text-lg font-semibold text-[var(--accent)]">
                  {(user?.name || "用户").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-sm"
              onClick={() => fileInputRef.current?.click()}
              aria-label="更换头像"
            >
              ✎
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
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
          <h2 className="text-lg font-semibold text-[var(--foreground)]">产品旅程</h2>
          <Link href="/app/products/all" className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
            查看全部
          </Link>
        </div>
        <Card className="rounded-[24px]">
          {journeyProducts.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-[var(--foreground)]">还没有产品旅程</p>
              <p className="text-sm text-[var(--text-muted)]">添加产品后，这里会展示你的产品记录时间线。</p>
              <Link href="/app/products/new">
                <Button className="w-full">添加第一个产品</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-4 border-b pb-2 text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]" style={{ borderColor: "var(--border-soft)" }}>
                {monthLabels.map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
              <div className="space-y-3">
                {journeyProducts.map((product) => (
                  <Link key={product.id} href={`/app/products/${product.id}`} className="block">
                    <div className="space-y-1">
                      <div className={`h-8 ${getJourneyWidth(product.usageDurationMonths)} rounded-r-md border-l-4 bg-[var(--surface-soft)] px-3 py-1`} style={{ borderLeftColor: "var(--accent)" }}>
                        <p className="truncate text-xs font-semibold text-[var(--foreground)]">{product.name}</p>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {getCategoryLabel(product.category)} · {getJourneyLabel(product.usageDurationMonths)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">个人档案</h2>
          <Link href="/app/profile/edit?returnTo=%2Fapp%2Fprofile" className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
            编辑
          </Link>
        </div>

        {!savedProfile ? (
          <Card className="space-y-3 rounded-[24px]">
            <p className="text-sm font-semibold text-[var(--foreground)]">还没有完善个人档案</p>
            <Link href="/app/assessment?returnTo=%2Fapp%2Fprofile">
              <Button className="w-full">完善个人信息</Button>
            </Link>
          </Card>
        ) : (
          <Link href="/app/profile/edit?returnTo=%2Fapp%2Fprofile" className="block">
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
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">账户设置</h2>
        <div className="grid gap-2">
          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={() => showToast({ tone: "info", message: "AI 分析偏好将在后续版本开放。" })}
          >
            AI 分析偏好
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={() => showToast({ tone: "info", message: "帮助与反馈将在后续版本开放。" })}
          >
            帮助与反馈
          </Button>
        </div>
      </section>

      <div className="rounded-2xl bg-[var(--surface-soft)] p-4 text-sm text-[var(--foreground)]">
        <p className="font-medium">关于 BeautyShelf AI</p>
        <p className="mt-1 text-[var(--text-muted)]">当前版本：V1.5 Final</p>
        <p className="text-[var(--text-muted)]">Personalized Local MVP</p>
        <p className="text-[var(--text-muted)]">本版本使用本地 mock 数据，不连接真实后端或真实 AI。</p>
      </div>

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => {
          signOutMock();
          queueToast({ tone: "success", message: "你已退出登录。" });
          router.replace("/auth/sign-in");
        }}
      >
        退出登录
      </Button>
    </div>
  );
}
