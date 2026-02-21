// import { OTPInput } from "@/components/auth/OTPInput";
// import type { Metadata } from "next";

// export const metadata: Metadata = {
//     title: "Verify Email — KTU Exam Prep AI",
//     description: "Verify your email address",
// };

// export default function VerifyEmailPage() {
//     return <OTPInput />;
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MailCheck, Loader2, RefreshCcw } from "lucide-react";

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const supabase = createClient();

    const [checking, setChecking] = useState(true);
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState("");

    // Check if user is already verified
    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();

            if (data.session?.user?.email_confirmed_at) {
                router.replace("/chat");
                return;
            }

            setChecking(false);
        };

        checkSession();
    }, [router, supabase]);

    const resendEmail = async () => {
        if (!email) return;

        setResending(true);
        setMessage("");

        const { error } = await supabase.auth.resend({
            type: "signup",
            email,
        });

        if (error) {
            setMessage("Failed to resend verification email.");
        } else {
            setMessage("Verification email resent. Check your inbox.");
        }

        setResending(false);
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
                <MailCheck className="w-12 h-12 text-indigo-600 mx-auto mb-4" />

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Verify your email
                </h1>

                <p className="text-gray-600 text-sm mb-6">
                    We’ve sent a verification link to{" "}
                    <span className="font-medium">{email ?? "your email address"}</span>.
                    <br />
                    Click the link to activate your account.
                </p>

                {message && (
                    <p className="text-sm text-indigo-600 mb-4">{message}</p>
                )}

                <button
                    onClick={resendEmail}
                    disabled={resending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition"
                >
                    {resending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCcw className="w-4 h-4" />
                    )}
                    Resend verification email
                </button>

                <p className="mt-6 text-xs text-gray-500">
                    Didn’t receive the email? Check spam or promotions.
                </p>
            </div>
        </div>
    );
}