import Head from 'next/head';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const router = useRouter();

  if (!isAuthenticated) {
    return null; // Will be redirected by ProtectedRoute
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <>
        <Head>
          <title>User Profile - QR Check-in System</title>
          <meta name="description" content="Manage your QR Check-in System profile" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="min-h-screen bg-gray-900">
          <Navigation />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="md:flex">
                {/* Sidebar */}
                <div className="md:w-1/4 border-r border-gray-700">
                  <div className="p-6 bg-gray-800">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                        {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
                        <p className="text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <nav className="p-4">
                    <ul className="space-y-1">
                      <li>
                        <button
                          onClick={() => setActiveTab('profile')}
                          className={`w-full text-left px-4 py-2 rounded-md ${
                            activeTab === 'profile'
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <i className="fas fa-user mr-2"></i> Profile
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => setActiveTab('subscriptions')}
                          className={`w-full text-left px-4 py-2 rounded-md ${
                            activeTab === 'subscriptions'
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <i className="fas fa-tag mr-2"></i> Subscriptions
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => setActiveTab('activity')}
                          className={`w-full text-left px-4 py-2 rounded-md ${
                            activeTab === 'activity'
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <i className="fas fa-history mr-2"></i> Activity Log
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => setActiveTab('settings')}
                          className={`w-full text-left px-4 py-2 rounded-md ${
                            activeTab === 'settings'
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <i className="fas fa-cog mr-2"></i> Settings
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>

                {/* Main content */}
                <div className="md:w-3/4 p-6">
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-6">Profile Information</h3>
                      
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">First Name</label>
                            <div className="bg-gray-700 rounded-md px-4 py-3 text-white">
                              {user?.firstName}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">Last Name</label>
                            <div className="bg-gray-700 rounded-md px-4 py-3 text-white">
                              {user?.lastName}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-gray-400 text-sm font-medium mb-2">Email</label>
                          <div className="bg-gray-700 rounded-md px-4 py-3 text-white">
                            {user?.email}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-gray-400 text-sm font-medium mb-2">Username</label>
                          <div className="bg-gray-700 rounded-md px-4 py-3 text-white">
                            {user?.username}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-gray-400 text-sm font-medium mb-2">Account Type</label>
                          <div className="bg-gray-700 rounded-md px-4 py-3 text-white">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                              user?.role === 'STAFF' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user?.role}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-gray-400 text-sm font-medium mb-2">Member Since</label>
                          <div className="bg-gray-700 rounded-md px-4 py-3 text-white">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subscriptions Tab */}
                  {activeTab === 'subscriptions' && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-6">Your Subscriptions</h3>
                      
                      <div className="bg-gray-700 rounded-lg overflow-hidden">
                        <div className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm text-gray-400">Current Plan</span>
                              <h4 className="text-lg font-semibold text-white mt-1">Premium Membership</h4>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Active
                            </span>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Billing Period</span>
                              <span className="text-white">Monthly</span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-2">
                              <span className="text-gray-400">Next Payment</span>
                              <span className="text-white">July 12, 2025</span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-2">
                              <span className="text-gray-400">Amount</span>
                              <span className="text-white">$29.99 / month</span>
                            </div>
                          </div>
                          
                          <div className="mt-6 flex items-center justify-end space-x-3">
                            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors">
                              Change Plan
                            </button>
                            <button className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Activity Log Tab */}
                  {activeTab === 'activity' && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-6">Activity Log</h3>
                      
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-start">
                              <div className="bg-blue-500 rounded-full p-2 mr-4">
                                <i className="fas fa-qrcode text-white"></i>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-white font-medium">
                                    {i % 2 === 0 ? 'Checked in at Fitness Club' : 'Checked out from Fitness Club'}
                                  </h4>
                                  <span className="text-gray-400 text-sm">
                                    {i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i + 1} days ago`}
                                  </span>
                                </div>
                                <p className="text-gray-400 text-sm mt-1">
                                  {new Date(2025, 5, 12 - i).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === 'settings' && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-medium text-white mb-3">Change Password</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-gray-400 text-sm font-medium mb-2">Current Password</label>
                              <input
                                type="password"
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-medium mb-2">New Password</label>
                              <input
                                type="password"
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-medium mb-2">Confirm New Password</label>
                              <input
                                type="password"
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                              />
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                              Update Password
                            </button>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-700 pt-6">
                          <h4 className="text-lg font-medium text-white mb-3">Notification Preferences</h4>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <input
                                id="email-notifications"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                                defaultChecked
                              />
                              <label htmlFor="email-notifications" className="ml-3 text-white">
                                Email Notifications
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="push-notifications"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                                defaultChecked
                              />
                              <label htmlFor="push-notifications" className="ml-3 text-white">
                                Push Notifications
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="sms-notifications"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                              />
                              <label htmlFor="sms-notifications" className="ml-3 text-white">
                                SMS Notifications
                              </label>
                            </div>
                          </div>
                          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            Save Preferences
                          </button>
                        </div>
                      </div>
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
