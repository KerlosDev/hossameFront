'use client';
import { useState, useEffect } from 'react';

export default function ConverterPage() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExam, setSelectedExam] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [imageStatus, setImageStatus] = useState({});
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('asc');
    const [imageStats, setImageStats] = useState({
        total: 0,
        working: 0,
        broken: 0,
        pending: 0
    });

    useEffect(() => {
        // Calculate image stats whenever imageStatus changes
        const stats = {
            total: 0,
            working: 0,
            broken: 0,
            pending: 0
        };

        filteredData.forEach(exam => {
            exam.sections?.forEach(section => {
                section.questions?.forEach(question => {
                    if (question.contentType === 'image') {
                        stats.total++;
                        if (imageStatus[question._id] === 'valid') {
                            stats.working++;
                        } else if (imageStatus[question._id] === 'error') {
                            stats.broken++;
                        } else {
                            stats.pending++;
                        }
                    }
                });
            });
        });

        setImageStats(stats);
    }, [imageStatus, filteredData]);

    const handleInputChange = (e) => {
        try {
            const parsedData = JSON.parse(e.target.value);
            const formattedData = Array.isArray(parsedData) ? parsedData : [parsedData];
            setData(formattedData);
            setFilteredData(formattedData);
            // Set first exam as selected to show all questions
            setSelectedExam(formattedData[0]);
            // Start checking all images immediately
            checkAllImages(formattedData);
        } catch (error) {
            console.error('Invalid JSON input');
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        filterData(term);
    };

    const filterData = (term) => {
        const filtered = data.filter(item =>
            item.name.toLowerCase().includes(term) ||
            item.unit?.toString().includes(term) ||
            item.stage?.toString().includes(term)
        );
        setFilteredData(filtered);
    };

    const handleSort = (type) => {
        if (type === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(type);
            setSortOrder('asc');
        }

        const sorted = [...filteredData].sort((a, b) => {
            let comparison = 0;
            switch (type) {
                case 'date':
                    comparison = new Date(a.publishDate) - new Date(b.publishDate);
                    break;
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'unit':
                    comparison = a.unit.localeCompare(b.unit);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        setFilteredData(sorted);
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'تاريخ غير صحيح';
        }
    };

    const checkImage = (url, questionId) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                setImageStatus(prev => ({
                    ...prev,
                    [questionId]: 'valid'
                }));
                resolve(true);
            };
            img.onerror = () => {
                setImageStatus(prev => ({
                    ...prev,
                    [questionId]: 'error'
                }));
                resolve(false);
            };
            img.src = url;
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const parsedData = JSON.parse(text);
            const formattedData = Array.isArray(parsedData) ? parsedData : [parsedData];
            setData(formattedData);
            setFilteredData(formattedData);
            // Set first exam as selected to show all questions
            setSelectedExam(formattedData[0]);
            // Start checking all images immediately
            checkAllImages(formattedData);
        } catch (error) {
            console.error('Error reading file:', error);
            alert('خطأ في قراءة الملف. تأكد من أن الملف بتنسيق JSON صحيح.');
        }
    };

    const checkAllImages = async (examData) => {
        const newImageStatus = {};

        // Reset image stats
        setImageStats({
            total: 0,
            working: 0,
            broken: 0,
            pending: 0
        });

        // Collect all image questions first
        const imageQuestions = [];
        examData.forEach(exam => {
            exam.sections?.forEach(section => {
                section.questions?.forEach(question => {
                    if (question.contentType === 'image') {
                        imageQuestions.push(question);
                    }
                });
            });
        });

        // Update total count immediately
        setImageStats(prev => ({
            ...prev,
            total: imageQuestions.length,
            pending: imageQuestions.length
        }));

        // Check all images in parallel
        await Promise.all(imageQuestions.map(async (question) => {
            try {
                const isValid = await checkImage(question.question, question._id);
                newImageStatus[question._id] = isValid ? 'valid' : 'error';

                // Update stats for each image as it completes
                setImageStats(prev => ({
                    ...prev,
                    working: isValid ? prev.working + 1 : prev.working,
                    broken: !isValid ? prev.broken + 1 : prev.broken,
                    pending: prev.pending - 1
                }));
            } catch (error) {
                console.error('Error checking image:', error);
            }
        }));
    };

    const convertToExamModel = () => {
        const convertedExams = filteredData.map(oldExam => {
            // Create base exam structure
            const newExam = {
                title: oldExam.name || 'Untitled Exam',
                duration: oldExam.timer || 90,
                questions: []
            };

            // Process questions from sections
            if (oldExam.sections && oldExam.sections.length > 0) {
                oldExam.sections.forEach(section => {
                    if (section.questions && section.questions.length > 0) {
                        section.questions.forEach(q => {
                            // Convert each question to new format
                            const question = {
                                title: `Question ${q.number + 1}`,
                                options: {
                                    a: q.choices[0] || 'أ',
                                    b: q.choices[1] || 'ب',
                                    c: q.choices[2] || 'ج',
                                    d: q.choices[3] || 'د'
                                },
                                correctAnswer: 'a', // Default to 'a' since original doesn't specify
                                imageUrl: q.question // The image URL from original question
                            };
                            newExam.questions.push(question);
                        });
                    }
                });
            }

            return newExam;
        });

        return convertedExams;
    };

    const handleDownloadConverted = () => {
        if (filteredData.length === 0) {
            alert('لا يوجد بيانات للتحويل');
            return;
        }

        try {
            const convertedData = convertToExamModel();
            const jsonString = JSON.stringify(convertedData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'converted_exams.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error converting data:', error);
            alert('حدث خطأ أثناء تحويل البيانات');
        }
    };

    return (
        <div className="container mx-auto p-6 min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="space-y-6">
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-bold text-white">محول الامتحانات</h1>

                    {/* Input Section */}
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <div className="flex gap-4 mb-4">
                            <label className="flex-1">
                                <span className="block text-white mb-2">ادخل JSON الامتحانات</span>
                                <textarea
                                    className="w-full h-40 px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                                             text-white placeholder-gray-400 focus:border-blue-500/50 transition-colors"
                                    placeholder="{ ... }"
                                    onChange={handleInputChange}
                                />
                            </label>
                        </div>

                        <div className="flex gap-4">
                            <label className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg 
                                    flex items-center gap-2 transition-all duration-300 cursor-pointer">
                                 تحميل ملف JSON
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </label>

                            <button
                                onClick={handleDownloadConverted}
                                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg 
                                         flex items-center gap-2 transition-all duration-300"
                                disabled={filteredData.length === 0}
                            >
                                 تحميل JSON المحول
                            </button>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-gray-400 text-sm">إجمالي الصور</p>
                            <p className="text-2xl font-bold text-white">{imageStats.total}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-gray-400 text-sm">الصور السليمة</p>
                            <p className="text-2xl font-bold text-green-400">{imageStats.working}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-gray-400 text-sm">الصور المعطوبة</p>
                            <p className="text-2xl font-bold text-red-400">{imageStats.broken}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-gray-400 text-sm">قيد الفحص</p>
                            <p className="text-2xl font-bold text-yellow-400">{imageStats.pending}</p>
                        </div>
                    </div>

                    {/* Results Summary */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <div className="flex flex-col space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">عدد الامتحانات: {filteredData.length}</span>
                                <div className="flex gap-2">
                                    {filteredData.length > 0 && (
                                        <button
                                            onClick={() => setSelectedExam(null)}
                                            className="text-blue-500 hover:text-blue-600"
                                        >
                                            {selectedExam ? 'اخفاء كل الأسئلة' : 'عرض كل الأسئلة'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {imageStats.total > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-gray-700">{imageStats.total}</div>
                                        <div className="text-sm text-gray-500">إجمالي الصور</div>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-green-600">{imageStats.working}</div>
                                        <div className="text-sm text-green-600">الروابط العاملة</div>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-red-600">{imageStats.broken}</div>
                                        <div className="text-sm text-red-600">الروابط المعطلة</div>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-blue-600">{imageStats.pending}</div>
                                        <div className="text-sm text-blue-600">قيد التحقق</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Exams Grid */}
                    <div className="grid gap-6 grid-cols-1">
                        {filteredData.map((exam, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6 border-b">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <h2 className="text-xl font-semibold text-gray-800">{exam.name}</h2>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                    المرحلة {exam.stage}
                                                </span>
                                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                                    الوحدة {exam.unit}
                                                </span>
                                                {exam.isTask && (
                                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                                                        واجب
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedExam(selectedExam === exam ? null : exam)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            {selectedExam === exam ? 'اخفاء الأسئلة' : 'عرض الأسئلة'}
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                                        <div className="space-y-2">
                                            <p className="flex justify-between border-b pb-2">
                                                <span className="font-medium">الدرجة الكاملة:</span>
                                                <span>{exam.fullDegree}</span>
                                            </p>
                                            <p className="flex justify-between border-b pb-2">
                                                <span className="font-medium">الوقت:</span>
                                                <span>{exam.timer} دقيقة</span>
                                            </p>
                                            <p className="flex justify-between border-b pb-2">
                                                <span className="font-medium">عدد المحاولات:</span>
                                                <span>{exam.tries || 'غير محدود'}</span>
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="flex justify-between border-b pb-2">
                                                <span className="font-medium">تاريخ النشر:</span>
                                                <span>{formatDate(exam.publishDate)}</span>
                                            </p>
                                            <p className="flex justify-between border-b pb-2">
                                                <span className="font-medium">تاريخ الانتهاء:</span>
                                                <span>{formatDate(exam.deadLine)}</span>
                                            </p>
                                            <p className="flex justify-between border-b pb-2">
                                                <span className="font-medium">نشر النتائج:</span>
                                                <span>{formatDate(exam.resultPublishDate)}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Questions Section - Always visible */}
                                <div className="border-t">
                                    {exam.sections?.map((section, sectionIndex) => (
                                        <div key={sectionIndex} className="p-6 border-b last:border-b-0">
                                            <h3 className="text-lg font-semibold mb-4">{section.text}</h3>
                                            <div className="grid gap-6">
                                                {section.questions?.map((question, questionIndex) => {
                                                    if (question.contentType === 'image') {
                                                        checkImage(question.question, question._id);
                                                    }
                                                    return (
                                                        <div key={questionIndex} className="bg-gray-50 p-4 rounded-lg">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-medium text-gray-700">سؤال {question.number + 1}</span>
                                                                    <span className="text-sm text-gray-600">({question.fullDegree} درجة)</span>
                                                                </div>
                                                                {question.contentType === 'image' && (
                                                                    <span className={`text-sm px-3 py-1 rounded-full ${imageStatus[question._id] === 'valid' ? 'bg-green-100 text-green-800' :
                                                                        imageStatus[question._id] === 'error' ? 'bg-red-100 text-red-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                                        }`}>
                                                                        {imageStatus[question._id] === 'valid' ? '✓ الصورة تعمل' :
                                                                            imageStatus[question._id] === 'error' ? '⚠️ الصورة لا تعمل' :
                                                                                'جاري التحقق...'}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {question.contentType === 'image' ? (
                                                                <div className="my-4">
                                                                    {imageStatus[question._id] !== 'error' ? (
                                                                        <img
                                                                            src={question.question}
                                                                            alt={`سؤال ${question.number + 1}`}
                                                                            className="max-w-full rounded-lg shadow-sm"
                                                                            loading="lazy"
                                                                        />
                                                                    ) : (
                                                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                                            <p className="text-red-600 text-center">⚠️ الصورة غير متوفرة</p>
                                                                            <p className="text-sm mt-2 text-red-500 break-all">{question.question}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p className="my-4">{question.question}</p>
                                                            )}

                                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                                {question.choices?.map((choice, choiceIndex) => (
                                                                    <div
                                                                        key={choiceIndex}
                                                                        className={`p-3 rounded-lg border transition-colors ${choice === question.modelAnswer
                                                                            ? 'bg-green-50 border-green-500 text-green-700'
                                                                            : 'bg-white hover:bg-gray-50'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <span>{choice}</span>
                                                                            {choice === question.modelAnswer && (
                                                                                <span className="text-green-600">✓</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredData.length === 0 && (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <div className="text-gray-500">
                                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <p className="text-lg">لا توجد نتائج</p>
                                <p className="text-sm mt-2">حاول تعديل معايير البحث أو تحميل بيانات جديدة</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}