"use client";

export default function OnboardingLoading() {
    return (
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 animate-fade-in">
            <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading...</p>
            </div>
        </div>
    );
}
