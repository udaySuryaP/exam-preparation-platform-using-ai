"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { DepartmentCards } from "@/components/onboarding/DepartmentCards";

export default function Step2Page() {
    const router = useRouter();
    const [department, setDepartment] = useState("");

    const handleNext = () => {
        const existing = JSON.parse(localStorage.getItem("onboarding") || "{}");
        localStorage.setItem(
            "onboarding",
            JSON.stringify({ ...existing, department })
        );
        router.push("/step-3");
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <ProgressIndicator currentStep={2} />

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Select Your Department
            </h1>
            <p className="text-gray-500 text-sm text-center mb-8">
                Choose your engineering branch
            </p>

            <DepartmentCards value={department} onChange={setDepartment} />

            <div className="flex gap-3 mt-8">
                <button
                    onClick={() => router.push("/step-1")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={!department}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                >
                    Next
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
