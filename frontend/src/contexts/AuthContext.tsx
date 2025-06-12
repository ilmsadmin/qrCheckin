import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { LOGIN, LOGOUT, GET_CURRENT_USER } from '../lib/graphql/auth';
import { useRouter } from 'next/router';

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
});

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const client = useApolloClient();

  // Login mutation
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      if (data?.login?.user) {
        setUser(data.login.user);
        setError(null);
        localStorage.setItem('token', data.login.access_token);
        console.log('Login successful, user data:', data.login.user);
      } else {
        console.error('Login response missing user data');
        setError(new Error('Invalid login response'));
      }
    },
    onError: (error) => {
      console.error('Login error details:', error);
      
      // Create user-friendly error message based on the error type
      if (error.graphQLErrors?.length > 0) {
        const gqlError = error.graphQLErrors[0];
        
        if (gqlError.extensions?.code === 'UNAUTHENTICATED') {
          setError(new Error('Invalid email or password. Please try again.'));
        } else {
          setError(new Error(gqlError.message || 'Authentication error'));
        }
      } else if (error.networkError) {
        setError(new Error('Network error. Please check your connection and try again.'));
      } else {
        setError(new Error('Login failed. Please try again.'));
      }
    },
  });

  // Logout mutation
  const [logoutMutation] = useMutation(LOGOUT, {
    onCompleted: async () => {
      setUser(null);
      localStorage.removeItem('token');
      // Clear Apollo cache
      await client.resetStore();
    },
    onError: (error) => {
      setError(error);
    },
  });

  // Get current user query
  const { loading: userLoading, refetch } = useQuery(GET_CURRENT_USER, {
    skip: !localStorage.getItem('token'),
    fetchPolicy: 'network-only', // Always fetch from server
    nextFetchPolicy: 'cache-first',
    onCompleted: (data) => {
      if (data?.me) {
        console.log('Current user data received:', data.me);
        setUser(data.me);
      } else {
        console.warn('Current user query returned no data');
      }
    },
    onError: (error) => {
      console.error('Error fetching current user:', error);
      // If token is invalid, clear it
      localStorage.removeItem('token');
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
          const result = await refetch();
          
          if (result.data?.me) {
            console.log('User session restored:', result.data.me);
            setUser(result.data.me);
          } else {
            console.warn('Token exists but no user data returned');
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error fetching current user:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        console.log('No auth token found');
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [refetch]);

  // Login function
  const login = async (input: LoginInput) => {
    setLoading(true);
    setError(null); // Reset any previous errors
    
    try {
      // Add retry logic for network issues
      let retries = 0;
      const maxRetries = 2;
      
      const attemptLogin = async (): Promise<any> => {
        try {
          return await loginMutation({ 
            variables: { input },
            // Automatically handle Apollo errors
            onError: (error) => {
              console.error('Apollo Error during login:', error);
              throw error; // Rethrow to be caught by the retry logic
            }
          });
        } catch (error: any) {
          // If it's a network error and we haven't reached max retries, try again
          if (error.networkError && retries < maxRetries) {
            retries++;
            console.log(`Network error during login, retrying (${retries}/${maxRetries})...`);
            // Wait with exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            return attemptLogin();
          } else {
            throw error; // We're out of retries or it's not a network error
          }
        }
      };
      
      const result = await attemptLogin();
      
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
      }
    } catch (error: any) {
      console.error('Login function error:', error);
      
      // Set a more user-friendly error message based on the error
      if (error.graphQLErrors?.some((err: any) => 
        err.message.includes('credentials') || 
        err.extensions?.code === 'UNAUTHENTICATED'
      )) {
        setError(new Error('Invalid email or password. Please try again.'));
      } else if (error.networkError) {
        setError(new Error('Network error. Please check your connection and try again.'));
      } else {
        setError(new Error(error.message || 'An error occurred during login.'));
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
      setError(error as Error);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
