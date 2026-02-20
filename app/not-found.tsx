import Link from "next/link";
import { GraduationCap, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="text-center animate-fade-in">
                <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <GraduationCap className="w-10 h-10 text-indigo-600" />
                </div>
                <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    Page Not Found
                </h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200"
                >
                    <Home className="w-4 h-4" />
                    Go Home
                </Link>
            </div>
        </div>
    );
}
