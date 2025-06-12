import { ApolloError } from '@apollo/client';
import { useEffect, useState } from 'react';

interface ErrorHandlerProps {
  error: Error | ApolloError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorHandler({ error, onRetry, onDismiss, className = '' }: ErrorHandlerProps) {
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    if (!error) {
      setErrorMessage('');
      setErrorDetails('');
      return;
    }

    // Format the error message
    if (error instanceof ApolloError) {
      // Handle Apollo errors
      const networkErrorMsg = error.networkError 
        ? `Network Error: ${error.networkError.message}` 
        : '';
      
      const graphQLErrors = error.graphQLErrors && error.graphQLErrors.length > 0
        ? error.graphQLErrors.map(err => err.message).join('\n')
        : '';
      
      setErrorMessage(error.message);
      
      // Create detailed error information for developers
      const details = [
        graphQLErrors && `GraphQL Errors:\n${graphQLErrors}`,
        networkErrorMsg && networkErrorMsg,
        error.stack && `Stack:\n${error.stack}`
      ].filter(Boolean).join('\n\n');
      
      setErrorDetails(details);
    } else {
      // Handle regular Error objects
      setErrorMessage(error.message);
      setErrorDetails(error.stack || '');
    }
  }, [error]);

  if (!error) return null;

  return (
    <div className={`bg-red-600/20 border border-red-500 text-red-200 px-4 py-3 rounded ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <i className="fas fa-exclamation-circle text-red-400 mr-2 mt-1"></i>
          <div>
            <p className="font-medium">{errorMessage}</p>
            {error instanceof ApolloError && error.networkError && (
              <p className="text-sm mt-1">Please check your internet connection and try again.</p>
            )}
          </div>
        </div>
        
        {onDismiss && (
          <button 
            onClick={onDismiss} 
            className="text-red-400 hover:text-red-300"
            aria-label="Dismiss"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
      
      {/* Additional actions */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="bg-red-700 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
            >
              <i className="fas fa-redo-alt mr-1"></i> Retry
            </button>
          )}
        </div>
        
        {errorDetails && (
          <button 
            onClick={() => setDetailsVisible(!detailsVisible)}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            {detailsVisible ? 'Hide details' : 'Show details'}
          </button>
        )}
      </div>
      
      {/* Detailed error information (for developers) */}
      {detailsVisible && errorDetails && (
        <div className="mt-3 p-2 bg-red-900/50 rounded text-xs font-mono whitespace-pre-wrap overflow-auto max-h-40">
          {errorDetails}
        </div>
      )}
    </div>
  );
}

export default ErrorHandler;
