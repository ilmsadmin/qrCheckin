import Head from 'next/head'
import Link from 'next/link'
import { QrCodeIcon } from '@heroicons/react/24/outline'

export default function AdminSubscriptionPackages() {
  const packages = [
    {
      id: 1,
      name: 'Gói Cơ Bản',
      type: 'Hàng tháng',
      price: '249,000₫',
      originalPrice: '299,000₫',
      subscribers: 125,
      status: 'active',
      icon: 'fas fa-user',
      gradient: 'from-blue-500 to-green-600'
    },
    {
      id: 2,
      name: 'Gói Tiêu Chuẩn',
      type: 'Hàng tháng',
      price: '399,000₫',
      originalPrice: '499,000₫',
      subscribers: 89,
      status: 'active',
      icon: 'fas fa-star',
      gradient: 'from-green-500 to-blue-600'
    },
    {
      id: 3,
      name: 'Gói Premium',
      type: 'Hàng tháng',
      price: '699,000₫',
      originalPrice: '799,000₫',
      subscribers: 42,
      status: 'active',
      icon: 'fas fa-crown',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      id: 4,
      name: 'Gói Hàng Tuần',
      type: 'Hàng tuần',
      price: '149,000₫',
      originalPrice: null,
      subscribers: 23,
      status: 'paused',
      icon: 'fas fa-calendar-week',
      gradient: 'from-gray-500 to-gray-600'
    }
  ]

  return (
    <>
      <Head>
        <title>Quản lý Gói Cước - QR Check-in System</title>
        <meta name="description" content="Quản lý các gói cước đăng ký cho thành viên" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <QrCodeIcon className="h-8 w-8 text-blue-600" />
                <h1 className="ml-3 text-xl font-semibold text-gray-900">QR Check-in Admin</h1>
              </div>
              <nav className="flex space-x-8">
                <Link href="/admin" className="text-gray-500 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="#" className="text-gray-500 hover:text-gray-900">
                  Người dùng
                </Link>
                <Link href="/admin/packages" className="text-blue-600 font-medium">
                  Gói cước
                </Link>
                <Link href="#" className="text-gray-500 hover:text-gray-900">
                  Sự kiện
                </Link>
              </nav>
            </div>
          </div>
        </header>

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
              <button type="button" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <i className="fas fa-download mr-2"></i>
                Xuất Excel
              </button>
              <button type="button" className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
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
                      <dd className="text-lg font-medium text-gray-900">24</dd>
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
                      <dd className="text-lg font-medium text-gray-900">18</dd>
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
                  <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                    <option>Tất cả trạng thái</option>
                    <option>Đang hoạt động</option>
                    <option>Tạm dừng</option>
                  </select>
                  <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                    <option>Tất cả loại</option>
                    <option>Hàng tháng</option>
                    <option>Hàng tuần</option>
                    <option>Hàng năm</option>
                  </select>
                </div>
              </div>

              <ul className="divide-y divide-gray-200">
                {packages.map((pkg) => (
                  <li key={pkg.id}>
                    <div className="px-6 py-6 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 bg-gradient-to-r ${pkg.gradient} rounded-lg flex items-center justify-center`}>
                            <i className={`${pkg.icon} text-white text-lg`}></i>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h4 className="text-lg font-medium text-gray-900">{pkg.name}</h4>
                            <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              pkg.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {pkg.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{pkg.type} • {pkg.subscribers} người đăng ký</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-8">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{pkg.price}</div>
                          {pkg.originalPrice && (
                            <div className="text-sm text-gray-500 line-through">{pkg.originalPrice}</div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <i className="fas fa-pause"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">4</span> của{' '}
                    <span className="font-medium">24</span> kết quả
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <i className="fas fa-chevron-left"></i>
                    </a>
                    <a href="#" className="bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">1</a>
                    <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">2</a>
                    <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">3</a>
                    <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <i className="fas fa-chevron-right"></i>
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}