// API function to fetch course content analytics with real view data
const fetchCourseContentAnalytics = async (timeRange = 'all') => {
    try {
        const token = Cookies.get('token');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/content-analytics?timeRange=${timeRange}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            return result.data || [];
        } else {
            console.error('Failed to fetch content analytics');
            return [];
        }
    } catch (error) {
        console.error('Error fetching content analytics:', error);
        return [];
    }
};

// API function to track lesson view
const trackLessonView = async (courseId, chapterId, lessonId, lessonTitle, viewDuration = 0, isCompleted = false) => {
    try {
        const token = Cookies.get('token');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lesson-views/track`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseId,
                chapterId,
                lessonId,
                lessonTitle,
                viewDuration,
                isCompleted
            })
        });

        if (response.ok) {
            const result = await response.json();
            return result.data;
        } else {
            console.error('Failed to track lesson view');
            return null;
        }
    } catch (error) {
        console.error('Error tracking lesson view:', error);
        return null;
    }
};

// Export these functions to be used in components
export { fetchCourseContentAnalytics, trackLessonView };
