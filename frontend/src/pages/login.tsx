import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import ApiConnectionStatus from '../components/ApiConnectionStatus';

type LoginFormValues = {
  email: string;
  password: string;
};

export default function Login() {
  const { login, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'error' | 'checking'>('checking');
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>();

  // Handle API status changes
  const handleApiStatusChange = (status: 'online' | 'offline' | 'error' | 'checking') => {
    // Only log significant changes (not checking transitions)
    if (status !== 'checking' && status !== apiStatus) {
      console.log('API connection status changed to:', status);
    }
    setApiStatus(status);
  };
  
  const onSubmit = async (data: LoginFormValues) => {
    await login(data);
  };
  
  // Check API status and pre-fill email
  useEffect(() => {
    // Check API status immediately on component mount
    const queryApiStatus = async () => {
      if (typeof window === 'undefined') return;
      
      // Check if we have a recent cached status
      const cachedTime = sessionStorage.getItem('lastApiCheck');
      const now = Date.now();
      const CACHE_TTL = 30000; // 30 seconds cache TTL
      
      if (cachedTime && (now - parseInt(cachedTime) < CACHE_TTL)) {
        // Use cached online status
        console.log('Using cached API status');
        setApiStatus('online');
        return;
      }
      
      try {
        // Simple fetch to check API connection
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '{ __typename }' })
        });
        
        if (response.ok) {
          // Store successful check time
          sessionStorage.setItem('lastApiCheck', now.toString());
          setApiStatus('online');
        } else {
          console.warn('API returned error status:', response.status);
          setApiStatus('error');
        }
      } catch (error) {
        console.error('API connection check error:', error);
        setApiStatus('error');
      }
    };
    
    // Run the status check
    queryApiStatus();
    
    // Also pre-fill email if in query params
    if (router.query.email && typeof router.query.email === 'string') {
      const emailInput = document.getElementById('email') as HTMLInputElement;
      if (emailInput) {
        emailInput.value = router.query.email;
      }
    }
  }, [router.query.email]);

  return (
    <>
      <Head>
        <title>Login | QR Check-in System</title>
        <meta name="description" content="Login to the QR Check-in System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-900 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">QR Check-in</h1>
            <p className="text-gray-400 mt-2">Sign in to your account</p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            {error && (
              <div className="bg-red-600/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium">{error.message}</p>
                    <p className="text-sm mt-1">
                      Need help? <Link href="/help" className="text-blue-300 hover:text-blue-200 underline">View demo accounts</Link> or try again.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Network status indicator */}
            <div className="flex items-center justify-center mb-4">
              <ApiConnectionStatus onStatusChange={handleApiStatusChange} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`w-full px-3 py-2 bg-gray-700 border ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="password">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full px-3 py-2 bg-gray-700 border ${
                      errors.password ? 'border-red-500' : 'border-gray-600'
                    } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div className="mb-6">
                <button
                  type="submit"
                  className={`w-full font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors ${
                    apiStatus === 'online' && !loading 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-700 text-gray-300 cursor-not-allowed'
                  }`}
                  disabled={loading || apiStatus !== 'online'}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Signing in...
                    </span>
                  ) : apiStatus === 'checking' ? (
                    <span className="flex items-center justify-center">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Checking connection...
                    </span>
                  ) : apiStatus === 'offline' ? (
                    <span className="flex items-center justify-center">
                      <i className="fas fa-wifi-slash mr-2"></i>
                      Network offline
                    </span>
                  ) : apiStatus === 'error' ? (
                    <span className="flex items-center justify-center">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Server connection error
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-400 hover:text-blue-300">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
