import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { QrCodeIcon } from '@heroicons/react/24/outline'
import Navigation from '../../components/Navigation'
import ProtectedRoute from '../../components/ProtectedRoute'
import { 
  GET_ALL_SUBSCRIPTION_PACKAGES,
  CREATE_SUBSCRIPTION_PACKAGE,
  UPDATE_SUBSCRIPTION_PACKAGE,
  TOGGLE_SUBSCRIPTION_PACKAGE_STATUS,
  DELETE_SUBSCRIPTION_PACKAGE
} from '../../lib/graphql/packages'
import { GET_CLUBS } from '../../lib/graphql/dashboard'

interface SubscriptionPackage {
  id: string;
  name: string;
  type: string;
  price: number;
  discountPrice?: number;
  duration: number;
  description?: string;
  features: string[];
  maxCheckins?: number;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  club: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Club {
  id: string;
  name: string;
  isActive: boolean;
}

export default function AdminSubscriptionPackages() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<SubscriptionPackage[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'MONTHLY',
    price: '',
    discountPrice: '',
    duration: '',
    maxCheckins: '',
    clubId: '',
    features: [] as string[],
    isPopular: false
  });
  const [featureInput, setFeatureInput] = useState('');

  const { data: packagesData, loading: packagesLoading, error: packagesError, refetch: refetchPackages } = useQuery(GET_ALL_SUBSCRIPTION_PACKAGES, {
    variables: { includeInactive: true }
  });

  const { data: clubsData } = useQuery(GET_CLUBS);

  const [createPackage, { loading: createLoading }] = useMutation(CREATE_SUBSCRIPTION_PACKAGE);
  const [updatePackage, { loading: updateLoading }] = useMutation(UPDATE_SUBSCRIPTION_PACKAGE);
  const [togglePackageStatus] = useMutation(TOGGLE_SUBSCRIPTION_PACKAGE_STATUS);
  const [deletePackage] = useMutation(DELETE_SUBSCRIPTION_PACKAGE);

  useEffect(() => {
    if (packagesData?.allSubscriptionPackages) {
      try {
        const parsedPackages = JSON.parse(packagesData.allSubscriptionPackages);
        setPackages(parsedPackages);
      } catch (e) {
        console.error('Error parsing packages data:', e);
        setPackages([]);
      }
    }
  }, [packagesData]);

  useEffect(() => {
    if (clubsData?.clubs) {
      setClubs(clubsData.clubs.filter((club: Club) => club.isActive));
    }
  }, [clubsData]);

  useEffect(() => {
    let filtered = packages;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(pkg =>
        filterStatus === 'active' ? pkg.isActive : !pkg.isActive
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(pkg => pkg.type === filterType);
    }

    setFilteredPackages(filtered);
  }, [packages, filterStatus, filterType]);

  const handleToggleStatus = async (packageId: string) => {
    try {
      await togglePackageStatus({ variables: { id: packageId } });
      refetchPackages();
    } catch (error) {
      console.error('Error toggling package status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'MONTHLY',
      price: '',
      discountPrice: '',
      duration: '',
      maxCheckins: '',
      clubId: '',
      features: [],
      isPopular: false
    });
    setFeatureInput('');
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const input = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        duration: parseFloat(formData.duration),
        maxCheckins: formData.maxCheckins ? parseInt(formData.maxCheckins) : undefined,
        clubId: formData.clubId,
        features: formData.features.length > 0 ? formData.features : undefined,
        isPopular: formData.isPopular
      };

      const result = await createPackage({ variables: input });
      
      if (result.data?.createSubscriptionPackage) {
        const newPackage = JSON.parse(result.data.createSubscriptionPackage);
        setPackages(prevPackages => [...prevPackages, newPackage]);
        resetForm();
        setShowCreateModal(false);
        alert('Package created successfully!');
      }
    } catch (error) {
      console.error('Error creating package:', error);
      alert('Failed to create package. Please try again.');
    }
  };

  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;

    try {
      const input = {
        id: editingPackage.id,
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        duration: parseFloat(formData.duration),
        maxCheckins: formData.maxCheckins ? parseInt(formData.maxCheckins) : undefined,
        features: formData.features.length > 0 ? formData.features : undefined,
        isPopular: formData.isPopular
      };

      const result = await updatePackage({ variables: input });
      
      if (result.data?.updateSubscriptionPackage) {
        const updatedPackage = JSON.parse(result.data.updateSubscriptionPackage);
        setPackages(prevPackages => 
          prevPackages.map(pkg => 
            pkg.id === editingPackage.id ? updatedPackage : pkg
          )
        );
        resetForm();
        setEditingPackage(null);
        alert('Package updated successfully!');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      alert('Failed to update package. Please try again.');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (pkg: SubscriptionPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      type: pkg.type,
      price: pkg.price.toString(),
      discountPrice: pkg.discountPrice?.toString() || '',
      duration: pkg.duration.toString(),
      maxCheckins: pkg.maxCheckins?.toString() || '',
      clubId: pkg.club.id,
      features: pkg.features || [],
      isPopular: pkg.isPopular
    });
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setEditingPackage(null);
    resetForm();
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleDeletePackage = async (packageId: string, packageName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa gói "${packageName}" không? Hành động này không thể hoàn tác.`)) return;

    try {
      await deletePackage({ variables: { id: packageId } });
      setPackages(prevPackages => prevPackages.filter(pkg => pkg.id !== packageId));
      alert('Package deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting package:', error);
      let errorMessage = 'Unknown error';
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      } else if (error.networkError) {
        errorMessage = `Network error: ${error.networkError.message}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(`Failed to delete package: ${errorMessage}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      'MONTHLY': 'Hàng tháng',
      'WEEKLY': 'Hàng tuần',
      'YEARLY': 'Hàng năm',
      'DAILY': 'Hàng ngày',
      'EVENT_SPECIFIC': 'Theo sự kiện'
    };
    return typeLabels[type] || type;
  };

  const stats = {
    totalPackages: packages.length,
    activePackages: packages.filter(pkg => pkg.isActive).length,
    totalSubscriptions: 0, // This would need to come from another API
    monthlyRevenue: 0 // This would need to come from another API
  };

  if (packagesLoading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading packages...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (packagesError) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading packages
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{packagesError.message}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => refetchPackages()}
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
          <title>Manage Packages - Admin Dashboard</title>
          <meta name="description" content="Manage subscription packages for the QR Check-in system" />
        </Head>

        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <Navigation />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="md:flex md:items-center md:justify-between mb-8">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Quản lý Gói Cước
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Tạo và quản lý các gói cước đăng ký cho thành viên
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button 
                  onClick={() => refetchPackages()}
                  type="button" 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <i className="fas fa-refresh mr-2"></i>
                  Refresh
                </button>
                <button 
                  onClick={() => openCreateModal()}
                  type="button" 
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Tạo Gói Mới
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-box-open text-2xl text-blue-500"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Tổng gói cước</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalPackages}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-check-circle text-2xl text-green-500"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Đang hoạt động</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.activePackages}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-users text-2xl text-purple-500"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Tổng đăng ký</dt>
                        <dd className="text-lg font-medium text-gray-900">456</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-chart-line text-2xl text-green-500"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Doanh thu tháng</dt>
                        <dd className="text-lg font-medium text-gray-900">125M₫</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Package List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Danh sách gói cước</h3>
                  <div className="flex items-center space-x-2">
                    <select 
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="active">Đang hoạt động</option>
                      <option value="inactive">Tạm dừng</option>
                    </select>
                    <select 
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="all">Tất cả loại</option>
                      <option value="MONTHLY">Hàng tháng</option>
                      <option value="WEEKLY">Hàng tuần</option>
                      <option value="YEARLY">Hàng năm</option>
                      <option value="DAILY">Hàng ngày</option>
                      <option value="EVENT_SPECIFIC">Theo sự kiện</option>
                    </select>
                  </div>
                </div>

                <ul className="divide-y divide-gray-200">
                  {filteredPackages.length === 0 ? (
                    <div className="text-center py-12">
                      <i className="fas fa-box text-gray-300 text-6xl mb-4"></i>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
                      <p className="text-gray-500">
                        {packages.length === 0 
                          ? "You haven't created any packages yet." 
                          : "No packages match your current filters."
                        }
                      </p>
                      {packages.length === 0 && (
                        <button 
                          onClick={() => openCreateModal()}
                          className="mt-4 bg-blue-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                        >
                          <i className="fas fa-plus mr-2"></i>Create Your First Package
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredPackages.map((pkg) => {
                      const getPackageIcon = (type: string) => {
                        const iconMap: { [key: string]: string } = {
                          'MONTHLY': 'fas fa-calendar-alt',
                          'WEEKLY': 'fas fa-calendar-week',
                          'YEARLY': 'fas fa-calendar',
                          'DAILY': 'fas fa-calendar-day',
                          'EVENT_SPECIFIC': 'fas fa-ticket-alt'
                        };
                        return iconMap[type] || 'fas fa-box';
                      };

                      const getPackageGradient = (type: string) => {
                        const gradientMap: { [key: string]: string } = {
                          'MONTHLY': 'from-blue-500 to-green-600',
                          'WEEKLY': 'from-green-500 to-blue-600',
                          'YEARLY': 'from-purple-500 to-pink-600',
                          'DAILY': 'from-yellow-500 to-orange-600',
                          'EVENT_SPECIFIC': 'from-red-500 to-purple-600'
                        };
                        return gradientMap[type] || 'from-gray-500 to-gray-600';
                      };

                      return (
                        <li key={pkg.id}>
                          <div className="px-6 py-6 flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className={`w-12 h-12 bg-gradient-to-r ${getPackageGradient(pkg.type)} rounded-lg flex items-center justify-center`}>
                                  <i className={`${getPackageIcon(pkg.type)} text-white text-lg`}></i>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center">
                                  <h4 className="text-lg font-medium text-gray-900">{pkg.name}</h4>
                                  <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    pkg.isActive 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {pkg.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                  </span>
                                  {pkg.isPopular && (
                                    <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                      Phổ biến
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">
                                  {getTypeLabel(pkg.type)} • {pkg.club.name}
                                  {pkg.maxCheckins && ` • Tối đa ${pkg.maxCheckins} lần check-in`}
                                </p>
                                {pkg.description && (
                                  <p className="text-sm text-gray-400 mt-1">{pkg.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-8">
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">{formatPrice(pkg.price)}</div>
                                {pkg.discountPrice && pkg.discountPrice !== pkg.price && (
                                  <div className="text-sm text-gray-500 line-through">{formatPrice(pkg.discountPrice)}</div>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => openEditModal(pkg)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit package"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  onClick={() => handleToggleStatus(pkg.id)}
                                  className={`${pkg.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                                  title={pkg.isActive ? 'Pause package' : 'Activate package'}
                                >
                                  <i className={`fas ${pkg.isActive ? 'fa-pause' : 'fa-play'}`}></i>
                                </button>
                                <button 
                                  onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                                  className="text-red-600 hover:text-red-900" 
                                  title="Delete package"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Hiển thị <span className="font-medium">{Math.min(filteredPackages.length, 1)}</span> đến{' '}
                      <span className="font-medium">{filteredPackages.length}</span> của{' '}
                      <span className="font-medium">{packages.length}</span> kết quả
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Package Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[700px] shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo Gói Cước Mới</h3>
                <form onSubmit={handleCreatePackage}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Tên Gói *
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
                      <label htmlFor="clubId" className="block text-sm font-medium text-gray-700 mb-2">
                        Câu Lạc Bộ *
                      </label>
                      <select
                        id="clubId"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.clubId}
                        onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                      >
                        <option value="">Chọn câu lạc bộ</option>
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
                      Mô Tả
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
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        Loại Gói *
                      </label>
                      <select
                        id="type"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="DAILY">Hàng ngày</option>
                        <option value="WEEKLY">Hàng tuần</option>
                        <option value="MONTHLY">Hàng tháng</option>
                        <option value="YEARLY">Hàng năm</option>
                        <option value="EVENT_SPECIFIC">Theo sự kiện</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                        Thời Hạn (ngày) *
                      </label>
                      <input
                        type="number"
                        id="duration"
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        Giá (VND) *
                      </label>
                      <input
                        type="number"
                        id="price"
                        required
                        min="0"
                        step="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700 mb-2">
                        Giá Khuyến Mãi (VND)
                      </label>
                      <input
                        type="number"
                        id="discountPrice"
                        min="0"
                        step="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.discountPrice}
                        onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="maxCheckins" className="block text-sm font-medium text-gray-700 mb-2">
                      Số Lần Check-in Tối Đa
                    </label>
                    <input
                      type="number"
                      id="maxCheckins"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.maxCheckins}
                      onChange={(e) => setFormData({ ...formData, maxCheckins: e.target.value })}
                      placeholder="Để trống = không giới hạn"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tính Năng
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        placeholder="Nhập tính năng..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Thêm
                      </button>
                    </div>
                    {formData.features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.features.map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="ml-1 text-blue-600 hover:text-blue-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        checked={formData.isPopular}
                        onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      />
                      <span className="ml-2 text-sm text-gray-700">Đánh dấu là gói phổ biến</span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {createLoading ? 'Đang tạo...' : 'Tạo Gói'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Package Modal */}
        {editingPackage && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[700px] shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh Sửa Gói Cước</h3>
                <form onSubmit={handleUpdatePackage}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Tên Gói *
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Câu Lạc Bộ
                      </label>
                      <input
                        type="text"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                        value={editingPackage.club.name}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                      Mô Tả
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
                      <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700 mb-2">
                        Loại Gói *
                      </label>
                      <select
                        id="edit-type"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="DAILY">Hàng ngày</option>
                        <option value="WEEKLY">Hàng tuần</option>
                        <option value="MONTHLY">Hàng tháng</option>
                        <option value="YEARLY">Hàng năm</option>
                        <option value="EVENT_SPECIFIC">Theo sự kiện</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="edit-duration" className="block text-sm font-medium text-gray-700 mb-2">
                        Thời Hạn (ngày) *
                      </label>
                      <input
                        type="number"
                        id="edit-duration"
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-2">
                        Giá (VND) *
                      </label>
                      <input
                        type="number"
                        id="edit-price"
                        required
                        min="0"
                        step="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-discountPrice" className="block text-sm font-medium text-gray-700 mb-2">
                        Giá Khuyến Mãi (VND)
                      </label>
                      <input
                        type="number"
                        id="edit-discountPrice"
                        min="0"
                        step="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.discountPrice}
                        onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="edit-maxCheckins" className="block text-sm font-medium text-gray-700 mb-2">
                      Số Lần Check-in Tối Đa
                    </label>
                    <input
                      type="number"
                      id="edit-maxCheckins"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.maxCheckins}
                      onChange={(e) => setFormData({ ...formData, maxCheckins: e.target.value })}
                      placeholder="Để trống = không giới hạn"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tính Năng
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        placeholder="Nhập tính năng..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Thêm
                      </button>
                    </div>
                    {formData.features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.features.map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {feature}
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="ml-1 text-blue-600 hover:text-blue-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        checked={formData.isPopular}
                        onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      />
                      <span className="ml-2 text-sm text-gray-700">Đánh dấu là gói phổ biến</span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updateLoading ? 'Đang cập nhật...' : 'Cập Nhật'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </>
    </ProtectedRoute>
  )
}