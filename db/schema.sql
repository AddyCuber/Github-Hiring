CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  github_id BIGINT UNIQUE NOT NULL,
  github_username VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  github_url TEXT,
  total_earnings_usd INTEGER DEFAULT 0,
  monthly_recurring_usd INTEGER DEFAULT 0,
  sponsor_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  last_synced_at TIMESTAMP,
  github_access_token TEXT,
  has_verified_badge BOOLEAN DEFAULT FALSE,
  badge_purchased_at TIMESTAMP,
  badge_expires_at TIMESTAMP,
  available_for_hire BOOLEAN DEFAULT FALSE,
  open_to_sponsorship BOOLEAN DEFAULT TRUE,
  profile_tagline TEXT,
  primary_language VARCHAR(80),
  location VARCHAR(120),
  hire_email VARCHAR(255),
  portfolio_links JSONB DEFAULT '[]'::jsonb,
  testimonials JSONB DEFAULT '[]'::jsonb,
  pro_plan_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS available_for_hire BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS open_to_sponsorship BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_tagline TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_language VARCHAR(80);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(120);
ALTER TABLE users ADD COLUMN IF NOT EXISTS hire_email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio_links JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS testimonials JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pro_plan_expires_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  plan_type VARCHAR(50) DEFAULT 'pro_dev',
  payer_type VARCHAR(30) DEFAULT 'developer',
  payer_email VARCHAR(255),
  payer_company VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255) UNIQUE,
  razorpay_signature TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'pro_dev';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payer_type VARCHAR(30) DEFAULT 'developer';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payer_email VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payer_company VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS recruiter_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  plan_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  seats INTEGER DEFAULT 1,
  starts_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recruiter_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  plan_interest VARCHAR(50) NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sponsored_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_type VARCHAR(30) NOT NULL,
  placement_key VARCHAR(120) NOT NULL,
  sponsor_name VARCHAR(255) NOT NULL,
  cta_label VARCHAR(80) NOT NULL,
  cta_url TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price_usd INTEGER,
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(120),
  salary_range VARCHAR(120),
  apply_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sponsored_slot_id UUID REFERENCES sponsored_slots(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

DROP MATERIALIZED VIEW IF EXISTS leaderboard_rankings;
CREATE MATERIALIZED VIEW leaderboard_rankings AS
SELECT
  ROW_NUMBER() OVER (ORDER BY sponsor_count DESC, total_earnings_usd DESC) AS rank,
  id,
  github_username,
  name,
  avatar_url,
  total_earnings_usd,
  monthly_recurring_usd,
  sponsor_count,
  is_verified,
  has_verified_badge
FROM users
WHERE sponsor_count > 0 OR is_verified = TRUE
ORDER BY sponsor_count DESC, total_earnings_usd DESC
LIMIT 100;

CREATE OR REPLACE VIEW recruiter_talent_view AS
SELECT
  id,
  github_username,
  name,
  avatar_url,
  bio,
  total_earnings_usd,
  monthly_recurring_usd,
  sponsor_count,
  primary_language,
  location,
  available_for_hire,
  open_to_sponsorship,
  has_verified_badge
FROM users
WHERE sponsor_count > 0 OR is_verified = TRUE
ORDER BY sponsor_count DESC, monthly_recurring_usd DESC;

CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
CREATE INDEX IF NOT EXISTS idx_users_earnings ON users(total_earnings_usd DESC);
CREATE INDEX IF NOT EXISTS idx_users_hireable ON users(available_for_hire, monthly_recurring_usd DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_slots_placement ON sponsored_slots(placement_key, is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON job_listings(is_active, created_at DESC);

CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW leaderboard_rankings;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
