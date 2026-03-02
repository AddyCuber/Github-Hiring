import { JobListing, LeaderboardRow, RecruiterTalent, SponsoredSlot, UserRow } from "@/types"

export function isPlaceholderMode() {
  if (process.env.NEXT_PUBLIC_PLACEHOLDER_MODE === "true") return true
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return true
  return false
}

const now = new Date()
const plusDays = (d: number) => {
  const t = new Date(now)
  t.setDate(t.getDate() + d)
  return t.toISOString()
}

export const placeholderUsers: UserRow[] = [
  {
    id: "u1",
    github_id: 1001,
    github_username: "alexoss",
    name: "Alex Chen",
    avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
    bio: "Building open tooling for teams at scale.",
    github_url: "https://github.com/alexoss",
    total_earnings_usd: 154000,
    monthly_recurring_usd: 7800,
    sponsor_count: 412,
    is_verified: true,
    has_verified_badge: true,
    badge_expires_at: plusDays(20),
    badge_purchased_at: plusDays(-10),
    available_for_hire: true,
    open_to_sponsorship: true,
    profile_tagline: "Maintainer of high-throughput OSS infra",
    primary_language: "TypeScript",
    location: "San Francisco, US",
    hire_email: "alex@sponsorsrank.dev",
    portfolio_links: ["https://alex.dev", "https://github.com/alexoss/core-lib"],
    testimonials: ["Alex shipped critical features in 2 weeks.", "Top-tier OSS systems thinking."],
    pro_plan_expires_at: plusDays(20)
  },
  {
    id: "u2",
    github_id: 1002,
    github_username: "nina-dev",
    name: "Nina Patel",
    avatar_url: "https://avatars.githubusercontent.com/u/19864447?v=4",
    bio: "Rust maintainer focused on reliability and DX.",
    github_url: "https://github.com/nina-dev",
    total_earnings_usd: 98000,
    monthly_recurring_usd: 6400,
    sponsor_count: 289,
    is_verified: true,
    has_verified_badge: true,
    badge_expires_at: plusDays(14),
    badge_purchased_at: plusDays(-16),
    available_for_hire: true,
    open_to_sponsorship: true,
    profile_tagline: "Rust performance + reliability specialist",
    primary_language: "Rust",
    location: "Berlin, DE",
    hire_email: "nina@sponsorsrank.dev",
    portfolio_links: ["https://nina.dev"],
    testimonials: ["Nina is one of the strongest Rust maintainers we worked with."],
    pro_plan_expires_at: plusDays(14)
  },
  {
    id: "u3",
    github_id: 1003,
    github_username: "sam-open",
    name: "Sam Rivera",
    avatar_url: "https://avatars.githubusercontent.com/u/6713784?v=4",
    bio: "Designing OSS data workflows.",
    github_url: "https://github.com/sam-open",
    total_earnings_usd: 61000,
    monthly_recurring_usd: 3500,
    sponsor_count: 181,
    is_verified: true,
    has_verified_badge: false,
    badge_expires_at: null,
    badge_purchased_at: null,
    available_for_hire: false,
    open_to_sponsorship: true,
    profile_tagline: "Data pipelines and developer tooling",
    primary_language: "Go",
    location: "Austin, US",
    hire_email: null,
    portfolio_links: ["https://sam-open.dev"],
    testimonials: [],
    pro_plan_expires_at: null
  }
]

export const placeholderSlots: SponsoredSlot[] = [
  {
    id: "s1",
    slot_type: "banner",
    placement_key: "home_banner",
    sponsor_name: "LaunchFast",
    cta_label: "Hire OSS Engineers",
    cta_url: "https://example.com/launchfast",
    description: "Recruit maintainers with verified sponsor traction.",
    image_url: null,
    price_usd: 1500,
    starts_at: plusDays(-7),
    ends_at: plusDays(30),
    is_active: true
  },
  {
    id: "s2",
    slot_type: "banner",
    placement_key: "leaderboard_banner",
    sponsor_name: "CloudForge",
    cta_label: "Sponsor Top Builders",
    cta_url: "https://example.com/cloudforge",
    description: "Infrastructure credits for OSS maintainers.",
    image_url: null,
    price_usd: 900,
    starts_at: plusDays(-4),
    ends_at: plusDays(24),
    is_active: true
  },
  {
    id: "s3",
    slot_type: "profile",
    placement_key: "profile_sidebar",
    sponsor_name: "VettedHire",
    cta_label: "Post OSS Roles",
    cta_url: "https://example.com/vettedhire",
    description: "Get in front of high-signal open-source engineers.",
    image_url: null,
    price_usd: 300,
    starts_at: plusDays(-2),
    ends_at: plusDays(20),
    is_active: true
  },
  {
    id: "s4",
    slot_type: "banner",
    placement_key: "recruiter_banner",
    sponsor_name: "ScaleTalent",
    cta_label: "Find Maintainers",
    cta_url: "https://example.com/scaletalent",
    description: "Recruit verified OSS talent.",
    image_url: null,
    price_usd: 1200,
    starts_at: plusDays(-2),
    ends_at: plusDays(20),
    is_active: true
  }
]

