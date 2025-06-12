import Head from 'next/head'
import Link from 'next/link'
import { QrCodeIcon } from '@heroicons/react/24/outline'

export default function MemberPackages() {
  return (
    <>
      <Head>
        <title>Chọn Gói Cước - QR Check-in System</title>
        <meta name="description" content="Chọn gói cước phù hợp cho việc check-in QR code" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <QrCodeIcon className="h-8 w-8 text-blue-600" />
                <h1 className="ml-3 text-xl font-semibold text-gray-900">Fitness Club Premium</h1>
              </div>
              <nav className="flex items-center space-x-8">
                <Link href="/" className="text-gray-500 hover:text-gray-900">
                  Trang chủ
                </Link>
                <Link href="/packages" className="text-blue-600 font-medium">
                  Gói cước
                </Link>
                <Link href="/events" className="text-gray-500 hover:text-gray-900">
                  Sự kiện
                </Link>
                <Link href="/contact" className="text-gray-500 hover:text-gray-900">
                  Liên hệ
                </Link>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Đăng nhập
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Chọn Gói Cước Phù Hợp</h1>
              <p className="text-xl opacity-90 mb-8">Đăng ký gói cước để trải nghiệm đầy đủ các dịch vụ của chúng tôi</p>
              <div className="flex justify-center space-x-8 text-sm">
                <div className="flex items-center">
                  <i className="fas fa-check-circle mr-2"></i>
                  <span>Check-in nhanh chóng</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-qrcode mr-2"></i>
                  <span>QR code cá nhân</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-chart-line mr-2"></i>
                  <span>Theo dõi thống kê</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Package Selection */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button className="px-4 py-2 rounded-md text-sm font-medium text-gray-500 focus:outline-none">
                Thanh toán theo tháng
              </button>
              <button className="px-4 py-2 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm focus:outline-none">
                Thanh toán theo năm
                <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Tiết kiệm 25%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Weekly Package */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gói Hàng Tuần</h3>
                <p className="text-sm text-gray-500 mb-6">Trải nghiệm ngắn hạn</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">149,000₫</span>
                  <span className="text-gray-500">/tuần</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-3 mb-8">
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    7 lần check-in
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    QR code tạm thời
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    Hỗ trợ cơ bản
                  </li>
                  <li className="flex items-center text-gray-400">
                    <i className="fas fa-times mr-3"></i>
                    Báo cáo thống kê
                  </li>
                </ul>
                <button className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Chọn gói này
                </button>
              </div>
            </div>

            {/* Basic Package */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gói Cơ Bản</h3>
                <p className="text-sm text-gray-500 mb-6">Cho thành viên mới</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">249,000₫</span>
                  <span className="text-gray-500">/tháng</span>
                  <div className="text-sm text-gray-500 line-through">299,000₫</div>
                </div>
                <ul className="text-sm text-gray-600 space-y-3 mb-8">
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    20 lần check-in/tháng
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    QR code cá nhân
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    Sự kiện thường
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    Hỗ trợ cơ bản
                  </li>
                </ul>
                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Chọn gói này
                </button>
              </div>
            </div>

            {/* Standard Package - Most Popular */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-500 p-8 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">Phổ biến nhất</span>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gói Tiêu Chuẩn</h3>
                <p className="text-sm text-gray-500 mb-6">Cho thành viên thường xuyên</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">399,000₫</span>
                  <span className="text-gray-500">/tháng</span>
                  <div className="text-sm text-gray-500 line-through">499,000₫</div>
                </div>
                <ul className="text-sm text-gray-600 space-y-3 mb-8">
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    50 lần check-in/tháng
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    QR code cá nhân
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    Tất cả sự kiện
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    Hỗ trợ ưu tiên
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    Báo cáo thống kê
                  </li>
                </ul>
                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Chọn gói này
                </button>
              </div>
            </div>

            {/* Premium Package */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gói Premium</h3>
                <p className="text-sm text-gray-500 mb-6">Cao cấp không giới hạn</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">699,000₫</span>
                  <span className="text-gray-500">/tháng</span>
                  <div className="text-sm text-gray-500 line-through">799,000₫</div>
                </div>
                <ul className="text-sm text-gray-600 space-y-3 mb-8">
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    Check-in không giới hạn
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    QR code Premium
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    Sự kiện VIP
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    Hỗ trợ 24/7
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-3"></i>
                    Báo cáo chi tiết
                  </li>
                </ul>
                <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                  Chọn gói này
                </button>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Tại sao chọn chúng tôi?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-clock text-blue-600 text-2xl"></i>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Check-in Nhanh Chóng</h4>
                <p className="text-gray-600">Chỉ với 1 giây để quét QR code và hoàn thành check-in</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shield-alt text-green-600 text-2xl"></i>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">An Toàn & Bảo Mật</h4>
                <p className="text-gray-600">Hệ thống bảo mật cao, bảo vệ thông tin cá nhân của bạn</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-chart-bar text-purple-600 text-2xl"></i>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Thống Kê Chi Tiết</h4>
                <p className="text-gray-600">Theo dõi lịch sử check-in và thống kê hoạt động</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-500">
              <p>&copy; 2024 Fitness Club Premium. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}