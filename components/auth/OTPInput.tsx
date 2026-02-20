"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function OTPInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const MAX_ATTEMPTS = 5;

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (countdown > 0 && !canResend) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCanResend(true);
        }
    }, [countdown, canResend]);

    const verifyOTP = useCallback(async (code: string) => {
        if (attempts >= MAX_ATTEMPTS) {
            setError("Too many attempts. Please request a new code.");
            return;
        }

        setIsVerifying(true);
        setError("");

        const supabase = createClient();

        const { error: verifyError } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: "signup",
        });

        if (verifyError) {
            setAttempts((prev) => prev + 1);
            if (attempts + 1 >= MAX_ATTEMPTS) {
                setError("Too many failed attempts. Please request a new code.");
            } else {
                setError(`Invalid code. ${MAX_ATTEMPTS - attempts - 1} attempts remaining.`);
            }
            setIsVerifying(false);
            return;
        }

        setSuccess(true);
        setTimeout(() => {
            router.push("/step-1");
            router.refresh();
        }, 1500);
    }, [email, router, attempts]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all filled
        const code = newOtp.join("");
        if (code.length === 6 && newOtp.every((d) => d !== "")) {
            verifyOTP(code);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < pasted.length; i++) {
            newOtp[i] = pasted[i];
        }
        setOtp(newOtp);
        if (pasted.length === 6) {
            verifyOTP(pasted);
        } else {
            inputRefs.current[pasted.length]?.focus();
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setError("");

        const supabase = createClient();
        const { error: resendError } = await supabase.auth.resend({
            type: "signup",
            email,
        });

        if (resendError) {
            setError(resendError.message);
        }

        setIsResending(false);
        setCountdown(30);
        setCanResend(false);
    };

    return (
        <div className="w-full max-w-[400px] animate-slide-up-fade">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-center">
                {success ? (
                    <div className="py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Email Verified!
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Redirecting to setup...
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-8 h-8 text-indigo-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Verify Your Email
                        </h1>
                        <p className="text-gray-500 text-sm mb-8">
                            We sent a 6-digit code to{" "}
                            <span className="font-medium text-gray-700">{email}</span>
                        </p>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => {
                                        inputRefs.current[index] = el;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-xl font-bold rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                    aria-label={`Digit ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => verifyOTP(otp.join(""))}
                            disabled={isVerifying || otp.some((d) => d === "")}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 text-sm mb-4"
                        >
                            {isVerifying ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : null}
                            {isVerifying ? "Verifying..." : "Verify"}
                        </button>

                        <button
                            onClick={handleResend}
                            disabled={!canResend || isResending}
                            className="text-sm text-gray-500 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isResending
                                ? "Resending..."
                                : canResend
                                    ? "Resend Code"
                                    : `Resend in ${countdown}s`}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
