"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SignInState = {
  email: string;
  password: string;
};

export default function SignInPage() {
  const [form, setForm] = useState<SignInState>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError("请输入邮箱和密码。");
      return;
    }

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    if (!form.email.includes("@")) {
      setError("邮箱格式看起来不正确。");
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <Card className="space-y-6 rounded-[24px]">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">欢迎回来</p>
        <h1 className="editorial-heading text-3xl font-semibold tracking-tight text-[var(--foreground)]">登录</h1>
        <p className="text-sm text-[var(--text-muted)]">
          继续管理你的产品库与护肤档案。
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--foreground)]">邮箱</span>
          <Input
            type="email"
            placeholder="请输入邮箱"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--foreground)]">密码</span>
          <Input
            type="password"
            placeholder="请输入密码"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
        </label>

        {!form.email && !form.password ? (
          <p className="rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-muted)]">
            先填写你的账号信息。
          </p>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "登录中..." : "登录"}
        </Button>
      </form>

      <p className="pt-1 text-center text-sm text-[var(--text-muted)]">
        还没有账号？{" "}
        <Link href="/auth/sign-up" className="font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]">
          立即注册
        </Link>
      </p>
    </Card>
  );
}
