# BeautyShelf AI 部署到 Vercel（iPhone 主屏自用）

本文仅覆盖部署兼容性：Vercel + Postgres + 现有 Next.js App Router。  
不涉及 For You 页面结构、MiniMax 核心逻辑、prompt/schema/fallback/metrics、产品库/Profile/Experience UI、storage-scope userId 隔离逻辑或业务数据模型改造。

## 1) 推送代码到 GitHub

1. 在本地完成改动并通过基础检查：
   - `npm run lint`
   - `npm run build`
2. 提交并推送到 GitHub 仓库。

## 2) 在 Vercel 导入仓库

1. 打开 [Vercel Dashboard](https://vercel.com/dashboard)。
2. `Add New` -> `Project`。
3. 选择 BeautyShelf AI 的 GitHub repo 并导入。
4. Framework 保持 `Next.js`（自动识别）。

## 3) 添加 Postgres 数据库

你可以使用：
- Vercel Postgres（推荐和 Vercel 一体化），或
- 外部托管 Postgres（Neon / Supabase / RDS 等）。

关键点：生产环境必须提供 `DATABASE_URL=postgresql://...`，不要使用 SQLite `dev.db`。

## 4) 配置 Vercel 环境变量

在 `Project Settings -> Environment Variables` 添加：

- `NEXT_PUBLIC_AUTH_PROVIDER=custom`
- `NEXT_PUBLIC_DATA_SOURCE=remote`
- `DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public`
- `AUTH_SESSION_SECRET=<至少32字符随机字符串>`
- `MINIMAX_API_KEY=<你的 key>`
- `MINIMAX_BASE_URL=https://api.minimaxi.com/v1`
- `MINIMAX_TIMEOUT_MS=60000`

说明：
- `AUTH_SESSION_SECRET` / `DATABASE_URL` / `MINIMAX_API_KEY` 不能加 `NEXT_PUBLIC_` 前缀。
- `NEXT_PUBLIC_AUTH_PROVIDER` / `NEXT_PUBLIC_DATA_SOURCE` 可以暴露给前端运行时。

## 5) 初始化生产数据库（Prisma）

当前 MVP 只有 `User` 表，初始化可用：

```bash
npx prisma generate
npx prisma db push
```

推荐方式说明：
- **MVP 阶段**：`db push` 足够快，适合先落地生产可用版本。
- **正式生产阶段**：建议改为 migration 工作流并使用：

```bash
npx prisma migrate deploy
```

可选做法：
- 在 CI/CD 或部署流水线中执行上述命令；
- 或在一次性运维步骤里，用同一套生产 `DATABASE_URL` 手动执行。

## 6) 验证部署

1. 部署完成后访问 Vercel 分配的 URL。
2. 检查关键链路：
   - `/auth/sign-up`、`/auth/sign-in`
   - `/api/auth/me`
   - `/api/for-you-analysis`（依赖 MiniMax 变量）
3. 确认页面在手机 Safari 正常打开。

## 7) iPhone Safari 添加到主屏幕

1. Safari 打开你的 Vercel 生产 URL。
2. 点分享按钮（方框上箭头）。
3. 选择“添加到主屏幕”。
4. 从主屏打开，应用将以 PWA standalone 形态运行。
