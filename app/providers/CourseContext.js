'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

// إنشاء الكنتكست
const CourseContext = createContext();

export const useCourses = () => {
    return useContext(CourseContext);
};

export const CourseProvider = ({ children }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrollmentStatus, setEnrollmentStatus] = useState({});
    
    useEffect(() => {
        // هنا بنعمل جلب البيانات لأول مرة فقط
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:9000/course');
                if (!response.ok) throw new Error('Failed to fetch courses');
                
                const data = await response.json();
                const courses = data.courses || [];
                setCourses(courses);

                // تحقق من حالة التسجيل للمستخدم
                const token = Cookies.get('token');
                if (token) {
                    for (const course of courses) {
                        try {
                            const res = await fetch(`http://localhost:9000/active/${course._id}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const result = await res.json();
                            setEnrollmentStatus(prev => ({ ...prev, [course._id]: result.isHeEnrolled }));
                        } catch (err) {
                            console.error('Error checking enrollment:', err);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses(); // استدعاء دالة جلب البيانات
    }, []);

    return (
        <CourseContext.Provider value={{ courses, loading, error, enrollmentStatus }}>
            {children}
        </CourseContext.Provider>
    );
};
