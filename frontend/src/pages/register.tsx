import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { REGISTER } from '../lib/graphql/auth';

type RegisterFormValues = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
};

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>();
  const password = watch('password', '');

  // Register mutation
  const [registerMutation, { loading, error }] = useMutation(REGISTER, {
    onCompleted: () => {
      // Redirect to login page after successful registration
      router.push('/login?registered=true');
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    const { confirmPassword, ...input } = data;
    try {
      await registerMutation({
        variables: {
          input,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Register | QR Check-in System</title>
        <meta name="description" content="Create a new account for the QR Check-in System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="text-gray-400 mt-2">Join the QR Check-in System</p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            {error && (
              <div className="bg-red-600/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                <p>{error.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className={`w-full px-3 py-2 bg-gray-700 border ${
                      errors.firstName ? 'border-red-500' : 'border-gray-600'
                    } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    {...register('firstName', { required: 'First name is required' })}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className={`w-full px-3 py-2 bg-gray-700 border ${
                      errors.lastName ? 'border-red-500' : 'border-gray-600'
                    } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className={`w-full px-3 py-2 bg-gray-700 border ${
                    errors.username ? 'border-red-500' : 'border-gray-600'
                  } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  {...register('username', { required: 'Username is required' })}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`w-full px-3 py-2 bg-gray-700 border ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
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

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full px-3 py-2 bg-gray-700 border ${
                      errors.password ? 'border-red-500' : 'border-gray-600'
                    } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
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

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full px-3 py-2 bg-gray-700 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                  } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match',
                  })}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
