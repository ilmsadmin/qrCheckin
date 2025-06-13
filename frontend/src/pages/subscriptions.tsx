import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import {
  GET_USER_SUBSCRIPTIONS,
  GET_AVAILABLE_PACKAGES,
  CREATE_SUBSCRIPTION_FROM_PACKAGE,
  CANCEL_SUBSCRIPTION,
  REACTIVATE_SUBSCRIPTION
} from '../lib/graphql/subscriptions';
import { GET_CLUBS } from '../lib/graphql/dashboard';

interface Subscription {
  id: string;
  name: string;
  type: string;
  price: number;
  duration: number;
  maxCheckins?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  description?: string;
  user: {
    id: string;
    username: string;
  };
  club: {
    id: string;
    name: string;
  };
  package?: {
    id: string;
    name: string;
    features: string[];
  };
  createdAt: string;
  updatedAt: string;
}

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

export default function UserSubscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [availablePackages, setAvailablePackages] = useState<SubscriptionPackage[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [showPackages, setShowPackages] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'expired' | 'all'>('active');

  const { data: subscriptionsData, loading: subscriptionsLoading, error: subscriptionsError, refetch: refetchSubscriptions } = useQuery(GET_USER_SUBSCRIPTIONS, {
    variables: { userId: user?.id },
    skip: !user?.id
  });

  const { data: clubsData } = useQuery(GET_CLUBS);

  const { data: packagesData, loading: packagesLoading } = useQuery(GET_AVAILABLE_PACKAGES, {
    variables: { clubId: selectedClub },
    skip: !selectedClub
  });

  const [createSubscription, { loading: createLoading }] = useMutation(CREATE_SUBSCRIPTION_FROM_PACKAGE);
  const [cancelSubscription] = useMutation(CANCEL_SUBSCRIPTION);
  const [reactivateSubscription] = useMutation(REACTIVATE_SUBSCRIPTION);

  useEffect(() => {
    if (subscriptionsData?.userSubscriptions) {
      try {
        const parsedSubscriptions = JSON.parse(subscriptionsData.userSubscriptions);
        setSubscriptions(parsedSubscriptions);
      } catch (e) {
        console.error('Error parsing subscriptions data:', e);
        setSubscriptions([]);
      }
    }
  }, [subscriptionsData]);

  useEffect(() => {
    if (clubsData?.clubs) {
      setClubs(clubsData.clubs.filter((club: Club) => club.isActive));
    }
  }, [clubsData]);

  useEffect(() => {
    if (packagesData?.subscriptionPackagesByClub) {
      try {
        const parsedPackages = JSON.parse(packagesData.subscriptionPackagesByClub);
        setAvailablePackages(parsedPackages);
      } catch (e) {
        console.error('Error parsing packages data:', e);
        setAvailablePackages([]);
      }
    }
  }, [packagesData]);

  const handleSubscribeToPackage = async (packageId: string, packageName: string) => {
    if (!user?.id) return;
    
    if (!confirm(`Bạn có chắc chắn muốn đăng ký gói "${packageName}" không?`)) return;

    try {
      const result = await createSubscription({
        variables: {
          packageId,
          userId: user.id
        }
      });

      if (result.data?.createSubscriptionFromPackage) {
        setShowPackages(false);
        alert('Đăng ký gói cước thành công!');
        // Refetch to get the latest data from backend
        await refetchSubscriptions();
      }
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      let errorMessage = 'Unknown error';
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      } else if (error.networkError) {
        errorMessage = `Network error: ${error.networkError.message}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(`Đăng ký thất bại: ${errorMessage}`);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string, subscriptionName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy gói "${subscriptionName}" không?`)) return;

    try {
      await cancelSubscription({ variables: { id: subscriptionId } });
      alert('Hủy gói cước thành công!');
      // Only refetch to get the true state from backend
      await refetchSubscriptions();
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      let errorMessage = 'Unknown error';
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      } else if (error.networkError) {
        errorMessage = `Network error: ${error.networkError.message}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Specific error handling for already cancelled subscriptions
      if (errorMessage.includes('already cancelled')) {
        alert('Gói cước này đã được hủy trước đó.');
      } else {
        alert(`Hủy gói thất bại: ${errorMessage}`);
      }
    }
  };

  const handleReactivateSubscription = async (subscriptionId: string, subscriptionName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn kích hoạt lại gói "${subscriptionName}" không?`)) return;

    try {
      await reactivateSubscription({ variables: { id: subscriptionId } });
      alert('Kích hoạt lại gói cước thành công!');
      // Only refetch to get the true state from backend
      await refetchSubscriptions();
    } catch (error: any) {
      console.error('Error reactivating subscription:', error);
      let errorMessage = 'Unknown error';
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      } else if (error.networkError) {
        errorMessage = `Network error: ${error.networkError.message}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Specific error handling
      if (errorMessage.includes('expired')) {
        alert('Không thể kích hoạt lại gói cước đã hết hạn.');
      } else {
        alert(`Kích hoạt lại thất bại: ${errorMessage}`);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
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

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    switch (activeTab) {
      case 'active':
        return sub.isActive && !isExpired(sub.endDate);
      case 'expired':
        return !sub.isActive || isExpired(sub.endDate);
      case 'all':
      default:
        return true;
    }
  });

  const activeSubscriptionsCount = subscriptions.filter(sub => sub.isActive && !isExpired(sub.endDate)).length;
  const expiredSubscriptionsCount = subscriptions.filter(sub => !sub.isActive || isExpired(sub.endDate)).length;

  if (subscriptionsLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Đang tải gói cước...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (subscriptionsError) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Lỗi tải dữ liệu
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{subscriptionsError.message}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => refetchSubscriptions()}
                      className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                    >
                      Thử lại
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
    <ProtectedRoute>
      <>
        <Head>
          <title>Gói Cước Của Tôi - QR Check-in</title>
        </Head>

        <div className="min-h-screen bg-gray-50">
          <Navigation />
          
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Gói Cước Của Tôi</h1>
                  <p className="mt-2 text-gray-600">Quản lý và theo dõi các gói cước đăng ký</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => refetchSubscriptions()}
                    className="bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <i className="fas fa-refresh mr-2"></i>Làm mới
                  </button>
                  <button 
                    onClick={() => setShowPackages(true)}
                    className="bg-blue-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <i className="fas fa-plus mr-2"></i>Đăng Ký Gói Mới
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-check-circle text-2xl text-green-500"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Gói đang hoạt động</dt>
                        <dd className="text-lg font-medium text-gray-900">{activeSubscriptionsCount}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-clock text-2xl text-red-500"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Gói đã hết hạn</dt>
                        <dd className="text-lg font-medium text-gray-900">{expiredSubscriptionsCount}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-box text-2xl text-blue-500"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Tổng gói đã đăng ký</dt>
                        <dd className="text-lg font-medium text-gray-900">{subscriptions.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'active'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Đang hoạt động ({activeSubscriptionsCount})
                </button>
                <button
                  onClick={() => setActiveTab('expired')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'expired'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Đã hết hạn ({expiredSubscriptionsCount})
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'all'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Tất cả ({subscriptions.length})
                </button>
              </nav>
            </div>

            {/* Subscriptions List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {filteredSubscriptions.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-box text-gray-300 text-6xl mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có gói cước nào</h3>
                    <p className="text-gray-500 mb-4">
                      Bạn chưa đăng ký gói cước nào. Hãy đăng ký gói cước để sử dụng dịch vụ.
                    </p>
                    <button 
                      onClick={() => setShowPackages(true)}
                      className="bg-blue-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <i className="fas fa-plus mr-2"></i>Đăng Ký Gói Đầu Tiên
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSubscriptions.map((subscription) => {
                      const expired = isExpired(subscription.endDate);
                      const daysRemaining = getDaysRemaining(subscription.endDate);
                      
                      return (
                        <div key={subscription.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">{subscription.name}</h3>
                              <p className="text-sm text-gray-500">{subscription.club.name}</p>
                              <p className="text-sm text-gray-500">{getTypeLabel(subscription.type)}</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              subscription.isActive && !expired
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {subscription.isActive && !expired ? 'Hoạt động' : 'Hết hạn'}
                            </span>
                          </div>

                          <div className="mt-4">
                            <div className="text-2xl font-bold text-gray-900">{formatPrice(subscription.price)}</div>
                            <div className="text-sm text-gray-500">
                              {subscription.maxCheckins ? `${subscription.maxCheckins} lần check-in` : 'Không giới hạn'}
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Bắt đầu:</span>
                              <span className="text-gray-900">{formatDate(subscription.startDate)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Kết thúc:</span>
                              <span className="text-gray-900">{formatDate(subscription.endDate)}</span>
                            </div>
                            {subscription.isActive && !expired && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Còn lại:</span>
                                <span className="text-green-600 font-medium">{daysRemaining} ngày</span>
                              </div>
                            )}
                          </div>

                          {subscription.package?.features && subscription.package.features.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Tính năng:</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {subscription.package.features.map((feature, index) => (
                                  <li key={index} className="flex items-center">
                                    <i className="fas fa-check text-green-500 mr-2 text-xs"></i>
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="mt-6 flex space-x-2">
                            {subscription.isActive && !expired ? (
                              <button
                                onClick={() => handleCancelSubscription(subscription.id, subscription.name)}
                                className="flex-1 bg-red-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-red-700"
                              >
                                Hủy gói
                              </button>
                            ) : !subscription.isActive && !expired ? (
                              <button
                                onClick={() => handleReactivateSubscription(subscription.id, subscription.name)}
                                className="flex-1 bg-green-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-green-700"
                              >
                                Kích hoạt lại
                              </button>
                            ) : (
                              <div className="flex-1 bg-gray-400 text-white text-sm font-medium py-2 px-3 rounded-md text-center">
                                {expired ? 'Đã hết hạn' : 'Đã hủy'}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Package Selection Modal */}
        {showPackages && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Chọn Gói Cước</h3>
                  <button
                    onClick={() => setShowPackages(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="mb-4">
                  <label htmlFor="club-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn Câu Lạc Bộ
                  </label>
                  <select
                    id="club-select"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                  >
                    <option value="">-- Chọn câu lạc bộ --</option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedClub && (
                  <div className="space-y-4">
                    {packagesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Đang tải gói cước...</p>
                      </div>
                    ) : availablePackages.length === 0 ? (
                      <div className="text-center py-8">
                        <i className="fas fa-box text-gray-300 text-4xl mb-4"></i>
                        <p className="text-gray-500">Không có gói cước nào khả dụng cho câu lạc bộ này.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                        {availablePackages.map((pkg) => (
                          <div key={pkg.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h4 className="text-lg font-medium text-gray-900">{pkg.name}</h4>
                                  {pkg.isPopular && (
                                    <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                      Phổ biến
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{getTypeLabel(pkg.type)}</p>
                                {pkg.description && (
                                  <p className="text-sm text-gray-600 mt-2">{pkg.description}</p>
                                )}
                                {pkg.features && pkg.features.length > 0 && (
                                  <div className="mt-2">
                                    <ul className="text-sm text-gray-600 space-y-1">
                                      {pkg.features.slice(0, 3).map((feature, index) => (
                                        <li key={index} className="flex items-center">
                                          <i className="fas fa-check text-green-500 mr-2 text-xs"></i>
                                          {feature}
                                        </li>
                                      ))}
                                      {pkg.features.length > 3 && (
                                        <li className="text-gray-400">+{pkg.features.length - 3} tính năng khác</li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-xl font-bold text-gray-900">
                                  {formatPrice(pkg.discountPrice || pkg.price)}
                                </div>
                                {pkg.discountPrice && pkg.discountPrice !== pkg.price && (
                                  <div className="text-sm text-gray-500 line-through">
                                    {formatPrice(pkg.price)}
                                  </div>
                                )}
                                <div className="text-sm text-gray-500">
                                  {pkg.maxCheckins ? `${pkg.maxCheckins} lần check-in` : 'Không giới hạn'}
                                </div>
                                <button
                                  onClick={() => handleSubscribeToPackage(pkg.id, pkg.name)}
                                  disabled={createLoading}
                                  className="mt-2 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {createLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    </ProtectedRoute>
  );
}
