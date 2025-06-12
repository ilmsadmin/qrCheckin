import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery, useApolloClient, ApolloError, NormalizedCacheObject } from '@apollo/client';
import { LOGIN, LOGOUT, GET_CURRENT_USER } from '../lib/graphql/auth';
import { useRouter } from 'next/router';
import { resetApolloClientStore } from '../lib/apollo-enhanced';
import { formatGraphQLErrors, getUserFriendlyErrorMessage } from '../lib/error-handlers';
import { 
  saveToken, 
  getToken, 
  clearToken, 
  isTokenValid, 
  getTokenTimeRemaining,
  USER_DATA_KEY
} from '../lib/auth-utils';

// Define types for our auth context
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'STAFF' | 'USER';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  username: string;
  firstName: string;
  lastName: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  clearError: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  isAdmin: false,
  isStaff: false,
  clearError: () => {},
});

// User persisted storage key
const USER_STORAGE_KEY = 'qr-checkin-user';

// Helper to serialize/deserialize user data
const serializeUser = (user: User | null): string | null => {
  if (!user) return null;
  return JSON.stringify(user);
};

const deserializeUser = (userData: string | null): User | null => {
  if (!userData) return null;
  try {
    return JSON.parse(userData) as User;
  } catch (error) {
    console.error('Error deserializing user data:', error);
    return null;
  }
};

// Helper to format GraphQL errors for better debugging
const formatApolloError = (error: ApolloError): string => {
  return formatGraphQLErrors(error);
};

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const client = useApolloClient();

  // Helper to store user data in localStorage
  const persistUser = (userData: User | null) => {
    if (typeof window === 'undefined') return;
    
    if (userData) {
      localStorage.setItem(USER_STORAGE_KEY, serializeUser(userData));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  // Clear error helper
  const clearError = () => setError(null);

  // Login mutation
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      if (data?.login?.user) {
        // Set the user in state
        setUser(data.login.user);
        
        // Store the token and user data
        localStorage.setItem('token', data.login.access_token);
        persistUser(data.login.user);
        
        setError(null);
        console.log('Login successful, user data:', data.login.user);
      } else {
        console.error('Login response missing user data');
        setError(new Error('Invalid login response'));
      }
    },
    onError: (error) => {
      console.error('Login error:', formatApolloError(error));
      setError(error);
    },
  });

  // Logout mutation
  const [logoutMutation] = useMutation(LOGOUT, {
    onCompleted: async () => {
      // Clear user state
      setUser(null);
      
      // Clear stored data
      localStorage.removeItem('token');
      localStorage.removeItem(USER_STORAGE_KEY);
      
      // Reset Apollo cache
      try {
        await client.resetStore();
      } catch (error) {
        console.error('Error resetting Apollo client store:', error);
      }
    },
    onError: (error) => {
      console.error('Logout error:', formatApolloError(error));
      setError(error);
      
      // Even if server logout fails, clear local state
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem(USER_STORAGE_KEY);
    },
  });

  // Get current user query
  const { loading: userLoading, refetch } = useQuery(GET_CURRENT_USER, {
    skip: typeof window === 'undefined' || !localStorage.getItem('token'),
    fetchPolicy: 'network-only', // Always fetch from server
    nextFetchPolicy: 'cache-first',
    onCompleted: (data) => {
      if (data?.me) {
        console.log('Current user data received:', data.me);
        setUser(data.me);
        persistUser(data.me);
      } else {
        console.warn('Current user query returned no data');
        setUser(null);
        persistUser(null);
      }
    },
    onError: (error) => {
      console.error('Error fetching current user:', formatApolloError(error));
      // If token is invalid, clear it
      localStorage.removeItem('token');
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    },
  });

  // Check for token and fetch user data on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          console.log('Token found, fetching current user...');
          
          // First try to restore from localStorage for faster startup
          const storedUser = deserializeUser(localStorage.getItem(USER_STORAGE_KEY));
          if (storedUser) {
            console.log('Restored user from local storage:', storedUser);
            setUser(storedUser);
          }
          
          // Then validate with server
          const result = await refetch();
          
          if (result.data?.me) {
            console.log('User session validated with server:', result.data.me);
            setUser(result.data.me);
            persistUser(result.data.me);
          } else {
            console.warn('Token exists but no user data returned from server');
            localStorage.removeItem('token');
            localStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching current user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
        }
      } else {
        console.log('No auth token found');
        setUser(null);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [refetch]);

  // Login function
  const login = async (input: LoginInput) => {
    setLoading(true);
    clearError();
    
    try {
      console.log('Attempting login with email:', input.email);
      const result = await loginMutation({ variables: { input } });
      
      if (result.data?.login?.user) {
        console.log('User authenticated, redirecting based on role');
        
        // Wait for a small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirect based on user role
        if (result.data.login.user.role === 'ADMIN') {
          router.push('/admin');
        } else if (result.data.login.user.role === 'STAFF') {
          router.push('/scanner');
        } else {
          router.push('/packages');
        }
      } else {
        console.error('Login succeeded but no user data returned');
        setError(new Error('Login response was missing user data'));
      }
    } catch (error) {
      console.error('Login function error:', error);
      setError(error as Error);
      
      // Display user-friendly error
      if (error instanceof ApolloError) {
        // Check for specific error types
        const errorMessage = error.graphQLErrors?.[0]?.message || error.message;
        if (errorMessage.includes('credentials') || errorMessage.includes('password')) {
          setError(new Error('Invalid email or password'));
        } else if (errorMessage.includes('not found')) {
          setError(new Error('User not found'));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await logoutMutation();
      // Redirect to login page after logout
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setError(error as Error);
      
      // Even if server logout fails, redirect to login
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  // Computed properties
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: loading || loginLoading || userLoading,
        error,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isStaff,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
