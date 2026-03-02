-- Run after db/schema.sql when you want prefilled demo content

INSERT INTO users (
  id, github_id, github_username, name, avatar_url, bio, github_url,
  total_earnings_usd, monthly_recurring_usd, sponsor_count,
  is_verified, verified_at, last_synced_at,
  has_verified_badge, badge_purchased_at, badge_expires_at,
  available_for_hire, open_to_sponsorship, profile_tagline,
  primary_language, location, hire_email, portfolio_links, testimonials, pro_plan_expires_at
) VALUES
(
  '11111111-1111-1111-1111-111111111111', 1001, 'alexoss', 'Alex Chen',
  'https://avatars.githubusercontent.com/u/583231?v=4',
  'Building open tooling for teams at scale.',
  'https://github.com/alexoss',
  154000, 7800, 412,
  TRUE, NOW(), NOW(),
  TRUE, NOW() - interval '10 day', NOW() + interval '20 day',
  TRUE, TRUE, 'Maintainer of high-throughput OSS infra',
  'TypeScript', 'San Francisco, US', 'alex@sponsorsrank.dev',
  '["https://alex.dev","https://github.com/alexoss/core-lib"]'::jsonb,
  '["Alex shipped critical features in 2 weeks.","Top-tier OSS systems thinking."]'::jsonb,
  NOW() + interval '20 day'
),
(
  '22222222-2222-2222-2222-222222222222', 1002, 'nina-dev', 'Nina Patel',
  'https://avatars.githubusercontent.com/u/19864447?v=4',
  'Rust maintainer focused on reliability and DX.',
  'https://github.com/nina-dev',
  98000, 6400, 289,
  TRUE, NOW(), NOW(),
  TRUE, NOW() - interval '16 day', NOW() + interval '14 day',
  TRUE, TRUE, 'Rust performance + reliability specialist',
  'Rust', 'Berlin, DE', 'nina@sponsorsrank.dev',
  '["https://nina.dev"]'::jsonb,
  '["Nina is one of the strongest Rust maintainers we worked with."]'::jsonb,
  NOW() + interval '14 day'
),
(
  '33333333-3333-3333-3333-333333333333', 1003, 'sam-open', 'Sam Rivera',
  'https://avatars.githubusercontent.com/u/6713784?v=4',
  'Designing OSS data workflows.',
  'https://github.com/sam-open',
  61000, 3500, 181,
  TRUE, NOW(), NOW(),
  FALSE, NULL, NULL,
  FALSE, TRUE, 'Data pipelines and developer tooling',
  'Go', 'Austin, US', NULL,
  '["https://sam-open.dev"]'::jsonb,
  '[]'::jsonb,
  NULL
)
ON CONFLICT (github_id) DO NOTHING;

INSERT INTO sponsored_slots (
  id, slot_type, placement_key, sponsor_name, cta_label, cta_url, description, price_usd, starts_at, ends_at, is_active
) VALUES
(
  'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'banner', 'home_banner', 'LaunchFast',
  'Hire OSS Engineers', 'https://example.com/launchfast',
  'Recruit maintainers with verified sponsor traction.', 1500,
  NOW() - interval '7 day', NOW() + interval '30 day', TRUE
),
(
  'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'banner', 'leaderboard_banner', 'CloudForge',
  'Sponsor Top Builders', 'https://example.com/cloudforge',
  'Infrastructure credits for OSS maintainers.', 900,
  NOW() - interval '4 day', NOW() + interval '24 day', TRUE
),
(
  'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'profile', 'profile_sidebar', 'VettedHire',
  'Post OSS Roles', 'https://example.com/vettedhire',
  'Get in front of high-signal open-source engineers.', 300,
  NOW() - interval '2 day', NOW() + interval '20 day', TRUE
),
(
  'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'banner', 'recruiter_banner', 'ScaleTalent',
  'Find Maintainers', 'https://example.com/scaletalent',
  'Recruit verified OSS talent.', 1200,
  NOW() - interval '2 day', NOW() + interval '20 day', TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO job_listings (
  id, company_name, title, location, salary_range, apply_url, description, is_active
) VALUES
(
  'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'Vercel', 'Staff OSS Developer Advocate', 'Remote', '$160k-$220k',
  'https://example.com/jobs/vercel-oss',
  'Work with maintainers and ship OSS tooling integrations.', TRUE
),
(
  'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'Railway', 'Senior Open Source Engineer', 'Remote', '$140k-$190k',
  'https://example.com/jobs/railway-oss',
  'Build platform features used by OSS maintainers worldwide.', TRUE
),
(
  'bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'Acme DevTools', 'Maintainer Success Lead', 'Bangalore / Remote', '$80k-$120k',
  'https://example.com/jobs/acme-maintainer',
  'Grow sponsor ecosystems and maintainer adoption.', TRUE
)
ON CONFLICT (id) DO NOTHING;

SELECT refresh_leaderboard();
