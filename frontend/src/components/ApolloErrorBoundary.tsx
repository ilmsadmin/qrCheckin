import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ApolloError } from '@apollo/client';

interface ApolloErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetErrorBoundary: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ApolloErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ApolloErrorBoundary extends Component<ApolloErrorBoundaryProps, ApolloErrorBoundaryState> {
  constructor(props: ApolloErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ApolloErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('Apollo Error Boundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error!, this.resetErrorBoundary);
        }
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="p-4 bg-red-800/20 border border-red-700 rounded-lg my-4">
          <h2 className="text-xl font-bold text-red-300 mb-2">Something went wrong</h2>
          <p className="text-red-200 mb-4">
            {this.state.error instanceof ApolloError 
              ? 'There was an error with the data fetching. Please try again.' 
              : 'An unexpected error occurred.'}
          </p>
          {this.state.error && (
            <div className="bg-red-900/50 p-3 rounded text-red-200 font-mono text-sm mb-4 overflow-auto max-h-40">
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={this.resetErrorBoundary}
            className="bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      );
    }

    // Otherwise, render children normally
    return this.props.children;
  }
}

export default ApolloErrorBoundary;
