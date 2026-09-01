# ⚔️ ROAST ARENA — Where Rival Brands Roast & Users Pick the Winner

**ROAST ARENA** is a viral 1v1 brand battle platform combining esports arena aesthetics, live audience voting, B2B marketing campaign dashboards, AI roast assistants, and brand perk rewards.

---

## 🚀 Quick Setup & Local Development Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment & Database
```bash
cp .env.example .env
npx prisma db push
npx prisma db seed
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Seeded Demo Credentials Table

| Account Role | Brand Name / Account | Email / Identifier | Demo Code / Password | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Verified Business** | Swiggy | `swiggy@coroast.com` | `SWIGGY2026` | ✓ Verified |
| **Verified Business** | Nike | `nike@coroast.com` | `NIKE2026` | ✓ Verified |
| **Verified Business** | Zomato | `zomato@coroast.com` | `ZOMATO2026` | ✓ Verified |
| **Unverified Business** | The Burger Club | `biz@burgerclub.com` | `PENDING2026` | ⏳ Pending Review |
| **Guest Voter** | AlexVoter | `alex@voter.com` | 1-Click Login | ⚡️ Active Voter |
| **System Admin** | Admin Moderator | `admin@coroast.com` | Admin Override | 👑 Super Admin |

---

## 🗺 Directory of Implemented Routes

### Public Consumer Routes
- `/` — Cinematic Arena Homepage, Live 1v1 Battle, Voting, Leaderboard Preview & Perks
- `/battles` — Public Battles Directory with categories and savage filter tabs
- `/battles/new` — Create Battle form for challenging rival brands
- `/brand/add` — 6-Step Brand Onboarding & Identity Customization Wizard
- `/brand/[slug]` — Public Brand Profile page with savage score & battle record
- `/history` — Battle History & Completed Battle Replays
- `/search` — Global Live Search Engine for brands, battles, and categories
- `/leaderboard` — Savage Voter Leaderboard with Top 3 Podium & Brand Ranks
- `/perks` — Winner Perks & Promo Claim Code Modal
- `/how-it-works` — Animated 3-step visual explainer
- `/profile` — Voter User Profile with level progress & claimed perks

### B2B Brand & Corporate Routes
- `/business/login` — Corporate Login with 1-Click Credentials Panel
- `/business/dashboard` — Brand Command Center, Pending Verification Gate, Roast Publisher & Perk Manager
- `/dashboard/analytics` — B2B Telemetry, Campaign Conversion Funnels & Reach Metrics
- `/dashboard/billing` — Monetization Plans (Free, Pro ₹9,999/mo, Campaign ₹49,999+), Payment History & Invoices
- `/dashboard/ai-roast` — AI Roast Generator Studio (Savage, Witty, Playful, Bold comebacks)

### System Admin & Moderation Routes
- `/admin` — System Admin Telemetry Command Center
- `/admin/moderation` — Brand Registration & Roast Moderation Queue

---

## 🛠 Tech Stack Architecture
- **Framework**: Next.js 16 (App Router, Server Actions, Turbopack)
- **Language**: TypeScript
- **Database**: SQLite / PostgreSQL with Prisma ORM
- **Styling**: Vanilla CSS tokens (`app/globals.css`), Tailwind CSS & Framer Motion
- **Icons**: Lucide React
