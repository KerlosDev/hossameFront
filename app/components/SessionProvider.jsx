'use client'
import { useEffect } from 'react';
import sessionManager from '../utils/sessionManager';

/**
 * SessionProvider component that sets up global session management
 * Should be placed at the root of your app
 */
export const SessionProvider = ({ children }) => {
    useEffect(() => {
        // Set up global error handling for fetch requests
        const originalFetch = window.fetch;

        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);                // Check if the response indicates a session problem
                if (response.status === 401) {
                    const clonedResponse = response.clone();
                    try {
                        const data = await clonedResponse.json();
                        if (data.code === 'SESSION_INVALID') {
                            // Trigger immediate session invalidation
                            sessionManager.handleSessionInvalidation(data.message);
                        }
                    } catch (e) {
                        // Failed to parse JSON, continue with original response
                    }
                }

                return response;
            } catch (error) {
                throw error;
            }
        };

        // Cleanup on unmount
        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    // Periodic session validation (every 5 minutes)
    useEffect(() => {
        const validatePeriodically = async () => {
            if (sessionManager.isAuthenticated()) {
                try {
                    await sessionManager.validateSession();
                } catch (error) {
                    if (error.message === 'SESSION_INVALID') {
                        // Session manager will handle this
                        return;
                    }
                    console.error('Session validation error:', error);
                }
            }
        };

        // Validate immediately
        validatePeriodically();

        // Then validate every 5 minutes
        const interval = setInterval(validatePeriodically, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return children;
};
