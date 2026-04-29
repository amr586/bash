# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4` for codegen schemas; raw Express routes use `zod` v3 syntax — `z.string().email()` not `z.email()`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- **lelo** (`artifacts/lelo`) — Bashak Developments real-estate landing page (React + Vite). Ported from a v0/Vercel import. Uses wouter for routing, Tailwind v4 + shadcn/ui components, framer-motion/motion for animations, RTL Arabic content. Served at `/`.
- **api-server** (`artifacts/api-server`) — Express 5 + Drizzle. Auth: native email/password (`POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`) using scrypt-hashed `users.password_hash`; legacy Replit OIDC routes (`GET /api/login`, `/callback`, `/logout`) still mounted but UI uses email/password. Browser sessions stored in Postgres `sessions` table. Profile (`PATCH /api/me`), super-admin (`GET/PATCH/DELETE /api/admin/users/:id`). Admin PATCH supports updating `firstName`/`lastName`/`email`/`phone`/`profileImageUrl`/`isAdmin`/`isDisabled`/`password` (password ≥ 8 chars, hashed via scrypt). Admins can't disable or demote themselves. Login rejects disabled accounts (HTTP 403); active sessions for newly-disabled users are killed by the auth middleware on the next request. First registered user auto-promoted to super admin.
- **mockup-sandbox** (`artifacts/mockup-sandbox`) — design sandbox for canvas previews.

## Migration notes

The import was already structured as a pnpm_workspace Vite app (no Next.js conversion needed). The migration just copied the `lelo` artifact + `attached_assets/` into the existing scaffold and registered it.

## Implementation phases

- **Phase 1 — Auth + Profile + Super Admin (DONE)**
  - DB: `users` (with `phone`, `isAdmin`, `role` enum: `user`/`demo`/`support`/`data_entry`/`property_manager`/`admin`/`super_admin`) + `sessions` (Postgres-backed Express sessions).
  - Roles & permissions: `super_admin`, `admin`, `property_manager`, `data_entry` are all "staff" — they can add/edit/approve/feature properties (auto-publish on create, see admin panel link). User management (`/admin/users`) is gated more tightly to `isAdmin`/`super_admin` only. Frontend uses `isStaff(user)` and `isUserManager(user)` helpers from `artifacts/lelo/src/lib/roles.ts`. Backend `STAFF_ROLES` set in `properties.ts` already enforces this. `AuthUser.role` is exposed via `/api/auth/verify-otp` and the auth middleware.
  - Test accounts (password `Bashak@2026`, emails `*@bashak.test`): `super_admin`, `property_manager`, `data_entry`, `support`, `demo`.
  - When a staff member adds a property, the contact phone defaults to their own profile phone: the frontend (`add-property.tsx`) prefills `contactPhone` from `user.phone`, and the backend (`POST /api/properties`) falls back to `req.user.phone` if the field is empty/whitespace.
  - Replit Auth (OIDC) wired through `lib/replit-auth` and `lib/replit-auth-web`.
  - Pages: `/login`, `/profile`, `/admin` (Arabic RTL, gold/black brand).
  - Header has auth-aware avatar dropdown; first signed-in user becomes super admin.
  - Email/password are managed by the user's Replit account; in-app profile edits cover firstName, lastName, phone, profileImageUrl. Admins can also edit other users' email + toggle isAdmin (cannot demote/delete self).
- **Phase 2 — Properties + notifications + contact (DONE)**
  - DB tables: `properties` (status pending|approved|rejected; types apartment/villa/office/chalet/shop/land; listingType sale|rent), `contact_requests`, `notifications`. Schemas in `lib/db/src/schema/properties.ts`.
  - Routes (raw Zod, not codegen) in `artifacts/api-server/src/routes/{properties,contact,notifications}.ts` wired in `routes/index.ts`. Helpers in `src/lib/notifications.ts` (`createNotification`, `notifyAllAdmins`).
  - Notification triggers: user submits property → admins notified; admin approves/rejects → owner notified; admin creates property → all other users notified; contact request on a property → owner + admins notified.
  - Pages: `/dashboard` (tabs: recommended / my-properties / contact-requests / notifications, tab persisted in `?tab=`), `/add-property` (auto-approved when admin), `/properties/:id` (public detail page with rich contact form: name/phone/email/reason dropdown/extra notes — combined into `message` as `[reason] extra` and tied to `propertyId`), `/admin?tab=users|properties|contacts` (review queue + contacts inbox). Notification bell with 30s polling in header (`components/notification-bell.tsx`). Contact form section on home → `POST /api/contact`. Shared API helpers in `artifacts/lelo/src/lib/api.ts` and `components/property-card.tsx` (whole card is a link to detail page, action buttons live above the link layer via z-index).
  - Public endpoints: `GET /api/properties` (approved-only, optional `type`/`listingType`/`limit` filters) and `GET /api/properties/:id` (approved-only unless caller is owner/admin). `ProjectsSection` ("مشاريعنا المميزة") fetches real approved properties (max 4); section hides when none exist. Static demo project images in `assets/project-*.png` are now used as image fallbacks only.
