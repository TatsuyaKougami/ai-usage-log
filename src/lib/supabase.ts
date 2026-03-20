import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[supabase] Missing env vars. Check .env.local and restart the dev server.");
} else {
  console.log("[supabase] URL:", supabaseUrl);
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);