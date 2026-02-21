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
    const publicRoutes = ["/", "/login", "/signup", "/verify-email"];
    // Public API routes (read-only)
    const publicApiRoutes = ["/api/courses", "/api/patterns"];

    const isPublicRoute =
        publicRoutes.some((route) => pathname === route) ||
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

    // 3. Enforce onboarding completion for authenticated dashboard routes
    const dashboardRoutes = ["/chat", "/courses", "/patterns", "/profile"];
    const onboardingRoutes = ["/onboarding"];
    const isDashboardRoute = dashboardRoutes.some((r) => pathname.startsWith(r));
    const isOnboardingRoute = onboardingRoutes.some((r) => pathname.startsWith(r));

    if (user && isDashboardRoute) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
            .from("user_profiles")
            .select("onboarding_completed")
            .eq("id", user.id)
            .single();

        if (!profile?.onboarding_completed) {
            const url = request.nextUrl.clone();
            url.pathname = "/onboarding/step-1";
            return NextResponse.redirect(url);
        }
    }

    // 4. Redirect authenticated users who completed onboarding away from onboarding steps
    if (user && isOnboardingRoute) {
        const { data: profile } = await supabase
            .from("user_profiles")
            .select("onboarding_completed")
            .eq("id", user.id)
            .single();

        if (profile?.onboarding_completed) {
            const url = request.nextUrl.clone();
            url.pathname = "/chat";
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}
