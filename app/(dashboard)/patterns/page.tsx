"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Filter, ArrowUpDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { QuestionPattern, Course } from "@/types";
import { cn } from "@/lib/utils";

export default function PatternsPage() {
    const [patterns, setPatterns] = useState<QuestionPattern[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"frequency" | "priority">("frequency");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const supabase = createClient();

            const { data: coursesData } = await supabase
                .from("courses")
                .select("*")
                .order("course_code");
            setCourses(coursesData || []);

            let query = supabase.from("question_patterns").select("*, course:courses(*)");
            if (selectedCourse !== "all") {
                query = query.eq("course_id", selectedCourse);
            }

            const { data } = await query;
            setPatterns((data as unknown as QuestionPattern[]) || []);
            setIsLoading(false);
        };
        load();
    }, [selectedCourse]);

    const sorted = [...patterns].sort((a, b) => {
        if (sortBy === "frequency") return b.total_frequency - a.total_frequency;
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const getPriorityBadge = (priority: string) => {
        const styles: Record<string, string> = {
            HIGH: "bg-red-50 text-red-700 border-red-200",
            MEDIUM: "bg-yellow-50 text-yellow-700 border-yellow-200",
            LOW: "bg-green-50 text-green-700 border-green-200",
        };
        return styles[priority] || "bg-gray-50 text-gray-700";
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Exam Patterns
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Analyze question frequency and prioritize your study topics
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={selectedCourse}
                            onChange={(e) => {
                                setSelectedCourse(e.target.value);
                                setIsLoading(true);
                            }}
                            className="w-full pl-10 pr-8 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
                        >
                            <option value="all">All Courses</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.course_code} — {c.course_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() =>
                            setSortBy(sortBy === "frequency" ? "priority" : "frequency")
                        }
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 hover:bg-gray-100 transition-all"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                        Sort by {sortBy === "frequency" ? "Priority" : "Frequency"}
                    </button>
                </div>

                {/* Patterns Table/Cards */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="h-16 rounded-xl border border-gray-200 skeleton"
                            />
                        ))}
                    </div>
                ) : sorted.length === 0 ? (
                    <div className="text-center py-16">
                        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">
                            No patterns found
                        </h3>
                        <p className="text-sm text-gray-500">
                            Question pattern data has not been added yet.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* Table Header */}
                        <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-4">Topic</div>
                            <div className="col-span-2 text-center">Part A</div>
                            <div className="col-span-2 text-center">Part B</div>
                            <div className="col-span-2 text-center">Part C</div>
                            <div className="col-span-2 text-center">Priority</div>
                        </div>

                        {/* Rows */}
                        {sorted.map((pattern) => (
                            <div
                                key={pattern.id}
                                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="md:col-span-4">
                                    <p className="font-medium text-gray-900 text-sm">
                                        {pattern.topic}
                                    </p>
                                    {pattern.course && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {pattern.course.course_code}
                                        </p>
                                    )}
                                </div>
                                <div className="md:col-span-2 flex items-center md:justify-center">
                                    <span className="md:hidden text-xs text-gray-500 mr-2">Part A:</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {pattern.part_a_frequency}
                                    </span>
                                </div>
                                <div className="md:col-span-2 flex items-center md:justify-center">
                                    <span className="md:hidden text-xs text-gray-500 mr-2">Part B:</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {pattern.part_b_frequency}
                                    </span>
                                </div>
                                <div className="md:col-span-2 flex items-center md:justify-center">
                                    <span className="md:hidden text-xs text-gray-500 mr-2">Part C:</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {pattern.part_c_frequency}
                                    </span>
                                </div>
                                <div className="md:col-span-2 flex items-center md:justify-center">
                                    <span
                                        className={cn(
                                            "inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border",
                                            getPriorityBadge(pattern.priority)
                                        )}
                                    >
                                        {pattern.priority}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
