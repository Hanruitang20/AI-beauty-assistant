"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStoredProducts } from "@/lib/products-store";
import { getSavedProfile } from "@/lib/profile-store";

export default function OnboardingPage() {
  const router = useRouter();
  const hasProfile = Boolean(getSavedProfile());
  const hasProducts = getStoredProducts().length > 0;

  useEffect(() => {
    if (hasProfile || hasProducts) {
      router.replace("/app/products");
    }
  }, [hasProducts, hasProfile, router]);

  if (hasProfile || hasProducts) return null;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-rose-950">开始设置你的 BeautyShelf AI</h1>
        <p className="max-w-2xl text-sm leading-6 text-rose-700/80">
          你可以直接填写个人档案，也可以先做一个轻量测评，再一键应用到档案里。
        </p>
      </div>

      <div className="grid gap-4">
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-rose-900">直接填写我的档案</h2>
            <p className="mt-2 text-sm text-rose-700/80">
              适合已经了解自己肤质、偏好和护肤目标的你。
            </p>
          </div>
          <Link href="/app/profile/edit?returnTo=%2Fapp%2Fproducts">
            <Button className="w-full">去填写档案</Button>
          </Link>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-rose-900">先做快速肤质与习惯测评</h2>
            <p className="mt-2 text-sm text-rose-700/80">
              回答几个简单问题，快速拿到可用的初始档案。
            </p>
          </div>
          <Link href="/app/assessment?returnTo=%2Fapp%2Fproducts">
            <Button variant="secondary" className="w-full">
              开始快速测评
            </Button>
          </Link>
        </Card>
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-rose-900">先添加第一个产品</h2>
            <p className="mt-2 text-sm text-rose-700/80">
              你也可以先从记录产品开始，后续再补充个人信息。
            </p>
          </div>
          <Link href="/app/products/new">
            <Button variant="secondary" className="w-full">添加第一个产品</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
