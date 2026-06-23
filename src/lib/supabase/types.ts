export type UserRole = "user" | "toppertje" | "admin" | "superadmin";
export type Pronoun = "vent" | "griet" | "neutraal";
export type LocationStatus = "pending" | "published" | "rejected";
export type CityStatus = "live" | "coming_soon";
export type VoteType = "up" | "down";
export type TagCategory = "gezelschap" | "vibe" | "setting";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          display_name: string;
          pronoun: Pronoun;
          role: UserRole;
          approved_count: number;
          created_at: string;
          banned_at: string | null;
          notif_spot_approved: boolean;
          notif_milestones: boolean;
          notif_city_news: boolean;
          notif_digest: boolean;
          notif_reengage: boolean;
          points: number;
          level: number;
          current_streak: number;
          longest_streak: number;
          last_active_on: string | null;
        };
        Insert: {
          id: string;
          display_name: string;
          pronoun?: Pronoun;
          role?: UserRole;
          approved_count?: number;
          banned_at?: string | null;
          notif_spot_approved?: boolean;
          notif_milestones?: boolean;
          notif_city_news?: boolean;
          notif_digest?: boolean;
          notif_reengage?: boolean;
          points?: number;
          level?: number;
          current_streak?: number;
          longest_streak?: number;
          last_active_on?: string | null;
        };
        Update: Partial<{
          display_name: string;
          pronoun: Pronoun;
          role: UserRole;
          approved_count: number;
          banned_at: string | null;
          notif_spot_approved: boolean;
          notif_milestones: boolean;
          notif_city_news: boolean;
          notif_digest: boolean;
          notif_reengage: boolean;
          points: number;
          level: number;
          current_streak: number;
          longest_streak: number;
          last_active_on: string | null;
        }>;
      };
      cities: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status: CityStatus;
          live_since: string | null;
        };
        Insert: {
          name: string;
          slug: string;
          status?: CityStatus;
          live_since?: string | null;
        };
        Update: Partial<{
          name: string;
          slug: string;
          status: CityStatus;
          live_since: string | null;
        }>;
      };
      locations: {
        Row: {
          id: string;
          name: string;
          address: string;
          city_id: string;
          neighborhood: string | null;
          lat: number | null;
          lng: number | null;
          image_url: string | null;
          status: LocationStatus;
          submitted_by: string;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          address: string;
          city_id: string;
          neighborhood?: string | null;
          lat?: number | null;
          lng?: number | null;
          image_url?: string | null;
          status?: LocationStatus;
          submitted_by: string;
        };
        Update: Partial<{
          name: string;
          address: string;
          city_id: string;
          neighborhood: string | null;
          lat: number | null;
          lng: number | null;
          image_url: string | null;
          status: LocationStatus;
          approved_by: string | null;
          approved_at: string | null;
        }>;
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: TagCategory;
          emoji: string;
          sort_order: number;
        };
        Insert: {
          name: string;
          slug: string;
          category: TagCategory;
          emoji: string;
          sort_order?: number;
        };
        Update: Partial<{
          name: string;
          slug: string;
          category: TagCategory;
          emoji: string;
          sort_order: number;
        }>;
      };
      location_tags: {
        Row: {
          id: string;
          location_id: string;
          tag_id: string;
          motivation: string | null;
          score: number;
          total_votes: number;
          hidden_at: string | null;
        };
        Insert: {
          location_id: string;
          tag_id: string;
          motivation?: string | null;
          score?: number;
          total_votes?: number;
        };
        Update: Partial<{
          motivation: string | null;
          score: number;
          total_votes: number;
          hidden_at: string | null;
        }>;
      };
      votes: {
        Row: {
          id: string;
          user_id: string;
          location_tag_id: string;
          vote_type: VoteType;
          created_at: string;
        };
        Insert: {
          user_id: string;
          location_tag_id: string;
          vote_type: VoteType;
        };
        Update: Partial<{
          vote_type: VoteType;
        }>;
      };
      waitlist_signups: {
        Row: {
          id: string;
          email: string;
          city_id: string;
          search_context: string | null;
          created_at: string;
        };
        Insert: {
          email: string;
          city_id: string;
          search_context?: string | null;
        };
        Update: Partial<{
          email: string;
          city_id: string;
          search_context: string | null;
        }>;
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          location_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          location_id: string;
        };
        Update: Partial<{
          user_id: string;
          location_id: string;
        }>;
      };
      point_events: {
        Row: {
          id: string;
          user_id: string;
          kind: string;
          points: number;
          ref_id: string | null;
          city_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          kind: string;
          points: number;
          ref_id?: string | null;
          city_id?: string | null;
        };
        Update: Partial<{
          points: number;
        }>;
      };
      badges: {
        Row: {
          slug: string;
          name: string;
          description: string;
          emoji: string;
          sort_order: number;
        };
        Insert: {
          slug: string;
          name: string;
          description: string;
          emoji: string;
          sort_order?: number;
        };
        Update: Partial<{
          name: string;
          description: string;
          emoji: string;
          sort_order: number;
        }>;
      };
      user_badges: {
        Row: {
          user_id: string;
          badge_slug: string;
          earned_at: string;
        };
        Insert: {
          user_id: string;
          badge_slug: string;
        };
        Update: Partial<{
          earned_at: string;
        }>;
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string | null;
        };
        Update: Partial<{
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent: string | null;
        }>;
      };
      notification_queue: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          payload: Record<string, unknown>;
          dedupe_key: string | null;
          status: string;
          attempts: number;
          created_at: string;
          sent_at: string | null;
        };
        Insert: {
          user_id: string;
          category: string;
          payload: Record<string, unknown>;
          dedupe_key?: string | null;
          status?: string;
          attempts?: number;
          sent_at?: string | null;
        };
        Update: Partial<{
          status: string;
          attempts: number;
          sent_at: string | null;
        }>;
      };
      location_milestones: {
        Row: {
          location_id: string;
          milestone: number;
          notified_at: string;
        };
        Insert: {
          location_id: string;
          milestone: number;
          notified_at?: string;
        };
        Update: Partial<{
          notified_at: string;
        }>;
      };
      admin_audit_log: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_type: string;
          target_id: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          admin_id: string;
          action: string;
          target_type: string;
          target_id?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Update: Partial<{
          action: string;
          target_type: string;
          target_id: string | null;
          metadata: Record<string, unknown> | null;
        }>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      enqueue_weekly_digests: {
        Args: Record<string, never>;
        Returns: number;
      };
      enqueue_reengagement: {
        Args: Record<string, never>;
        Returns: number;
      };
      complete_profile: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      get_leaderboard: {
        Args: { p_period?: string; p_city?: string | null; p_limit?: number };
        Returns: {
          user_id: string;
          display_name: string;
          level: number;
          points: number;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      pronoun: Pronoun;
      location_status: LocationStatus;
      city_status: CityStatus;
      vote_type: VoteType;
      tag_category: TagCategory;
    };
  };
}
