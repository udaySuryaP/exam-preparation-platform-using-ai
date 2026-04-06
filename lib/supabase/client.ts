import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("❌ Supabase env vars missing", {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseAnonKey,
        });
        throw new Error("Supabase environment variables are missing");
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}