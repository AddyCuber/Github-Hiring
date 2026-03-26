#!/usr/bin/env node

/**
 * Seed the leaderboard with real GitHub Sponsors data.
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_xxx SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/seed-leaderboard.mjs
 *
 * The GitHub token needs `read:user` scope (no special sponsors scope needed for public data).
 * This script queries public sponsorship info for a list of known OSS maintainers.
 */

import { createClient } from "@supabase/supabase-js"

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!GITHUB_TOKEN) {
  console.error("Missing GITHUB_TOKEN. Create one at https://github.com/settings/tokens with read:user scope.")
  process.exit(1)
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Known OSS maintainers with GitHub Sponsors enabled.
// Expand this list as needed. These are public figures with public sponsorship data.
const KNOWN_SPONSORED_DEVS = [
  "sindresorhus",
  "antfu",
  "egoist",
  "patak-dev",
  "pi0",
  "danielroe",
  "posva",
  "privatenumber",
  "sxzz",
  "harlan-zw",
  "unjs",
  "nuxt",
  "vitejs",
  "TomerAberworking",
  "calcom",
  "shadcn",
  "tanstack",
  "trpc",
  "t3-oss",
  "drizzle-team",
  "colinhacks",
  "mattpocock",
  "wesbos",
  "kentcdodds",
  "leerob",
  "theprimeagen",
  "tj",
  "substack",
  "mdo",
  "fat",
  "yyx990803",
  "Rich-Harris",
  "developit",
  "mhevery",
  "BurntSushi",
  "dtolnay",
  "sharkdp",
  "ogham",
  "XAMPPRocky",
  "nickel-org",
  "seanmonstar",
  "hyperium",
  "tokio-rs",
  "bevyengine",
  "getzola",
  "starship",
  "nushell",
  "helix-editor",
  "ajeetdsouza",
  "casey",
  "astral-sh",
  "charliermarsh",
  "tiangolo",
  "pydantic",
  "pallets",
  "encode",
  "django",
  "psf",
  "dateutil",
  "jazzband",
]

// NOTE: monthlyEstimatedSponsorsIncomeInCents is only visible to the account owner.
// For third-party queries it returns 0. We use sponsor count as the public signal
// and set MRR/total to 0 — real earnings populate when devs verify via OAuth.
const GRAPHQL_QUERY = `
query($login: String!) {
  user(login: $login) {
    databaseId
    login
    name
    avatarUrl
    bio
    url
    location
    hasSponsorsListing
    sponsors {
      totalCount
    }
    sponsorsListing {
      fullDescription
    }
    repositories(first: 3, orderBy: {field: STARGAZERS, direction: DESC}) {
      totalCount
      nodes {
        stargazerCount
        primaryLanguage {
          name
        }
      }
    }
    followers {
      totalCount
    }
  }
}
`

async function fetchUser(login) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: GRAPHQL_QUERY, variables: { login } })
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`  GitHub API error for ${login}: ${res.status} ${text}`)
    return null
  }

  const json = await res.json()

  if (json.errors) {
    console.error(`  GraphQL error for ${login}:`, json.errors[0]?.message)
    return null
  }

  return json.data?.user || null
}

async function main() {
  console.log(`Seeding leaderboard with ${KNOWN_SPONSORED_DEVS.length} developers...\n`)

  let inserted = 0
  let skipped = 0
  let errored = 0

  // Deduplicate
  const uniqueDevs = [...new Set(KNOWN_SPONSORED_DEVS.map((d) => d.toLowerCase()))]

  for (const login of uniqueDevs) {
    try {
      const user = await fetchUser(login)

      if (!user) {
        skipped++
        continue
      }

      if (!user.hasSponsorsListing) {
        console.log(`  ${login}: no sponsors listing, skipping`)
        skipped++
        continue
      }

      const sponsorCount = user.sponsors?.totalCount || 0
      const totalStars = (user.repositories?.nodes || []).reduce((sum, r) => sum + (r.stargazerCount || 0), 0)
      const primaryLanguage = user.repositories?.nodes?.[0]?.primaryLanguage?.name || null
      const followers = user.followers?.totalCount || 0

      // MRR and total earnings are private — only populated when devs verify via OAuth.
      // We set them to 0 here. Sponsor count + stars serve as the public ranking signal.
      const { error } = await supabase.from("users").upsert(
        {
          github_id: user.databaseId,
          github_username: user.login,
          name: user.name,
          avatar_url: user.avatarUrl,
          bio: user.bio,
          github_url: user.url,
          total_earnings_usd: 0,
          monthly_recurring_usd: 0,
          sponsor_count: sponsorCount,
          is_verified: false,
          has_verified_badge: false,
          available_for_hire: false,
          open_to_sponsorship: true,
          primary_language: primaryLanguage,
          location: user.location
        },
        { onConflict: "github_id" }
      )

      if (error) {
        console.error(`  ${login}: DB error — ${error.message}`)
        errored++
      } else {
        console.log(`  ${login}: ${sponsorCount} sponsors, ${totalStars} stars, ${followers} followers, ${primaryLanguage || "??"}`)
        inserted++
      }

      // Rate limit: 1 request per 200ms to stay well within GitHub's limits
      await new Promise((r) => setTimeout(r, 200))
    } catch (err) {
      console.error(`  ${login}: ${err.message}`)
      errored++
    }
  }

  // Refresh materialized view
  console.log("\nRefreshing leaderboard materialized view...")
  const { error: rpcError } = await supabase.rpc("refresh_leaderboard")
  if (rpcError) {
    console.error("Failed to refresh leaderboard:", rpcError.message)
  }

  console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}, Errors: ${errored}`)
}

main().catch(console.error)
