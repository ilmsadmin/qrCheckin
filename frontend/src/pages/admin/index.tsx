import Head from 'next/head'
import Link from 'next/link'
import { QrCodeIcon } from '@heroicons/react/24/outline'
import Navigation from '../../components/Navigation'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useDashboardData } from '../../hooks/useDashboardData'

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return `${Math.floor(diffInMinutes / 1440)} days ago`;
}

export default function AdminDashboard() {
  const { stats, recentCheckins, loading, error, refetch } = useDashboardData();

  return (
    <ProtectedRoute requireAdmin={true}>
      <>
        <Head>
          <title>Admin Dashboard - QR Check-in</title>
        </Head>

        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <Navigation />
          
          {/* Loading and Error States */}
          {loading && (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading dashboard data...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error loading dashboard data
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error.message}</p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={refetch}
                        className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Main Content */}
          {!loading && !error && (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <i className="fas fa-users text-blue-600 text-2xl"></i>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <i className="fas fa-building text-green-600 text-2xl"></i>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Active Clubs</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.activeClubs}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <i className="fas fa-calendar text-purple-600 text-2xl"></i>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Events This Month</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.eventsThisMonth}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <i className="fas fa-check-circle text-green-600 text-2xl"></i>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Check-ins Today</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.checkinsToday}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                <p className="text-sm text-gray-600 mb-4">Manage system users, roles, and permissions</p>
                <Link href="/admin/users" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block">
                  <i className="fas fa-users mr-2"></i>Manage Users
                </Link>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Event Management</h3>
                <p className="text-sm text-gray-600 mb-4">Create events and track attendance</p>
                <Link href="/admin/events" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 inline-block">
                  <i className="fas fa-calendar-plus mr-2"></i>Manage Events
                </Link>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Club Management</h3>
                <p className="text-sm text-gray-600 mb-4">Manage clubs and their settings</p>
                <Link href="/admin/clubs" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 inline-block">
                  <i className="fas fa-building mr-2"></i>Manage Clubs
                </Link>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">QR Code Management</h3>
                <p className="text-sm text-gray-600 mb-4">Generate and manage QR codes</p>
                <Link href="/admin/packages" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 inline-block">
                  <i className="fas fa-qrcode mr-2"></i>Manage Packages
                </Link>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">System Logs</h3>
                <p className="text-sm text-gray-600 mb-4">View check-in and check-out activity logs</p>
                <Link href="/admin/logs" className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 inline-block">
                  <i className="fas fa-clipboard-list mr-2"></i>View Logs
                </Link>
              </div>
            </div>

              {/* Recent Activity */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Check-ins</h3>
                    <button
                      onClick={refetch}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      <i className="fas fa-refresh mr-1"></i>Refresh
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    {recentCheckins.length === 0 ? (
                      <div className="text-center py-8">
                        <i className="fas fa-clipboard-list text-gray-300 text-4xl mb-4"></i>
                        <p className="text-gray-500">No recent check-ins found</p>
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Member
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Event/Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentCheckins.map((checkin) => (
                            <tr key={checkin.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {checkin.user 
                                  ? `${checkin.user.firstName} ${checkin.user.lastName}`
                                  : 'Unknown User'
                                }
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {checkin.event?.name || checkin.location || 'Unknown Location'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {checkin.action}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatTimeAgo(checkin.timestamp)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  checkin.action && (checkin.action.toLowerCase().includes('checkin') || checkin.action.toLowerCase().includes('check-in'))
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {checkin.action && (checkin.action.toLowerCase().includes('checkin') || checkin.action.toLowerCase().includes('check-in')) 
                                    ? 'Active' 
                                    : 'Completed'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    </ProtectedRoute>
  )
}