# BeautyShelf AI (V3.0 In Progress)

BeautyShelf AI is a local-first app for recording beauty/care products, building a personal profile, and getting mock AI-style guidance.

Current architecture status:

- Next.js App Router + TypeScript + Tailwind CSS
- repository + data-source abstraction layer (local / remote-ready)
- localStorage data for products/profile/experience/summaries
- auth source switch via env (`local` mock or `remote` Firebase Auth)
- mock summary and recommendation logic

No Firestore/backend product data sync or real AI API is connected yet.

## Current Progress

- ✅ V3.0 Phase 1A-1E: data-source/repository foundation + async service/page migration completed
- ✅ V3.0 Phase 2A: Firebase client + remote auth repository adapter completed
- ✅ V3.0 Phase 2B: auth flow can switch to Firebase Auth via env
- ⏳ Next: database schema + remote product/profile/experience persistence (Firestore or equivalent)

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

### Auth source switch (V3.0)

Set in `.env.local`:

```bash
# local (default): mock auth
NEXT_PUBLIC_DATA_SOURCE=local

# remote: Firebase Auth
# NEXT_PUBLIC_DATA_SOURCE=remote
```

When `NEXT_PUBLIC_DATA_SOURCE=remote`, Firebase Auth uses:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (optional)
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` (optional)
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)

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

## Data Storage

Product/profile/experience/summaries remain stored in browser localStorage/sessionStorage.
Auth can be mock-local or Firebase Auth depending on `NEXT_PUBLIC_DATA_SOURCE`.

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

## Notes for Next Work

- Keep UI behavior stable while refactoring services/stores.
- Prepare model contracts before integrating real backend/AI.
- Preserve current flows (state layering, returnTo navigation, single top toast behavior).
