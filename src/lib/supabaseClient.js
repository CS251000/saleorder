"use client";

import { createClient } from "@supabase/supabase-js";

// ✅ These come from your Supabase project settings (API tab)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ✅ Create a single reusable client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
