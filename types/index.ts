export type UserRow = {
  id: string
  github_id: number
  github_username: string
  name: string | null
  avatar_url: string | null
  bio: string | null
  github_url: string | null
  total_earnings_usd: number
  monthly_recurring_usd: number
  sponsor_count: number
  is_verified: boolean
  has_verified_badge: boolean
  badge_expires_at: string | null
  badge_purchased_at: string | null
  available_for_hire: boolean
  open_to_sponsorship: boolean
  profile_tagline: string | null
  primary_language: string | null
  location: string | null
  hire_email: string | null
  portfolio_links: string[] | null
  testimonials: string[] | null
  pro_plan_expires_at: string | null
}

export type LeaderboardRow = {
  rank: number
  id: string
  github_username: string
  name: string | null
  avatar_url: string | null
  total_earnings_usd: number
  monthly_recurring_usd: number
  sponsor_count: number
  is_verified: boolean
  has_verified_badge: boolean
}

export type SponsoredSlot = {
  id: string
  slot_type: "banner" | "profile" | "job"
  placement_key: string
  sponsor_name: string
  cta_label: string
  cta_url: string
  description: string | null
  image_url: string | null
  price_usd: number | null
  starts_at: string
  ends_at: string
  is_active: boolean
}

export type JobListing = {
  id: string
  company_name: string
  title: string
  location: string | null
  salary_range: string | null
  apply_url: string
  description: string | null
  is_active: boolean
  created_at: string
}

export type RecruiterTalent = {
  id: string
  github_username: string
  name: string | null
  avatar_url: string | null
  bio: string | null
  total_earnings_usd: number
  monthly_recurring_usd: number
  sponsor_count: number
  primary_language: string | null
  location: string | null
  available_for_hire: boolean
  open_to_sponsorship: boolean
  has_verified_badge: boolean
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserRow
        Insert: Partial<UserRow> & { github_id: number; github_username: string }
        Update: Partial<UserRow>
      }
      payments: {
        Row: {
          id: string
          user_id: string | null
          amount: number
          currency: string
          plan_type: string
          payer_type: string
          payer_email: string | null
          payer_company: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string
          created_at: string
        }
        Insert: {
          user_id?: string | null
          amount: number
          currency?: string
          plan_type?: string
          payer_type?: string
          payer_email?: string | null
          payer_company?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
        }
        Update: Partial<{
          user_id: string | null
          amount: number
          currency: string
          plan_type: string
          payer_type: string
          payer_email: string | null
          payer_company: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string
        }>
      }
    }
    Views: {
      leaderboard_rankings: {
        Row: LeaderboardRow
      }
      recruiter_talent_view: {
        Row: RecruiterTalent
      }
    }
    Functions: {
      refresh_leaderboard: {
        Args: Record<string, never>
        Returns: void
      }
    }
  }
}
