import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { RESET_PASSWORD } from '../lib/graphql/auth';
import Link from 'next/link';

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const { token } = router.query;
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordFormValues>();
  const password = watch('password', '');
  
  const [resetPassword, { loading, error }] = useMutation(RESET_PASSWORD, {
    onCompleted: () => {
      setIsSubmitted(true);
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    await resetPassword({ variables: { token: token as string, password: data.password } });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
              <i className="fas fa-times text-white text-2xl"></i>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Invalid Reset Link</h2>
            <p className="text-gray-400 mb-6">
              The password reset link appears to be invalid or expired.
            </p>
            <Link href="/forgot-password" className="inline-block text-blue-400 hover:text-blue-300">
              Request a new password reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Reset Password | QR Check-in System</title>
        <meta name="description" content="Set a new password for your QR Check-in account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-900 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">QR Check-in</h1>
            <p className="text-gray-400 mt-2">Set a new password</p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            {isSubmitted ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                  <i className="fas fa-check text-white text-2xl"></i>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Password Reset Successful</h2>
                <p className="text-gray-400 mb-6">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
                <Link 
                  href="/login" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
                >
                  Go to Login
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
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="password">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className={`w-full px-3 py-2 bg-gray-700 border ${
                          errors.password ? 'border-red-500' : 'border-gray-600'
                        } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Enter new password"
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters',
                          },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                            message: 'Password must include uppercase, lowercase, number and special character',
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
                    <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`w-full px-3 py-2 bg-gray-700 border ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                        } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Confirm new password"
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: value => value === password || 'Passwords do not match',
                        })}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
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
                          Resetting...
                        </span>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
