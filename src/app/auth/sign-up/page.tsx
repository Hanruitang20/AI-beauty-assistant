"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpAsync } from "@/lib/auth-service";

type SignUpState = {
  name: string;
  email: string;
  password: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignUpState>({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getErrorCode(error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error) {
      const code = (error as { code?: string }).code;
      if (typeof code === "string" && code) return code;
    }
    return "unknown";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.name || !form.email || !form.password) {
      setError("请填写所有必填项。");
      return;
    }

    if (form.password.length < 8) {
      setError("密码至少需要 8 位。");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    try {
      await signUpAsync({
        name: form.name || "BeautyShelf 用户",
        email: form.email,
        password: form.password,
        id: `bs_user_${Date.now().toString().slice(-6)}`,
      });
      setLoading(false);
      router.replace("/app/products");
    } catch (error) {
      setError(`创建失败：${getErrorCode(error)}`);
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-6 rounded-[24px]">
      <div className="space-y-2">
        <h1 className="editorial-heading text-3xl font-semibold tracking-tight text-[var(--foreground)]">创建账号</h1>
        <p className="text-sm text-[var(--text-muted)]">
          不到 1 分钟，开启你的专属美妆产品库。
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--foreground)]">昵称</span>
          <Input
            type="text"
            placeholder="请输入昵称"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
        </label>
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
            placeholder="至少 8 位"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
        </label>

        {!form.name && !form.email && !form.password ? (
          <p className="rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--text-muted)]">
            注册后即可进入 onboarding 并获得个性化建议。
          </p>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "创建中..." : "创建账号"}
        </Button>
      </form>

      <p className="pt-1 text-center text-sm text-[var(--text-muted)]">
        已有账号？{" "}
        <Link href="/auth/sign-in" className="font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]">
          去登录
        </Link>
      </p>
    </Card>
  );
}
