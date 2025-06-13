import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import { useQuery } from '@apollo/client'
import { GET_CLUB_STATS } from '../../lib/graphql/club'

interface ClubStats {
  activeMembers: number
  todayCheckins: number
  activePackages: number
  monthlyRevenue: number
  membersGrowth: string
  checkinsGrowth: string
  packagesGrowth: string
  revenueGrowth: string
}

export default function ClubAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  
  // Mock data for now - will be replaced with real API data
  const clubStats: ClubStats = {
    activeMembers: 1245,
    todayCheckins: 523,
    activePackages: 8,
    monthlyRevenue: 28500,
    membersGrowth: '↑ 8%',
    checkinsGrowth: '↑ 12%',
    packagesGrowth: '+2',
    revenueGrowth: '↑ 15%'
  }

  const recentActivity = [
    { type: 'member', description: 'New member "John Smith" registered', time: '5 minutes ago' },
    { type: 'checkin', description: '25 new check-ins in the last hour', time: '1 hour ago' },
    { type: 'package', description: 'Premium package purchased by Sarah Johnson', time: '2 hours ago' },
    { type: 'staff', description: 'Staff member "Mike Wilson" updated profile', time: '3 hours ago' }
  ]

  const upcomingEvents = [
    { name: 'Morning Yoga Class', time: '9:00 AM', participants: 15 },
    { name: 'HIIT Training', time: '6:00 PM', participants: 22 },
    { name: 'Swimming Session', time: '7:00 PM', participants: 8 }
  ]

  return (
    <ProtectedRoute requireClubAdmin={true}>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Fitness Club Pro - Club Admin</title>
        </Head>

        {/* Header */}
        <header className="bg-blue-700 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <i className="fas fa-qrcode text-2xl text-white mr-3"></i>
                <h1 className="text-xl font-bold text-white">Fitness Club Pro</h1>
              </div>
              <div className="flex items-center space-x-6">
                <button className="text-white hover:text-blue-200 relative">
                  <i className="fas fa-bell"></i>
                  <span className="absolute -top-1 -right-1 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                </button>
                <div className="flex items-center text-sm text-white">
                  <img 
                    className="h-8 w-8 rounded-full" 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="Club Admin" 
                  />
                  <span className="ml-2">Club Admin</span>
                </div>
                <button className="text-white hover:text-blue-200">
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Sidebar and Main Content Container */}
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 h-screen bg-blue-800 text-white pt-6 sticky top-0">
            <nav className="mt-6">
              <div className="px-4 mb-4">
                <p className="text-xs uppercase tracking-wider text-blue-300">Club Management</p>
              </div>
              <Link href="/club-admin" className={`flex items-center py-2 px-4 ${activeTab === 'overview' ? 'bg-blue-900 text-white' : 'text-blue-100 hover:bg-blue-700'}`}>
                <i className="fas fa-tachometer-alt w-6 mr-3"></i>
                <span>Dashboard</span>
              </Link>
              <Link href="/club-admin/customers" className="flex items-center py-2 px-4 text-blue-100 hover:bg-blue-700">
                <i className="fas fa-users w-6 mr-3"></i>
                <span>Customers</span>
              </Link>
              <Link href="/club-admin/packages" className="flex items-center py-2 px-4 text-blue-100 hover:bg-blue-700">
                <i className="fas fa-tags w-6 mr-3"></i>
                <span>Subscription Packages</span>
              </Link>
              <Link href="/club-admin/staff" className="flex items-center py-2 px-4 text-blue-100 hover:bg-blue-700">
                <i className="fas fa-user-tie w-6 mr-3"></i>
                <span>Staff Management</span>
              </Link>
              <Link href="/club-admin/analytics" className="flex items-center py-2 px-4 text-blue-100 hover:bg-blue-700">
                <i className="fas fa-chart-bar w-6 mr-3"></i>
                <span>Analytics</span>
              </Link>
              <Link href="/club-admin/financial" className="flex items-center py-2 px-4 text-blue-100 hover:bg-blue-700">
                <i className="fas fa-money-bill-wave w-6 mr-3"></i>
                <span>Financial Reports</span>
              </Link>
              <Link href="/club-admin/settings" className="flex items-center py-2 px-4 text-blue-100 hover:bg-blue-700">
                <i className="fas fa-cog w-6 mr-3"></i>
                <span>Club Settings</span>
              </Link>
              <Link href="/club-admin/branding" className="flex items-center py-2 px-4 text-blue-100 hover:bg-blue-700">
                <i className="fas fa-palette w-6 mr-3"></i>
                <span>Branding</span>
              </Link>
              
              <div className="px-4 mt-8">
                <p className="text-xs uppercase tracking-wider text-blue-300 mb-4">Support</p>
                <Link href="/club-admin/help" className="flex items-center py-2 px-4 text-blue-100 hover:bg-blue-700">
                  <i className="fas fa-question-circle w-6 mr-3"></i>
                  <span>Help Center</span>
                </Link>
                <Link href="/club-admin/support" className="flex items-center py-2 px-4 text-blue-100 hover:bg-blue-700">
                  <i className="fas fa-headset w-6 mr-3"></i>
                  <span>Contact Support</span>
                </Link>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Club Dashboard</h2>
              <p className="text-gray-600">Welcome back to your club management dashboard</p>
            </div>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-3 rounded-md bg-blue-100">
                      <i className="fas fa-users text-blue-600 text-xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Members</dt>
                        <dd className="text-lg font-medium text-gray-900">{clubStats.activeMembers.toLocaleString()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 px-5 py-2">
                  <div className="text-sm text-blue-600">
                    <span className="font-medium text-blue-700">{clubStats.membersGrowth}</span> from last month
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-3 rounded-md bg-green-100">
                      <i className="fas fa-qrcode text-green-600 text-xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Today's Check-ins</dt>
                        <dd className="text-lg font-medium text-gray-900">{clubStats.todayCheckins}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 px-5 py-2">
                  <div className="text-sm text-green-600">
                    <span className="font-medium text-green-700">{clubStats.checkinsGrowth}</span> from yesterday
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-3 rounded-md bg-yellow-100">
                      <i className="fas fa-tags text-yellow-600 text-xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Packages</dt>
                        <dd className="text-lg font-medium text-gray-900">{clubStats.activePackages}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 px-5 py-2">
                  <div className="text-sm text-yellow-600">
                    <span className="font-medium text-yellow-700">{clubStats.packagesGrowth}</span> new this month
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
                        <dd className="text-lg font-medium text-gray-900">${clubStats.monthlyRevenue.toLocaleString()}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 px-5 py-2">
                  <div className="text-sm text-purple-600">
                    <span className="font-medium text-purple-700">{clubStats.revenueGrowth}</span> from last month
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Recent Activity */}
              <div className="bg-white shadow-lg rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.type === 'member' ? 'bg-blue-100' :
                            activity.type === 'checkin' ? 'bg-green-100' :
                            activity.type === 'package' ? 'bg-yellow-100' : 'bg-purple-100'
                          }`}>
                            <i className={`fas text-sm ${
                              activity.type === 'member' ? 'fa-user text-blue-600' :
                              activity.type === 'checkin' ? 'fa-qrcode text-green-600' :
                              activity.type === 'package' ? 'fa-tags text-yellow-600' : 'fa-user-tie text-purple-600'
                            }`}></i>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white shadow-lg rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Today's Schedule</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {upcomingEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <i className="fas fa-clock text-indigo-600 text-sm"></i>
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{event.name}</p>
                            <p className="text-sm text-gray-500">{event.time}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.participants} participants
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 p-2 rounded-md bg-blue-100">
                    <i className="fas fa-user-plus text-blue-600 text-xl"></i>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-md font-medium text-gray-900">Add New Customer</h4>
                    <p className="text-sm text-gray-600">Register a new club member</p>
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Add Customer
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 p-2 rounded-md bg-green-100">
                    <i className="fas fa-plus-circle text-green-600 text-xl"></i>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-md font-medium text-gray-900">Create Package</h4>
                    <p className="text-sm text-gray-600">Add new subscription package</p>
                  </div>
                </div>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                  Create Package
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 p-2 rounded-md bg-purple-100">
                    <i className="fas fa-chart-bar text-purple-600 text-xl"></i>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-md font-medium text-gray-900">View Reports</h4>
                    <p className="text-sm text-gray-600">Access analytics and reports</p>
                  </div>
                </div>
                <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}