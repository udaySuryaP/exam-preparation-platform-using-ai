"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { ReferralOptions } from "@/components/onboarding/ReferralOptions";
import { createClient } from "@/lib/supabase/client";

export default function Step4Page() {
    const router = useRouter();
    const [referral, setReferral] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComplete = async () => {
        setIsSubmitting(true);

        let existing: Record<string, unknown> = {};
        try {
            existing = JSON.parse(localStorage.getItem("onboarding") || "{}");
        } catch {
            existing = {};
        }
        const onboardingData: Record<string, unknown> = { ...existing, referral };

        // Validate critical fields
        const collegeName = typeof onboardingData.college === "string"
            ? onboardingData.college.slice(0, 200)
            : "";
        const gradYear = Number(onboardingData.graduationYear);
        const validGradYear = Number.isInteger(gradYear) && gradYear >= 2020 && gradYear <= 2035
            ? gradYear
            : 2025;
        const branch = typeof onboardingData.department === "string"
            ? onboardingData.department.slice(0, 50)
            : "";
        const semester = Number(onboardingData.semester);
        const validSemester = Number.isInteger(semester) && semester >= 1 && semester <= 8
            ? semester
            : 1;

        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user) {
            await supabase.from("user_profiles").upsert({
                id: user.id,
                full_name: user.user_metadata?.full_name || "",
                email: user.email,
                college_name: collegeName,
                graduation_year: validGradYear,
                branch: branch,
                semester: validSemester,
                referral_source: referral,
                onboarding_completed: true,
            });
        }

        localStorage.removeItem("onboarding");
        router.push("/chat");
        router.refresh();
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <ProgressIndicator currentStep={4} />

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                How did you hear about us?
            </h1>
            <p className="text-gray-500 text-sm text-center mb-8">
                Help us reach more students like you
            </p>

            <ReferralOptions value={referral} onChange={setReferral} />

            <div className="flex gap-3 mt-8">
                <button
                    onClick={() => router.push("/step-3")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={handleComplete}
                    disabled={!referral || isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4" />
                    )}
                    {isSubmitting ? "Setting up..." : "Get Started"}
                </button>
            </div>
        </div>
    );
}
