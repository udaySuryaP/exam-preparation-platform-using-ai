"use client";

import { useState, useEffect } from "react";
import { User, Loader2, Save, BookOpen, Clock, Brain, CheckCircle, AlertCircle } from "lucide-react";
import { DEPARTMENTS } from "@/types";

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [profile, setProfile] = useState({
        full_name: "",
        email: "",
        college_name: "",
        branch: "",
        semester: 1,
    });
    const [stats, setStats] = useState({
        questions: 0,
        studyTime: 0,
        favSubject: "N/A",
    });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const data = await res.json();
                    if (data.profile) {
                        setProfile({
                            full_name: data.profile.full_name || "",
                            email: data.profile.email || "",
                            college_name: data.profile.college_name || "",
                            branch: data.profile.branch || "",
                            semester: data.profile.semester || 1,
                        });
                    }
                    if (data.stats) {
                        setStats(data.stats);
                    }
                }
            } catch {
                // Profile load failed silently - form shows defaults
            }
            setIsLoading(false);
        };
        load();
    }, []);

    const handleSave = async () => {
        // Client-side validation
        if (!profile.full_name.trim() || profile.full_name.trim().length < 2) {
            setSaveMessage({ type: "error", text: "Name must be at least 2 characters." });
            return;
        }

        setIsSaving(true);
        setSaveMessage(null);

        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: profile.full_name,
                    college_name: profile.college_name,
                    branch: profile.branch,
                    semester: profile.semester,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setSaveMessage({ type: "error", text: data.error || "Failed to save profile." });
            } else {
                setSaveMessage({ type: "success", text: "Profile updated successfully!" });
                // Update local state with server-validated data
                if (data.profile) {
                    setProfile((prev) => ({
                        ...prev,
                        full_name: data.profile.full_name,
                        college_name: data.profile.college_name,
                        branch: data.profile.branch,
                        semester: data.profile.semester,
                    }));
                }
                setTimeout(() => setSaveMessage(null), 3000);
            }
        } catch {
            setSaveMessage({ type: "error", text: "Network error. Please try again." });
        }

        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
                    <p className="text-gray-500 text-sm">
                        Manage your account and preferences
                    </p>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-2xl font-bold">
                        {profile.full_name
                            ? profile.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)
                            : "U"}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {profile.full_name || "User"}
                        </h2>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                    </div>
                </div>

                {/* Save Toast */}
                {saveMessage && (
                    <div
                        className={`mb-6 p-3 rounded-lg flex items-center gap-2 text-sm ${saveMessage.type === "success"
                                ? "bg-green-50 border border-green-200 text-green-700"
                                : "bg-red-50 border border-red-200 text-red-700"
                            }`}
                    >
                        {saveMessage.type === "success" ? (
                            <CheckCircle className="w-4 h-4 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 shrink-0" />
                        )}
                        {saveMessage.text}
                    </div>
                )}

                {/* Profile Form */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Personal Information
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={profile.full_name}
                                onChange={(e) =>
                                    setProfile({ ...profile, full_name: e.target.value })
                                }
                                maxLength={100}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-sm text-gray-500 cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                College
                            </label>
                            <input
                                type="text"
                                value={profile.college_name}
                                onChange={(e) =>
                                    setProfile({ ...profile, college_name: e.target.value })
                                }
                                maxLength={200}
                                placeholder="Enter your college name"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Department
                                </label>
                                <select
                                    value={profile.branch}
                                    onChange={(e) =>
                                        setProfile({ ...profile, branch: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
                                >
                                    <option value="">Select</option>
                                    {DEPARTMENTS.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.shortName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Semester
                                </label>
                                <select
                                    value={profile.semester}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            semester: parseInt(e.target.value),
                                        })
                                    }
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                        <option key={s} value={s}>
                                            Semester {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="mt-6 flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-all text-sm"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                {/* Usage Stats */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                        Usage Statistics
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-indigo-50 rounded-xl">
                            <Brain className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-indigo-700">
                                {stats.questions}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Questions Asked</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-xl">
                            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-blue-700">
                                {stats.studyTime}m
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Study Time</p>
                        </div>
                        <div className="text-center p-4 bg-emerald-50 rounded-xl">
                            <BookOpen className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-emerald-700">
                                {stats.favSubject}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Top Subject</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
