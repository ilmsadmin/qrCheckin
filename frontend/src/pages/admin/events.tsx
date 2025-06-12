import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import Navigation from '../../components/Navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { GET_ALL_EVENTS, CREATE_EVENT, UPDATE_EVENT, REMOVE_EVENT } from '../../lib/graphql/events';
import { GET_CLUBS } from '../../lib/graphql/dashboard';

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
  club: {
    id: string;
    name: string;
  };
}

interface Club {
  id: string;
  name: string;
  isActive: boolean;
}

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    maxCapacity: '',
    clubId: ''
  });

  const { data, loading, error, refetch } = useQuery(GET_ALL_EVENTS);
  const { data: clubsData } = useQuery(GET_CLUBS);
  const [createEvent, { loading: createLoading }] = useMutation(CREATE_EVENT);
  const [updateEvent, { loading: updateLoading }] = useMutation(UPDATE_EVENT);
  const [removeEvent, { loading: removeLoading }] = useMutation(REMOVE_EVENT);

  useEffect(() => {
    if (data?.events) {
      try {
        const parsedEvents = JSON.parse(data.events);
        setEvents(parsedEvents);
      } catch (e) {
        console.error('Error parsing events data:', e);
        setEvents([]);
      }
    }
  }, [data]);

  useEffect(() => {
    if (clubsData?.clubs) {
      setClubs(clubsData.clubs.filter((club: Club) => club.isActive));
    }
  }, [clubsData]);

  useEffect(() => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.club.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(event =>
        filterStatus === 'active' ? event.isActive : !event.isActive
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, filterStatus]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      maxCapacity: '',
      clubId: ''
    });
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const input = {
        name: formData.name,
        description: formData.description || undefined,
        location: formData.location || undefined,
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : undefined,
        clubId: formData.clubId
      };

      await createEvent({ variables: { input } });
      resetForm();
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      const input = {
        name: formData.name,
        description: formData.description || undefined,
        location: formData.location || undefined,
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : undefined,
        clubId: formData.clubId
      };

      await updateEvent({ variables: { id: editingEvent.id, input } });
      resetForm();
      setEditingEvent(null);
      refetch();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleRemoveEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to deactivate this event?')) return;

    try {
      await removeEvent({ variables: { id: eventId } });
      refetch();
    } catch (error) {
      console.error('Error removing event:', error);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || '',
      location: event.location || '',
      startTime: new Date(event.startTime).toISOString().slice(0, 16),
      endTime: new Date(event.endTime).toISOString().slice(0, 16),
      maxCapacity: event.maxCapacity?.toString() || '',
      clubId: event.club.id
    });
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setEditingEvent(null);
    resetForm();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading events...</p>
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
                    Error loading events
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error.message}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => refetch()}
                      className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                    >
                      Retry
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

  return (
    <ProtectedRoute requireAdmin={true}>
      <>
        <Head>
          <title>Event Management - QR Check-in</title>
        </Head>

        <div className="min-h-screen bg-gray-50">
          <Navigation />
          
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
                  <p className="mt-2 text-gray-600">Manage and monitor your events</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => refetch()}
                    className="bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <i className="fas fa-refresh mr-2"></i>Refresh
                  </button>
                  <button 
                    onClick={() => openCreateModal()}
                    className="bg-blue-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <i className="fas fa-plus mr-2"></i>Create Event
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="search" className="sr-only">Search events</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-search text-gray-400"></i>
                    </div>
                    <input
                      id="search"
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                  >
                    <option value="all">All Events</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Events List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-calendar text-gray-300 text-6xl mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-500">
                      {events.length === 0 
                        ? "You haven't created any events yet." 
                        : "No events match your current filters."
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Capacity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredEvents.map((event) => (
                          <tr key={event.id}>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {event.name}
                                </div>
                                {event.description && (
                                  <div className="text-sm text-gray-500">
                                    {event.description}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {event.location || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                <div>{formatDate(event.startTime)}</div>
                                {event.endTime && (
                                  <div className="text-xs text-gray-500">
                                    End: {formatDate(event.endTime)}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {event.maxCapacity ? (
                                <div>
                                  <div>{event.currentAttendees || 0} / {event.maxCapacity}</div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ 
                                        width: `${Math.min(((event.currentAttendees || 0) / event.maxCapacity) * 100, 100)}%` 
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              ) : (
                                'Unlimited'
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                event.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {event.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => openEditModal(event)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit event"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button className="text-green-600 hover:text-green-900" title="View details">
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button 
                                  onClick={() => handleRemoveEvent(event.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Deactivate event"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Create Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Event</h3>
                <form onSubmit={handleCreateEvent}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Event Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="club" className="block text-sm font-medium text-gray-700 mb-2">
                        Club *
                      </label>
                      <select
                        id="club"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.clubId}
                        onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                      >
                        <option value="">Select a club</option>
                        {clubs.map((club) => (
                          <option key={club.id} value={club.id}>
                            {club.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time *
                      </label>
                      <input
                        type="datetime-local"
                        id="startTime"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                        End Time *
                      </label>
                      <input
                        type="datetime-local"
                        id="endTime"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="maxCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                        Max Capacity
                      </label>
                      <input
                        type="number"
                        id="maxCapacity"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.maxCapacity}
                        onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {createLoading ? 'Creating...' : 'Create Event'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Event Modal */}
        {editingEvent && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Event</h3>
                <form onSubmit={handleUpdateEvent}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Event Name *
                      </label>
                      <input
                        type="text"
                        id="edit-name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-club" className="block text-sm font-medium text-gray-700 mb-2">
                        Club *
                      </label>
                      <select
                        id="edit-club"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.clubId}
                        onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                      >
                        <option value="">Select a club</option>
                        {clubs.map((club) => (
                          <option key={club.id} value={club.id}>
                            {club.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="edit-description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="edit-startTime" className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time *
                      </label>
                      <input
                        type="datetime-local"
                        id="edit-startTime"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-endTime" className="block text-sm font-medium text-gray-700 mb-2">
                        End Time *
                      </label>
                      <input
                        type="datetime-local"
                        id="edit-endTime"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        id="edit-location"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-maxCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                        Max Capacity
                      </label>
                      <input
                        type="number"
                        id="edit-maxCapacity"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.maxCapacity}
                        onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updateLoading ? 'Updating...' : 'Update Event'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </>
    </ProtectedRoute>
  );
}