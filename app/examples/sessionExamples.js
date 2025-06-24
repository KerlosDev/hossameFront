// Example of how to use session management in your components

import { useAuth } from '../hooks/useAuth';
import sessionManager from '../utils/sessionManager';

export const ExampleComponent = () => {
    const { isAuthenticated, user, logout, isAdmin } = useAuth();

    // Example of making an authenticated API call
    const fetchUserData = async () => {
        try {
            const response = await sessionManager.makeAuthenticatedRequest(
                `${process.env.NEXT_PUBLIC_API_URL}/user/profile`
            );

            if (response.ok) {
                const data = await response.json();
                console.log('User data:', data);
            }
        } catch (error) {
            if (error.message === 'SESSION_INVALID') {
                // Session manager will handle the logout automatically
                console.log('Session invalid, user will be logged out');
                return;
            }
            console.error('API call failed:', error);
        }
    };

    if (!isAuthenticated) {
        return <div>Please log in to access this content</div>;
    }

    return (
        <div>
            <h1>Welcome, {user?.username}!</h1>
            {isAdmin && <p>Admin privileges enabled</p>}
            <button onClick={fetchUserData}>Fetch Data</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

// Example of a protected page component
export const ProtectedPageExample = () => {
    return (
        <ProtectedRoute>
            <div>
                <h1>This is a protected page</h1>
                <p>Only authenticated users can see this content</p>
            </div>
        </ProtectedRoute>
    );
};

// Example of an admin-only page
export const AdminPageExample = () => {
    return (
        <ProtectedRoute requireAdmin={true}>
            <div>
                <h1>Admin Dashboard</h1>
                <p>Only admins can see this content</p>
            </div>
        </ProtectedRoute>
    );
};

// Example of wrapping auth pages to redirect logged-in users
export const LoginPageExample = () => {
    return (
        <GuestRoute>
            <div>
                <h1>Login Page</h1>
                <p>Authenticated users will be redirected automatically</p>
            </div>
        </GuestRoute>
    );
};
