import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col justify-between bg-[var(--background)] px-6 py-10">
      <main className="space-y-8">
        <section className="space-y-3 pt-2 text-center">
          <h1 className="editorial-heading text-4xl font-semibold tracking-tight text-[#3c3530]">BeautyShelf AI</h1>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:color-mix(in_oklab,var(--accent)_72%,white)]">
            你的个人 BEAUTY/CARE ASSISTANT
          </p>
        </section>

        <section
          className="relative aspect-[4/5] overflow-hidden rounded-[32px] border bg-[var(--surface)] shadow-[0_14px_34px_rgba(60,53,48,0.08)]"
          style={{ borderColor: "var(--border-soft)" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#f8f3eb_0%,#efe6da_38%,#e9dece_100%)]" />
          <div className="absolute left-1/2 top-[16%] h-[68%] w-[38%] -translate-x-1/2 rounded-[28px] border border-white/45 bg-[linear-gradient(160deg,rgba(255,255,255,0.92)_0%,rgba(244,236,225,0.84)_100%)] shadow-[0_18px_30px_rgba(95,78,62,0.18)]" />
          <div className="absolute left-1/2 top-[11%] h-[9%] w-[18%] -translate-x-1/2 rounded-full border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(237,226,210,0.8)_100%)]" />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/30 bg-white/40 p-3 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-sm text-white">✦</span>
              <p className="text-sm italic text-[#4a4138]">Intelligent skincare tracking</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[320px] space-y-6 text-center">
          <p className="text-sm leading-7 text-[var(--text-muted)]">
            记录你关注的产品，理解你的使用感受，给出更适合你的下一步。
          </p>
          <Link href="/auth/sign-up" className="mx-auto block w-full max-w-[280px]">
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(109,80,55,0.2)]">
              <span>开启旅程</span>
              <span aria-hidden>→</span>
            </span>
          </Link>
        </section>
      </main>

      <footer className="pt-8 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:color-mix(in_oklab,var(--text-muted)_70%,white)]">
          Pure &amp; Systematic
        </p>
      </footer>
    </div>
  );
}
