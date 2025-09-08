'use client'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Users,
    BookOpen,
    Clock,
    AlertTriangle,
    Phone,
    ExternalLink,
    Search,
    Filter,
    RefreshCw,
    User,
    ChevronDown,
    ChevronUp,
    Download,
    FileSpreadsheet,
    Loader2,
    TrendingDown,
    TrendingUp
} from 'lucide-react';

export default function StudentsNotWatchingTracker() {
    const [data, setData] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [lessonCount, setLessonCount] = useState(5);
    const [expandedCourses, setExpandedCourses] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    // Use a ref to track the real current page and avoid state sync issues
    const pageRef = useRef(1);
    const [currentPage, setCurrentPage] = useState(1);

    // Create a custom page setter that updates both state and ref
    const setCurrentPageSafe = useCallback((page) => {
        console.log(`Setting page to ${page} (was ${currentPage}, ref was ${pageRef.current})`);
        pageRef.current = page;
        setCurrentPage(page);
    }, [currentPage]);
    const [pagination, setPagination] = useState(null);
    const [pageSize] = useState(8); // Increased for better performance
    const [progressFilter, setProgressFilter] = useState('all');
    const [sortBy, setSortBy] = useState('studentsCount'); // studentsCount, progressRate, courseName
    const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
    const [viewMode, setViewMode] = useState('compact'); // compact, detailed
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [studentsPage, setStudentsPage] = useState({}); // Track student pagination per course
    const [studentsPageSize, setStudentsPageSize] = useState(10); // Students per page

    // Fetch all courses for dropdown with caching
    const fetchCourses = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students-not-watching/courses`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                setCourses(result.data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses([]);
        }
    }, []);

    // Fetch students not watching data with optimizations
    const fetchData = useCallback(async (page = 1, courseSpecificStudentsPage = null) => {
        // Save the current scroll position before loading new data
        if (page !== 1) { // Don't save position when resetting to page 1
            const currentPosition = window.scrollY;
            sessionStorage.setItem('scrollPosition', currentPosition.toString());
        }

        // Update URL state to match page
        if (typeof window !== 'undefined' && page !== 1) {
            const url = new URL(window.location);
            url.searchParams.set('page', page.toString());
            window.history.replaceState({}, '', url); // Use replaceState to avoid creating new history entries
        }

        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCourse) {
                params.append('courseId', selectedCourse);
                // Use the provided page number or get from state for this specific course
                const currentStudentsPage = courseSpecificStudentsPage || studentsPage[selectedCourse] || 1;
                params.append('studentsPage', currentStudentsPage.toString());
            }

            params.append('lastLessonsCount', lessonCount.toString());
            if (!selectedCourse) {
                params.append('page', page.toString());
                params.append('limit', pageSize.toString());
            }
            params.append('studentsLimit', studentsPageSize.toString());

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students-not-watching?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                // Update data but NEVER override the current page state
                setData(result.data);

                // IMPORTANT: Only update pagination if the server's page matches our expected page
                // This prevents the server from inadvertently changing our page
                if (result.pagination) {
                    // Verify the pagination matches our expected page
                    if (result.pagination.currentPage === page) {
                        setPagination(result.pagination);
                    } else {
                        console.warn(`Server returned page ${result.pagination.currentPage} but we expected ${page}`);
                        // Adjust the pagination object to match our expected page
                        const adjustedPagination = {
                            ...result.pagination,
                            currentPage: page
                        };
                        setPagination(adjustedPagination);
                    }
                }

                // Don't clear selection by default, give option to manually clear
                // setSelectedStudents(new Set());

                // Store current state in localStorage for additional persistence
                localStorage.setItem('currentPaginationPage', page.toString());
            } else {
                console.error('Error:', result.message || 'Invalid data format');
                setData([]);
                setPagination(null);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [selectedCourse, lessonCount, pageSize, studentsPage, studentsPageSize]);

    // Export data to Excel/JSON using xlsx
    const handleExport = useCallback(async () => {
        setExporting(true);
        try {
            const params = new URLSearchParams();
            if (selectedCourse) params.append('courseId', selectedCourse);
            params.append('lastLessonsCount', lessonCount.toString());

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students-not-watching/export?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                // Import xlsx dynamically (only when needed)
                const XLSX = await import('xlsx');

                // Create a worksheet from the data
                const worksheet = XLSX.utils.json_to_sheet(result.data);

                // Generate CSV content using xlsx
                // Convert the worksheet to CSV format
                const csvContent = XLSX.utils.sheet_to_csv(worksheet);

                // Create a download link for the CSV file
                const csvFileName = `students-not-watching-${selectedCourse ? 'course-specific' : 'all-courses'}-${new Date().toISOString().split('T')[0]}.csv`;

                // Add BOM for UTF-8 encoding to handle Arabic characters correctly
                const bomPrefix = "\uFEFF"; // BOM character for UTF-8
                const csvContentWithBom = bomPrefix + csvContent;

                // Create blob with proper encoding for Arabic text
                const blob = new Blob([csvContentWithBom], { type: 'text/csv;charset=utf-8' });
                const url = URL.createObjectURL(blob);

                // Create and trigger download link
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', csvFileName);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                alert('حدث خطأ في تصدير البيانات: ' + result.message);
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('حدث خطأ في تصدير البيانات');
        } finally {
            setExporting(false);
        }
    }, [selectedCourse, lessonCount]);

    // No longer needed with xlsx implementation

    // Set up popstate event listener for browser navigation
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handlePopState = (event) => {
                // When the user navigates with browser back/forward buttons
                console.log('Popstate event triggered', event.state);

                if (event.state && event.state.page) {
                    // Update page without triggering another history entry
                    console.log('Restoring page from history navigation:', event.state.page);
                    setCurrentPageSafe(event.state.page);
                } else {
                    // If there's no state, try to get from URL
                    const urlParams = new URLSearchParams(window.location.search);
                    const pageParam = urlParams.get('page');
                    if (pageParam) {
                        const pageNumber = parseInt(pageParam, 10);
                        if (!isNaN(pageNumber) && pageNumber > 0) {
                            console.log('Restoring page from URL after popstate:', pageNumber);
                            setCurrentPageSafe(pageNumber);
                        }
                    }
                }
            };

            // Add event listener
            window.addEventListener('popstate', handlePopState);

            // Clean up
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, []);

    // Effect for restoring state from localStorage, URL, and session storage on component mount
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                // CRITICAL: First check popstate/history state to see if we're coming back
                // This has highest priority because it reflects user navigation
                const historyState = window.history.state;
                if (historyState && historyState.page) {
                    console.log('Restoring page from history state:', historyState.page);
                    setCurrentPage(historyState.page);
                    // No need to check other sources if we have history state
                    return;
                }

                // Next priority: Check URL parameters
                const urlParams = new URLSearchParams(window.location.search);
                const pageParam = urlParams.get('page');
                if (pageParam) {
                    const pageNumber = parseInt(pageParam, 10);
                    if (!isNaN(pageNumber) && pageNumber > 0) {
                        console.log('Restoring page from URL:', pageNumber);
                        setCurrentPage(pageNumber);
                        return; // Found the page, no need to check localStorage
                    }
                }

                // Last priority: Check localStorage for stored page
                const storedPage = localStorage.getItem('currentPaginationPage');
                if (storedPage) {
                    const pageNumber = parseInt(storedPage, 10);
                    if (!isNaN(pageNumber) && pageNumber > 0) {
                        console.log('Restoring page from localStorage:', pageNumber);
                        setCurrentPage(pageNumber);

                        // Update URL to match localStorage state
                        const url = new URL(window.location);
                        url.searchParams.set('page', pageNumber.toString());
                        window.history.replaceState({ page: pageNumber }, '', url);
                    }
                }

                // Handle expanded courses state
                const expandedFromUrl = urlParams.getAll('expanded');
                if (expandedFromUrl && expandedFromUrl.length > 0) {
                    setExpandedCourses(new Set(expandedFromUrl));
                } else {
                    // Fallback to session storage
                    const savedExpandedCourses = sessionStorage.getItem('expandedCourses');
                    if (savedExpandedCourses) {
                        const expandedArray = JSON.parse(savedExpandedCourses);
                        setExpandedCourses(new Set(expandedArray));
                    }
                }

                // Handle student pagination state
                const studentPageParams = [];
                urlParams.forEach((value, key) => {
                    if (key.startsWith('student-page-')) {
                        const courseId = key.replace('student-page-', '');
                        const pageNum = parseInt(value, 10);
                        if (courseId && !isNaN(pageNum)) {
                            studentPageParams.push({ courseId, page: pageNum });
                        }
                    }
                });

                if (studentPageParams.length > 0) {
                    setStudentsPage(prev => {
                        const updatedPages = { ...prev };
                        studentPageParams.forEach(item => {
                            updatedPages[item.courseId] = item.page;
                        });
                        return updatedPages;
                    });
                }
            }
        } catch (error) {
            console.error('Error restoring state:', error);
        }
    }, []);    // Helper function to update URL with all pagination state
    const updateUrlState = useCallback((params = {}) => {
        if (typeof window === 'undefined') return;

        try {
            const url = new URL(window.location);

            // Update main page
            if (params.page) {
                // IMPORTANT: If we're updating the URL with a page, update our ref too
                pageRef.current = params.page;
                url.searchParams.set('page', params.page.toString());
            }

            // Update expanded courses
            if (params.expandedCourses) {
                url.searchParams.delete('expanded');
                params.expandedCourses.forEach(id => {
                    url.searchParams.append('expanded', id);
                });
            }

            // Update student pagination
            if (params.courseId && params.studentPage) {
                url.searchParams.set(`student-page-${params.courseId}`, params.studentPage.toString());
            }

            window.history.replaceState({}, '', url);
        } catch (error) {
            console.error('Error updating URL state:', error);
        }
    }, []);

    // Effect for maintaining scroll position after pagination
    useEffect(() => {
        const savedScrollPosition = sessionStorage.getItem('scrollPosition');
        if (savedScrollPosition) {
            window.scrollTo({
                top: parseInt(savedScrollPosition),
                behavior: 'smooth'
            });
            // Clear it after restoring to avoid unexpected scrolling on other navigations
            sessionStorage.removeItem('scrollPosition');
        }

        // Also restore course-specific positions if applicable
        if (expandedCourses.size > 0 && data.length > 0) {
            for (const courseId of expandedCourses) {
                const savedCoursePosition = sessionStorage.getItem(`scrollPosition-${courseId}`);
                if (savedCoursePosition) {
                    const courseElement = document.getElementById(`course-${courseId}`);
                    if (courseElement) {
                        setTimeout(() => {
                            window.scrollTo({
                                top: parseInt(savedCoursePosition),
                                behavior: 'smooth'
                            });
                        }, 200); // Small delay to ensure DOM is ready

                        // Only use the first one we find to avoid conflicting scrolling
                        sessionStorage.removeItem(`scrollPosition-${courseId}`);
                        break;
                    }
                }
            }
        }

        // Component cleanup function
        return () => {
            // Clear session storage items related to scrolling when component unmounts
            sessionStorage.removeItem('scrollPosition');
            sessionStorage.removeItem('lastFetchedPage');
        };
    }, [data, expandedCourses]);  // Run when data or expanded courses change

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // Effect to fetch data when filters change
    useEffect(() => {
        console.log("Filter changed - resetting to page 1");

        // Reset to page 1 but keep expanded state
        setCurrentPageSafe(1);

        // Reset student pagination when course/filters change
        if (selectedCourse) {
            setStudentsPage(prev => ({
                ...prev,
                [selectedCourse]: 1
            }));
        }

        // Update URL to reflect we're back to page 1 but keep other state
        if (typeof window !== 'undefined') {
            const url = new URL(window.location);
            url.searchParams.set('page', '1');

            // Also update the filter parameters in URL for bookmarking
            if (selectedCourse) {
                url.searchParams.set('course', selectedCourse);
            } else {
                url.searchParams.delete('course');
            }

            url.searchParams.set('lessons', lessonCount.toString());
            url.searchParams.set('studentsPerPage', studentsPageSize.toString());

            window.history.replaceState({}, '', url);
        }

        // Fetch page 1 with new filters and update the page ref
        pageRef.current = 1;
        fetchData(1);
    }, [selectedCourse, lessonCount, studentsPageSize]); // Removed fetchData from dependencies

    // Effect to handle current page changes with more reliable state handling
    useEffect(() => {
        // Verify that we should actually fetch this page (prevents infinite loops)
        if (pageRef.current !== currentPage) {
            console.log(`Page ref (${pageRef.current}) doesn't match state (${currentPage}), fixing...`);
            pageRef.current = currentPage;
        }

        console.log(`Current page changed to ${currentPage}, fetching data...`);

        // Store the current page in localStorage to persist it between page refreshes
        localStorage.setItem('currentPaginationPage', currentPage.toString());

        // Apply a short debounce to avoid multiple rapid fetches
        const timer = setTimeout(() => {
            // Force the URL to match the current page state
            if (typeof window !== 'undefined') {
                const url = new URL(window.location);
                url.searchParams.set('page', currentPage.toString());
                window.history.replaceState({ page: currentPage }, '', url);
            }

            fetchData(currentPage);
        }, 10);
    }, [currentPage, fetchData]);    // Memoized filtered and sorted data
    const processedData = useMemo(() => {
        let filtered = data.filter(course => {
            if (course.courseName && !course.courseName.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            if (progressFilter === 'noProgress') {
                return course.studentsNotWatching && course.studentsNotWatching.every(student =>
                    student.watchedRecentLessons === 0
                );
            } else if (progressFilter === 'someProgress') {
                return course.studentsNotWatching && course.studentsNotWatching.some(student =>
                    student.watchedRecentLessons > 0
                );
            } else if (progressFilter === 'highRisk') {
                const riskPercentage = course.totalEnrolledStudents > 0 ?
                    (course.studentsNotWatchingCount / course.totalEnrolledStudents) * 100 : 0;
                return riskPercentage > 50;
            }

            return true;
        });

        // Sort data
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'studentsCount':
                    aValue = a.studentsNotWatchingCount || 0;
                    bValue = b.studentsNotWatchingCount || 0;
                    break;
                case 'progressRate':
                    aValue = a.totalEnrolledStudents > 0 ? (a.studentsNotWatchingCount / a.totalEnrolledStudents) * 100 : 0;
                    bValue = b.totalEnrolledStudents > 0 ? (b.studentsNotWatchingCount / b.totalEnrolledStudents) * 100 : 0;
                    break;
                case 'courseName':
                    aValue = a.courseName || '';
                    bValue = b.courseName || '';
                    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                default:
                    aValue = a.studentsNotWatchingCount || 0;
                    bValue = b.studentsNotWatchingCount || 0;
            }

            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });

        return filtered;
    }, [data, searchTerm, progressFilter, sortBy, sortOrder]);

    const toggleCourseExpansion = useCallback((courseId) => {
        setExpandedCourses(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(courseId)) {
                newExpanded.delete(courseId);
            } else {
                newExpanded.add(courseId);
            }

            // Store in session storage for restoration after page change
            const expandedArray = Array.from(newExpanded);
            sessionStorage.setItem('expandedCourses', JSON.stringify(expandedArray));

            // Also store in URL for deep linking and browser history support
            if (typeof window !== 'undefined') {
                const url = new URL(window.location);
                url.searchParams.delete('expanded'); // Remove old expanded params

                // Add each expanded course as a param
                expandedArray.forEach(id => {
                    url.searchParams.append('expanded', id);
                });

                window.history.replaceState({}, '', url);
            }

            return newExpanded;
        });
    }, []);

    const toggleStudentSelection = useCallback((studentId, courseId) => {
        setSelectedStudents(prev => {
            const newSelected = new Set(prev);
            const key = `${courseId}-${studentId}`;
            if (newSelected.has(key)) {
                newSelected.delete(key);
            } else {
                newSelected.add(key);
            }
            return newSelected;
        });
    }, []);

    const openStudentProfile = useCallback((studentId) => {
        const url = `https://www.hossammirah.com/admin/${studentId}`;
        window.open(url, '_blank');
    }, []);

    // Helper function to save scroll position before changing pages and update URL
    const saveScrollPositionAndChangePage = useCallback((newPage) => {
        // Prevent unnecessary re-renders if page hasn't changed
        if (newPage === currentPage) {
            return;
        }

        // Save current scroll position
        const currentPosition = window.scrollY;
        sessionStorage.setItem('scrollPosition', currentPosition.toString());
        localStorage.setItem('currentPaginationPage', newPage.toString());

        // Use browser history state to store page information
        if (typeof window !== 'undefined') {
            const url = new URL(window.location);
            url.searchParams.set('page', newPage.toString());

            // Save expanded courses state
            url.searchParams.delete('expanded');
            Array.from(expandedCourses).forEach(id => {
                url.searchParams.append('expanded', id);
            });

            // Use pushState instead of replaceState to create a proper history entry
            window.history.pushState({ page: newPage }, '', url);
        }

        // Update component state - this will trigger the useEffect that fetches data
        console.log('Setting current page to:', newPage);
        setCurrentPageSafe(newPage);
    }, [currentPage, expandedCourses]);    // Handle student pagination with improved functionality and direct API calls
    const handleStudentPageChange = useCallback((courseId, newPage) => {
        console.log(`Changing student page for course ${courseId} to page ${newPage}`);

        // Save current scroll position to restore after data loads
        const currentScrollPosition = window.scrollY;
        const courseElement = document.getElementById(`course-${courseId}`);
        let courseElementPosition = null;

        if (courseElement) {
            courseElementPosition = courseElement.getBoundingClientRect().top + window.scrollY;
            sessionStorage.setItem(`scrollPosition-${courseId}`, courseElementPosition.toString());
        } else {
            sessionStorage.setItem('scrollPosition', currentScrollPosition.toString());
        }

        // Save student page in URL using our helper
        updateUrlState({
            courseId: courseId,
            studentPage: newPage,
            // Keep the main pagination page
            page: currentPage
        });

        // Update the students page state immediately
        setStudentsPage(prev => {
            const updatedPages = {
                ...prev,
                [courseId]: newPage
            };
            console.log('Updated student pages:', updatedPages);
            return updatedPages;
        });

        // Always make a direct API call for pagination - more reliable approach
        const params = new URLSearchParams();
        params.append('courseId', courseId);
        params.append('lastLessonsCount', lessonCount.toString());
        params.append('studentsPage', newPage.toString());
        params.append('studentsLimit', studentsPageSize.toString());

        console.log(`Fetching students for course ${courseId}, page ${newPage}, API URL: ${process.env.NEXT_PUBLIC_API_URL}/students-not-watching?${params.toString()}`);

        setLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/students-not-watching?${params}`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(result => {
                if (result.success && Array.isArray(result.data)) {
                    console.log(`Successfully fetched data for page ${newPage}, found ${result.data.length} courses`);
                    setData(result.data);
                    setPagination(result.pagination);

                    // Restore scroll position to the course position
                    setTimeout(() => {
                        const savedCoursePosition = sessionStorage.getItem(`scrollPosition-${courseId}`);
                        if (savedCoursePosition) {
                            window.scrollTo({
                                top: parseInt(savedCoursePosition),
                                behavior: 'smooth'
                            });
                            // Clear after using
                            sessionStorage.removeItem(`scrollPosition-${courseId}`);
                        } else {
                            // If no saved position, just scroll to the course
                            const courseElement = document.getElementById(`course-${courseId}`);
                            if (courseElement) {
                                courseElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }
                    }, 100);
                } else {
                    console.error('Error:', result.message || 'Invalid data format');
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [lessonCount, studentsPageSize]); const getRiskLevel = useCallback((course) => {
        const riskPercentage = course.totalEnrolledStudents > 0 ?
            (course.studentsNotWatchingCount / course.totalEnrolledStudents) * 100 : 0;

        if (riskPercentage >= 70) return { level: 'high', color: 'red', text: 'عالي' };
        if (riskPercentage >= 40) return { level: 'medium', color: 'yellow', text: 'متوسط' };
        if (riskPercentage >= 20) return { level: 'low', color: 'orange', text: 'منخفض' };
        return { level: 'minimal', color: 'green', text: 'طبيعي' };
    }, []);

    return (
        <div className="p-6 min-h-screen">
            <div className="max-w-7xl mx-auto font-arabicUI3 space-y-6">
                {/* Enhanced Header with Export */}
                <div dir='rtl' className="bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-white/20 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    متابعة الطلاب المتراكمين - إصدار محسن
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300">
                                    لعرض جميع الطلبة الخاصة بكورس يجب عليك اختيار الكورس من الفلتر ال
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleExport}
                                disabled={exporting || loading}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all disabled:opacity-50"
                            >
                                {exporting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <FileSpreadsheet className="w-4 h-4" />
                                )}
                                تصدير CSV
                            </button>
                            <button
                                onClick={() => fetchData(currentPage)}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                تحديث
                            </button>
                        </div>
                    </div>

                    {/* Enhanced Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                البحث في الكورسات
                            </label>
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="ابحث عن كورس..."
                                    className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                اختر كورس محدد
                            </label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">جميع الكورسات</option>
                                {courses.map(course => (
                                    <option key={course._id} value={course._id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                عدد الدروس 
                            </label>
                            <select
                                value={lessonCount}
                                onChange={(e) => setLessonCount(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={2}>اول درسين</option>
                                <option value={3}>اول 3 دروس</option>
                                <option value={5}>اول 5 دروس</option>
                                <option value={10}>اول 10 دروس</option>
                                <option value={15}>اول 15 درس</option>
                                <option value={20}>اول 20 درس</option>
                                <option value={25}>اول 25 درس</option>
                                <option value={30}>اول 30 درس</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                عدد الطلاب في الصفحة
                            </label>
                            <select
                                value={studentsPageSize}
                                onChange={(e) => setStudentsPageSize(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={5}>5 طلاب</option>
                                <option value={10}>10 طلاب</option>
                                <option value={20}>20 طالب</option>
                                <option value={30}>30 طالب</option>
                                <option value={50}>50 طالب</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                فلترة حسب المخاطر
                            </label>
                            <select
                                value={progressFilter}
                                onChange={(e) => setProgressFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">جميع الكورسات</option>
                                <option value="highRisk">مخاطر عالية (50%+)</option>
                                <option value="noProgress">بدون تقدم نهائياً</option>
                                <option value="someProgress">تقدم جزئي</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                ترتيب حسب
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="studentsCount">عدد الطلاب المتراكمين</option>
                                <option value="progressRate">معدل المخاطر</option>
                                <option value="courseName">اسم الكورس</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                طريقة العرض
                            </label>
                            <select
                                value={viewMode}
                                onChange={(e) => setViewMode(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="compact">مضغوط (10 طلاب)</option>
                                <option value="detailed">مفصل (50 طالب)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center gap-3">
                            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                            <span className="text-gray-600 dark:text-gray-300">جاري تحميل البيانات...</span>
                        </div>
                    </div>
                )}

                {/* Performance Stats */}
                {!loading && processedData.length > 0 && (
                    <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-white/20 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            إحصائيات الأداء المحسنة
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {processedData.length}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    كورسات تحتاج متابعة
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {processedData.reduce((total, course) => total + (course.studentsNotWatchingCount || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    إجمالي الطلاب المتراكمين
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {processedData.reduce((total, course) => total + (course.totalEnrolledStudents || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    إجمالي الطلاب المسجلين
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {Math.round((processedData.reduce((total, course) => total + (course.studentsNotWatchingCount || 0), 0) /
                                        Math.max(processedData.reduce((total, course) => total + (course.totalEnrolledStudents || 0), 0), 1)) * 100)}%
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    معدل التراكم العام
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {processedData.filter(course => getRiskLevel(course).level === 'high').length}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    كورسات عالية المخاطر
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Results with Virtual Scrolling Support */}
                {!loading && (
                    <div className="space-y-4">
                        {processedData.length === 0 ? (
                            <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-gray-200 dark:border-white/20 shadow-lg text-center">
                                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    لا توجد بيانات
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    جميع الطلاب متابعون للدروس الأخيرة أو لا توجد كورسات بالفلاتر المحددة
                                </p>
                            </div>
                        ) : (
                            processedData.map(course => {
                                const risk = getRiskLevel(course);
                                const isExpanded = expandedCourses.has(course.courseId || course._id);

                                return (
                                    <div
                                        dir='rtl'
                                        key={course.courseId || course._id}
                                        id={`course-${course.courseId || course._id}`}
                                        className="bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/20 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200">

                                        {/* Enhanced Course Header with Risk Indicators */}
                                        <div
                                            className={`p-6 bg-gradient-to-r cursor-pointer transition-all duration-200 ${risk.level === 'high' ? 'from-red-500 to-red-600' :
                                                risk.level === 'medium' ? 'from-yellow-500 to-orange-500' :
                                                    risk.level === 'low' ? 'from-orange-400 to-yellow-500' :
                                                        'from-blue-500 to-purple-600'
                                                } text-white hover:opacity-90`}
                                            onClick={() => toggleCourseExpansion(course.courseId || course._id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-white/20 rounded-xl">
                                                        <BookOpen className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-xl font-bold">
                                                                {course.courseName || course.title || 'كورس غير محدد'}
                                                            </h3>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/20`}>
                                                                مخاطر {risk.text}
                                                            </span>
                                                        </div>
                                                        <p className="text-white/90">
                                                            {course.studentsNotWatchingCount || 0} من {course.totalEnrolledStudents || 0} طالب لم يشاهد اول {course.lastLessonsCount || 0} دروس
                                                            {course.averageProgressPercentage !== undefined && (
                                                                <span className="ml-2">• متوسط التقدم: {course.averageProgressPercentage}%</span>
                                                            )}
                                                        </p>
                                                        {course.hasMoreStudents && (
                                                            <p className="text-white/70 text-sm mt-1">
                                                                عرض أول {(course.studentsNotWatching || []).length} طلاب من أصل {course.totalStudentsNotWatching} طالب متراكم
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-center">
                                                        <div className="text-3xl font-bold">
                                                            {course.totalEnrolledStudents > 0
                                                                ? Math.round((course.studentsNotWatchingCount / course.totalEnrolledStudents) * 100)
                                                                : 0}%
                                                        </div>
                                                        <div className="text-sm text-white/80">معدل التراكم</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-lg font-bold">
                                                            {isExpanded ? 'إخفاء' : 'عرض'}
                                                        </div>
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-5 h-5 mx-auto" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 mx-auto" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Enhanced Students List with Better Performance */}
                                        {isExpanded && (
                                            <div className="p-6">
                                                {course.hasMoreStudents && (
                                                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                                                    📊 عرض الصفحة {course.studentsPagination?.currentPage || 1} من {course.studentsPagination?.totalPages || 1} ({(course.studentsNotWatching || []).length} طالب من أصل {course.totalStudentsNotWatching})
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setViewMode(viewMode === 'compact' ? 'detailed' : 'compact');
                                                                }}
                                                                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm transition-all"
                                                            >
                                                                {viewMode === 'compact' ? 'عرض مفصل' : 'عرض مضغوط'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid gap-3">
                                                    {(course.studentsNotWatching || []).map((student, index) => {
                                                        const studentKey = `${course.courseId || course._id}-${student.studentId}`;
                                                        const isSelected = selectedStudents.has(studentKey);
                                                        const progressPercentage = student.totalRecentLessons > 0 ?
                                                            Math.round((student.watchedRecentLessons / student.totalRecentLessons) * 100) : 0;

                                                        return (
                                                            <div
                                                                key={student.studentId}
                                                                className={`rounded-xl p-4 border transition-all duration-200 hover:shadow-md ${progressPercentage === 0
                                                                    ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800'
                                                                    : progressPercentage < 50
                                                                        ? 'bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800'
                                                                        : 'bg-gradient-to-r from-yellow-50 to-green-50 dark:from-yellow-900/20 dark:to-green-900/20 border-yellow-200 dark:border-yellow-800'
                                                                    } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-4 flex-1">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isSelected}
                                                                            onChange={(e) => {
                                                                                e.stopPropagation();
                                                                                toggleStudentSelection(student.studentId, course.courseId || course._id);
                                                                            }}
                                                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                                        />
                                                                        <div className={`p-2 rounded-full text-white ${progressPercentage === 0 ? 'bg-red-500' :
                                                                            progressPercentage < 50 ? 'bg-orange-500' : 'bg-yellow-600'
                                                                            }`}>
                                                                            <User className="w-4 h-4" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <h4 className="font-semibold text-gray-800 dark:text-white">
                                                                                    {student.name || 'اسم غير متوفر'}
                                                                                </h4>
                                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${progressPercentage === 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                                                    progressPercentage < 50 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                                                    }`}>
                                                                                    {progressPercentage}% تقدم
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                                                {student.email || 'بريد إلكتروني غير متوفر'}
                                                                            </p>
                                                                            {viewMode === 'detailed' && (
                                                                                <div className="flex items-center gap-4">
                                                                                    {student.phoneNumber && (
                                                                                        <div className="flex items-center gap-1">
                                                                                            <Phone className="w-4 h-4 text-green-500" />
                                                                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                                                                {student.phoneNumber}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                    {student.parentPhoneNumber && (
                                                                                        <div className="flex items-center gap-1">
                                                                                            <Phone className="w-4 h-4 text-blue-500" />
                                                                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                                                                {student.parentPhoneNumber} (ولي الأمر)
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-4">
                                                                        <div className="text-center">
                                                                            <div className={`text-lg font-bold ${progressPercentage === 0 ? 'text-red-600 dark:text-red-400' :
                                                                                progressPercentage < 50 ? 'text-orange-600 dark:text-orange-400' :
                                                                                    'text-yellow-600 dark:text-yellow-400'
                                                                                }`}>
                                                                                {student.unwatchedLessonsCount || 0}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                لم تُشاهد
                                                                            </div>
                                                                        </div>

                                                                        <div className="text-center">
                                                                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                                                                {student.watchedRecentLessons || 0}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                مُشاهدة
                                                                            </div>
                                                                        </div>

                                                                        <div className="w-20">
                                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                                <div
                                                                                    className={`h-2 rounded-full transition-all duration-300 ${progressPercentage === 0 ? 'bg-red-500' :
                                                                                        progressPercentage < 50 ? 'bg-orange-500' :
                                                                                            progressPercentage === 100 ? 'bg-green-500' : 'bg-yellow-500'
                                                                                        }`}
                                                                                    style={{ width: `${progressPercentage}%` }}
                                                                                ></div>
                                                                            </div>
                                                                            <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                                                                                {progressPercentage}%
                                                                            </div>
                                                                        </div>

                                                                        {student.studentId && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    openStudentProfile(student.studentId);
                                                                                }}
                                                                                className="flex items-center gap-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all text-sm"
                                                                            >
                                                                                <ExternalLink className="w-4 h-4" />
                                                                                {viewMode === 'detailed' ? 'الملف الشخصي' : 'ملف'}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Unwatched lessons details for detailed view */}
                                                                {viewMode === 'detailed' && student.unwatchedLessons && student.unwatchedLessons.length > 0 && (
                                                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                            الدروس التي لم تُشاهد:
                                                                        </h5>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {student.unwatchedLessons.slice(0, 5).map(lesson => (
                                                                                <span
                                                                                    key={lesson.lessonId}
                                                                                    className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-xs"
                                                                                >
                                                                                    {lesson.chapterTitle}: {lesson.title}
                                                                                </span>
                                                                            ))}
                                                                            {student.unwatchedLessons.length > 5 && (
                                                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs">
                                                                                    +{student.unwatchedLessons.length - 5} أخرى
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Student Pagination Controls */}
                                                {course.studentsPagination && course.studentsPagination.totalPages > 1 && (
                                                    <div className="mt-4 flex items-center justify-between p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 rounded-b-xl">
                                                        <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                                            صفحة {course.studentsPagination.currentPage} من {course.studentsPagination.totalPages}
                                                            ({course.studentsPagination.totalStudents} طالب إجمالاً)
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => {
                                                                    console.log("Go to first page clicked for course", course.courseId || course._id);
                                                                    handleStudentPageChange(course.courseId || course._id, 1);
                                                                }}
                                                                disabled={!course.studentsPagination?.hasPrevPage || course.studentsPagination?.currentPage === 1}
                                                                className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-all shadow-md text-sm font-medium flex items-center gap-2"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                                                الأولى
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    console.log("Previous page clicked for course", course.courseId || course._id);
                                                                    const prevPage = Math.max(1, (course.studentsPagination?.currentPage || 2) - 1);
                                                                    handleStudentPageChange(course.courseId || course._id, prevPage);
                                                                }}
                                                                disabled={!course.studentsPagination?.hasPrevPage || course.studentsPagination?.currentPage === 1}
                                                                className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-all shadow-md text-sm font-medium"
                                                            >
                                                                السابقة
                                                            </button>
                                                            <span className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium shadow-md text-sm">
                                                                {course.studentsPagination?.currentPage || 1}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    console.log("Next page clicked for course", course.courseId || course._id);
                                                                    const nextPage = Math.min((course.studentsPagination?.totalPages || 1), (course.studentsPagination?.currentPage || 0) + 1);
                                                                    handleStudentPageChange(course.courseId || course._id, nextPage);
                                                                }}
                                                                disabled={!course.studentsPagination?.hasNextPage || course.studentsPagination?.currentPage === course.studentsPagination?.totalPages}
                                                                className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-all shadow-md text-sm font-medium"
                                                            >
                                                                التالية
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    console.log("Last page clicked for course", course.courseId || course._id);
                                                                    handleStudentPageChange(course.courseId || course._id, course.studentsPagination?.totalPages || 1);
                                                                }}
                                                                disabled={!course.studentsPagination?.hasNextPage || course.studentsPagination?.currentPage === course.studentsPagination?.totalPages}
                                                                className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-all shadow-md text-sm font-medium flex items-center gap-2"
                                                            >
                                                                الأخيرة
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Enhanced Pagination */}
                {!loading && pagination && pagination.totalPages > 1 && !selectedCourse && (
                    <div className="bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-white/20 shadow-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                صفحة {pagination.currentPage} من {pagination.totalPages}
                                ({pagination.totalCourses} كورس إجمالاً)
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => saveScrollPositionAndChangePage(1)}
                                    disabled={!pagination.hasPrevPage || currentPage === 1}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    الأولى
                                </button>

                                <button
                                    onClick={() => saveScrollPositionAndChangePage(Math.max(currentPage - 1, 1))}
                                    disabled={!pagination.hasPrevPage || currentPage === 1}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium"
                                >
                                    السابقة
                                </button>

                                <span className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium shadow-md">
                                    {pagination.currentPage}
                                </span>

                                <button
                                    onClick={() => saveScrollPositionAndChangePage(Math.min(currentPage + 1, pagination.totalPages))}
                                    disabled={!pagination.hasNextPage || currentPage === pagination.totalPages}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium"
                                >
                                    التالية
                                </button>

                                <button
                                    onClick={() => saveScrollPositionAndChangePage(pagination.totalPages)}
                                    disabled={!pagination.hasNextPage || currentPage === pagination.totalPages}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-medium flex items-center gap-2"
                                >
                                    الأخيرة
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}
