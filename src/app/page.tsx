import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] items-center bg-[var(--background)] px-6 py-12">
      <main className="w-full space-y-8 rounded-[30px] border bg-[var(--surface)] p-8 shadow-[0_8px_28px_rgba(60,53,48,0.06)]" style={{ borderColor: "var(--border-soft)" }}>
        <section className="space-y-3">
          <h1 className="editorial-heading text-4xl font-semibold tracking-tight text-[#3c3530]">BeautyShelf AI</h1>
          <p className="text-sm font-medium text-[var(--foreground)]">你的个人 beauty/care assistant</p>
          <p className="text-sm leading-6 text-[var(--text-muted)]">记录产品、理解产品、获得更适合你的下一步建议。</p>
        </section>

        <section className="grid gap-2">
          <Link href="/auth/sign-up" className="w-full">
            <span className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white">
              开始使用
            </span>
          </Link>
          <Link href="/auth/sign-in" className="w-full">
            <span
              className="inline-flex w-full items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold text-[var(--foreground)]"
              style={{ borderColor: "var(--border-soft)" }}
            >
              我已有账号
            </span>
          </Link>
        </section>
      </main>
    </div>
  );
}
