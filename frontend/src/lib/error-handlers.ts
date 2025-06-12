import { ApolloError } from '@apollo/client';

// Serialize error objects for better logging
export const serializeError = (error: any): string => {
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

// Format GraphQL errors for consistent display
export const formatGraphQLErrors = (error: ApolloError): string => {
  const messages: string[] = [];
  
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    error.graphQLErrors.forEach((gqlError, i) => {
      messages.push(`GraphQL Error ${i + 1}: ${gqlError.message}`);
      
      if (gqlError.extensions) {
        messages.push(`  Code: ${gqlError.extensions.code || 'N/A'}`);
        messages.push(`  Exception: ${JSON.stringify(gqlError.extensions.exception || {})}`);
      }
      
      if (gqlError.path) {
        messages.push(`  Path: ${gqlError.path.join('.')}`);
      }
    });
  }
  
  if (error.networkError) {
    messages.push(`Network Error: ${error.networkError.message}`);
    if ('statusCode' in error.networkError) {
      messages.push(`  Status Code: ${(error.networkError as any).statusCode}`);
    }
    if ('result' in error.networkError) {
      messages.push(`  Result: ${JSON.stringify((error.networkError as any).result || {})}`);
    }
  }
  
  if (messages.length === 0) {
    messages.push(`Error: ${error.message}`);
  }
  
  return messages.join('\n');
};

// Check if error is an authentication error that requires re-login
export const isAuthenticationError = (error: ApolloError | Error): boolean => {
  if (!(error instanceof ApolloError)) {
    return false;
  }
  
  // Check GraphQL errors
  if (error.graphQLErrors) {
    for (const gqlError of error.graphQLErrors) {
      if (
        gqlError.extensions?.code === 'UNAUTHENTICATED' ||
        gqlError.message.includes('Unauthorized') ||
        gqlError.message.includes('jwt expired') ||
        gqlError.message.includes('invalid token') ||
        gqlError.message.includes('not authenticated')
      ) {
        return true;
      }
    }
  }
  
  // Check network errors (sometimes auth errors come through here)
  if (error.networkError && 'statusCode' in error.networkError) {
    const statusCode = (error.networkError as any).statusCode;
    if (statusCode === 401 || statusCode === 403) {
      return true;
    }
  }
  
  return false;
};

// Get user-friendly error message
export const getUserFriendlyErrorMessage = (error: ApolloError | Error): string => {
  if (!(error instanceof ApolloError)) {
    return error.message;
  }
  
  // Handle common error scenarios
  if (isAuthenticationError(error)) {
    return 'Your session has expired. Please log in again.';
  }
  
  if (error.networkError) {
    if (!navigator.onLine) {
      return 'You appear to be offline. Please check your internet connection and try again.';
    }
    return 'Network error. Please check your connection and try again.';
  }
  
  // Extract GraphQL error message if available
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    const gqlError = error.graphQLErrors[0];
    
    // Handle specific error codes
    if (gqlError.extensions?.code === 'FORBIDDEN') {
      return 'You do not have permission to perform this action.';
    }
    
    if (gqlError.extensions?.code === 'BAD_USER_INPUT') {
      return gqlError.message || 'Invalid input provided.';
    }
    
    // Handle validation errors
    if (gqlError.extensions?.code === 'VALIDATION_ERROR') {
      return gqlError.message || 'The information provided is invalid.';
    }
    
    return gqlError.message;
  }
  
  // Fallback to generic message
  return error.message || 'An unexpected error occurred.';
};
