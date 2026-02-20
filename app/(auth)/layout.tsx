import { GraduationCap } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="absolute top-6 left-6">
                <a href="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                        KTU Exam Prep AI
                    </span>
                </a>
            </div>
            {children}
        </div>
    );
}
