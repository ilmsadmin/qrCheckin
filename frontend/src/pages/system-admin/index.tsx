import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useQuery } from '@apollo/client'
import { GET_PLATFORM_STATS } from '../../lib/graphql/platform'

interface PlatformStats {
  activeClubs: number
  totalCustomers: number
  checkinsToday: number
  monthlyRevenue: number
  clubsGrowth: string
  customersGrowth: string
  checkinsGrowth: string
  revenueGrowth: string
}

export default function SystemAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  
  // Fetch platform stats from API
  const { data: platformStatsData, loading: statsLoading, error: statsError } = useQuery(GET_PLATFORM_STATS, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  })
  
  // Use API data if available, otherwise fall back to mock data
  const platformStats: PlatformStats = platformStatsData?.platformStats || {
    activeClubs: 48,
    totalCustomers: 24521,
    checkinsToday: 8327,
    monthlyRevenue: 125000,
    clubsGrowth: '↑ 12%',
    customersGrowth: '↑ 18%',
    checkinsGrowth: '↑ 5%',
    revenueGrowth: '↑ 23%'
  }

  const recentOnboardingRequests = [
    { name: 'CrossFit Peak', submitted: '2 hours ago' },
    { name: 'Dance Academy Plus', submitted: '5 hours ago' },
    { name: 'Elite Tennis Club', submitted: '1 day ago' },
    { name: 'Yoga Wellness Center', submitted: '2 days ago' }
  ]

  return (
    <ProtectedRoute requireSystemAdmin={true}>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>QR Check-in Platform Admin</title>
        </Head>

        {/* Header */}
        <header className="bg-indigo-700 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <i className="fas fa-qrcode text-2xl text-white mr-3"></i>
                <h1 className="text-xl font-bold text-white">QR Check-in Platform Admin</h1>
              </div>
              <div className="flex items-center space-x-6">
                <button className="text-white hover:text-indigo-200 relative">
                  <i className="fas fa-bell"></i>
                  <span className="absolute -top-1 -right-1 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                </button>
                <div className="flex items-center text-sm text-white">
                  <img 
                    className="h-8 w-8 rounded-full" 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="System Admin" 
                  />
                  <span className="ml-2">System Admin</span>
                </div>
                <button className="text-white hover:text-indigo-200">
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Sidebar and Main Content Container */}
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 h-screen bg-indigo-800 text-white pt-6 sticky top-0">
            <nav className="mt-6">
              <div className="px-4 mb-4">
                <p className="text-xs uppercase tracking-wider text-indigo-300">Platform Management</p>
              </div>
              <Link href="/system-admin" className={`flex items-center py-2 px-4 ${activeTab === 'overview' ? 'bg-indigo-900 text-white' : 'text-indigo-100 hover:bg-indigo-700'}`}>
                <i className="fas fa-tachometer-alt w-6 mr-3"></i>
                <span>Dashboard</span>
              </Link>
              <Link href="/system-admin/clubs" className="flex items-center py-2 px-4 text-indigo-100 hover:bg-indigo-700">
                <i className="fas fa-building w-6 mr-3"></i>
                <span>Clubs Management</span>
              </Link>
              <Link href="/system-admin/users" className="flex items-center py-2 px-4 text-indigo-100 hover:bg-indigo-700">
                <i className="fas fa-user-shield w-6 mr-3"></i>
                <span>System Users</span>
              </Link>
              <Link href="/system-admin/analytics" className="flex items-center py-2 px-4 text-indigo-100 hover:bg-indigo-700">
                <i className="fas fa-chart-line w-6 mr-3"></i>
                <span>Platform Analytics</span>
              </Link>
              <Link href="/system-admin/billing" className="flex items-center py-2 px-4 text-indigo-100 hover:bg-indigo-700">
                <i className="fas fa-money-bill-wave w-6 mr-3"></i>
                <span>Billing & Revenue</span>
              </Link>
              <Link href="/system-admin/settings" className="flex items-center py-2 px-4 text-indigo-100 hover:bg-indigo-700">
                <i className="fas fa-cog w-6 mr-3"></i>
                <span>System Settings</span>
              </Link>
              <Link href="/system-admin/support" className="flex items-center py-2 px-4 text-indigo-100 hover:bg-indigo-700">
                <i className="fas fa-headset w-6 mr-3"></i>
                <span>Support Tickets</span>
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Platform Overview</h2>
              <p className="text-gray-600">Welcome to the QR Check-in System Admin Dashboard</p>
            </div>
            
            {/* Loading State */}
            {statsLoading && (
              <div className="bg-white rounded-lg shadow p-8 mb-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-gray-600">Loading platform statistics...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {statsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error loading platform data
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{statsError.message}</p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-3 rounded-md bg-indigo-100">
                      <i className="fas fa-building text-indigo-600 text-xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Clubs</dt>
                        <dd className="text-lg font-medium text-gray-900">{platformStats.activeClubs}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-indigo-50 px-5 py-2">
                  <div className="text-sm text-indigo-600">
                    <span className="font-medium text-indigo-700">{platformStats.clubsGrowth}</span> from last month
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-3 rounded-md bg-green-100">
                      <i className="fas fa-users text-green-600 text-xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                        <dd className="text-lg font-medium text-gray-900">{platformStats.totalCustomers.toLocaleString()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 px-5 py-2">
                  <div className="text-sm text-green-600">
                    <span className="font-medium text-green-700">{platformStats.customersGrowth}</span> from last month
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-3 rounded-md bg-blue-100">
                      <i className="fas fa-qrcode text-blue-600 text-xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Check-ins Today</dt>
                        <dd className="text-lg font-medium text-gray-900">{platformStats.checkinsToday.toLocaleString()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 px-5 py-2">
                  <div className="text-sm text-blue-600">
                    <span className="font-medium text-blue-700">{platformStats.checkinsGrowth}</span> from yesterday
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-3 rounded-md bg-purple-100">
                      <i className="fas fa-dollar-sign text-purple-600 text-xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                        <dd className="text-lg font-medium text-gray-900">${platformStats.monthlyRevenue.toLocaleString()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 px-5 py-2">
                  <div className="text-sm text-purple-600">
                    <span className="font-medium text-purple-700">{platformStats.revenueGrowth}</span> from last month
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-2 rounded-md bg-indigo-100">
                      <i className="fas fa-plus-circle text-indigo-600 text-xl"></i>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-md font-medium text-gray-900">Create a New Club</h4>
                      <p className="text-sm text-gray-600">Add a new club to the platform</p>
                    </div>
                    <div className="ml-auto">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <i className="fas fa-plus mr-2"></i> Add Club
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-2">Recent Onboarding Requests</h4>
                <div className="space-y-3">
                  {recentOnboardingRequests.map((request, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{request.name}</p>
                        <p className="text-xs text-gray-500">Submitted: {request.submitted}</p>
                      </div>
                      <button className="text-sm text-indigo-600 hover:text-indigo-900">Review</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow-lg rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Platform Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-plus text-green-600 text-sm"></i>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">New club "CrossFit Peak" onboarded</p>
                      <p className="text-sm text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-chart-line text-blue-600 text-sm"></i>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Monthly revenue milestone reached</p>
                      <p className="text-sm text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-exclamation-triangle text-yellow-600 text-sm"></i>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">System maintenance scheduled</p>
                      <p className="text-sm text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}