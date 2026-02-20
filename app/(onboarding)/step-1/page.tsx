"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { CollegeSelector } from "@/components/onboarding/CollegeSelector";

export default function Step1Page() {
    const router = useRouter();
    const [college, setCollege] = useState("");
    const [graduationYear, setGraduationYear] = useState("");

    const canProceed = college !== "" && graduationYear !== "";

    const handleNext = () => {
        localStorage.setItem(
            "onboarding",
            JSON.stringify({ college, graduationYear })
        );
        router.push("/step-2");
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <ProgressIndicator currentStep={1} />

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Tell us about yourself
            </h1>
            <p className="text-gray-500 text-sm text-center mb-8">
                This helps us personalize your learning experience
            </p>

            <div className="space-y-6">
                <CollegeSelector value={college} onChange={setCollege} />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Graduation Year
                    </label>
                    <select
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm appearance-none"
                    >
                        <option value="">Select year</option>
                        {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 text-sm mt-8"
                >
                    Next
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
