"use client";

import { REFERRAL_OPTIONS } from "@/types";

interface ReferralOptionsProps {
    value: string;
    onChange: (value: string) => void;
}

export function ReferralOptions({ value, onChange }: ReferralOptionsProps) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {REFERRAL_OPTIONS.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    onClick={() => onChange(option.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02] ${value === option.id
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                >
                    <span className="text-xl">{option.icon}</span>
                    <span className="text-sm font-medium text-gray-700">
                        {option.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
