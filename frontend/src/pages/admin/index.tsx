import Head from 'next/head'
import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <>
      <Head>
        <title>Admin Dashboard - QR Check-in</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <nav className="flex space-x-4">
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </Link>
                <button className="text-red-600 hover:text-red-800">
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              
              {/* Users Management */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
                <p className="text-gray-600 mb-4">Manage system users, roles, and permissions</p>
                <Link href="/admin/users" className="btn btn-primary">
                  Manage Users
                </Link>
              </div>

              {/* Clubs Management */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Club Management</h3>
                <p className="text-gray-600 mb-4">Create and manage clubs and organizations</p>
                <Link href="/admin/clubs" className="btn btn-primary">
                  Manage Clubs
                </Link>
              </div>

              {/* Events Management */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Event Management</h3>
                <p className="text-gray-600 mb-4">Create events and track attendance</p>
                <Link href="/admin/events" className="btn btn-primary">
                  Manage Events
                </Link>
              </div>

              {/* Subscriptions */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Subscriptions</h3>
                <p className="text-gray-600 mb-4">Manage membership packages and QR codes</p>
                <Link href="/admin/subscriptions" className="btn btn-primary">
                  Manage Subscriptions
                </Link>
              </div>

              {/* Check-in Logs */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Check-in Logs</h3>
                <p className="text-gray-600 mb-4">View and analyze attendance data</p>
                <Link href="/admin/logs" className="btn btn-primary">
                  View Logs
                </Link>
              </div>

              {/* Analytics */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics</h3>
                <p className="text-gray-600 mb-4">Generate reports and insights</p>
                <Link href="/admin/analytics" className="btn btn-primary">
                  View Analytics
                </Link>
              </div>

            </div>

            {/* Quick Stats */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">👥</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Users
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            1,234
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">🏢</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Active Clubs
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            42
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">📅</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Events This Month
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            18
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">✅</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Check-ins Today
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            156
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}