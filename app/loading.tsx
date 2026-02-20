export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading...</p>
            </div>
        </div>
    );
}
