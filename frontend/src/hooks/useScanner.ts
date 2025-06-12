import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EVENTS, GET_RECENT_CHECKINS, PERFORM_CHECKIN, PERFORM_CHECKOUT } from '../lib/graphql/scanner';

// Types
export type CheckinType = 'checkin' | 'checkout';

export interface Event {
  id: string;
  name: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CheckinLog {
  id: number;
  name: string;
  action: string;
  time: string;
  status: string;
  type: CheckinType;
  user?: User;
  eventId?: string;
}

// Interface for offline scan cache
interface OfflineScan {
  qrCodeId: string;
  eventId: string;
  type: CheckinType;
  timestamp: number;
}

export const useScanner = () => {
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [recentScans, setRecentScans] = useState<CheckinLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [offlineScans, setOfflineScans] = useState<OfflineScan[]>([]);

  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline scans from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedScans = localStorage.getItem('offlineScans');
      if (storedScans) {
        try {
          setOfflineScans(JSON.parse(storedScans));
        } catch (e) {
          console.error('Error parsing offline scans:', e);
        }
      }
    }
  }, []);

  // Query for events
  const { loading: eventsLoading, data: eventsData, refetch: refetchEvents } = useQuery(GET_EVENTS, {
    onError: (error) => {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
    }
  });

  // Query for recent check-ins
  const { loading: scansLoading, data: scansData, refetch: refetchScans } = useQuery(GET_RECENT_CHECKINS, {
    variables: { limit: 10 },
    onError: (error) => {
      console.error('Error fetching recent scans:', error);
      setError('Failed to load recent scans. Please try again.');
    }
  });

  // Mutation for check-in
  const [performCheckin, { loading: checkinLoading }] = useMutation(PERFORM_CHECKIN, {
    onCompleted: (data) => {
      const result = JSON.parse(data.checkin);
      const userName = result.user ? `${result.user.firstName} ${result.user.lastName}` : 'User';
      
      // Update UI with success message
      setSuccess(`${userName} has been successfully checked in.`);
      
      // Refresh recent scans
      refetchScans();
      
      setIsProcessing(false);
    },
    onError: (error) => {
      setError(`Check-in failed: ${error.message}`);
      setIsProcessing(false);
    }
  });

  // Mutation for check-out
  const [performCheckout, { loading: checkoutLoading }] = useMutation(PERFORM_CHECKOUT, {
    onCompleted: (data) => {
      const result = JSON.parse(data.checkout);
      const userName = result.user ? `${result.user.firstName} ${result.user.lastName}` : 'User';
      
      // Update UI with success message
      setSuccess(`${userName} has been successfully checked out.`);
      
      // Refresh recent scans
      refetchScans();
      
      setIsProcessing(false);
    },
    onError: (error) => {
      setError(`Check-out failed: ${error.message}`);
      setIsProcessing(false);
    }
  });

  // Save offline scans to local storage
  const saveOfflineScans = useCallback((scans: OfflineScan[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('offlineScans', JSON.stringify(scans));
    }
  }, []);

  // Add a scan to offline queue
  const addOfflineScan = useCallback((qrCodeId: string, eventId: string, type: CheckinType) => {
    const newScan: OfflineScan = {
      qrCodeId,
      eventId,
      type,
      timestamp: Date.now()
    };
    
    const updatedScans = [...offlineScans, newScan];
    setOfflineScans(updatedScans);
    saveOfflineScans(updatedScans);
    
    // Add to recent scans UI temporarily
    const tempLog: CheckinLog = {
      id: Date.now(),
      name: 'User (Offline)',
      action: type === 'checkin' ? 'Check-in' : 'Check-out',
      time: 'Just now',
      status: 'Pending',
      type,
      eventId
    };
    
    setRecentScans(prev => [tempLog, ...prev.slice(0, 4)]);
    
    return tempLog;
  }, [offlineScans, saveOfflineScans]);

  // Process offline scans when online
  const processOfflineScans = useCallback(async () => {
    if (!isOnline || offlineScans.length === 0) return;
    
    setError(null);
    
    // Create a copy of the current offline scans
    const scansToProcess = [...offlineScans];
    
    // Clear the offline scans list before processing to avoid duplicate processing
    setOfflineScans([]);
    saveOfflineScans([]);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const scan of scansToProcess) {
      try {
        if (scan.type === 'checkin') {
          await performCheckin({
            variables: {
              qrCodeId: scan.qrCodeId,
              eventId: scan.eventId
            }
          });
        } else {
          await performCheckout({
            variables: {
              qrCodeId: scan.qrCodeId,
              eventId: scan.eventId
            }
          });
        }
        successCount++;
      } catch (e) {
        console.error('Error processing offline scan:', e);
        failureCount++;
        
        // Add failed scan back to offline queue
        setOfflineScans(prev => {
          const updated = [...prev, scan];
          saveOfflineScans(updated);
          return updated;
        });
      }
    }
    
    // Refresh the scan list
    refetchScans();
    
    // Show summary message
    if (successCount > 0 && failureCount === 0) {
      setSuccess(`Successfully synced ${successCount} offline scan${successCount > 1 ? 's' : ''}.`);
    } else if (successCount > 0 && failureCount > 0) {
      setSuccess(`Synced ${successCount} scan${successCount > 1 ? 's' : ''}, but ${failureCount} failed. Will retry failed scans later.`);
    } else if (successCount === 0 && failureCount > 0) {
      setError(`Failed to sync ${failureCount} offline scan${failureCount > 1 ? 's' : ''}. Will retry later.`);
    }
  }, [isOnline, offlineScans, performCheckin, performCheckout, refetchScans, saveOfflineScans]);

  // Check and process offline scans when coming back online
  useEffect(() => {
    if (isOnline && offlineScans.length > 0) {
      processOfflineScans();
    }
  }, [isOnline, offlineScans.length, processOfflineScans]);

  // Process events data when loaded
  useEffect(() => {
    if (eventsData && eventsData.events) {
      try {
        const parsedEvents = JSON.parse(eventsData.events);
        const activeEvents = parsedEvents.filter((event: Event) => event.isActive);
        setEvents(activeEvents);
        
        // Select first event if none selected
        if (!currentEvent && activeEvents.length > 0) {
          setCurrentEvent(activeEvents[0]);
        }
      } catch (e) {
        console.error('Error parsing events data:', e);
      }
    }
  }, [eventsData, currentEvent]);

  // Process recent scans data when loaded
  useEffect(() => {
    if (scansData && scansData.checkinLogs) {
      try {
        const parsedLogs = JSON.parse(scansData.checkinLogs);
        
        // Format logs for display
        const formattedLogs: CheckinLog[] = parsedLogs.map((log: any) => {
          const userName = log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown User';
          const timeAgo = getTimeAgo(new Date(log.timestamp));
          const action = log.type === 'CHECKIN' ? 'Check-in' : 'Check-out';
          const status = log.type === 'CHECKIN' ? 'Success' : 'Completed';
          
          return {
            id: log.id,
            name: userName,
            action,
            time: timeAgo,
            status,
            type: log.type.toLowerCase() as CheckinType,
            user: log.user,
            eventId: log.eventId
          };
        });
        
        setRecentScans(formattedLogs.slice(0, 5));
      } catch (e) {
        console.error('Error parsing check-in logs:', e);
      }
    }
  }, [scansData]);

  // Function to handle check-in or check-out
  const handleScan = async (qrCodeId: string, type: CheckinType) => {
    if (!currentEvent) {
      setError('Please select an event first.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    // If offline, add to offline queue instead of making API call
    if (!isOnline) {
      const offlineScan = addOfflineScan(qrCodeId, currentEvent.id, type);
      setSuccess(`${type === 'checkin' ? 'Check-in' : 'Check-out'} saved offline. Will sync when online.`);
      setIsProcessing(false);
      return;
    }
    
    try {
      if (type === 'checkin') {
        await performCheckin({
          variables: {
            qrCodeId,
            eventId: currentEvent.id
          }
        });
      } else {
        await performCheckout({
          variables: {
            qrCodeId,
            eventId: currentEvent.id
          }
        });
      }
    } catch (e) {
      console.error('Error processing scan:', e);
      setError('Failed to process the scan. Please try again.');
      setIsProcessing(false);
    }
  };

  // Helper function to calculate time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} secs ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Handle event selection
  const selectEvent = (event: Event) => {
    setCurrentEvent(event);
  };

  // Clear error and success messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Refresh data
  const refreshData = () => {
    refetchEvents();
    refetchScans();
    
    // Try to process offline scans if we're online
    if (isOnline && offlineScans.length > 0) {
      processOfflineScans();
    }
  };

  // Manually retry sync of offline scans
  const syncOfflineScans = () => {
    if (!isOnline) {
      setError('Cannot sync while offline. Please check your internet connection.');
      return;
    }
    
    if (offlineScans.length === 0) {
      setSuccess('No offline scans to sync.');
      return;
    }
    
    processOfflineScans();
  };

  return {
    events,
    currentEvent,
    recentScans,
    isLoading: eventsLoading || scansLoading || checkinLoading || checkoutLoading,
    isProcessing,
    error,
    success,
    isOnline,
    offlineScans: offlineScans.length,
    selectEvent,
    handleScan,
    clearMessages,
    refreshData,
    syncOfflineScans
  };
};
