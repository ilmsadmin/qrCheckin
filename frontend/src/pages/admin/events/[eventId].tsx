import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import Navigation from '../../../components/Navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { GET_EVENT } from '../../../lib/graphql/events';

interface Event {
  id: string;
  name: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  maxCapacity?: number;
  currentAttendees?: number;
  createdAt: string;
  updatedAt: string;
  club: {
    id: string;
    name: string;
  };
}

export default function EventDetail() {
  const router = useRouter();
  const { eventId } = router.query;

  const { data, loading, error, refetch } = useQuery(GET_EVENT, {
    variables: { id: eventId },
    skip: !eventId,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTimeOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading event details...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading event details
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error.message}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => refetch()}
                      className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 mr-3"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => router.push('/admin/events')}
                      className="bg-gray-100 px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-200"
                    >
                      Back to Events
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!data?.event) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <i className="fas fa-calendar-times text-gray-300 text-6xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Event not found</h3>
              <p className="text-gray-500 mb-4">The event you're looking for doesn't exist or has been removed.</p>
              <button 
                onClick={() => router.push('/admin/events')}
                className="bg-blue-600 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                Back to Events
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const event: Event = JSON.parse(data.event);

  return (
    <ProtectedRoute requireAdmin={true}>
      <>
        <Head>
          <title>{event.name} - Event Details - QR Check-in</title>
        </Head>

        <div className="min-h-screen bg-gray-50">
          <Navigation />
          
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button 
                    onClick={() => router.push('/admin/events')}
                    className="text-gray-500 hover:text-gray-700 mr-4"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>Back to Events
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
                    <p className="mt-2 text-gray-600">Event Details</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => refetch()}
                    className="bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <i className="fas fa-refresh mr-2"></i>Refresh
                  </button>
                  <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-md ${
                    event.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {event.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Event Information */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Event Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Event Name</label>
                      <p className="text-lg text-gray-900">{event.name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Club</label>
                      <p className="text-lg text-gray-900">{event.club.name}</p>
                    </div>
                    
                    {event.description && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                        <p className="text-gray-900">{event.description}</p>
                      </div>
                    )}
                    
                    {event.location && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Location</label>
                        <p className="text-gray-900 flex items-center">
                          <i className="fas fa-map-marker-alt text-gray-400 mr-2"></i>
                          {event.location}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Event ID</label>
                      <p className="text-gray-900 font-mono text-sm">{event.id}</p>
                    </div>
                  </div>
                </div>

                {/* Schedule Information */}
                <div className="mt-6 bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Start Date & Time</label>
                      <div className="text-gray-900">
                        <div className="flex items-center mb-1">
                          <i className="fas fa-calendar text-gray-400 mr-2"></i>
                          {formatDateOnly(event.startTime)}
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-clock text-gray-400 mr-2"></i>
                          {formatTimeOnly(event.startTime)}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">End Date & Time</label>
                      <div className="text-gray-900">
                        <div className="flex items-center mb-1">
                          <i className="fas fa-calendar text-gray-400 mr-2"></i>
                          {formatDateOnly(event.endTime)}
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-clock text-gray-400 mr-2"></i>
                          {formatTimeOnly(event.endTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Capacity Information */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity</h3>
                  
                  {event.maxCapacity ? (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">Current Attendees</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {event.currentAttendees || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-500">Max Capacity</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {event.maxCapacity}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${Math.min(((event.currentAttendees || 0) / event.maxCapacity) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      
                      <div className="text-center text-sm text-gray-500">
                        {Math.round(((event.currentAttendees || 0) / event.maxCapacity) * 100)}% Full
                      </div>
                      
                      {(event.currentAttendees || 0) >= event.maxCapacity && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                          <div className="flex items-center">
                            <i className="fas fa-exclamation-triangle text-red-400 mr-2"></i>
                            <span className="text-sm text-red-800 font-medium">Event is at full capacity</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-infinity text-blue-600 text-3xl mb-2"></i>
                      <p className="text-gray-900 font-semibold">Unlimited Capacity</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Current attendees: {event.currentAttendees || 0}
                      </p>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="mt-6 bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Created</label>
                      <p className="text-sm text-gray-900">{formatDate(event.createdAt)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-sm text-gray-900">{formatDate(event.updatedAt)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <div className="flex items-center mt-1">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          event.isActive ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        <span className="text-sm text-gray-900">
                          {event.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => router.push('/admin/events')}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      Edit Event
                    </button>
                    
                    <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 flex items-center justify-center">
                      <i className="fas fa-qrcode mr-2"></i>
                      Generate QR Code
                    </button>
                    
                    <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 flex items-center justify-center">
                      <i className="fas fa-download mr-2"></i>
                      Export Attendees
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </ProtectedRoute>
  );
}
