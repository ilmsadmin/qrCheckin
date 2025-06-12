import Head from 'next/head'
import Link from 'next/link'
import { QrCodeIcon } from '@heroicons/react/24/outline'
import Navigation from '../../components/Navigation'
import ProtectedRoute from '../../components/ProtectedRoute'

export default function AdminDashboard() {
  const recentCheckins = [
    {
      id: 1,
      name: 'John Doe',
      location: 'Gym Floor',
      action: 'Check-in',
      time: '5 minutes ago',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      location: 'Swimming Pool',
      action: 'Check-out',
      time: '15 minutes ago',
      status: 'Completed'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      location: 'Swimming Pool',
      action: 'Check-in',
      time: '10 minutes ago',
      status: 'Active'
    }
  ]

  return (
    <ProtectedRoute requireAdmin={true}>
      <>
        <Head>
          <title>Admin Dashboard - QR Check-in</title>
        </Head>

        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <Navigation />
          
          {/* Main Content */}
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
                        <dd className="text-lg font-medium text-gray-900">1,234</dd>
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
                        <dd className="text-lg font-medium text-gray-900">42</dd>
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
                        <dd className="text-lg font-medium text-gray-900">18</dd>
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
                        <dd className="text-lg font-medium text-gray-900">156</dd>
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
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  <i className="fas fa-users mr-2"></i>Manage Users
                </button>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Event Management</h3>
                <p className="text-sm text-gray-600 mb-4">Create events and track attendance</p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                  <i className="fas fa-calendar-plus mr-2"></i>Manage Events
                </button>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">QR Code Management</h3>
                <p className="text-sm text-gray-600 mb-4">Generate and manage QR codes</p>
                <Link href="/admin/packages" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 inline-block">
                  <i className="fas fa-qrcode mr-2"></i>Manage Packages
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Check-ins</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
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
                            {checkin.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {checkin.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {checkin.action}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {checkin.time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              checkin.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {checkin.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </ProtectedRoute>
  )
}