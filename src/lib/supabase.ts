import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Lazy initialization - only create client when actually used
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Missing Supabase environment variables. Please check your .env.local file."
      );
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return _supabase;
}

// For backward compatibility - export a proxy that lazily initializes
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabase();
    return (client as any)[prop];
  },
});

// Database types
export type Host = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
  deleted_at: string | null;
};

export type Session = {
  id: string;
  code: string;
  name: string;
  date: string;
  location: string;
  num_courts: number;
  scoring_rule: string;
  rounds_per_player: number;
  non_member_fee: number;
  shuttle_price: number;
  status: string;
  host_id: string;
  host_name: string;
  matches_generated: boolean;
  created_at: string;
  deleted_at: string | null;
};

export type Player = {
  id: string;
  session_id: string;
  name: string;
  is_member: boolean;
  fee: number;
  shuttlecocks: number;
  paid: boolean;
  created_at: string;
};

export type Match = {
  id: string;
  session_id: string;
  court: number;
  round: number;
  order: number;
  team_a: string[];
  team_b: string[];
  team_a_names: string[];
  team_b_names: string[];
  score_a: number;
  score_b: number;
  status: string;
  winner: string | null;
  created_at: string;
};
