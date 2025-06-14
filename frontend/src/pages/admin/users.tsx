import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import QRCode from 'react-qr-code';
import { GET_USERS, ACTIVATE_USER, DEACTIVATE_USER, GENERATE_USER_QR_CODE, CREATE_SYSTEM_USER, UPDATE_USER_ROLE } from '../../lib/graphql/users';
import { GET_CLUBS } from '../../lib/graphql/dashboard';
import Navigation from '../../components/Navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import ErrorHandler from '../../components/ErrorHandler';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Club {
  id: string;
  name: string;
  isActive: boolean;
}

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [qrCodeModal, setQrCodeModal] = useState<{ show: boolean; userId?: string; qrCode?: string }>({ show: false });
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'CLUB_STAFF',
    clubId: ''
  });
  const [roleFormData, setRoleFormData] = useState({
    role: '',
    clubId: ''
  });

  // Query to get all users
  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    errorPolicy: 'all'
  });

  // Query to get clubs for user creation
  const { data: clubsData } = useQuery(GET_CLUBS);

  // Mutations
  const [activateUser] = useMutation(ACTIVATE_USER, {
    onCompleted: () => refetch(),
    onError: (error) => console.error('Error activating user:', error)
  });

  const [deactivateUser] = useMutation(DEACTIVATE_USER, {
    onCompleted: () => refetch(),
    onError: (error) => console.error('Error deactivating user:', error)
  });

  const [generateQRCode] = useMutation(GENERATE_USER_QR_CODE, {
    onCompleted: (data) => {
      setQrCodeModal({ 
        show: true, 
        userId: data.generateUserQRCode.id,
        qrCode: data.generateUserQRCode.qrCode 
      });
    },
    onError: (error) => console.error('Error generating QR code:', error)
  });

  const [createSystemUser, { loading: createLoading }] = useMutation(CREATE_SYSTEM_USER, {
    onCompleted: () => {
      refetch();
      setShowCreateModal(false);
      resetForm();
      alert('User created successfully!');
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    }
  });

  const [updateUserRole, { loading: updateRoleLoading }] = useMutation(UPDATE_USER_ROLE, {
    onCompleted: () => {
      refetch();
      setShowRoleModal(false);
      alert('User role updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating user role:', error);
      alert('Failed to update user role. Please try again.');
    }
  });

  const users = data?.users || [];
  const clubs: Club[] = clubsData?.clubs || [];

  const handleToggleUserStatus = async (user: User) => {
    try {
      if (user.isActive) {
        await deactivateUser({ variables: { id: user.id } });
      } else {
        await activateUser({ variables: { id: user.id } });
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleGenerateQR = async (userId: string) => {
    try {
      await generateQRCode({ variables: { userId } });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'system_admin':
        return 'bg-purple-100 text-purple-800';
      case 'club_admin':
        return 'bg-red-100 text-red-800';
      case 'club_staff':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      password: '',
      role: 'CLUB_STAFF',
      clubId: ''
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createSystemUser({
        variables: {
          input: {
            email: formData.email,
            username: formData.username,
            firstName: formData.firstName,
            lastName: formData.lastName,
            password: formData.password,
            role: formData.role,
            clubId: formData.clubId || null
          }
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleRoleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    try {
      await updateUserRole({
        variables: {
          userId: selectedUser.id,
          role: roleFormData.role,
          clubId: roleFormData.clubId || null
        }
      });
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setRoleFormData({
      role: user.role,
      clubId: ''
    });
    setShowRoleModal(true);
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <>
        <Head>
          <title>User Management - QR Check-in Admin</title>
        </Head>

        <div className="min-h-screen bg-gray-50">
          <Navigation />
          
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  User Management
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Manage system users, roles, and permissions
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
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                >
                  <i className="fas fa-user-plus mr-2"></i>
                  Create User
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
                      <i className="fas fa-users text-blue-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{users.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-user-check text-green-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {users.filter((user: User) => user.isActive).length}
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
                      <i className="fas fa-user-shield text-red-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">System Admins</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {users.filter((user: User) => user.role === 'SYSTEM_ADMIN').length}
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
                      <i className="fas fa-user-tie text-purple-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Club Admins</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {users.filter((user: User) => user.role === 'CLUB_ADMIN').length}
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
                      <i className="fas fa-users text-blue-600 text-2xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Club Staff</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {users.filter((user: User) => user.role === 'CLUB_STAFF').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">All Users</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user: User) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <i className="fas fa-user text-gray-500"></i>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                onClick={() => handleGenerateQR(user.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Generate QR Code"
                              >
                                <i className="fas fa-qrcode"></i>
                              </button>
                              <button
                                onClick={() => handleToggleUserStatus(user)}
                                className={`${
                                  user.isActive 
                                    ? 'text-red-600 hover:text-red-900' 
                                    : 'text-green-600 hover:text-green-900'
                                }`}
                                title={user.isActive ? 'Deactivate User' : 'Activate User'}
                              >
                                <i className={`fas ${user.isActive ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                              </button>
                              <button
                                onClick={() => openRoleModal(user)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Change Role"
                              >
                                <i className="fas fa-user-cog"></i>
                              </button>
                              <Link 
                                href={`/admin/users/${user.id}/logs`}
                                className="text-purple-600 hover:text-purple-900"
                                title="View Check-in Logs"
                              >
                                <i className="fas fa-history"></i>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {users.length === 0 && (
                  <div className="text-center py-8">
                    <i className="fas fa-users text-gray-400 text-4xl mb-4"></i>
                    <p className="text-gray-500">No users found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Details Modal */}
          {showUserModal && selectedUser && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                    <button
                      onClick={() => setShowUserModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Username</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.username}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(selectedUser.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={() => setShowUserModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Modal */}
          {qrCodeModal.show && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">QR Code Generated</h3>
                    <button
                      onClick={() => setQrCodeModal({ show: false })}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  
                  {qrCodeModal.qrCode && (
                    <div className="mb-4">
                      <div className="bg-white p-4 rounded-lg border-2 border-gray-300 inline-block">
                        <QRCode
                          value={qrCodeModal.qrCode}
                          size={200}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">QR Code Value: {qrCodeModal.qrCode}</p>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 mb-4">
                    QR Code has been generated successfully. Users can use this code for check-in.
                  </p>
                  
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => setQrCodeModal({ show: false })}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create User Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Create New User</h3>
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <form onSubmit={handleCreateUser}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input
                        type="password"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                          <option value="SYSTEM_ADMIN">System Admin</option>
                          <option value="CLUB_ADMIN">Club Admin</option>
                          <option value="CLUB_STAFF">Club Staff</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={formData.clubId}
                          onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                          disabled={formData.role === 'SYSTEM_ADMIN'}
                        >
                          <option value="">Select a club</option>
                          {clubs.filter(club => club.isActive).map((club) => (
                            <option key={club.id} value={club.id}>
                              {club.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateModal(false);
                          resetForm();
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {createLoading ? 'Creating...' : 'Create User'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Role Update Modal */}
          {showRoleModal && selectedUser && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-[400px] shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Change User Role</h3>
                    <button
                      onClick={() => setShowRoleModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Changing role for: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
                    </p>
                    <p className="text-xs text-gray-500">Current role: {selectedUser.role}</p>
                  </div>

                  <form onSubmit={handleRoleUpdate}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Role *</label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={roleFormData.role}
                        onChange={(e) => setRoleFormData({ ...roleFormData, role: e.target.value })}
                      >
                        <option value="">Select new role</option>
                        <option value="SYSTEM_ADMIN">System Admin</option>
                        <option value="CLUB_ADMIN">Club Admin</option>
                        <option value="CLUB_STAFF">Club Staff</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={roleFormData.clubId}
                        onChange={(e) => setRoleFormData({ ...roleFormData, clubId: e.target.value })}
                        disabled={roleFormData.role === 'SYSTEM_ADMIN'}
                      >
                        <option value="">Select a club</option>
                        {clubs.filter(club => club.isActive).map((club) => (
                          <option key={club.id} value={club.id}>
                            {club.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowRoleModal(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateRoleLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updateRoleLoading ? 'Updating...' : 'Update Role'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    </ProtectedRoute>
  );
}