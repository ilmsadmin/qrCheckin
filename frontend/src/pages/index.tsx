import Head from 'next/head'
import Link from 'next/link'
import { QrCodeIcon, UserGroupIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import Navigation from '../components/Navigation'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const { isAuthenticated, isAdmin, isStaff, loading, user } = useAuth();
  const router = useRouter();
  
  // Redirect based on user role
  useEffect(() => {
    // Only redirect if authentication check is complete and user is authenticated
    if (!loading && isAuthenticated && user) {
      console.log('Home: User authenticated, redirecting based on role:', user.role);
      
      if (isAdmin) {
        router.push('/admin');
      } else if (isStaff) {
        router.push('/scanner');
      } else {
        router.push('/packages');
      }
    }
  }, [isAuthenticated, isAdmin, isStaff, router, loading, user]);

  return (
    <>
      <Head>
        <title>QR Check-in System</title>
        <meta name="description" content="QR Code based check-in system for clubs and events" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <Navigation />

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              QR Check-in System
            </h2>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Streamline your club and event check-ins with QR code technology. 
              Manage memberships, track attendance, and enhance user experience.
            </p>
          </div>

          {/* Features */}
          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="card text-center">
                <UserGroupIcon className="h-12 w-12 text-primary-600 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Member Management</h3>
                <p className="mt-2 text-gray-500">
                  Easily manage club members, subscriptions, and user profiles in one place.
                </p>
              </div>

              <div className="card text-center">
                <QrCodeIcon className="h-12 w-12 text-primary-600 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">QR Code Check-ins</h3>
                <p className="mt-2 text-gray-500">
                  Generate unique QR codes for each member and enable quick check-ins.
                </p>
              </div>

              <div className="card text-center">
                <CalendarIcon className="h-12 w-12 text-primary-600 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Event Management</h3>
                <p className="mt-2 text-gray-500">
                  Create and manage events with automated attendance tracking.
                </p>
              </div>

              <div className="card text-center">
                <ChartBarIcon className="h-12 w-12 text-primary-600 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Analytics & Reports</h3>
                <p className="mt-2 text-gray-500">
                  Track attendance patterns and generate insightful reports.
                </p>
              </div>

              <div className="card text-center">
                <div className="h-12 w-12 bg-primary-600 rounded-lg mx-auto flex items-center justify-center">
                  <span className="text-white font-bold text-xl">📱</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Mobile Apps</h3>
                <p className="mt-2 text-gray-500">
                  iOS and Android apps for staff to scan QR codes and manage check-ins.
                </p>
              </div>

              <div className="card text-center">
                <div className="h-12 w-12 bg-primary-600 rounded-lg mx-auto flex items-center justify-center">
                  <span className="text-white font-bold text-xl">🔒</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Secure & Reliable</h3>
                <p className="mt-2 text-gray-500">
                  Built with security in mind, ensuring your data is safe and accessible.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <h3 className="text-2xl font-bold text-gray-900">Ready to get started?</h3>
            <p className="mt-4 text-lg text-gray-500">
              Join thousands of clubs and organizations using our QR check-in system.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Link href="/packages" className="btn btn-primary px-8 py-3 text-lg">
                View Packages
              </Link>
              <Link href="/admin" className="btn btn-secondary px-8 py-3 text-lg">
                Admin Panel
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-500">
              <p>&copy; 2024 QR Check-in System. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}