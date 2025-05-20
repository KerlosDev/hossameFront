const CoursePageSkeleton = () => {
    return (
        <div className="animate-pulse">
            {/* Course Header Skeleton */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-4">
                        <div className="w-32 h-8 bg-gray-700/50 rounded-full" />
                        <div className="w-3/4 h-10 bg-gray-700/50 rounded-lg" />
                        <div className="w-full h-20 bg-gray-700/50 rounded-lg" />
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-700/50 rounded-full" />
                            <div className="space-y-2">
                                <div className="w-32 h-4 bg-gray-700/50 rounded" />
                                <div className="w-24 h-3 bg-gray-700/50 rounded" />
                            </div>
                        </div>
                    </div>
                    {/* Enrollment Card Skeleton */}
                    <div className="w-full md:w-96 h-48 bg-gray-700/50 rounded-xl" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="aspect-video rounded-xl bg-gray-700/50" />
                    <div className="h-32 bg-gray-700/50 rounded-xl" />
                </div>
                {/* Chapters List Skeleton */}
                <div className="bg-gray-800/50 rounded-xl h-fit">
                    <div className="p-4 border-b border-gray-700">
                        <div className="w-40 h-6 bg-gray-700/50 rounded" />
                    </div>
                    <div className="divide-y divide-gray-700">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="p-4 flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-700/50 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <div className="w-full h-4 bg-gray-700/50 rounded" />
                                    <div className="w-20 h-3 bg-gray-700/50 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePageSkeleton;
