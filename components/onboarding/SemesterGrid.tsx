"use client";

interface SemesterGridProps {
    value: number;
    onChange: (value: number) => void;
}

export function SemesterGrid({ value, onChange }: SemesterGridProps) {
    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

    return (
        <div className="grid grid-cols-4 gap-3">
            {semesters.map((sem) => (
                <button
                    key={sem}
                    type="button"
                    onClick={() => onChange(sem)}
                    className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center text-lg font-bold transition-all duration-200 hover:scale-[1.05] ${value === sem
                            ? "border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                >
                    S{sem}
                </button>
            ))}
        </div>
    );
}
