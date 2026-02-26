import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase Auth Callback Route
 *
 * Supabase uses PKCE flow — when a user clicks the verification email link,
 * Supabase redirects here with a `code` query parameter.
 * We exchange that code for a session, then redirect the user appropriately:
 *   - New user (onboarding not done) → /onboarding/step-1
 *   - Returning user (onboarding done) → /chat
 *   - Error → /login?error=...
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/chat";

    if (!code) {
        // No code — something went wrong with the email link
        return NextResponse.redirect(
            new URL("/login?error=missing_code", request.url)
        );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    // Exchange the code for a real session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("[Auth Callback] Code exchange failed:", error.message);
        return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
        );
    }

    // Session is now established — check if onboarding is done
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: profile } = await supabase
        .from("user_profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

    // New user → go to onboarding
    if (!profile?.onboarding_completed) {
        return NextResponse.redirect(new URL("/onboarding/step-1", request.url));
    }

    // Existing user → go to the intended destination (default: /chat)
    return NextResponse.redirect(new URL(next, request.url));
}
