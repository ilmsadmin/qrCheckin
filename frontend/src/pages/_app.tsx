import '../globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ApolloClient, ApolloProvider, NormalizedCacheObject } from '@apollo/client'
import { useEffect, useState } from 'react'
import { initializeApolloClient, initializeCachePersistence } from '../lib/apollo'
import { AuthProvider } from '../contexts/AuthContext'

export default function App({ Component, pageProps }: AppProps) {
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject> | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    async function initApollo() {
      try {
        console.log('Initializing Apollo client...');
        
        // Initialize the cache persister
        await initializeCachePersistence();
        
        // Create the Apollo client with the persisted cache
        const newClient = await initializeApolloClient();
        setClient(newClient);
        
        console.log('Apollo client initialized successfully');
      } catch (error) {
        console.error('Error initializing Apollo client:', error);
        
        // Check if API proxy is accessible
        try {
          console.log('Testing API proxy connection...');
          
          // Simple fetch to check if API proxy is accessible
          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              query: '{ __typename }' // Simplest possible query
            }),
          });
          
          if (!response.ok) {
            console.error('API proxy is accessible but returned an error:', await response.text());
            setInitError(new Error(`API proxy error: ${response.status} ${response.statusText}`));
          } else {
            // API proxy is accessible but there was another error with Apollo setup
            setInitError(error as Error);
          }
        } catch (connectionError) {
          console.error('API proxy connection test failed:', connectionError);
          setInitError(new Error(`Cannot connect to API proxy. Details: ${(error as Error).message}`));
        }
        
        // Fallback to creating a new client without persistence
        try {
          console.log('Attempting to create fallback Apollo client...');
          const newClient = await initializeApolloClient();
          setClient(newClient);
        } catch (fallbackError) {
          console.error('Critical error initializing Apollo client fallback:', fallbackError);
          setInitError(fallbackError as Error);
        }
      } finally {
        setLoading(false);
      }
    }

    initApollo();
  }, []);

  // Show loading indicator while initializing Apollo client
  if (loading || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-300 mb-4">Application Error</h2>
          <p className="mb-4">There was a problem initializing the application:</p>
          <div className="bg-red-950 p-3 rounded text-red-200 font-mono text-sm mb-4 overflow-auto max-h-40">
            {initError.message}
          </div>
          
          {/* Show helpful tips for API connection errors */}
          {initError.message.includes('connect to GraphQL API') && (
            <div className="bg-yellow-900/50 border border-yellow-700 rounded p-3 mb-4">
              <h3 className="text-yellow-300 font-semibold mb-2">Troubleshooting Tips:</h3>
              <ul className="text-yellow-100 text-sm list-disc pl-5 space-y-1">
                <li>Check if the backend server is running</li>
                <li>Verify that the API URL is correct in your environment variables</li>
                <li>Make sure there are no network connectivity issues</li>
                <li>Check for any CORS configuration issues</li>
              </ul>
            </div>
          )}
          
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <ApolloProvider client={client}>
      <Head>
        <link 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
          rel="stylesheet" 
        />
      </Head>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ApolloProvider>
  )
}