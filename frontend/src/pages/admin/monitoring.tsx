import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import Navigation from '../../components/Navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import ErrorHandler from '../../components/ErrorHandler';
import { GET_PLATFORM_ACTIVITY } from '../../lib/graphql/platform';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  lastChecked: string;
}

interface PlatformActivity {
  id: string;
  type: 'ERROR' | 'WARNING' | 'INFO' | 'PERFORMANCE' | 'SECURITY';
  description: string;
  timestamp: string;
  metadata?: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface APIMetrics {
  totalRequests: number;
  errorRate: number;
  averageResponseTime: number;
  activeConnections: number;
}

export default function TechnicalMonitoring() {
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    cpu: 45,
    memory: 68,
    disk: 32,
    uptime: 86400000, // 24 hours in ms
    lastChecked: new Date().toISOString()
  });
  
  const [apiMetrics, setApiMetrics] = useState<APIMetrics>({
    totalRequests: 12450,
    errorRate: 0.8,
    averageResponseTime: 120,
    activeConnections: 45
  });

  const [selectedActivityType, setSelectedActivityType] = useState<string>('all');

  // Query to get platform activity/logs
  const { data, loading, error, refetch } = useQuery(GET_PLATFORM_ACTIVITY, {
    variables: { limit: 100 },
    errorPolicy: 'all',
    pollInterval: 30000 // Refresh every 30 seconds
  });

  const activities: PlatformActivity[] = data?.platformActivity || [];
  
  // Filter activities based on selected type
  const filteredActivities = selectedActivityType === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === selectedActivityType);

  // Simulate real-time updates for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth(prev => ({
        ...prev,
        cpu: Math.max(20, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(95, prev.memory + (Math.random() - 0.5) * 8)),
        disk: Math.max(10, Math.min(80, prev.disk + (Math.random() - 0.5) * 2)),
        lastChecked: new Date().toISOString()
      }));

      setApiMetrics(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 20),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.5)),
        averageResponseTime: Math.max(50, Math.min(500, prev.averageResponseTime + (Math.random() - 0.5) * 20)),
        activeConnections: Math.max(0, Math.min(100, prev.activeConnections + Math.floor((Math.random() - 0.5) * 10)))
      }));
    }, 5000);

    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const getHealthStatus = (value: number, type: 'cpu' | 'memory' | 'disk') => {
    const thresholds = {
      cpu: { warning: 70, critical: 85 },
      memory: { warning: 80, critical: 90 },
      disk: { warning: 75, critical: 85 }
    };

    if (value >= thresholds[type].critical) return 'critical';
    if (value >= thresholds[type].warning) return 'warning';
    return 'healthy';
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'INFO': return 'bg-blue-100 text-blue-800';
      case 'PERFORMANCE': return 'bg-purple-100 text-purple-800';
      case 'SECURITY': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatUptime = (ms: number) => {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  // Overall system status
  const overallStatus = [
    systemHealth.cpu >= 85 ? 'critical' : systemHealth.cpu >= 70 ? 'warning' : 'healthy',
    systemHealth.memory >= 90 ? 'critical' : systemHealth.memory >= 80 ? 'warning' : 'healthy',
    systemHealth.disk >= 85 ? 'critical' : systemHealth.disk >= 75 ? 'warning' : 'healthy'
  ].includes('critical') ? 'critical' : 
  [
    systemHealth.cpu >= 85 ? 'critical' : systemHealth.cpu >= 70 ? 'warning' : 'healthy',
    systemHealth.memory >= 90 ? 'critical' : systemHealth.memory >= 80 ? 'warning' : 'healthy',
    systemHealth.disk >= 85 ? 'critical' : systemHealth.disk >= 75 ? 'warning' : 'healthy'
  ].includes('warning') ? 'warning' : 'healthy';

  if (loading && activities.length === 0) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading monitoring data...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <>
        <Head>
          <title>Technical Monitoring - QR Check-in Admin</title>
        </Head>

        <div className="min-h-screen bg-gray-50">
          <Navigation />
          
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Technical Monitoring
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  System health, performance metrics, and technical logs
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
                <Link 
                  href="/admin" 
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Dashboard
                </Link>
                <button
                  onClick={() => refetch()}
                  className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                  title="Refresh monitoring data"
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  Refresh
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <ErrorHandler 
                error={error} 
                onDismiss={() => refetch()}
                onRetry={() => refetch()}
              />
            )}

            {/* System Health Overview */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">System Health</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${overallStatus === 'healthy' ? 'bg-green-400' : overallStatus === 'warning' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                    <span className="text-sm font-medium text-gray-900 capitalize">{overallStatus}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">CPU Usage</p>
                        <p className="text-2xl font-bold text-gray-900">{systemHealth.cpu.toFixed(1)}%</p>
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getHealthColor(getHealthStatus(systemHealth.cpu, 'cpu'))}`}>
                        <i className="fas fa-microchip text-lg"></i>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getHealthStatus(systemHealth.cpu, 'cpu') === 'critical' ? 'bg-red-500' : getHealthStatus(systemHealth.cpu, 'cpu') === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${systemHealth.cpu}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Memory Usage</p>
                        <p className="text-2xl font-bold text-gray-900">{systemHealth.memory.toFixed(1)}%</p>
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getHealthColor(getHealthStatus(systemHealth.memory, 'memory'))}`}>
                        <i className="fas fa-memory text-lg"></i>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getHealthStatus(systemHealth.memory, 'memory') === 'critical' ? 'bg-red-500' : getHealthStatus(systemHealth.memory, 'memory') === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${systemHealth.memory}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Disk Usage</p>
                        <p className="text-2xl font-bold text-gray-900">{systemHealth.disk.toFixed(1)}%</p>
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getHealthColor(getHealthStatus(systemHealth.disk, 'disk'))}`}>
                        <i className="fas fa-hdd text-lg"></i>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getHealthStatus(systemHealth.disk, 'disk') === 'critical' ? 'bg-red-500' : getHealthStatus(systemHealth.disk, 'disk') === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${systemHealth.disk}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Uptime</p>
                        <p className="text-lg font-bold text-gray-900">{formatUptime(systemHealth.uptime)}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                        <i className="fas fa-clock text-lg"></i>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Last checked: {new Date(systemHealth.lastChecked).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* API Metrics */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-exchange-alt text-blue-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">API Requests</dt>
                        <dd className="text-lg font-medium text-gray-900">{apiMetrics.totalRequests.toLocaleString()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Error Rate</dt>
                        <dd className="text-lg font-medium text-gray-900">{apiMetrics.errorRate.toFixed(2)}%</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-stopwatch text-yellow-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Avg Response Time</dt>
                        <dd className="text-lg font-medium text-gray-900">{apiMetrics.averageResponseTime}ms</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-plug text-green-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Connections</dt>
                        <dd className="text-lg font-medium text-gray-900">{apiMetrics.activeConnections}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Filter */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex items-center space-x-4">
                <label htmlFor="activityType" className="text-sm font-medium text-gray-700">
                  Filter by Activity Type:
                </label>
                <select
                  id="activityType"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedActivityType}
                  onChange={(e) => setSelectedActivityType(e.target.value)}
                >
                  <option value="all">All Activities</option>
                  <option value="ERROR">Errors</option>
                  <option value="WARNING">Warnings</option>
                  <option value="INFO">Information</option>
                  <option value="PERFORMANCE">Performance</option>
                  <option value="SECURITY">Security</option>
                </select>
              </div>
            </div>

            {/* System Activity Logs */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">System Activity & Logs</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredActivities.map((activity: PlatformActivity) => {
                        const { date, time } = formatTimestamp(activity.timestamp);
                        return (
                          <tr key={activity.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{date}</div>
                              <div className="text-sm text-gray-500">{time}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActivityTypeColor(activity.type)}`}>
                                {activity.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{activity.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {activity.metadata && (
                                <button 
                                  className="text-blue-600 hover:text-blue-900"
                                  title="View Details"
                                >
                                  <i className="fas fa-info-circle"></i>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredActivities.length === 0 && (
                  <div className="text-center py-8">
                    <i className="fas fa-clipboard-list text-gray-400 text-4xl mb-4"></i>
                    <p className="text-gray-500">
                      {selectedActivityType === 'all' 
                        ? 'No activity logs found' 
                        : `No ${selectedActivityType.toLowerCase()} activities found`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    </ProtectedRoute>
  );
}