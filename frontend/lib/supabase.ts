// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client for fetching images, and content in the UI
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client using Service Role Key for background sync (write access)
// WARNING:do no expose to the client!
export const getAdminSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
};