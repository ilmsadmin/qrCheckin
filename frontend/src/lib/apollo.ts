import { ApolloClient, InMemoryCache, createHttpLink, fromPromise, NormalizedCacheObject } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { CachePersistor, LocalStorageWrapper } from 'apollo3-cache-persist';
import { onError } from '@apollo/client/link/error';

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

// Setup cache persistence
export const initializeCachePersistence = async () => {
  if (typeof window === 'undefined') {
    return null; // Skip on server-side
  }
  
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
    console.log('Apollo cache restored from local storage');
  } catch (error) {
    console.warn('Error restoring Apollo cache:', error);
    // If restore fails, purge the cache
    await persistor.purge();
  }

  return persistor;
};

const httpLink = createHttpLink({
  uri: '/api/graphql', // Use the proxy through Next.js rewrites
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

// Error handling link to handle token expiration and network errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  const operationName = operation.operationName || 'Unknown Operation';
  console.log(`[GraphQL operation]: ${operationName}`);
  
  if (graphQLErrors) {
    console.error(`[GraphQL errors for ${operationName}]:`, graphQLErrors);
    
    for (let err of graphQLErrors) {
      // Log detailed error information for debugging
      console.error(`[Error in ${operationName}]:`, {
        message: err.message,
        path: err.path,
        code: err.extensions?.code,
        details: err.extensions
      });
      
      // Handle specific auth errors (adjust based on your backend error structure)
      if (err.extensions?.code === 'UNAUTHENTICATED' || 
          err.message.includes('Unauthorized') || 
          err.message.includes('jwt expired')) {
        console.warn('Authentication error detected, clearing token');
        
        // Clear the token and trigger login redirect
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          
          // If it's not the login page or current user query, show an error alert
          if (!operation.operationName?.includes('Login') && 
              !operation.operationName?.includes('Me')) {
            alert('Your session has expired. Please log in again.');
            
            // Redirect to login page
            window.location.href = '/login';
          }
        }
      }
    }
  }
  
  if (networkError) {
    // Cast networkError to get access to more properties
    const netError = networkError as any;
    console.error(`[Network Error in ${operationName}]:`, {
      message: netError.message,
      name: netError.name,
      stack: netError.stack,
      status: netError.statusCode || netError.status,
      response: netError.response,
    });
    // You can handle specific network errors here
    // For example, if the server is down, you might want to show a friendly message
    if (typeof window !== 'undefined' && 
        !window.location.pathname.includes('/login') && 
        !window.location.pathname.includes('/offline') &&
        !window.location.pathname.includes('/help')) {
      
      // Only show once per session to avoid alert spam
      const errorKey = `network_error_${Date.now()}`;
      if (!window.sessionStorage.getItem(errorKey)) {
        window.sessionStorage.setItem(errorKey, 'true');
        
        // Show different messages based on error type
        if (netError.message?.includes('Failed to fetch')) {
          console.warn('API server connection failed. The server might be down or unreachable.');
          // Redirect to help page which has offline support info
          window.location.href = '/help?error=connection';
        } else {
          console.warn('API server error:', netError.message);
        }
      }
    }
  }
});

// Create the Apollo client
export const createApolloClient = (): ApolloClient<NormalizedCacheObject> => {
  // Always use the API proxy via Next.js to avoid CORS issues
  console.log(`Creating Apollo client with API proxy at: /api/graphql`);
  
  // Use the existing httpLink that points to our API proxy
  const proxyHttpLink = createHttpLink({
    uri: '/api/graphql',
    credentials: 'same-origin', // Changed from 'include' to 'same-origin'
  });
  
  return new ApolloClient({
    link: errorLink.concat(authLink.concat(proxyHttpLink)),
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-first', // Changed from network-only for better performance
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
      },
      query: {
        fetchPolicy: 'cache-first', // Changed from network-only
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
    connectToDevTools: process.env.NODE_ENV === 'development',
  });
};

// Global client instance
export let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

// Safe initialization function to create Apollo client
export const initializeApolloClient = async (): Promise<ApolloClient<NormalizedCacheObject>> => {
  // Only create once on client side
  if (typeof window !== 'undefined') {
    if (!apolloClient) {
      apolloClient = createApolloClient();
      console.log('Apollo client initialized and cached globally');
    }
    return apolloClient;
  }
  
  // For SSR, create a fresh client
  return createApolloClient();
};