- **Phase 2.5 — "سجّل الآن" + AI assistant (DONE)**
  - Hero section now has 3 CTAs: "احجز شقتك الآن" (WhatsApp), "سجّل الآن" (opens dialog), "الخط الساخن 17327".
  - `RegisterNowDialog` (`components/register-now-dialog.tsx`): name + phone + reason Select (شراء شقة/فيلا/إيجار/استشارة استثمارية/عرض عقار/أخرى) + notes; posts to `POST /api/contact` with message `[reason] notes`. Shows success state with "تم استلام طلبك!".
  - Bashak AI assistant: floating bottom-left FAB ("مساعد باشاك") opens a chat sheet (`components/bashak-ai-chat.tsx`) with welcome + 4 quick prompts.
  - Backend: `POST /api/bashak-ai/chat` (`routes/bashak-ai.ts`) calls Gemini 2.5 Flash via Replit AI Integrations proxy (`@google/genai`, `httpOptions: { apiVersion: "", baseUrl }`). System instruction = static `COMPANY_FACTS` + dynamically fetched top 8 approved properties (title/location/price/bedrooms/area/listingType). Replies in Egyptian Arabic, ≤5 sentences, refers to hotline 17327 / WhatsApp +20 11 5131 3999 / "سجّل الآن" for closing actions.
  - Env vars `AI_INTEGRATIONS_GEMINI_BASE_URL` + `AI_INTEGRATIONS_GEMINI_API_KEY` provisioned via setupReplitAIIntegrations (free-tier compliant — no user API key required).
- **Phase 2.6 — Favorites + Contact-us tab + dashboard rework (DONE)**
  - DB: `favorites` table (`user_id`, `property_id`, unique on the pair). Schema in `lib/db/src/schema/properties.ts`.
  - API (`artifacts/api-server/src/routes/favorites.ts`): `GET /api/me/favorites` (full property objects), `GET /api/me/favorites/ids` (just ids — used to render the heart state on listings), `POST /api/favorites/:id`, `DELETE /api/favorites/:id`. All require auth.
  - `PropertyCard` shows a heart toggle in the top corner (opposite of the listing badge). Anonymous taps redirect to `/login`. Cards accept `isFavorite` + `onFavoriteChange` for parent-controlled state, otherwise track locally.
  - Dashboard tabs are now role-aware:
    - All users: `recommended`, `favorites`, `contact-us`, `notifications`.
    - Staff (super_admin / admin / property_manager / data_entry / legacy isAdmin): the above + `my-properties` and `contact-requests`.
  - `contact-us` tab embeds an inline form (name/phone/email/reason/message) that POSTs to `/api/contact`. Pre-fills name/phone/email from the logged-in user.
  - Bug fix: dashboard previously used `isStaff(user)` without importing it — now imported from `@/lib/roles`.
  - Test accounts seeded by `pnpm --filter db run seed` (script: `lib/db/scripts/seed-test-users.mjs`). Re-run is idempotent (`ON CONFLICT (email) DO UPDATE`). Also chained from `scripts/post-merge.sh` so merges keep accounts in sync.
  - All test accounts use password `Bashak@2026`: `superadmin@bashak.test` (super_admin), `manager@bashak.test` (property_manager), `dataentry@bashak.test` (data_entry), `support@bashak.test` (support), `demo@bashak.test` (demo). Login is via `POST /api/auth/login` → returns 6-digit OTP challenge (dev OTP shown on the login page in non-prod) → `POST /api/auth/verify-otp` finalises the session.
- **Phase 3 — Media library (planned)**: YouTube videos curated by admin, public gallery.
- **Phase 4 — Site polish (planned)**: EN/AR toggle, Google Maps footer, full-screen loader, public property listings + filters + detail page.

## Codegen gotcha

Orval generates Zod schemas from `operationId` (e.g. `updateMyProfile` → `UpdateMyProfileBody`) AND TS types from schema component names. If a schema is named identically to one of these auto-generated body names, the api-zod barrel re-export collides. Suffix request schemas with `Request` (e.g. `UpdateMyProfileRequest`) to avoid the collision; consume the Zod from the generated `<OperationId>Body` / `<OperationId>Response` constants.
