# BeautyShelf AI (V1.5 Final)

BeautyShelf AI is a local-first MVP for recording beauty/care products, building a personal profile, and getting mock AI-style guidance.

This version is intentionally frontend-only:

- Next.js App Router + TypeScript + Tailwind CSS
- localStorage/mock data
- mock auth
- mock summary and recommendation logic

No real backend, database, auth provider, or AI API is connected.

## Quick Start

### Requirements

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Run in dev mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other commands

```bash
npm run lint
npm run build
npm run start
```

## Core User Flow

1. Open app at `/`
2. Sign up or sign in (`/auth/sign-up`, `/auth/sign-in`)
3. Complete profile via:
   - quick assessment (`/app/assessment`), or
   - direct profile edit (`/app/profile/edit`)
4. Add products (`/app/products/new`)
5. Explore:
   - Product Library (`/app/products`, `/app/products/all`)
   - Product details and summary (`/app/products/[id]`)
   - For You analysis (`/app/recommendations`)
   - Profile and Product Journey (`/app/profile`)

## Main Pages

- `/app/products`: state-based product home
- `/app/products/all`: full library with search + category chips
- `/app/products/[id]`: product detail, product image upload, mock summary, usage feedback
- `/app/recommendations`: state-aware "For You" analysis with category scope chips
- `/app/profile`: avatar, product journey preview, profile summary, account actions
- `/app/notifications`: lightweight placeholder notification center

## Data Storage (Local Only)

All data is stored in browser localStorage/sessionStorage.

Important keys:

- `beautyshelf.mock-auth`
- `beautyshelf.mock-user`
- `beautyshelf.products`
- `beautyshelf.product-summaries`
- `beautyshelf.recent-viewed-products`
- `beautyshelf.profile`
- `beautyshelf.profile-draft`
- `beautyshelf.mock-user-avatar`
- `beautyshelf.product-images`
- `beautyshelf.product-experiences`
- `beautyshelf.flash-toast` (sessionStorage)

## Notes for Users

- This is a mock/local MVP. Data is tied to your current browser.
- Clearing browser storage will remove app data.
- Product and avatar image uploads are local previews (stored as data URL), not uploaded to a server.
- Recommendation and summary content are rule-based/mock outputs.

## Notes for Future V2 Work

- Keep UI behavior stable while refactoring services/stores.
- Prepare model contracts before integrating real backend/AI.
- Preserve current flows (state layering, returnTo navigation, single top toast behavior).
