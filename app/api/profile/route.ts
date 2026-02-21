import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

const PROFILE_RATE_LIMIT = { maxRequests: 10, windowSeconds: 60 };

export async function GET() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        // Count only THIS user's messages (via their conversations)
        const { count: questionCount } = await supabase
            .from("messages")
            .select("*, conversations!inner(user_id)", { count: "exact", head: true })
            .eq("role", "user")
            .eq("conversations.user_id", user.id);

        const { data: progressData } = await supabase
            .from("user_progress")
            .select("study_time_minutes, course_id, courses(course_name)")
            .eq("user_id", user.id)
            .order("study_time_minutes", { ascending: false });

        const totalStudyTime = (progressData || []).reduce(
            (sum: number, p: { study_time_minutes?: number }) => sum + (p.study_time_minutes || 0),
            0
        );

        const topSubject = progressData?.[0]
            ? (progressData[0] as unknown as { courses: { course_name: string } })?.courses?.course_name || "N/A"
            : "N/A";

        return NextResponse.json({
            profile: profile || {
                full_name: user.user_metadata?.full_name || "",
                email: user.email || "",
                college_name: "",
                branch: "",
                semester: 1,
            },
            stats: {
                questions: questionCount || 0,
                studyTime: totalStudyTime,
                favSubject: topSubject,
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting
        const rateResult = await checkRateLimit(`profile:${user.id}`, PROFILE_RATE_LIMIT);
        if (!rateResult.allowed) {
            return NextResponse.json(
                { error: "Too many requests. Please wait a moment." },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { full_name, college_name, branch, semester } = body;

        // Validate inputs
        if (typeof full_name !== "string" || full_name.trim().length < 2 || full_name.length > 100) {
            return NextResponse.json(
                { error: "Name must be 2-100 characters" },
                { status: 400 }
            );
        }

        if (typeof college_name !== "string" || college_name.length > 200) {
            return NextResponse.json(
                { error: "Invalid college name" },
                { status: 400 }
            );
        }

        if (typeof branch !== "string" || branch.length > 50) {
            return NextResponse.json(
                { error: "Invalid department" },
                { status: 400 }
            );
        }

        const semesterNum = Number(semester);
        if (!Number.isInteger(semesterNum) || semesterNum < 1 || semesterNum > 8) {
            return NextResponse.json(
                { error: "Semester must be 1-8" },
                { status: 400 }
            );
        }

        // Update user_profiles table
        const { error: upsertError } = await supabase
            .from("user_profiles")
            .upsert({
                id: user.id,
                full_name: full_name.trim(),
                email: user.email || "",
                college_name: college_name.trim(),
                branch: branch.trim(),
                semester: semesterNum,
                onboarding_completed: true,
            });

        if (upsertError) {
            return NextResponse.json(
                { error: "Failed to update profile" },
                { status: 500 }
            );
        }

        // Also update Supabase auth user metadata so name reflects everywhere
        const serviceClient = await createServiceClient();
        await serviceClient.auth.admin.updateUserById(user.id, {
            user_metadata: {
                ...user.user_metadata,
                full_name: full_name.trim(),
            },
        });

        return NextResponse.json({
            success: true,
            profile: {
                full_name: full_name.trim(),
                email: user.email,
                college_name: college_name.trim(),
                branch: branch.trim(),
                semester: semesterNum,
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
