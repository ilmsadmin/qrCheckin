import { NextPage } from 'next';
import { ComponentType, ReactElement } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';

// Types for the authentication requirements
export type AuthRequirements = {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireStaff?: boolean;
};

// Type for the wrapped component
export type WithAuthProps = AuthRequirements;

/**
 * Higher-order component that wraps a page with authentication protection
 * @param Component The page component to wrap
 * @param authRequirements Authentication requirements for the page
 */
export function withAuth<P extends WithAuthProps = WithAuthProps>(
  Component: ComponentType<P>,
  authRequirements: AuthRequirements = {}
) {
  const WithAuth: NextPage<P> = (props) => {
    // Extract auth requirements
    const { requireAuth = false, requireAdmin = false, requireStaff = false } = authRequirements;

    return (
      <ProtectedRoute
        requireAuth={requireAuth}
        requireAdmin={requireAdmin}
        requireStaff={requireStaff}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  // Copy static methods and display name
  if (Component.displayName) {
    WithAuth.displayName = `WithAuth(${Component.displayName})`;
  }

  return WithAuth;
}

/**
 * Creates a page that requires authentication
 */
export function withAuthentication<P extends WithAuthProps>(Component: ComponentType<P>) {
  return withAuth(Component, { requireAuth: true });
}

/**
 * Creates a page that requires admin role
 */
export function withAdminAuth<P extends WithAuthProps>(Component: ComponentType<P>) {
  return withAuth(Component, { requireAuth: true, requireAdmin: true });
}

/**
 * Creates a page that requires staff role (or higher)
 */
export function withStaffAuth<P extends WithAuthProps>(Component: ComponentType<P>) {
  return withAuth(Component, { requireAuth: true, requireStaff: true });
}
