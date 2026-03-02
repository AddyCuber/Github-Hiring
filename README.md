# SponsorsRank (Pivoted MVP)

Revenue-intelligence product for OSS hiring: public GitHub Sponsors leaderboard + recruiter talent discovery + paid plans.

## Modes

- Placeholder mode (default): works without Supabase/GitHub/Razorpay using built-in demo data.
- Live mode: uses real Supabase, GitHub OAuth and Razorpay.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Start in placeholder mode (already enabled by default in `.env.example`):

```bash
npm run dev
```

## Live mode setup

1. Set `NEXT_PUBLIC_PLACEHOLDER_MODE=false` in `.env.local`
2. Fill all GitHub/Supabase/Razorpay env vars
3. Run schema in Supabase:
   - `/Users/adityaray/Documents/New project/db/schema.sql`
4. Optional demo seed in Supabase:
   - `/Users/adityaray/Documents/New project/db/seed_placeholders.sql`

## Core pages

- `/` B2B landing page
- `/leaderboard` public rankings
- `/verify` GitHub verify + sync
- `/profile/[username]` developer profile
- `/embed/[username]` shareable profile widget
- `/recruiters` recruiter dashboard + lead capture
- `/jobs` sponsored job board
- `/pro` Pro Dev feature page
- `/checkout` plan checkout (`pro_dev`, `recruiter`, `enterprise`)

## API routes

- `POST /api/sync-sponsors`
- `GET /api/leaderboard?sort=total|mrr&limit=100`
- `GET /api/recruiter/talent`
- `POST /api/recruiter-leads`
- `GET /api/sponsored-slots`
- `GET /api/jobs`
- `POST /api/profile/preferences`
- `POST /api/create-order`
- `POST /api/webhooks/razorpay`
- `POST /api/refresh-leaderboard` (requires `x-cron-secret`)

## Notes

- Placeholder mode returns realistic demo responses for all data flows.
- GitHub token is encrypted before storage in live mode.
- Razorpay signature is verified server-side in live mode.
