"use client";

interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps?: number;
}

export function ProgressIndicator({
    currentStep,
    totalSteps = 4,
}: ProgressIndicatorProps) {
    return (
        <div className="flex items-center justify-center gap-3 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${i + 1 < currentStep
                                ? "bg-indigo-600 text-white"
                                : i + 1 === currentStep
                                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                                    : "bg-gray-100 text-gray-400"
                            }`}
                    >
                        {i + 1 < currentStep ? "✓" : i + 1}
                    </div>
                    {i < totalSteps - 1 && (
                        <div
                            className={`w-8 h-0.5 transition-all duration-300 ${i + 1 < currentStep ? "bg-indigo-600" : "bg-gray-200"
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
