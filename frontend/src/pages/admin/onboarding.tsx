import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import Navigation from '../../components/Navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import ErrorHandler from '../../components/ErrorHandler';
import { GET_RECENT_ONBOARDING_REQUESTS, CREATE_CLUB } from '../../lib/graphql/platform';

interface OnboardingRequest {
  id: string;
  clubName: string;
  contactEmail: string;
  contactPhone?: string;
  businessType?: string;
  description?: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  notes?: string;
}

export default function OnboardingManagement() {
  const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  // Query to get onboarding requests
  const { data, loading, error, refetch } = useQuery(GET_RECENT_ONBOARDING_REQUESTS, {
    errorPolicy: 'all'
  });

  // Mutation to create club from approved request
  const [createClub, { loading: createLoading }] = useMutation(CREATE_CLUB);

  const requests: OnboardingRequest[] = data?.recentOnboardingRequests || [];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const pendingRequests = requests.filter(req => req.status === 'PENDING');
  const approvedRequests = requests.filter(req => req.status === 'APPROVED');
  const rejectedRequests = requests.filter(req => req.status === 'REJECTED');
  const completedRequests = requests.filter(req => req.status === 'COMPLETED');

  const handleViewRequest = (request: OnboardingRequest) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const handleApproval = (request: OnboardingRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setApprovalNotes('');
    setShowApprovalModal(true);
  };

  const handleCreateClubFromRequest = async () => {
    if (!selectedRequest) return;

    try {
      const result = await createClub({
        variables: {
          input: {
            name: selectedRequest.clubName,
            description: selectedRequest.description || '',
            contactEmail: selectedRequest.contactEmail,
            contactPhone: selectedRequest.contactPhone
          }
        }
      });

      if (result.data?.createClub) {
        alert('Club created successfully!');
        // Update request status to COMPLETED
        // In a real implementation, you'd have a mutation to update request status
        refetch();
        setShowApprovalModal(false);
      }
    } catch (error) {
      console.error('Error creating club:', error);
      alert('Failed to create club. Please try again.');
    }
  };

  const handleApprovalSubmit = async () => {
    if (!selectedRequest) return;

    try {
      // In a real implementation, you'd have mutations to approve/reject requests
      // For now, we'll just simulate the action
      if (actionType === 'approve') {
        await handleCreateClubFromRequest();
      } else {
        // Simulate rejection
        alert('Request rejected successfully!');
        refetch();
        setShowApprovalModal(false);
      }
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Failed to process request. Please try again.');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading onboarding requests...</p>
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
          <title>Onboarding Management - QR Check-in Admin</title>
        </Head>

        <div className="min-h-screen bg-gray-50">
          <Navigation />
          
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Club Onboarding Management
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Review and manage club onboarding requests
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
                <Link 
                  href="/admin" 
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Dashboard
                </Link>
                <button
                  onClick={() => refetch()}
                  className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  Refresh
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <ErrorHandler 
                error={error} 
                onDismiss={() => refetch()}
                onRetry={() => refetch()}
              />
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-clock text-yellow-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                        <dd className="text-lg font-medium text-gray-900">{pendingRequests.length}</dd>
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
                        <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                        <dd className="text-lg font-medium text-gray-900">{approvedRequests.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-times-circle text-red-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                        <dd className="text-lg font-medium text-gray-900">{rejectedRequests.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-building text-blue-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                        <dd className="text-lg font-medium text-gray-900">{completedRequests.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Onboarding Requests</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Club Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
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
                      {requests.map((request: OnboardingRequest) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {request.clubName}
                            </div>
                            {request.businessType && (
                              <div className="text-sm text-gray-500">{request.businessType}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{request.contactEmail}</div>
                            {request.contactPhone && (
                              <div className="text-sm text-gray-500">{request.contactPhone}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(request.submittedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewRequest(request)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              {request.status === 'PENDING' ? (
                                <>
                                  <button
                                    onClick={() => handleApproval(request, 'approve')}
                                    className="text-green-600 hover:text-green-900"
                                    title="Approve Request"
                                  >
                                    <i className="fas fa-check"></i>
                                  </button>
                                  <button
                                    onClick={() => handleApproval(request, 'reject')}
                                    className="text-red-600 hover:text-red-900"
                                    title="Reject Request"
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </>
                              ) : request.status === 'APPROVED' ? (
                                <button
                                  onClick={() => handleApproval(request, 'approve')}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Create Club"
                                >
                                  <i className="fas fa-plus-circle"></i>
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {requests.length === 0 && (
                  <div className="text-center py-8">
                    <i className="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
                    <p className="text-gray-500">No onboarding requests found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Request Details Modal */}
          {showRequestModal && selectedRequest && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Request Details</h3>
                    <button
                      onClick={() => setShowRequestModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Club Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRequest.clubName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRequest.contactEmail}</p>
                    </div>
                    {selectedRequest.contactPhone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedRequest.contactPhone}</p>
                      </div>
                    )}
                    {selectedRequest.businessType && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Business Type</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedRequest.businessType}</p>
                      </div>
                    )}
                    {selectedRequest.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedRequest.description}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedRequest.status)}`}>
                        {selectedRequest.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Submitted</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRequest.submittedAt)}</p>
                    </div>
                    {selectedRequest.notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedRequest.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={() => setShowRequestModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Approval Modal */}
          {showApprovalModal && selectedRequest && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
                    </h3>
                    <button
                      onClick={() => setShowApprovalModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Are you sure you want to {actionType} the request from <strong>{selectedRequest.clubName}</strong>?
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {actionType === 'approve' ? 'Approval Notes' : 'Rejection Reason'}
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      placeholder={actionType === 'approve' ? 'Optional notes...' : 'Please provide a reason for rejection...'}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowApprovalModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApprovalSubmit}
                      disabled={createLoading}
                      className={`px-4 py-2 text-white rounded-md ${
                        actionType === 'approve' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      } disabled:opacity-50`}
                    >
                      {createLoading 
                        ? 'Processing...' 
                        : actionType === 'approve' 
                          ? 'Approve & Create Club' 
                          : 'Reject'
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    </ProtectedRoute>
  );
}