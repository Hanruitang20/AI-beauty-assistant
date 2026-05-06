# BeautyShelf AI

BeautyShelf AI 是一个面向个人自用的护肤/美妆整理助手：记录产品与体验、维护个人画像，并通过 For You 分析辅助日常决策。  
当前版本以 **mobile-first PWA** 为目标，支持在 iPhone Safari 中“添加到主屏幕”后以接近 App 的方式使用。

## 当前状态（最新）

- ✅ Next.js App Router + TypeScript + Tailwind CSS
- ✅ 自建 Auth API（`/api/auth/signup` / `signin` / `signout` / `me`）
- ✅ Prisma + `User` 模型（生产目标为 Postgres）
- ✅ For You 通过 `/api/for-you-analysis` 调用 MiniMax
- ✅ mobile-first UI（375/390/414 宽度优先）+ PWA 基础配置（manifest/standalone）
- ✅ Vercel 部署文档与生产环境变量模板

## 技术架构（当前）

- **前端**：Next.js App Router（React 19）
- **鉴权**：Custom Auth（session cookie）
- **数据库**：Prisma（`postgresql` datasource，生产使用 `DATABASE_URL`）
- **业务数据存储**：
  - 产品库 / Profile / Experience / 摘要：仍为 `userId` scoped localStorage
  - 用户账户（Auth）：数据库 `User` 表
- **AI 分析**：服务端路由调用 MiniMax，保留现有 prompt/schema/fallback/metrics 机制
- **形态**：PWA（`display: standalone`），用于手机主屏自用

## 快速开始（本地）

### 1) 环境要求

- Node.js 20+
- npm 10+

### 2) 安装依赖

```bash
npm install
```

> 项目已配置 `postinstall: prisma generate`，安装后会自动生成 Prisma Client。

### 3) 配置环境变量

复制 `.env.example` 到 `.env.local`，并按需填写：

```bash
NEXT_PUBLIC_AUTH_PROVIDER=custom
NEXT_PUBLIC_DATA_SOURCE=remote
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public
AUTH_SESSION_SECRET=replace-with-at-least-32-char-random-string
MINIMAX_API_KEY=replace-with-your-minimax-key
MINIMAX_BASE_URL=https://api.minimaxi.com/v1
MINIMAX_TIMEOUT_MS=55000
```

### 4) 初始化数据库（MVP）

```bash
npx prisma generate
npx prisma db push
```

### 5) 启动开发环境

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 常用命令

```bash
npm run lint
npm run build
npm run start
```

## 核心页面

- `/auth/sign-in` / `/auth/sign-up`
- `/app/products` / `/app/products/all` / `/app/products/new`
- `/app/products/[id]` / `/app/products/[id]/edit`
- `/app/recommendations`
- `/app/profile`

## 数据边界说明（当前）

- 产品库/Profile/Experience 的业务数据仍保存在浏览器本地（按 `userId` 隔离）。
- 清理浏览器存储会清除对应端侧业务数据。
- 产品图/头像目前为本地 data URL 预览存储，不是对象存储上传。
- 数据库目前承载的是鉴权用户信息（`User`）。

## 部署到 Vercel（生产）

推荐流程：

1. 推送代码到 GitHub
2. 在 Vercel 导入仓库
3. 配置 Postgres（Vercel Postgres 或外部托管 Postgres）
4. 在 Vercel 配置环境变量（见 `.env.example`）
5. 初始化数据库（MVP 用 `db push`，正式生产建议 `migrate deploy`）
6. 访问生产 URL，并在 iPhone Safari 添加到主屏幕

详见：

- [Vercel 部署说明](docs/deploy-vercel.md)
- [PWA 自用说明](docs/pwa-self-use.md)

## 生产数据库初始化建议

- **MVP 阶段可用**：

```bash
npx prisma generate
npx prisma db push
```

- **正式生产推荐**：

```bash
npx prisma migrate deploy
```

## 后续里程碑建议

- 将产品/Profile/Experience 从 localStorage 迁移到后端持久化（保持现有 UI/交互）
- 建立 Prisma migration 常规流程（CI 中固定执行 `migrate deploy`）
- 完善 PWA 图标与启动体验（替换占位 icon）
- 若未来要上架 App Store，再进入 Capacitor/TestFlight/App Store 流程
