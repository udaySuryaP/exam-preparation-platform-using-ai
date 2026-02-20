export default function DashboardLoading() {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading...</p>
            </div>
        </div>
    );
}
