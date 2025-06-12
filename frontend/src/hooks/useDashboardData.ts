import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS, GET_RECENT_CHECKINS_DASHBOARD } from '../lib/graphql/dashboard';

export interface DashboardStats {
  totalUsers: number;
  activeClubs: number;
  eventsThisMonth: number;
  checkinsToday: number;
}

export interface RecentCheckin {
  id: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  event?: {
    id: string;
    name: string;
    location: string;
  };
  action: string;
  timestamp: string;
  location?: string;
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeClubs: 0,
    eventsThisMonth: 0,
    checkinsToday: 0,
  });
  const [recentCheckins, setRecentCheckins] = useState<RecentCheckin[]>([]);

  const { 
    data: statsData, 
    loading: statsLoading, 
    error: statsError,
    refetch: refetchStats
  } = useQuery(GET_DASHBOARD_STATS);

  const { 
    data: checkinsData, 
    loading: checkinsLoading, 
    error: checkinsError,
    refetch: refetchCheckins 
  } = useQuery(GET_RECENT_CHECKINS_DASHBOARD);

  useEffect(() => {
    if (statsData) {
      try {
        // Parse users data
        const totalUsers = statsData.users ? statsData.users.length : 0;
        const activeUsers = statsData.users ? statsData.users.filter((user: any) => user.isActive).length : 0;

        // Parse clubs data
        const activeClubs = statsData.clubs ? statsData.clubs.filter((club: any) => club.isActive).length : 0;

        // Parse events data (JSON string from backend)
        let eventsThisMonth = 0;
        if (statsData.events) {
          try {
            const events = JSON.parse(statsData.events);
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            
            eventsThisMonth = events.filter((event: any) => {
              const eventDate = new Date(event.startTime || event.createdAt);
              return eventDate >= startOfMonth && eventDate <= endOfMonth;
            }).length;
          } catch (e) {
            console.error('Error parsing events data:', e);
          }
        }

        setStats({
          totalUsers,
          activeClubs,
          eventsThisMonth,
          checkinsToday: 0, // Will be updated when checkins data is processed
        });
      } catch (error) {
        console.error('Error processing stats data:', error);
      }
    }
  }, [statsData]);

  useEffect(() => {
    if (checkinsData?.checkinLogs) {
      try {
        // Parse checkin logs data (JSON string from backend)
        const logs = JSON.parse(checkinsData.checkinLogs);
        
        // Calculate today's checkins
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const todayCheckins = logs.filter((log: any) => {
          const logDate = new Date(log.timestamp);
          return logDate >= startOfDay;
        });

        // Update stats with today's checkin count
        setStats(prev => ({
          ...prev,
          checkinsToday: todayCheckins.length,
        }));

        // Get recent checkins (last 10)
        const recent = logs
          .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10)
          .map((log: any) => ({
            id: log.id,
            user: log.user,
            event: log.event,
            action: log.action,
            timestamp: log.timestamp,
            location: log.location,
          }));

        setRecentCheckins(recent);
      } catch (error) {
        console.error('Error parsing checkin logs:', error);
      }
    }
  }, [checkinsData]);

  const loading = statsLoading || checkinsLoading;
  const error = statsError || checkinsError;

  const refetch = () => {
    refetchStats();
    refetchCheckins();
  };

  return {
    stats,
    recentCheckins,
    loading,
    error,
    refetch,
  };
}