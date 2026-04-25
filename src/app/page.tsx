import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[var(--background)] px-6 pb-12 pt-12">
      <main className="space-y-8">
        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Welcome</p>
          <h1 className="editorial-heading text-4xl font-semibold tracking-tight text-[#3c3530]">
            BeautyShelf AI
          </h1>
          <p className="text-sm leading-7 text-[var(--text-muted)]">
            你的个人 beauty/care assistant。先登录，再通过测评和档案建立属于你的产品库、为你解读和下一步建议。
          </p>
        </section>

        <section className="rounded-[24px] border bg-[var(--surface)] p-6 shadow-[0_4px_24px_rgba(60,53,48,0.04)]" style={{ borderColor: "var(--border-soft)" }}>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">开始你的个人路径</h2>
            <p className="text-sm text-[var(--text-muted)]">
              登录前：Welcome / 登录 / 注册。登录后：Onboarding、测评与主应用。
            </p>
          </div>
          <div className="mt-6 grid gap-2">
            <Link href="/auth/sign-in" className="w-full">
              <span className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white">
                登录
              </span>
            </Link>
            <Link href="/auth/sign-up" className="w-full">
              <span className="inline-flex w-full items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold text-[var(--foreground)]" style={{ borderColor: "var(--border-soft)" }}>
                注册
              </span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
