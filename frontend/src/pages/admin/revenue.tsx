import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import Navigation from '../../components/Navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import ErrorHandler from '../../components/ErrorHandler';
import { GET_PLATFORM_STATS, GET_PLATFORM_REVENUE, GET_REVENUE_ANALYTICS } from '../../lib/graphql/platform';

interface RevenueData {
  period: string;
  revenue: number;
  count: number;
}

interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerClub: number;
  byPeriod: Array<{
    period: string;
    revenue: number;
    growth: number;
  }>;
  byClub: Array<{
    clubId: string;
    clubName: string;
    revenue: number;
    percentage: number;
  }>;
  byPackage: Array<{
    packageId: string;
    packageName: string;
    revenue: number;
    subscriptions: number;
  }>;
}

export default function RevenueManagement() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [groupBy, setGroupBy] = useState<'DAY' | 'WEEK' | 'MONTH' | 'YEAR'>('MONTH');

  // Queries
  const { data: platformStats, loading: statsLoading, error: statsError } = useQuery(GET_PLATFORM_STATS);
  
  const { data: revenueData, loading: revenueLoading, error: revenueError, refetch: refetchRevenue } = useQuery(GET_PLATFORM_REVENUE, {
    variables: {
      dateRange: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      },
      groupBy
    }
  });

  const { data: analyticsData, loading: analyticsLoading, error: analyticsError } = useQuery(GET_REVENUE_ANALYTICS, {
    variables: {
      dateRange: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }
    }
  });

  const stats = platformStats?.platformStats || {};
  const revenue: RevenueData[] = revenueData?.platformRevenue || [];
  const analytics: RevenueAnalytics = analyticsData?.revenueAnalytics || {
    totalRevenue: 0,
    monthlyRecurringRevenue: 0,
    averageRevenuePerClub: 0,
    byPeriod: [],
    byClub: [],
    byPackage: []
  };

  const handleDateRangeChange = () => {
    refetchRevenue();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const loading = statsLoading || revenueLoading || analyticsLoading;
  const error = statsError || revenueError || analyticsError;

  if (loading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading revenue data...</p>
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
          <title>Revenue Management - QR Check-in Admin</title>
        </Head>

        <div className="min-h-screen bg-gray-50">
          <Navigation />
          
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Revenue Management
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Platform-wide billing and revenue analytics
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
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <ErrorHandler 
                error={error} 
                onDismiss={() => {}}
                onRetry={() => {
                  refetchRevenue();
                }}
              />
            )}

            {/* Date Range Filter */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex items-center gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="groupBy" className="block text-sm font-medium text-gray-700 mb-1">
                      Group By
                    </label>
                    <select
                      id="groupBy"
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={groupBy}
                      onChange={(e) => setGroupBy(e.target.value as 'DAY' | 'WEEK' | 'MONTH' | 'YEAR')}
                    >
                      <option value="DAY">Daily</option>
                      <option value="WEEK">Weekly</option>
                      <option value="MONTH">Monthly</option>
                      <option value="YEAR">Yearly</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleDateRangeChange}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  Update
                </button>
              </div>
            </div>

            {/* Revenue Overview Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-dollar-sign text-green-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                        <dd className="text-lg font-medium text-gray-900">{formatCurrency(analytics.totalRevenue)}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-chart-line text-blue-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Monthly Recurring Revenue</dt>
                        <dd className="text-lg font-medium text-gray-900">{formatCurrency(analytics.monthlyRecurringRevenue)}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-calculator text-yellow-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Avg Revenue Per Club</dt>
                        <dd className="text-lg font-medium text-gray-900">{formatCurrency(analytics.averageRevenuePerClub)}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-building text-purple-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Clubs</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.activeClubs || 0}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Revenue Trend</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Growth
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analytics.byPeriod.map((period, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {period.period}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(period.revenue)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${getGrowthColor(period.growth)}`}>
                            {formatGrowth(period.growth)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {analytics.byPeriod.length === 0 && (
                  <div className="text-center py-8">
                    <i className="fas fa-chart-line text-gray-400 text-4xl mb-4"></i>
                    <p className="text-gray-500">No revenue data available for the selected period</p>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue by Club */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Revenue by Club</h3>
                  <div className="space-y-4">
                    {analytics.byClub.map((club, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{club.clubName}</div>
                          <div className="text-xs text-gray-500">{club.percentage.toFixed(1)}% of total</div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(club.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {analytics.byClub.length === 0 && (
                    <div className="text-center py-8">
                      <i className="fas fa-building text-gray-400 text-4xl mb-4"></i>
                      <p className="text-gray-500">No club revenue data available</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Revenue by Package</h3>
                  <div className="space-y-4">
                    {analytics.byPackage.map((pkg, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{pkg.packageName}</div>
                          <div className="text-xs text-gray-500">{pkg.subscriptions} subscriptions</div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(pkg.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {analytics.byPackage.length === 0 && (
                    <div className="text-center py-8">
                      <i className="fas fa-box text-gray-400 text-4xl mb-4"></i>
                      <p className="text-gray-500">No package revenue data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </ProtectedRoute>
  );
}