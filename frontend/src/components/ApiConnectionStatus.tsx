import { useState, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';

const API_STATUS_QUERY = gql`
  query ApiStatus {
    __typename
  }
`;

type ApiStatusProps = {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onStatusChange?: (status: 'online' | 'offline' | 'error' | 'checking') => void;
};

const ApiConnectionStatus: React.FC<ApiStatusProps> = ({
  className = '',
  showLabel = true,
  size = 'md',
  onStatusChange
}) => {
  const [status, setStatus] = useState<'online' | 'offline' | 'error' | 'checking'>('checking');
  const client = useApolloClient();
  
  // Get the indicator size
  const dotSize = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-3 w-3'
  }[size];
  
  // Get text size
  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];
  
  // Function to check API connection
  const checkConnection = async (): Promise<'online' | 'offline' | 'error'> => {
    // First check if browser is online
    if (typeof window !== 'undefined' && !navigator.onLine) {
      return 'offline';
    }
    
    try {
      // Create an AbortController to handle timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      // Direct fetch to check connection
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ __typename }' }),
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return 'online';
      } else {
        // Avoid spamming the console with every check
        if (process.env.NODE_ENV === 'development') {
          console.warn('API returned error:', await response.text());
        }
        return 'error';
      }
    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('API connection check error:', error);
      }
      
      // Check for abort error (timeout)
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.warn('API connection check timed out after 5 seconds');
      }
      
      return 'error';
    }
  };
  
  // Check API connection status
  useEffect(() => {
    // Skip this on server-side rendering
    if (typeof window === 'undefined') return;
    
    let mounted = true; // Track if component is mounted
    let checkInterval: NodeJS.Timeout | null = null;
    let lastStatus: string | null = null;
    let isChecking = false;
    
    const checkApiStatus = async () => {
      // Prevent concurrent checks
      if (!mounted || isChecking) return;
      
      isChecking = true;
      
      try {
        // Only show checking indicator if it takes longer than 300ms
        const checkingTimeout = setTimeout(() => {
          if (mounted && isChecking) {
            setStatus('checking');
            if (onStatusChange) onStatusChange('checking');
          }
        }, 300);
        
        // Use direct fetch instead of Apollo client to avoid circular dependencies
        const connectionStatus = await checkConnection();
        
        // Clear the checking timeout
        clearTimeout(checkingTimeout);
        
        if (mounted) {
          // Only update if status changed to avoid rerenders
          if (lastStatus !== connectionStatus) {
            setStatus(connectionStatus);
            if (onStatusChange) onStatusChange(connectionStatus);
            lastStatus = connectionStatus;
            
            // Store last successful check time
            if (connectionStatus === 'online') {
              sessionStorage.setItem('lastApiCheck', Date.now().toString());
            }
          }
        }
      } catch (error) {
        console.error('API status check error:', error);
        if (mounted && lastStatus !== 'error') {
          setStatus('error');
          if (onStatusChange) onStatusChange('error');
          lastStatus = 'error';
        }
      } finally {
        isChecking = false;
      }
    };
    
    // Try to use cached status first
    const cachedTime = sessionStorage.getItem('lastApiCheck');
    const now = Date.now();
    const CACHE_TTL = 60000; // 1 minute cache TTL
    
    if (cachedTime && (now - parseInt(cachedTime) < CACHE_TTL)) {
      // Use cached online status temporarily
      setStatus('online');
      if (onStatusChange) onStatusChange('online');
      lastStatus = 'online';
      
      // Still check in the background after a short delay
      setTimeout(checkApiStatus, 1000);
    } else {
      // Do an immediate check if no valid cache
      checkApiStatus();
    }
    
    // Set up event listeners for online/offline events
    const handleOnline = () => {
      if (mounted) {
        // When browser comes online, check API after a short delay
        setTimeout(checkApiStatus, 1000);
      }
    };
    
    const handleOffline = () => {
      if (mounted && lastStatus !== 'offline') {
        setStatus('offline');
        if (onStatusChange) onStatusChange('offline');
        lastStatus = 'offline';
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check periodically but less frequently (2 minutes)
    checkInterval = setInterval(checkApiStatus, 120000);
    
    // Cleanup function
    return () => {
      mounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [onStatusChange]);
  
  // Status color
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    error: 'bg-amber-500',
    checking: 'bg-gray-400 animate-pulse'
  };
  
  // Status label
  const statusLabels = {
    online: 'API connected',
    offline: 'Network offline',
    error: 'API connection error',
    checking: 'Checking connection...'
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${dotSize} rounded-full mr-2 ${statusColors[status]}`}></div>
      {showLabel && (
        <span className={`${textSize} text-gray-400`}>
          {statusLabels[status]}
        </span>
      )}
    </div>
  );
};

export default ApiConnectionStatus;
