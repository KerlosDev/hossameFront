'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark'); // Default theme is "dark"
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Check for saved theme preference in localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        } else {
            // If no saved preference, default to dark mode
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        setIsLoaded(true);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const setLightMode = () => {
        setTheme('light');
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
    };

    const setDarkMode = () => {
        setTheme('dark');
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
    };

    const value = {
        theme,
        isLoaded,
        toggleTheme,
        setLightMode,
        setDarkMode,
        isDark: theme === 'dark',
        isLight: theme === 'light'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
