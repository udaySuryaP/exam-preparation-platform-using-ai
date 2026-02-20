"use client";

import { useState, useEffect } from "react";
import { Search, BookOpen, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Course } from "@/types";

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState("");
    const [semesterFilter, setSemesterFilter] = useState<string>("all");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const supabase = createClient();
            let query = supabase.from("courses").select("*").order("semester").order("course_code");

            if (semesterFilter !== "all") {
                query = query.eq("semester", parseInt(semesterFilter));
            }

            const { data } = await query;
            setCourses(data || []);
            setIsLoading(false);
        };
        load();
    }, [semesterFilter]);

    const filtered = courses.filter(
        (c) =>
            c.course_name.toLowerCase().includes(search.toLowerCase()) ||
            c.course_code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Courses</h1>
                    <p className="text-gray-500 text-sm">
                        Browse and explore your KTU semester courses
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={semesterFilter}
                            onChange={(e) => setSemesterFilter(e.target.value)}
                            className="pl-10 pr-8 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
                        >
                            <option value="all">All Semesters</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                <option key={s} value={s}>
                                    Semester {s}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Course Grid */}
                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="h-40 rounded-xl border border-gray-200 skeleton"
                            />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">
                            No courses found
                        </h3>
                        <p className="text-sm text-gray-500">
                            {courses.length === 0
                                ? "No courses have been added to the database yet."
                                : "Try adjusting your search or filter."}
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((course) => (
                            <div
                                key={course.id}
                                className="group p-5 rounded-xl border border-gray-200 bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className="inline-flex px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md">
                                        {course.course_code}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        S{course.semester}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors line-clamp-2">
                                    {course.course_name}
                                </h3>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>{course.credits} Credits</span>
                                    {course.module_count !== undefined && (
                                        <span>{course.module_count} Modules</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
