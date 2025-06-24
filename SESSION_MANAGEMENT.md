# Session Management System

This session management system provides single-device login functionality and automatic session invalidation when users log in from different devices.

## Features

- **Single Device Login**: Users can only be logged in on one device at a time
- **Automatic Session Invalidation**: When a user logs in from a new device, their session on the previous device is automatically invalidated
- **Session Validation**: Periodic checks to ensure sessions are still valid
- **Automatic Logout**: Users are automatically logged out when their session is invalidated
- **Toast Notifications**: Users receive notifications when they're logged out due to login from another device

## Components

### SessionManager (`utils/sessionManager.js`)

The core session management utility that handles:
- Token storage and retrieval
- Authenticated API requests
- Session invalidation handling
- User data management

### useAuth Hook (`hooks/useAuth.js`)

A React hook that provides:
- Authentication state management
- User data access
- Loading states
- Logout functionality

### SessionProvider (`components/SessionProvider.jsx`)

A provider component that sets up:
- Global session monitoring
- Periodic session validation
- Automatic error handling

### Route Protection Components

- `ProtectedRoute`: Protects routes that require authentication
- `GuestRoute`: Redirects authenticated users away from auth pages

## Usage

### 1. Setup (Already Done)

The `SessionProvider` is already wrapped around your app in `layout.jsx`.

### 2. Using Authentication in Components

```jsx
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
    const { isAuthenticated, user, logout, isAdmin } = useAuth();
    
    if (!isAuthenticated) {
        return <div>Please log in</div>;
    }
    
    return (
        <div>
            <h1>Welcome, {user?.username}!</h1>
            {isAdmin && <p>Admin Panel Available</p>}
            <button onClick={logout}>Logout</button>
        </div>
    );
};
```

### 3. Making Authenticated API Calls

```jsx
import sessionManager from '../utils/sessionManager';

const fetchData = async () => {
    try {
        const response = await sessionManager.makeAuthenticatedRequest(
            `${process.env.NEXT_PUBLIC_API_URL}/api/data`
        );
        
        if (response.ok) {
            const data = await response.json();
            // Handle data
        }
    } catch (error) {
        if (error.message === 'SESSION_INVALID') {
            // Session manager handles logout automatically
            return;
        }
        // Handle other errors
    }
};
```

### 4. Protecting Routes

```jsx
import { ProtectedRoute } from '../hooks/useAuth';

const Dashboard = () => {
    return (
        <ProtectedRoute>
            <div>Protected content here</div>
        </ProtectedRoute>
    );
};

// For admin-only pages
const AdminPanel = () => {
    return (
        <ProtectedRoute requireAdmin={true}>
            <div>Admin-only content</div>
        </ProtectedRoute>
    );
};
```

### 5. Auth Pages (Sign In/Sign Up)

```jsx
import { GuestRoute } from '../hooks/useAuth';

const SignInPage = () => {
    return (
        <GuestRoute>
            {/* Sign in form */}
        </GuestRoute>
    );
};
```

## How It Works

1. **Login Process**: When a user logs in, a session token is generated and stored both client-side and server-side
2. **Session Validation**: Each authenticated request includes the session token for validation
3. **Single Device Enforcement**: When a user logs in from a new device, the previous session token is invalidated
4. **Automatic Logout**: If a session is invalidated, the user is automatically logged out and redirected
5. **Notifications**: Users receive a toast notification explaining why they were logged out

## Backend Integration

The backend should implement:
- Session token generation and storage in user model
- Session validation in the `protect` middleware
- Session invalidation on new logins
- `/auth/validate` endpoint for session verification

## Error Handling

The system automatically handles:
- Network errors during session validation
- Session invalidation due to login from another device
- Token expiration
- Invalid or missing tokens

Users are gracefully logged out with appropriate notifications when session issues occur.

## Configuration

- Session validation occurs every 5 minutes
- Tokens expire after 7 days (configured in backend)
- Remember me functionality extends cookie expiration to 30 days
- Toast notifications appear for 3 seconds

## Migration from Old System

The old cookie-based authentication has been replaced with this session management system. The main changes:

1. Replace direct cookie access with `sessionManager` methods
2. Use `useAuth` hook instead of manual state management
3. Use `sessionManager.makeAuthenticatedRequest` for API calls
4. Wrap protected routes with `ProtectedRoute` component
5. Wrap auth pages with `GuestRoute` component
