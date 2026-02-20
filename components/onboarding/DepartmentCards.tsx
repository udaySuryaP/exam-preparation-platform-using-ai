"use client";

import { DEPARTMENTS } from "@/types";

interface DepartmentCardsProps {
    value: string;
    onChange: (value: string) => void;
}

export function DepartmentCards({ value, onChange }: DepartmentCardsProps) {
    return (
        <div className="space-y-3">
            {DEPARTMENTS.map((dept) => (
                <button
                    key={dept.id}
                    type="button"
                    onClick={() => onChange(dept.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.01] ${value === dept.id
                            ? "border-indigo-500 bg-indigo-50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                >
                    <span className="text-2xl">{dept.icon}</span>
                    <div>
                        <p className="font-semibold text-gray-900">{dept.name}</p>
                        <p className="text-xs text-gray-500">{dept.shortName}</p>
                    </div>
                    {value === dept.id && (
                        <div className="ml-auto w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}
