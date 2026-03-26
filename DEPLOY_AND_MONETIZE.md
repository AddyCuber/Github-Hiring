# SponsorsRank — Deploy & Monetize Roadmap

## Phase 0: Deploy (Day 1-2)

### Critical Blockers (Must Fix)

- [ ] Generate `NEXTAUTH_SECRET` — run `openssl rand -base64 32`, set in Vercel env vars
- [ ] Set `NEXTAUTH_URL` to production domain (currently hardcoded to `http://localhost:3000`)
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain (used in embed iframes in `app/profile/[username]/page.tsx`)
- [ ] Set `TOKEN_ENCRYPTION_SECRET` in Vercel (or it falls back to NEXTAUTH_SECRET — acceptable)

### Deploy to Vercel

- [ ] Push code to GitHub repo
- [ ] Connect repo to Vercel
- [ ] Set env vars in Vercel dashboard (see Environment Variables section below)
- [ ] Deploy — placeholder mode works out of the box, no external services needed

### Environment Variables

| Variable | Required for Deploy? | Notes |
|----------|---------------------|-------|
| `NEXT_PUBLIC_PLACEHOLDER_MODE` | Yes (set `true`) | Enables demo data, no external deps needed |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Your production URL |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as above |
| `TOKEN_ENCRYPTION_SECRET` | No | Falls back to NEXTAUTH_SECRET |
| `SUPABASE_URL` | No (placeholder mode) | Needed for live mode |
| `SUPABASE_ANON_KEY` | No (placeholder mode) | Needed for live mode |
| `SUPABASE_SERVICE_ROLE_KEY` | No (placeholder mode) | Needed for live mode |
| `GITHUB_CLIENT_ID` | No (placeholder mode) | Needed for GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | No (placeholder mode) | Needed for GitHub OAuth |
| `RAZORPAY_KEY_ID` | No (placeholder mode) | Needed for payments |
| `RAZORPAY_KEY_SECRET` | No (placeholder mode) | Needed for payments |
| `CRON_SECRET` | No | Needed for scheduled leaderboard refresh |

### Security Checklist

- [ ] Add `.env` to `.gitignore` (never commit secrets)
- [ ] Move Supabase credentials from `.env` file to Vercel env vars only
- [ ] Remove `verify_supabase.mjs` before deploying (dev-only script)

---

## Phase 1: Pre-Populate Real Data (Day 2-3)

The leaderboard is useless empty. Solve the cold-start problem.

### Scrape Public GitHub Sponsors Data

- [ ] Write a script that queries GitHub GraphQL API for known top sponsored developers
- [ ] Pull: username, avatar, MRR, total lifetime earnings, sponsor count
- [ ] Insert into Supabase `users` table with `is_verified: false` (mark as "unclaimed")
- [ ] Target: 200-500 real developer profiles on day one
- [ ] Add "Claim Your Profile" CTA on unclaimed profiles

### Data Sources for Seeding

- GitHub Sponsors Explore page
- Known top maintainers: Sindre Sorhus, Evan You, Anthony Fu, Caleb Porzio, etc.
- HN "Who is Hiring" threads for companies that sponsor OSS
- npm/crates top package maintainers who have GitHub Sponsors enabled

### Go Live

- [ ] Set `NEXT_PUBLIC_PLACEHOLDER_MODE=false`
- [ ] Set all Supabase env vars in Vercel
- [ ] Run `db/schema.sql` in Supabase
- [ ] Run the seeding script
- [ ] Verify leaderboard shows real data

---

## Phase 2: Launch & Get Users (Day 3-7)

### Launch Channels

- [ ] **Hacker News** — "Show HN: We ranked the top 500 GitHub Sponsors developers by earnings"
- [ ] **Twitter/X** — Tag top-ranked devs, they'll engage and retweet
- [ ] **Reddit** — r/programming, r/opensource, r/webdev
- [ ] **Product Hunt** — classic SaaS launch
- [ ] **Dev.to / Hashnode** — write "The Highest-Earning OSS Developers in 2026"

### Viral Growth Mechanisms

- [ ] **GitHub README badges** — build a `/api/badge/[username]` endpoint that returns an SVG badge devs can embed in their repos
- [ ] **Embeddable profile widgets** — already built at `/embed/[username]`, promote it
- [ ] **Tag devs on socials** — people love seeing themselves ranked

### Growth Targets

| Milestone | When |
|-----------|------|
| 100 verified devs | Week 1 |
| 500 verified devs | Week 2-3 |
| 1,000 verified devs | Month 1 |
| First HN front page | Week 1 (this is the launch catalyst) |

---

## Phase 3: Monetize (Week 2+)

### Revenue Stream 1: Featured Developer — $29/mo (Self-Serve, Fastest)

Zero sales required. Devs buy it themselves.

**What they get:**
- Gold "Featured" badge on leaderboard
- Pinned to top of their earnings tier
- "Open to Work" flag visible to recruiters
- Profile boosted in recruiter search results

**What to build:**
- [ ] Add `featured_developer` plan to Razorpay checkout flow (alongside existing `pro_dev`)
- [ ] Add Featured badge rendering in `LeaderboardTable.tsx`
- [ ] Add sorting boost for featured devs in leaderboard query
- [ ] Add upsell CTA on profile pages: "Get Featured — $29/mo"

### Revenue Stream 2: Job Listings — $299/mo per listing (Self-Serve)

