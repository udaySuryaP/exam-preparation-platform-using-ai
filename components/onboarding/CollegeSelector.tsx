"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { KTU_COLLEGES } from "@/types";

interface CollegeSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export function CollegeSelector({ value, onChange }: CollegeSelectorProps) {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const filtered = useMemo(
        () =>
            KTU_COLLEGES.filter((c) =>
                c.toLowerCase().includes(search.toLowerCase())
            ),
        [search]
    );

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                College Name
            </label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search your college..."
                    value={value || search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        onChange("");
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                            No colleges found
                        </div>
                    ) : (
                        filtered.map((college) => (
                            <button
                                key={college}
                                type="button"
                                onClick={() => {
                                    onChange(college);
                                    setSearch("");
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors ${value === college
                                        ? "bg-indigo-50 text-indigo-700 font-medium"
                                        : "text-gray-700"
                                    }`}
                            >
                                {college}
                            </button>
                        ))
                    )}
                </div>
            )}

            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
