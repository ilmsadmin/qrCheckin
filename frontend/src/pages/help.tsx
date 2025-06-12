import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Help() {
  const router = useRouter();
  const [showConnectionError, setShowConnectionError] = useState(false);
  
  // Check for error query parameter
  useEffect(() => {
    if (router.query.error === 'connection') {
      setShowConnectionError(true);
    }
  }, [router.query.error]);
  
  return (
    <>
      <Head>
        <title>Help & Demo Accounts | QR Check-in System</title>
        <meta name="description" content="Help and demo accounts for the QR Check-in System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-900 flex flex-col">
        <header className="bg-gray-800 py-4 px-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">QR Check-in System</h1>
            <button 
              onClick={() => router.push('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Back to Login
            </button>
          </div>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
          {showConnectionError && (
            <div className="bg-amber-900/40 border border-amber-700 text-amber-100 px-4 py-4 rounded-lg mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-amber-200">Connection Error Detected</h3>
                  <div className="mt-2 text-sm">
                    <p>We're having trouble connecting to the backend server. This could be due to:</p>
                    <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
                      <li>The backend server is not running</li>
                      <li>Network connectivity issues</li>
                      <li>CORS configuration problems</li>
                    </ul>
                    <p className="mt-3 font-medium">Try the following:</p>
                    <ol className="list-decimal list-inside mt-1 ml-2 space-y-1">
                      <li>Make sure the backend server is running at localhost:4000</li>
                      <li>Check your network connection</li>
                      <li>Try using one of the demo accounts below</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Help & Demo Accounts</h2>
            <p className="text-gray-300 mb-6">
              Welcome to the QR Check-in System demo. Below are test accounts you can use to explore different roles in the system.
            </p>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Test Accounts</h3>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-500 rounded-full p-2 mr-3">
                      <i className="fas fa-user-shield text-white"></i>
                    </div>
                    <h4 className="text-lg font-medium text-white">Admin User</h4>
                  </div>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="text-gray-400">Email:</span> admin@qrcheckin.com</p>
                    <p><span className="text-gray-400">Password:</span> admin123</p>
                    <p><span className="text-gray-400">Access:</span> Full admin access</p>
                  </div>
                  <button 
                    onClick={() => {
                      router.push({
                        pathname: '/login',
                        query: { email: 'admin@qrcheckin.com' }
                      });
                    }}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors"
                  >
                    Use this account
                  </button>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-green-500 rounded-full p-2 mr-3">
                      <i className="fas fa-user-tie text-white"></i>
                    </div>
                    <h4 className="text-lg font-medium text-white">Staff User</h4>
                  </div>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="text-gray-400">Email:</span> staff@qrcheckin.com</p>
                    <p><span className="text-gray-400">Password:</span> staff123</p>
                    <p><span className="text-gray-400">Access:</span> Staff permissions</p>
                  </div>
                  <button 
                    onClick={() => {
                      router.push({
                        pathname: '/login',
                        query: { email: 'staff@qrcheckin.com' }
                      });
                    }}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm transition-colors"
                  >
                    Use this account
                  </button>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-purple-500 rounded-full p-2 mr-3">
                      <i className="fas fa-user text-white"></i>
                    </div>
                    <h4 className="text-lg font-medium text-white">Member User</h4>
                  </div>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="text-gray-400">Email:</span> user@qrcheckin.com</p>
                    <p><span className="text-gray-400">Password:</span> user123</p>
                    <p><span className="text-gray-400">Access:</span> Basic member access</p>
                  </div>
                  <button 
                    onClick={() => {
                      router.push({
                        pathname: '/login',
                        query: { email: 'user@qrcheckin.com' }
                      });
                    }}
                    className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-sm transition-colors"
                  >
                    Use this account
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Developer Account</h3>
              <div className="bg-gray-700 rounded-lg p-5">
                <div className="flex items-start mb-3">
                  <div className="bg-yellow-500 rounded-full p-2 mr-3 mt-1">
                    <i className="fas fa-code text-white"></i>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">Test Developer Account</h4>
                    <p className="text-gray-300 mb-3">This account is from the test script and should work with the current backend setup:</p>
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-md text-gray-300">
                  <p><span className="text-gray-400">Email:</span> toan@zplus.vn</p>
                  <p><span className="text-gray-400">Password:</span> ToanLinh</p>
                </div>
                <button 
                  onClick={() => {
                    router.push({
                      pathname: '/login',
                      query: { email: 'toan@zplus.vn' }
                    });
                  }}
                  className="mt-4 w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded text-sm transition-colors"
                >
                  Use developer account
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Troubleshooting Tips</h2>
            
            <div className="space-y-4 text-gray-300">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">Connection Issues</h3>
                <p>If you're experiencing connection errors:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Make sure the backend server is running at localhost:4000</li>
                  <li>Check if there are any network or firewall restrictions</li>
                  <li>Try clearing your browser cache and cookies</li>
                </ul>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">Authentication Problems</h3>
                <p>If you can't log in:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Verify you're using the correct credentials</li>
                  <li>Check if the account exists in the database</li>
                  <li>Make sure the backend auth service is configured correctly</li>
                </ul>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">Developer Tools</h3>
                <p>Some useful tools for debugging:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Check browser console for error messages</li>
                  <li>Use GraphQL Playground at localhost:4000/graphql to test queries</li>
                  <li>Review the Apollo Client Developer Tools extension if installed</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
        
        <footer className="bg-gray-800 text-gray-400 py-6 border-t border-gray-700">
          <div className="container mx-auto px-6">
            <p className="text-center">QR Check-in System Demo &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </>
  );
}
