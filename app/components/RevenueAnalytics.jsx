'use client';
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import GlobalApi from '../api/GlobalApi';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import { motion } from 'framer-motion';
import { BsCashCoin, BsCalendar3 } from 'react-icons/bs';
import { FaMoneyBillWave } from 'react-icons/fa';
import { FiTrendingUp, FiDollarSign, FiPieChart } from 'react-icons/fi';
import { BsLightningCharge } from 'react-icons/bs';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const RevenueAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [monthlyGrowth, setMonthlyGrowth] = useState(0);
    const [revenueData, setRevenueData] = useState({
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0,
    });
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const [expenses, setExpenses] = useState([]);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [newExpense, setNewExpense] = useState({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [parsedEnrollments, setParsedEnrollments] = useState([]);
    const [showStats, setShowStats] = useState(false);
    const [forecast, setForecast] = useState(null);

    const periods = {
        daily: { label: 'يومي', days: 1 },
        weekly: { label: 'أسبوعي', days: 7 },
        monthly: { label: 'شهري', days: 30 },
        yearly: { label: 'سنوي', days: 365 }
    };

    const calculateNetRevenue = (period) => {
        const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        return revenueData[period] - totalExpenses;
    };

    const handleAddExpense = (e) => {
        e.preventDefault();
        if (!newExpense.amount || !newExpense.description) return;

        setExpenses([...expenses, {
            ...newExpense,
            id: Date.now(),
            amount: parseFloat(newExpense.amount)
        }]);

        setNewExpense({
            amount: '',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
        setShowExpenseForm(false);
    };

    const chartOptions = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        animations: {
            tension: {
                duration: 1000,
                easing: 'linear',
                from: 0.8,
                to: 0.2,
                loop: true
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'white',
                    font: {
                        family: 'arabicUI3',
                        size: 14
                    },
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                callbacks: {
                    label: (context) => {
                        const value = context.raw;
                        return `${context.dataset.label}: $${value.toLocaleString()}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => `$${value.toLocaleString()}`,
                    color: 'rgba(255, 255, 255, 0.8)',
                    font: {
                        family: 'arabicUI3'
                    }
                },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    const aggregateDataByPeriod = (data, period) => {
        const now = new Date();
        const startDate = new Date(now - periods[period].days * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);

        const dateFormat = new Intl.DateTimeFormat('ar', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        const groupedData = {};

        // Initialize all dates in the period
        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
            const key = getKeyForDate(d, period);
            if (!groupedData[key]) {
                groupedData[key] = { revenue: 0, expenses: 0 };
            }
        }

        // Add revenue data
        data.forEach(item => {
            const date = new Date(item.timestamp);
            if (date >= startDate && date <= now) {
                const key = getKeyForDate(date, period);
                if (groupedData[key]) {
                    groupedData[key].revenue += (item.price || 0);
                }
            }
        });

        // Add expense data
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            if (date >= startDate && date <= now) {
                const key = getKeyForDate(date, period);
                if (groupedData[key]) {
                    groupedData[key].expenses += parseFloat(expense.amount || 0);
                }
            }
        });

        const sortedKeys = Object.keys(groupedData).sort((a, b) => {
            if (period === 'daily') {
                return new Date(a) - new Date(b);
            }
            return a.localeCompare(b);
        });

        return {
            labels: sortedKeys.map(key => formatLabel(key, period)),
            datasets: [
                {
                    label: 'الإيرادات',
                    data: sortedKeys.map(key => groupedData[key].revenue),
                    borderColor: 'rgba(75, 192, 192, 0.8)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'المصروفات',
                    data: sortedKeys.map(key => groupedData[key].expenses),
                    borderColor: 'rgba(255, 99, 132, 0.8)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'صافي الربح',
                    data: sortedKeys.map(key =>
                        groupedData[key].revenue - groupedData[key].expenses
                    ),
                    borderColor: 'rgba(153, 102, 255, 0.8)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    fill: true,
                    tension: 0.4
                }
            ]
        };
    };

    const getKeyForDate = (date, period) => {
        switch (period) {
            case 'daily':
                return date.toISOString().split('T')[0];
            case 'weekly':
                const weekNumber = Math.ceil((date.getDate()) / 7);
                return `${date.getFullYear()}-W${weekNumber}`;
            case 'monthly':
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            case 'yearly':
                return date.getFullYear().toString();
        }
    };

    const formatLabel = (key, period) => {
        switch (period) {
            case 'daily':
                return new Date(key).toLocaleDateString('ar', { day: '2-digit', month: 'short' });
            case 'weekly':
                const [year, week] = key.split('-W');
                return `أسبوع ${week}`;
            case 'monthly':
                const [y, m] = key.split('-');
                return new Date(y, m - 1).toLocaleDateString('ar', { month: 'short', year: 'numeric' });
            case 'yearly':
                return key;
        }
    };

    useEffect(() => {
        if (parsedEnrollments.length > 0) {
            const newChartData = aggregateDataByPeriod(parsedEnrollments, selectedPeriod);
            setChartData(newChartData);
        }
    }, [selectedPeriod, expenses, parsedEnrollments]);

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await GlobalApi.getActivationData();
                let activations = [];

                try {
                    // Get decrypted data from the API - it's already decrypted in getActivationData
                    activations = result.actvition?.activit || [];
                    if (!Array.isArray(activations)) {
                        throw new Error('Invalid data format');
                    }
                } catch (e) {
                    console.error('Error processing activation data:', e);
                    activations = [];
                }

                const approvedEnrollments = activations.filter(e => e.status === 'approved');
                setParsedEnrollments(approvedEnrollments);

                // Calculate current and previous month's revenue
                const now = new Date();
                const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

                const currentMonthRevenue = approvedEnrollments
                    .filter(e => new Date(e.timestamp) >= currentMonthStart)
                    .reduce((sum, e) => sum + (e.price || 0), 0);

                const prevMonthRevenue = approvedEnrollments
                    .filter(e => {
                        const date = new Date(e.timestamp);
                        return date >= prevMonthStart && date < currentMonthStart;
                    })
                    .reduce((sum, e) => sum + (e.price || 0), 0);

                // Calculate growth percentage
                const growth = prevMonthRevenue > 0
                    ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
                    : 0;
                setMonthlyGrowth(growth);

                // Continue with existing revenue calculations...
                const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
                const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
                const oneYearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000);

                const daily = approvedEnrollments
                    .filter(e => new Date(e.timestamp) > oneDayAgo)
                    .reduce((sum, e) => sum + (e.price || 0), 0);

                const weekly = approvedEnrollments
                    .filter(e => new Date(e.timestamp) > oneWeekAgo)
                    .reduce((sum, e) => sum + (e.price || 0), 0);

                const monthly = approvedEnrollments
                    .filter(e => new Date(e.timestamp) > oneMonthAgo)
                    .reduce((sum, e) => sum + (e.price || 0), 0);

                const yearly = approvedEnrollments
                    .filter(e => new Date(e.timestamp) > oneYearAgo)
                    .reduce((sum, e) => sum + (e.price || 0), 0);

                setRevenueData({ daily, weekly, monthly, yearly });

                // Group by month for chart
                const monthlyData = approvedEnrollments.reduce((acc, curr) => {
                    const date = new Date(curr.timestamp);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    acc[monthKey] = (acc[monthKey] || 0) + (curr.price || 0);
                    return acc;
                }, {});

                const sortedMonths = Object.keys(monthlyData).sort();
                setChartData({
                    labels: sortedMonths.map(m => {
                        const [year, month] = m.split('-');
                        return `${month}/${year}`;
                    }),
                    datasets: [{
                        label: 'الإيرادات الشهرية',
                        data: sortedMonths.map(m => monthlyData[m]),
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                });

            } catch (error) {
                setError('Failed to load revenue data');
                console.error(error);
                setMonthlyGrowth(0);
                setEnrollments([]);
                setRevenueData({
                    daily: 0,
                    weekly: 0,
                    monthly: 0,
                    yearly: 0
                });
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollments();
    }, []);

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            label: 'الإيرادات الشهرية',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    });

    // Update chart data based on selected period
    const updateChartData = (data, period) => {
        const now = new Date();
        const filteredData = data.filter(item => {
            const itemDate = new Date(item.timestamp);
            return itemDate >= new Date(now - periods[period].days * 24 * 60 * 60 * 1000);
        });

        // Group by appropriate interval
        const groupedData = filteredData.reduce((acc, curr) => {
            const date = new Date(curr.timestamp);
            let key;

            switch (period) {
                case 'daily':
                    key = date.toISOString().split('T')[0];
                    break;
                case 'weekly':
                    key = `Week ${Math.ceil(date.getDate() / 7)}`;
                    break;
                case 'monthly':
                    key = `${date.getMonth() + 1}/${date.getFullYear()}`;
                    break;
                case 'yearly':
                    key = date.getFullYear().toString();
                    break;
            }

            acc[key] = (acc[key] || 0) + (curr.price || 0);
            return acc;
        }, {});

        return {
            labels: Object.keys(groupedData),
            datasets: [{
                label: 'الإيرادات',
                data: Object.values(groupedData),
                borderColor: 'rgba(75, 192, 192, 0.8)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true
            }, {
                label: 'المصروفات',
                data: expenses.map(() => expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length),
                borderColor: 'rgba(255, 99, 132, 0.8)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true
            }]
        };
    };

    const calculateStats = (data) => {
        const revenues = data.map(item => item.price || 0);
        return {
            total: revenues.reduce((a, b) => a + b, 0),
            average: revenues.length ? revenues.reduce((a, b) => a + b, 0) / revenues.length : 0,
            max: Math.max(...revenues, 0),
            growth: calculateGrowthRate(revenues)
        };
    };

    const calculateGrowthRate = (revenues) => {
        if (revenues.length < 2) return 0;
        const firstHalf = revenues.slice(0, Math.floor(revenues.length / 2));
        const secondHalf = revenues.slice(Math.floor(revenues.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        return firstAvg ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
    };

    // Add this to your return statement before the chart
    const statsSection = (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: showStats ? 1 : 0, height: showStats ? 'auto' : 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                    <FiDollarSign className="text-emerald-400" />
                    <h3 className="text-white/90">متوسط الإيرادات</h3>
                </div>
                <p className="text-2xl font-bold text-white mt-2">
                    ${calculateStats(parsedEnrollments).average.toLocaleString()}
                </p>
            </div>
            {/* Add similar stats cards for other metrics */}
        </motion.div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 p-4 rounded-xl text-red-500 text-center">
                {error}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
                    <motion.div
                        key={period}
                        whileHover={{ scale: 1.03, translateY: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl"
                    >
                        <h3 className="text-white/90 font-arabicUI3 text-lg mb-3">
                            {period === 'daily' && 'اليومي'}
                            {period === 'weekly' && 'الأسبوعي'}
                            {period === 'monthly' && 'الشهري'}
                            {period === 'yearly' && 'السنوي'}
                        </h3>
                        <div className="flex items-end gap-3">
                            <p className="text-4xl font-bold text-white tracking-tight">
                                ${revenueData[period].toLocaleString()}
                            </p>
                            {period === 'monthly' && monthlyGrowth && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`text-sm ${monthlyGrowth > 0 ? 'text-green-400' : 'text-red-400'} flex items-center gap-1 pb-1`}
                                >
                                    {monthlyGrowth > 0 ? <MdTrendingUp size={18} /> : <MdTrendingDown size={18} />}
                                    {Math.abs(monthlyGrowth).toFixed(1)}%
                                </motion.span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-between items-center">
                <div className="flex gap-4 flex-wrap">
                    {Object.keys(periods).map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-4 py-2 rounded-lg transition-all ${selectedPeriod === period
                                ? 'bg-white/20 text-white shadow-lg'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            {periods[period].label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setShowStats(!showStats)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                >
                    <BsLightningCharge className={`transition-transform ${showStats ? 'rotate-180' : ''}`} />
                    <span>التحليلات المتقدمة</span>
                </button>
            </div>

            {statsSection}

            {/* Expense Calculator Form */}
            <motion.div
                initial={false}
                animate={{ height: showExpenseForm ? 'auto' : 0 }}
                className="overflow-hidden"
            >
                {showExpenseForm && (
                    <form onSubmit={handleAddExpense} className="bg-white/10 rounded-xl p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="number"
                                value={newExpense.amount}
                                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                placeholder="قيمة المصروف"
                                className="bg-white/5 rounded-lg p-2 text-white"
                            />
                            <input
                                type="text"
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                placeholder="وصف المصروف"
                                className="bg-white/5 rounded-lg p-2 text-white"
                            />
                            <input
                                type="date"
                                value={newExpense.date}
                                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                className="bg-white/5 rounded-lg p-2 text-white"
                            />
                        </div>
                        <button type="submit" className="bg-emerald-500/80 px-4 py-2 rounded-lg text-white">
                            إضافة مصروف
                        </button>
                    </form>
                )}
            </motion.div>

            {/* Expenses List */}
            {expenses.length > 0 && (
                <div className="bg-white/10 rounded-xl p-6">
                    <h3 className="text-xl text-white mb-4">المصروفات</h3>
                    <div className="space-y-2">
                        {expenses.map(expense => (
                            <div key={expense.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                <span className="text-white">{expense.description}</span>
                                <span className="text-red-400">${expense.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Expense Button */}
            <button
                onClick={() => setShowExpenseForm(!showExpenseForm)}
                className="fixed bottom-6 right-6 bg-emerald-500 p-4 rounded-full shadow-lg"
            >
                <FaMoneyBillWave className="text-white text-xl" />
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl"
            >
                <h2 className="text-2xl text-white font-arabicUI3 mb-6">تحليل الإيرادات</h2>
                <Line
                    data={{
                        ...chartData,
                        datasets: [{
                            ...chartData.datasets[0],
                            borderColor: 'rgba(75, 192, 192, 0.8)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            fill: true,
                            borderWidth: 2,
                            pointBackgroundColor: 'rgb(75, 192, 192)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgb(75, 192, 192)',
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }]
                    }}
                    options={chartOptions}
                />
            </motion.div>
        </motion.div>
    );
};

export default RevenueAnalytics;
