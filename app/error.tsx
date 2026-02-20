"use client";

import { RefreshCw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4">
            <div className="text-center animate-fade-in">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Something went wrong
                </h2>
                <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                    {error.message || "An unexpected error occurred. Please try again."}
                </p>
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200 text-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
            </div>
        </div>
    );
}
