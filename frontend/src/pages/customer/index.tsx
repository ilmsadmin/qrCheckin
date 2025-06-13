import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import QRCode from '../../components/QRCode'
import { useQuery } from '@apollo/client'
import { GET_CUSTOMER_DASHBOARD } from '../../lib/graphql/customer'

interface CustomerData {
  name: string
  membershipStatus: string
  membershipType: string
  renewalDate: string
  qrCode: string
  recentVisits: Array<{
    date: string
    time: string
    location: string
    type: 'checkin' | 'checkout'
  }>
  membershipDetails: {
    name: string
    price: string
    features: string[]
  }
}

export default function CustomerPortal() {
  const [showQR, setShowQR] = useState(false)
  
  // Fetch customer data from API
  const { data: customerDashboardData, loading: dashboardLoading, error: dashboardError } = useQuery(GET_CUSTOMER_DASHBOARD, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  })
  
  // Use API data if available, otherwise fall back to mock data
  const customerData: CustomerData = customerDashboardData?.customerDashboard ? {
    name: `${customerDashboardData.customerDashboard.customer.firstName} ${customerDashboardData.customerDashboard.customer.lastName}`,
    membershipStatus: customerDashboardData.customerDashboard.activeSubscription?.status || 'Active',
    membershipType: customerDashboardData.customerDashboard.activeSubscription?.package?.name || 'Premium Membership',
    renewalDate: customerDashboardData.customerDashboard.activeSubscription?.expiresAt || 'July 15, 2025',
    qrCode: customerDashboardData.customerDashboard.activeSubscription?.qrCode?.hash || 'USER-user123-SUB-sub456',
    recentVisits: customerDashboardData.customerDashboard.recentCheckins?.map((checkin: any) => ({
      date: new Date(checkin.timestamp).toLocaleDateString(),
      time: new Date(checkin.timestamp).toLocaleTimeString(),
      location: checkin.location || 'Main Entrance',
      type: checkin.type as 'checkin' | 'checkout'
    })) || [],
    membershipDetails: {
      name: customerDashboardData.customerDashboard.activeSubscription?.package?.name || 'Premium Membership',
      price: `$${customerDashboardData.customerDashboard.activeSubscription?.package?.price || 89.99}/mo`,
      features: customerDashboardData.customerDashboard.activeSubscription?.package?.features || [
        'Unlimited gym access',
        'Group fitness classes',
        'Pool and sauna access',
        'Personal trainer (2x/month)',
        'Nutritional counseling'
      ]
    }
  } : {
    name: 'Sarah Johnson',
    membershipStatus: 'Active',
    membershipType: 'Premium Membership',
    renewalDate: 'July 15, 2025',
    qrCode: 'USER-user123-SUB-sub456',
    recentVisits: [
      { date: 'Today', time: '9:32 AM', location: 'Main Entrance', type: 'checkin' },
      { date: 'June 12', time: '5:45 PM', location: 'Main Entrance', type: 'checkout' },
      { date: 'June 12', time: '4:15 PM', location: 'Main Entrance', type: 'checkin' },
      { date: 'June 10', time: '6:20 PM', location: 'Main Entrance', type: 'checkout' }
    ],
    membershipDetails: {
      name: 'Premium Membership',
      price: '$89.99/mo',
      features: [
        'Unlimited gym access',
        'Group fitness classes',
        'Pool and sauna access',
        'Personal trainer (2x/month)',
        'Nutritional counseling'
      ]
    }
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Fitness Club Pro - Customer Portal</title>
        </Head>

        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <i className="fas fa-qrcode text-2xl text-white mr-3"></i>
                <h1 className="text-xl font-bold text-white">Fitness Club Pro</h1>
              </div>
              <div className="flex items-center space-x-6">
                <button className="text-white hover:text-blue-200">
                  <i className="fas fa-bell"></i>
                </button>
                <div className="flex items-center text-sm text-white">
                  <img 
                    className="h-8 w-8 rounded-full" 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="Customer" 
                  />
                  <span className="ml-2">{customerData.name}</span>
                </div>
                <button className="text-white hover:text-blue-200">
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Banner */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Welcome back, {customerData.name.split(' ')[0]}!</h2>
              <p className="text-blue-100">Your {customerData.membershipType} is active</p>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <p className="text-gray-600 mb-1">Membership Status</p>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mr-2">
                      <i className="fas fa-check-circle mr-1"></i> {customerData.membershipStatus}
                    </span>
                    <span className="text-gray-600 text-sm">Renews on {customerData.renewalDate}</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowQR(!showQR)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <i className="fas fa-qrcode mr-2"></i> Show My QR
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <i className="fas fa-credit-card mr-2"></i> Manage Payment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Your QR Code */}
          {showQR && (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Your QR Code</h3>
              </div>
              <div className="p-6 flex flex-col items-center">
                <div className="text-center mb-4">
                  <p className="text-gray-600 mb-2">Present this QR code when you arrive at the club</p>
                </div>
                <QRCode value={customerData.qrCode} size={256} className="mb-6" />
                <div className="flex space-x-4">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <i className="fas fa-download mr-2"></i> Download
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <i className="fas fa-share-alt mr-2"></i> Share
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Membership and Visit History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Membership Details */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Membership Details</h3>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg mb-4">
                  <div>
                    <h4 className="text-md font-medium text-gray-900">{customerData.membershipDetails.name}</h4>
                    <p className="text-sm text-gray-600">Unlimited access to all facilities</p>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{customerData.membershipDetails.price}</span>
                </div>
                
                <div className="space-y-3 mb-4">
                  {customerData.membershipDetails.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <i className="fas fa-check text-green-500 mr-2"></i>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Explore Other Packages
                  </button>
                </div>
              </div>
            </div>
            
            {/* Recent Visits */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Recent Visits</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {customerData.recentVisits.map((visit, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{visit.date}, {visit.time}</p>
                        <p className="text-xs text-gray-500">{visit.location}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        visit.type === 'checkin' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {visit.type === 'checkin' ? 'Check-in' : 'Check-out'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 p-2 rounded-md bg-blue-100">
                  <i className="fas fa-calendar-alt text-blue-600 text-xl"></i>
                </div>
                <div className="ml-3">
                  <h4 className="text-md font-medium text-gray-900">Book Classes</h4>
                  <p className="text-sm text-gray-600">Reserve your spot in group classes</p>
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                View Schedule
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 p-2 rounded-md bg-green-100">
                  <i className="fas fa-user-friends text-green-600 text-xl"></i>
                </div>
                <div className="ml-3">
                  <h4 className="text-md font-medium text-gray-900">Personal Trainer</h4>
                  <p className="text-sm text-gray-600">Schedule a session with a trainer</p>
                </div>
              </div>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                Book Session
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 p-2 rounded-md bg-purple-100">
                  <i className="fas fa-chart-line text-purple-600 text-xl"></i>
                </div>
                <div className="ml-3">
                  <h4 className="text-md font-medium text-gray-900">Progress Tracking</h4>
                  <p className="text-sm text-gray-600">View your fitness journey</p>
                </div>
              </div>
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                View Progress
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}