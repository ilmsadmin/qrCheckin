import { ApolloClient, InMemoryCache, createHttpLink, fromPromise, NormalizedCacheObject } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { CachePersistor, LocalStorageWrapper } from 'apollo3-cache-persist';
import { onError } from '@apollo/client/link/error';
import { getToken } from './auth-utils';

// Create cache for Apollo Client
export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        events: {
          // Merge function for events
          merge(existing, incoming) {
            return incoming;
          }
        },
        checkinLogs: {
          // Merge function for check-in logs
          merge(existing, incoming) {
            return incoming;
          }
        }
      }
    }
  }
});

// Serialize error objects for better logging
const serializeError = (error: any) => {
  if (!error) return 'No error details';
  
  const serialized = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    networkError: error.networkError ? {
      name: error.networkError.name,
      message: error.networkError.message,
      statusCode: error.networkError.statusCode,
      result: error.networkError.result
    } : null,
    graphQLErrors: error.graphQLErrors ? error.graphQLErrors.map((gqlError: any) => ({
      message: gqlError.message,
      path: gqlError.path,
      extensions: gqlError.extensions,
      locations: gqlError.locations
    })) : null
  };
  
  return JSON.stringify(serialized, null, 2);
};

// Setup cache persistence
export const initializeCachePersistence = async () => {
  const persistor = new CachePersistor({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
    key: 'qr-checkin-cache',
    maxSize: 5242880, // 5MB
    debug: process.env.NODE_ENV === 'development',
  });

  // Attempt to restore data from local storage
  try {
    await persistor.restore();
  } catch (error) {
    console.warn('Error restoring Apollo cache:', error);
    // If restore fails, purge the cache
    await persistor.purge();
  }

  return persistor;
};

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext((operation, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (token) {
    console.log(`[${operation.operationName}] Adding auth token to request`);
  }
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Error handling link to handle token expiration
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  console.log(`[GraphQL operation]: ${operation.operationName}`);
  
  if (graphQLErrors) {
    console.error(`[GraphQL errors for ${operation.operationName}]:`, graphQLErrors);
    
    // Log detailed error information for debugging
    graphQLErrors.forEach((err, index) => {
      console.error(`[GraphQL Error ${index + 1}]: ${err.message}`);
      console.error(`Extensions:`, err.extensions);
      console.error(`Path:`, err.path);
      console.error(`Locations:`, err.locations);
    });
    
    for (let err of graphQLErrors) {
      // Handle specific auth errors (adjust based on your backend error structure)
      if (err.extensions?.code === 'UNAUTHENTICATED' || 
          err.message.includes('Unauthorized') || 
          err.message.includes('jwt expired') ||
          err.message.includes('invalid token') ||
          err.message.includes('not authenticated')) {
        console.warn('Authentication error detected, clearing token');
        
        // Clear the token and trigger login redirect
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // If it's not the login page or current user query, show an error alert
          if (!operation.operationName?.includes('Login') && 
              !operation.operationName?.includes('Me')) {
            // Use a more user-friendly notification
            const message = 'Your session has expired. Please log in again.';
            console.error(message);
            
            // Avoid multiple alerts by checking if we're already on the login page
            const isLoginPage = window.location.pathname === '/login';
            if (!isLoginPage) {
              alert(message);
              // Redirect to login page
              window.location.href = '/login';
            }
          }
        }
      }
    }
  }

  if (networkError) {
    console.error(`[Network Error for ${operation.operationName}]:`, networkError);
    // Log detailed network error information
    if (networkError instanceof Error) {
      console.error(`Error name: ${networkError.name}`);
      console.error(`Error message: ${networkError.message}`);
      console.error(`Error stack: ${networkError.stack}`);
    }
    
    // Handle offline status
    if ('online' in navigator && !navigator.onLine) {
      console.error('Device appears to be offline');
      if (typeof window !== 'undefined') {
        // Show offline notification if not already on the error page
        const isErrorPage = window.location.pathname === '/error';
        if (!isErrorPage) {
          alert('You appear to be offline. Please check your connection and try again.');
        }
      }
    }
  }
});

// Enhanced error logging
const enhancedErrorHandling = (error: any) => {
  // Only log in development or if explicitly enabled
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_VERBOSE_LOGGING === 'true') {
    console.group('Apollo Error Details');
    console.error('Error occurred during GraphQL operation:');
    console.error(serializeError(error));
    console.groupEnd();
  }
  
  // Return the error for further handling
  return error;
};

export const createApolloClient = (): ApolloClient<NormalizedCacheObject> => {
  return new ApolloClient({
    link: errorLink.concat(authLink.concat(httpLink)),
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only', // Always fetch new data from the server
        nextFetchPolicy: 'cache-first', // Then use cache for subsequent requests
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
    connectToDevTools: process.env.NODE_ENV === 'development',
    // Log any uncaught errors
    onError: enhancedErrorHandling
  });
};

// Function to reset Apollo Client state (useful for logout)
export const resetApolloClientStore = async (client: ApolloClient<NormalizedCacheObject>) => {
  try {
    console.log('Resetting Apollo client store');
    await client.resetStore();
    console.log('Apollo client store reset successfully');
  } catch (error) {
    console.error('Error resetting Apollo client store:', error);
  }
};

// Singleton instance - will be initialized in _app.tsx
export let apolloClient = typeof window !== 'undefined' 
  ? createApolloClient() 
  : null as unknown as ApolloClient<NormalizedCacheObject>;
