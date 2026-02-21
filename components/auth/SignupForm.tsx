"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const signupSchema = z
    .object({
        fullName: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type SignupFormData = z.infer<typeof signupSchema>;

function getPasswordStrength(password: string) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { label: "Weak", color: "bg-red-500", percent: 33 };
    if (score <= 3) return { label: "Medium", color: "bg-yellow-500", percent: 66 };
    return { label: "Strong", color: "bg-green-500", percent: 100 };
}

export function SignupForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const [email, setEmail] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    const passwordValue = watch("password", "");
    const strength = useMemo(
        () => getPasswordStrength(passwordValue),
        [passwordValue]
    );

    const onSubmit = async (data: SignupFormData) => {
        setError("");
        const supabase = createClient();

        const { error: signUpError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    full_name: data.fullName,
                },
                emailRedirectTo: `${window.location.origin}/login`,
            },
        });

        if (signUpError) {
            // Show a generic error — never reveal whether an email is already registered
            setError("Unable to create account. Please check your details and try again.");
            return;
        }

        setEmail(data.email);
        setEmailSent(true);
    };

    /* ---------------- EMAIL SENT SCREEN ---------------- */
    if (emailSent) {
        return (
            <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl border p-8 text-center">
                <Mail className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
                <h2 className="text-xl font-bold mb-2">Verify your email</h2>
                <p className="text-gray-600 text-sm">
                    We&apos;ve sent a verification link to
                </p>
                <p className="font-medium mt-1">{email}</p>

                <p className="text-xs text-gray-500 mt-4">
                    Click the link in your email to activate your account.
                </p>

                <Link
                    href="/login"
                    className="inline-block mt-6 text-indigo-600 font-semibold"
                >
                    Go to Login
                </Link>
            </div>
        );
    }

    /* ---------------- SIGNUP FORM ---------------- */
    return (
        <div className="w-full max-w-[400px]">
            <div className="bg-white rounded-2xl shadow-xl border p-8">
                <h1 className="text-2xl font-bold text-center mb-2">
                    Create Account
                </h1>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Start your smart exam preparation journey
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <input
                            {...register("fullName")}
                            placeholder="Full Name"
                            autoComplete="name"
                            className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.fullName && (
                            <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
                        )}
                    </div>

                    <div>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="Email"
                            autoComplete="email"
                            className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <div className="relative">
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="Password (min. 8 characters)"
                                autoComplete="new-password"
                                className="w-full px-4 py-3 border rounded-lg pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {passwordValue && (
                            <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${strength.color} rounded-full transition-all duration-300`}
                                        style={{ width: `${strength.percent}%` }}
                                    />
                                </div>
                                <span className={`text-xs font-medium ${strength.label === "Weak"
                                        ? "text-red-500"
                                        : strength.label === "Medium"
                                            ? "text-yellow-500"
                                            : "text-green-500"
                                    }`}>
                                    {strength.label}
                                </span>
                            </div>
                        )}
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <div className="relative">
                            <input
                                {...register("confirmPassword")}
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirm Password"
                                autoComplete="new-password"
                                className="w-full px-4 py-3 border rounded-lg pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label={showConfirm ? "Hide password" : "Show password"}
                            >
                                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <p className="text-sm text-center mt-6 text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}