**What to build:**
- [ ] Self-serve "Post a Job" form — company name, title, salary, description, Razorpay payment
- [ ] Job listing approval flow (manual review via Supabase dashboard is fine initially)
- [ ] "Hiring OSS developers? Post here →" CTA on leaderboard and profile pages
- [ ] Job listings appear on `/jobs` and on relevant developer profiles

**Who to target:**
- DevTools companies: Vercel, Supabase, Railway, Planetscale, Turso, Neon, Fly.io
- Companies with "Developer Relations" teams
- Any company posting on HN "Who is Hiring" looking for senior/staff engineers

### Revenue Stream 3: Sponsored Slots — $500-1,500/mo (Light Sales)

Already built in the codebase. Just needs to be sold.

**What to build:**
- [ ] "Advertise Here" CTA on leaderboard page with contact form
- [ ] Self-serve sponsored slot purchase flow (stretch goal)
- [ ] Slot placements: `home_banner`, `leaderboard_banner`, `profile_sidebar`, `recruiter_banner`

**How to sell:**
- Wait until you have traffic numbers from launch
- Email 20 DevTools companies: "SponsorsRank got X visitors last week — all OSS maintainers. Banner spot: $800/mo."

### Revenue Stream 4: Recruiter Subscriptions — $299/mo (After 300+ Profiles)

**What to build:**
- [ ] **Paywall the recruiter dashboard** — this is currently free and open, which means you're giving away the product
- [ ] Free tier: see names and rankings only
- [ ] Paid tier ($299/mo): contact info, "open to work" filter, language/location filter, export to CSV
- [ ] Enforce subscription check in `/api/recruiter/talent` route

**What to fix (already broken):**
- Currently no subscription enforcement — anyone can hit `/api/recruiter/talent` and `/recruiters` page
- Need to check `recruiter_subscriptions` table and gate access

### Pricing Changes

| Plan | Current Price | New Price | Rationale |
|------|--------------|-----------|-----------|
| Pro Dev | $5/mo | **Free** | It's your growth engine, not revenue. Removing the paywall gets more devs verified. |
| Featured Dev | doesn't exist | **$29/mo** | Self-serve upsell, the real dev monetization |
| Job Listing | doesn't exist | **$299/mo** | Per listing, self-serve |
| Recruiter | $49/mo | **$299/mo** | LinkedIn Recruiter is $800+/mo. You're premium niche. |
| Enterprise | $199/mo | **$999/mo** | 10 seats, CSV export, API access |
| Sponsored Slot | $300-1500/mo | **$500-1,500/mo** | Keep as-is, sell manually at first |

---

## Phase 4: Build the Moat (Month 2-3)

### Developer Impact Score (Proprietary Data)

The leaderboard using only GitHub Sponsors data is easy to copy. Aggregate more signals:

- [ ] **npm download counts** — for packages the dev maintains
- [ ] **GitHub stars** — total across their repos
- [ ] **Dependent repos** — how many projects depend on their code
- [ ] **Contribution frequency** — commits/PRs to major OSS projects
- [ ] **Social reach** — Twitter/X followers (optional)

Combine into a single **Impact Score** that's unique to SponsorsRank. This is the moat — no one else has this composite signal.

### Admin Dashboard

- [ ] Manage sponsored slots (create, edit, activate/deactivate)
- [ ] Manage job listings (approve, reject, edit)
- [ ] View recruiter subscriptions and leads
- [ ] View payment history
- [ ] Basic analytics (signups, verifications, revenue)

### Email Automation

- [ ] Payment confirmation emails
- [ ] "Claim your profile" outreach to unclaimed devs
- [ ] Recruiter lead follow-up sequences
- [ ] Weekly leaderboard digest email

### GitHub OAuth (Real Auth)

- [ ] Register GitHub OAuth App
- [ ] Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
- [ ] Test full verification flow: GitHub login → sponsor data sync → profile creation

---

## Revenue Targets

| Milestone | Target | How | Timeline |
|-----------|--------|-----|----------|
| First dollar | $29-299 | 1 featured dev or 1 job listing | Week 2 |
| $1K MRR | ~$1,000 | 3 job listings + 3 featured devs | Week 3-4 |
| $5K MRR | ~$5,000 | 8 job listings + 2 sponsored slots + 20 featured devs | Month 2 |
| $10K MRR | ~$10,000 | 15 job listings + 3 slots + 5 recruiter subs | Month 2-3 |
| $50K MRR | ~$50,000 | Self-serve job board + 30 recruiters + Impact Score API | Month 6-9 |

---

## Current Codebase Status

### What's Already Built & Working
- Public leaderboard with sorting (total/MRR)
- Developer profiles with edit form
- GitHub OAuth verification flow
- Embeddable profile widgets
- Recruiter dashboard with filtering
- Job board page
- Sponsored slot rendering
- Razorpay payment integration (checkout, webhooks, signature verification)
- Full placeholder mode for demo/testing
- Database schema with materialized views and indexes

### What's Missing (Build Priority Order)
1. GitHub README badge endpoint (`/api/badge/[username]`)
2. Recruiter paywall enforcement
3. "Featured Developer" plan + upsell flow
4. Self-serve job posting form
5. "Claim Your Profile" flow for unclaimed profiles
6. Developer Impact Score aggregation
7. Admin dashboard
8. Email notifications
9. CSV export for recruiters
10. API key access for enterprise recruiter plans