export const placeholderJobs: JobListing[] = [
  {
    id: "j1",
    company_name: "Vercel",
    title: "Staff OSS Developer Advocate",
    location: "Remote",
    salary_range: "$160k-$220k",
    apply_url: "https://example.com/jobs/vercel-oss",
    description: "Work with maintainers and ship OSS tooling integrations.",
    is_active: true,
    created_at: plusDays(-3)
  },
  {
    id: "j2",
    company_name: "Railway",
    title: "Senior Open Source Engineer",
    location: "Remote",
    salary_range: "$140k-$190k",
    apply_url: "https://example.com/jobs/railway-oss",
    description: "Build platform features used by OSS maintainers worldwide.",
    is_active: true,
    created_at: plusDays(-2)
  },
  {
    id: "j3",
    company_name: "Acme DevTools",
    title: "Maintainer Success Lead",
    location: "Bangalore / Remote",
    salary_range: "$80k-$120k",
    apply_url: "https://example.com/jobs/acme-maintainer",
    description: "Grow sponsor ecosystems and maintainer adoption.",
    is_active: true,
    created_at: plusDays(-1)
  }
]

export function getPlaceholderLeaderboard(sort: "total" | "mrr" = "total", limit = 100): LeaderboardRow[] {
  const rows = [...placeholderUsers]
  rows.sort((a, b) => (sort === "mrr" ? b.monthly_recurring_usd - a.monthly_recurring_usd : b.total_earnings_usd - a.total_earnings_usd))
  return rows.slice(0, limit).map((u, idx) => ({
    rank: idx + 1,
    id: u.id,
    github_username: u.github_username,
    name: u.name,
    avatar_url: u.avatar_url,
    total_earnings_usd: u.total_earnings_usd,
    monthly_recurring_usd: u.monthly_recurring_usd,
    sponsor_count: u.sponsor_count,
    is_verified: u.is_verified,
    has_verified_badge: u.has_verified_badge
  }))
}

export function getPlaceholderTalent(filters: {
  minMrr?: number
  minTotal?: number
  availableOnly?: boolean
  language?: string
  limit?: number
}): RecruiterTalent[] {
  const minMrr = filters.minMrr || 0
  const minTotal = filters.minTotal || 0
  const language = (filters.language || "").toLowerCase()
  const availableOnly = !!filters.availableOnly
  const limit = filters.limit || 50

  const rows = placeholderUsers
    .filter((u) => u.monthly_recurring_usd >= minMrr && u.total_earnings_usd >= minTotal)
    .filter((u) => (availableOnly ? u.available_for_hire : true))
    .filter((u) => (language ? (u.primary_language || "").toLowerCase().includes(language) : true))
    .sort((a, b) => b.monthly_recurring_usd - a.monthly_recurring_usd)
    .slice(0, limit)

  return rows.map((u) => ({
    id: u.id,
    github_username: u.github_username,
    name: u.name,
    avatar_url: u.avatar_url,
    bio: u.bio,
    total_earnings_usd: u.total_earnings_usd,
    monthly_recurring_usd: u.monthly_recurring_usd,
    sponsor_count: u.sponsor_count,
    primary_language: u.primary_language,
    location: u.location,
    available_for_hire: u.available_for_hire,
    open_to_sponsorship: u.open_to_sponsorship,
    has_verified_badge: u.has_verified_badge
  }))
}

export function getPlaceholderSlot(placement: string) {
  return placeholderSlots.find((s) => s.placement_key === placement && s.is_active) || null
}

export function getPlaceholderUser(username: string) {
  return placeholderUsers.find((u) => u.github_username.toLowerCase() === username.toLowerCase()) || null
}

export function getPlaceholderUserByGithubId(githubId: number) {
  return placeholderUsers.find((u) => u.github_id === githubId) || null
}
