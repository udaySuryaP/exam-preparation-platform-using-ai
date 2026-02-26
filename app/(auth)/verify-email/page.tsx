"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MailCheck, Loader2, RefreshCcw } from "lucide-react";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const supabase = createClient();

    const [checking, setChecking] = useState(true);
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState("");

    // If user somehow already has a confirmed session, redirect properly via callback logic
    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session?.user?.email_confirmed_at) {
                // Use callback route so onboarding check runs correctly
                window.location.href = "/auth/callback-redirect";
            }
            setChecking(false);
        };
        checkSession();
    }, [supabase]);

    const resendEmail = async () => {
        if (!email) return;
        setResending(true);
        setMessage("");

        const { error } = await supabase.auth.resend({
            type: "signup",
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            if (error.message.toLowerCase().includes("rate limit")) {
                setMessage("Too many attempts. Please wait a few minutes before resending.");
            } else {
                setMessage("Failed to resend verification email. Please try again.");
            }
        } else {
            setMessage("✓ Verification email resent. Check your inbox and spam folder.");
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
                    Check your email
                </h1>

                <p className="text-gray-600 text-sm mb-2">
                    We sent a verification link to
                </p>
                <p className="font-semibold text-gray-900 mb-4">
                    {email ?? "your email address"}
                </p>
                <p className="text-gray-500 text-sm mb-6">
                    Click the link in the email to verify your account. You will be
                    automatically taken through the setup steps after verification.
                </p>

                {message && (
                    <p className={`text-sm mb-4 ${message.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>
                        {message}
                    </p>
                )}

                <button
                    onClick={resendEmail}
                    disabled={resending || !email}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition"
                >
                    {resending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCcw className="w-4 h-4" />
                    )}
                    Resend verification email
                </button>

                <p className="mt-4 text-xs text-gray-400">
                    Didn&apos;t receive it? Check your spam or promotions folder.
                </p>
            </div>
        </div>
    );
}