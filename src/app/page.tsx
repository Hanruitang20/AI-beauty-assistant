import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen scroll-smooth bg-gradient-to-b from-rose-50 via-white to-pink-50 text-rose-950">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <div className="text-lg font-semibold tracking-tight">BeautyShelf AI</div>
        <nav className="hidden items-center gap-8 text-sm text-rose-700 md:flex">
          <a className="transition hover:text-rose-900" href="#features">
            功能亮点
          </a>
          <a className="transition hover:text-rose-900" href="#about">
            产品介绍
          </a>
        </nav>
        <Link
          href="/auth/sign-in"
          className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-50"
        >
          登录
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-16 pt-8 md:px-10 md:pt-12">
        <section className="rounded-3xl border border-rose-100 bg-white/80 p-8 shadow-[0_20px_60px_-40px_rgba(244,114,182,0.45)] backdrop-blur md:p-12">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-rose-700">
              专为日常护肤打造
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              你的轻量护肤决策搭档，{" "}
              <span className="text-rose-600">BeautyShelf AI</span>
            </h1>
            <p className="max-w-2xl text-base leading-7 text-rose-800/80 md:text-lg">
              把用过、想买、被推荐的产品都整理进一个清晰的产品库，
              更快理解产品是否适合你，并获得更贴合自己的日常建议。
            </p>
            <Link
              href="/app/onboarding"
              className="rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-rose-600"
            >
              开始体验
            </Link>
          </div>
        </section>

        <section id="about" className="max-w-3xl space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            为真实护肤日常而生
          </h2>
          <p className="text-rose-800/80">
            BeautyShelf AI 帮你把零散信息变成结构化记录，从第一次种草到长期使用，
            都能更清楚地做出适合自己的选择。
          </p>
        </section>

        <section id="features" className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold">保存产品</h3>
            <p className="mt-2 text-sm leading-6 text-rose-800/80">
              把护肤和彩妆产品集中记录，支持检索、备注和补货提醒，不再反复翻聊天记录。
            </p>
          </article>
          <article className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold">理解产品</h3>
            <p className="mt-2 text-sm leading-6 text-rose-800/80">
              将产品信息拆成易理解的要点，帮助你更快判断是否符合自己的肤质和目标。
            </p>
          </article>
          <article className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold">个性化建议</h3>
            <p className="mt-2 text-sm leading-6 text-rose-800/80">
              基于你的产品库、个人档案和使用偏好，提供更贴近你的入门建议与替代方案。
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
