import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Public routes that never require authentication
    const exactPublicRoutes = ["/", "/login", "/signup", "/verify-email"];
    const prefixPublicRoutes = ["/auth/callback"];
    // Public API routes (read-only)
    const publicApiRoutes = ["/api/courses", "/api/patterns"];

    const isPublicRoute =
        exactPublicRoutes.includes(pathname) ||
        prefixPublicRoutes.some((route) => pathname.startsWith(route)) ||
        publicApiRoutes.some((route) => pathname === route);

    // 1. Redirect unauthenticated users to login
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // 2. Redirect authenticated users away from auth pages
    if (user && (pathname === "/login" || pathname === "/signup")) {
        const url = request.nextUrl.clone();
        url.pathname = "/chat";
        return NextResponse.redirect(url);
    }

    // 3. Enforce onboarding completion for authenticated dashboard/onboarding routes
    const dashboardRoutes = ["/chat", "/courses", "/patterns", "/profile"];
    const isOnboardingRoute = pathname.startsWith("/onboarding");
    const isDashboardRoute = dashboardRoutes.some((r) => pathname.startsWith(r));

    // Only query the profile ONCE if we need to check onboarding status
    if (user && (isDashboardRoute || isOnboardingRoute)) {
        try {
            const { data: profile } = await supabase
                .from("user_profiles")
                .select("onboarding_completed")
                .eq("id", user.id)
                .single();

            const onboardingCompleted = !!profile?.onboarding_completed;

            // Redirect incomplete users away from dashboard to onboarding
            if (isDashboardRoute && !onboardingCompleted) {
                const url = request.nextUrl.clone();
                url.pathname = "/onboarding/step-1";
                return NextResponse.redirect(url);
            }

            // Redirect completed users away from onboarding to dashboard
            if (isOnboardingRoute && onboardingCompleted) {
                const url = request.nextUrl.clone();
                url.pathname = "/chat";
                return NextResponse.redirect(url);
            }
        } catch {
            // Profile not found — redirect to onboarding if on dashboard, let continue if on onboarding
            if (isDashboardRoute) {
                const url = request.nextUrl.clone();
                url.pathname = "/onboarding/step-1";
                return NextResponse.redirect(url);
            }
        }
    }

    return supabaseResponse;
}
