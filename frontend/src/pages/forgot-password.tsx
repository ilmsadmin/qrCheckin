import Head from 'next/head';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { FORGOT_PASSWORD } from '../lib/graphql/auth';
import Link from 'next/link';

type ForgotPasswordFormValues = {
  email: string;
};

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>();
  
  const [requestPasswordReset, { loading, error }] = useMutation(FORGOT_PASSWORD, {
    onCompleted: () => {
      setIsSubmitted(true);
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await requestPasswordReset({ variables: { email: data.email } });
  };

  return (
    <>
      <Head>
        <title>Reset Password | QR Check-in System</title>
        <meta name="description" content="Reset your QR Check-in System password" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-900 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">QR Check-in</h1>
            <p className="text-gray-400 mt-2">Reset your password</p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            {isSubmitted ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                  <i className="fas fa-check text-white text-2xl"></i>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
                <p className="text-gray-400 mb-6">
                  We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
                </p>
                <Link href="/login" className="inline-block text-blue-400 hover:text-blue-300">
                  Return to login
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-600/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                    <p>{error.message}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`w-full px-3 py-2 bg-gray-700 border ${
                        errors.email ? 'border-red-500' : 'border-gray-600'
                      } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter your email address"
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
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Sending...
                        </span>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center mt-4">
                  <p className="text-gray-400 text-sm">
                    Remember your password?{' '}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300">
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
