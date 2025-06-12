import { useRouter } from 'next/router';
import { useEffect, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireStaff?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = false,
  requireAdmin = false,
  requireStaff = false,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isAdmin, isStaff, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait until the authentication state is loaded

    // If authentication is required and user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push({
        pathname: '/login',
        query: { returnUrl: router.asPath }
      });
      return;
    }

    // If admin role is required and user is not an admin
    if (requireAdmin && !isAdmin) {
      router.push('/');
      return;
    }

    // If staff role is required and user is not staff
    if (requireStaff && !isStaff) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, isAdmin, isStaff, loading, requireAuth, requireAdmin, requireStaff, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show 403 error for unauthorized access (authenticated but not authorized)
  if (
    (requireAdmin && isAuthenticated && !isAdmin) ||
    (requireStaff && isAuthenticated && !isStaff)
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="text-xl mb-6">You don't have permission to access this page.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // If all checks pass, render the children
  return <>{children}</>;
}
