import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Env } from "@/types";

export function getSupabaseClient(env: Env): SupabaseClient {
  try {
    return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false, // Important for serverless
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (error) {
    console.error("Error creating Supabase client:", error);
  }
}
