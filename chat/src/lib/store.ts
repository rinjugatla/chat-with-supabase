import { createClient } from "@supabase/supabase-js";
import { readonly, writable } from "svelte/store";
import type { Database } from "./types/supabase";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";

const writableSupabase = writable(createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY));
export const supabase = readonly(writableSupabase);
